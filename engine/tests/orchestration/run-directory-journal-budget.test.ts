import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, truncateSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import fc from "fast-check";
import { createRunDirectory, parseRunEventResourcePolicy, type RunEventResourcePolicy } from "../../src/orchestration/run-directory-handle";

const roots: string[] = [];
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }); });
const record = (dedupKey = "first") => ({ schemaVersion: 1 as const, sequence: 0, dedupKey, recordedAtMs: 1, event: { kind: "fixture" } });
function policy(maxEventBytes = 256, maxJournalBytes = 512, maxRecords = 2): RunEventResourcePolicy {
  const result = parseRunEventResourcePolicy({ maxEventBytes, maxJournalBytes, maxRecords });
  if (!result.ok) throw new Error(result.error.message);
  return result.value;
}
function fixture() {
  const root = mkdtempSync(join(tmpdir(), "loom-journal-budget-"));
  roots.push(root);
  const handle = createRunDirectory(root, "run.budget");
  if (!handle.ok) throw new Error(handle.error.message);
  return handle.value;
}

describe("per-operation anchored event resource policy", () => {
  it("parses unknown limits once into immutable authority, rejecting unsafe numbers and accessors", () => {
    fc.assert(fc.property(fc.oneof(fc.integer({ max: 0 }), fc.double().filter(n => !Number.isSafeInteger(n))), (bad) => {
      for (const key of ["maxEventBytes", "maxJournalBytes", "maxRecords"]) {
        expect(parseRunEventResourcePolicy({ maxEventBytes: 256, maxJournalBytes: 512, maxRecords: 2, [key]: bad }).ok).toBe(false);
      }
    }));
    expect(parseRunEventResourcePolicy({ maxEventBytes: 513, maxJournalBytes: 512, maxRecords: 2 }).ok).toBe(false);
    let accessed = false;
    expect(parseRunEventResourcePolicy({ get maxEventBytes() { accessed = true; return 1; }, maxJournalBytes: 2, maxRecords: 1 }).ok).toBe(false);
    expect(accessed).toBe(false);
    const raw = { maxEventBytes: 256, maxJournalBytes: 512, maxRecords: 2 };
    const parsed = parseRunEventResourcePolicy(raw);
    expect(parsed.ok).toBe(true);
    raw.maxEventBytes = 1;
    if (parsed.ok) { expect(parsed.value.maxEventBytes).toBe(256); expect(Object.isFrozen(parsed.value)).toBe(true); }
  });

  it("refuses a sparse oversized retained file before JSON parsing in read AND append reconciliation", async () => {
    const handle = fixture();
    await handle.appendEvent(record());
    const events = join(handle.runDirectory, "events");
    const path = join(events, readdirSync(events)[0]!);
    truncateSync(path, 1024 * 1024 * 1024);
    await expect(handle.readEvents(policy())).rejects.toThrow(/byte limit/);
    await expect(handle.appendEvent(record("second"), policy())).rejects.toThrow(/byte limit/);
    expect(readdirSync(events)).toHaveLength(1);
  });

  it("enforces aggregate bytes before reading the next record and before appending a new one", async () => {
    const handle = fixture();
    await handle.appendEvent(record());
    const path = join(handle.runDirectory, "events", readdirSync(join(handle.runDirectory, "events"))[0]!);
    const size = readFileSync(path).byteLength;
    const budget = policy(size, size, 2);
    await expect(handle.readEvents(budget)).resolves.toHaveLength(1);
    await expect(handle.appendEvent(record("second"), budget)).rejects.toThrow(/journal.*byte limit/);
    await handle.appendEvent(record("second")); // unrelated/default consumers remain unchanged
    await expect(handle.readEvents(budget)).rejects.toThrow(/byte limit/);
    await expect(handle.appendEvent(record("first"), budget)).rejects.toThrow(/byte limit/);
  });

  it("preserves exact-limit dedup, contiguity, count and bounded directory enumeration", async () => {
    const handle = fixture();
    const budget = policy(256, 512, 1);
    await handle.appendEvent(record(), budget);
    await handle.appendEvent(record(), budget);
    await expect(handle.readEvents(budget)).resolves.toHaveLength(1);
    await expect(handle.appendEvent(record("second"), budget)).rejects.toThrow(/record limit/);
    await handle.appendEvent(record("second"));
    await expect(handle.readEvents(budget)).rejects.toThrow(/record limit/);
    const events = join(handle.runDirectory, "events");
    for (let n = 0; n < 20; n++) mkdirSync(join(events, `unrelated-${n}`));
    await expect(handle.readEvents(budget)).rejects.toThrow(/directory.*entry limit/);
  });

  it("releases its own lock if enumeration exceeds the budget after publication", async () => {
    const handle = fixture();
    const events = join(handle.runDirectory, "events");
    // The pre-claim directory fits exactly; publishing append.lock consumes the next slot.
    for (let n = 0; n < 9; n++) mkdirSync(join(events, `entry-${n}`));
    await expect(handle.readEvents(policy(256, 512, 1))).rejects.toThrow(/directory.*entry limit/);
    expect(readdirSync(events)).toHaveLength(9);
    expect(readdirSync(events)).not.toContain("append.lock");
  });

  it("serializes concurrent bounded appends without losing contiguity or duplicate idempotency", async () => {
    const handle = fixture();
    const budget = policy(256, 512, 2);
    await Promise.all([handle.appendEvent(record(), budget), handle.appendEvent(record("second"), budget), handle.appendEvent(record(), budget)]);
    const events = await handle.readEvents(budget);
    expect(events.map(({ sequence }) => sequence)).toEqual([0, 1]);
    expect(events.map(({ dedupKey }) => dedupKey).sort()).toEqual(["first", "second"]);
    await expect(handle.appendEvent(record("third"), budget)).rejects.toThrow(/record limit/);
  });

  it("rejects forged policy before accessing its fields or filesystem", async () => {
    const handle = fixture();
    let accessed = false;
    const forged = { get maxEventBytes() { accessed = true; throw new Error("accessed"); } } as unknown as RunEventResourcePolicy;
    await expect(handle.readEvents(forged)).rejects.toThrow(/parser-minted/);
    await expect(handle.appendEvent(record(), forged)).rejects.toThrow(/parser-minted/);
    expect(accessed).toBe(false);
    expect(readdirSync(join(handle.runDirectory, "events"))).toEqual([]);
  });

  it("retains filename/record identity validation under a budget", async () => {
    const handle = fixture();
    writeFileSync(join(handle.runDirectory, "events", "000001-first.json"), JSON.stringify(record()));
    await expect(handle.readEvents(policy())).rejects.toThrow(/contiguous/);
  });
});
