import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { parseStandaloneSuccessorStartInput, parseStandaloneSuccessorRegistration } from "../../../../src/handlers/helpers/programs/standalone-successor-registration";
import { parseStandaloneStartInput, parseRegisteredFacadeProgram } from "../../../../src/handlers/helpers/programs/helpers";
import { STANDALONE_REVIEWER_PROTOCOL_V3 } from "../../../../src/core/standalone-lineage-contract";
import { CURRENT_REVIEWER_PROTOCOL } from "../../../../src/core/reviewer-contract";
const input = { schemaVersion: 3, kind: "types", files: ["a.ts"], dryRun: false,
  successor: { source: { locator: "/owned/source", runId: "source", resultDigest: "a".repeat(64) },
    disposition: { kind: "selected-record", publication: { locator: "/owned/policy", runId: "policy", dispositionDigest: "b".repeat(64) } } } };

describe("explicit bounded successor registration ingress", () => {
  it("keeps independent issuance unversioned and Wave v2; only exact standalone v3 input selects successors", () => {
    expect(parseStandaloneStartInput({ kind: "types", files: ["a.ts"], dryRun: false })).toEqual({ ok: true, value: { kind: "types", files: ["a.ts"], dryRun: false } });
    expect(parseStandaloneStartInput(input).ok).toBe(true);
    expect(parseRegisteredFacadeProgram({ schemaVersion: 3, reviewerProtocol: STANDALONE_REVIEWER_PROTOCOL_V3, kind: "wave-gate", input: { wave: 1 }, taskIds: ["T1"], authorityDigest: "a".repeat(64) }).kind).toBe("invalid");
    expect(parseRegisteredFacadeProgram({ schemaVersion: 2, reviewerProtocol: CURRENT_REVIEWER_PROTOCOL, kind: "wave-gate", input: { wave: 1 }, taskIds: ["T1"], authorityDigest: "a".repeat(64) }).kind).toBe("registered");
    for (const raw of [{ ...input, schemaVersion: 2 }, { ...input, files: null }, { ...input, dryRun: true },
      { ...input, successor: { ...input.successor, disposition: null } }, { ...input, files: ["a.ts", "a.ts"] },
      { ...input, files: ["../outside.ts"] }]) expect(parseStandaloneSuccessorStartInput(raw).ok, JSON.stringify(raw)).toBe(false);
    const ordered = { ...input, files: ["b.ts", "a.ts"] };
    expect(parseStandaloneSuccessorStartInput(ordered)).toEqual({ ok: true, value: ordered });
  });
  it("preserves exact explicit source and policy identities for arbitrary valid SHA-256 references", () => {
    fc.assert(fc.property(fc.uint8Array({ minLength: 32, maxLength: 32 }), bytes => {
      const digest = Buffer.from(bytes).toString("hex");
      const raw = { ...input, successor: { ...input.successor, source: { ...input.successor.source, resultDigest: digest } } };
      const parsed = parseStandaloneSuccessorStartInput(raw);
      expect(parsed.ok).toBe(true);
      if (parsed.ok) { expect(parsed.value).toEqual(raw); expect(Object.isFrozen(parsed.value.successor.source)).toBe(true); }
    }));
  });
  it("refuses accessors without evaluating them, unknown fields, oversized scopes and missing frozen authority", () => {
    let reads = 0;
    const source = { ...input.successor.source };
    Object.defineProperty(source, "resultDigest", { enumerable: true, get() { reads += 1; return "a".repeat(64); } });
    expect(parseStandaloneSuccessorStartInput({ ...input, successor: { ...input.successor, source } }).ok).toBe(false);
    expect(reads).toBe(0);
    expect(parseStandaloneSuccessorStartInput({ ...input, files: Array.from({ length: 4097 }, (_, i) => `a${i}.ts`) }).ok).toBe(false);
    expect(parseStandaloneSuccessorStartInput({ ...input, latest: true }).ok).toBe(false);
    expect(parseStandaloneSuccessorRegistration({ schemaVersion: 3, kind: "standalone-review", reviewerProtocol: STANDALONE_REVIEWER_PROTOCOL_V3, input, authority: {} }).ok).toBe(false);
  });
});
