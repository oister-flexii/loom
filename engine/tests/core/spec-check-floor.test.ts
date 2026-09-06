import { describe, expect, it } from "vitest";
import {
  parseSpecCheckOutput,
  parseStoredSpecCheck,
  reconcileSpecCheck,
  specCheckNeedsReapplication,
} from "../../src/core/spec-check";
import { unprojectedFloor, type SettledFloor } from "../../src/core/requirement-coverage";
import { epochSettledFloor } from "../../src/core/wave-review-authority";
import type { SpecCheck, WaveReviewEpochAuthority } from "../../src/types";


/**
 * The settled floor lives inside `reconcileSpecCheck` and not beside one
 * harness's call to it.
 *
 * Round 1 put it in the Claude SubagentStop handler alone. The Pi transport and
 * the Wave Gate façade both committed the Agent's own count unchecked — and the
 * façade's resume loop re-applied the transcript through its unfloored path
 * precisely BECAUSE a floor violation writes `EVIDENCE_CAPTURE_FAILED`, which
 * is the one verdict that loop refuses to skip. The enforcement erased itself.
 *
 * These tests pin the rule at the one function all three call, so a harness
 * cannot be clean while another is evidence-failed.
 */

const transcript = (critical: number): string => [
  "SPEC_CHECK_WAVE: 5",
  ...Array.from({ length: critical }, (_, at) => `CRITICAL: finding ${at + 1}`),
  `SPEC_CHECK_CRITICAL_COUNT: ${critical}`,
  "SPEC_CHECK_HIGH_COUNT: 0",
  `SPEC_CHECK_VERDICT: ${critical === 0 ? "PASSED" : "BLOCKED"}`,
].join("\n");

const settled = (count: number): SettledFloor => Object.freeze({ kind: "settled", count });
const unprojected = (): SettledFloor => unprojectedFloor("test fixture: no projection");

const reconcile = (critical: number, floor: SettledFloor) =>
  reconcileSpecCheck(parseSpecCheckOutput(transcript(critical)), 5, "2026-09-05T00:00:00.000Z", floor);

describe("reconcileSpecCheck enforces the settled floor", () => {
  it("fails evidence capture when the report falls below the floor", () => {
    const result = reconcile(0, settled(3));
    expect(result.kind).toBe("evidence-failed");
    expect(result.specCheck.verdict).toBe("EVIDENCE_CAPTURE_FAILED");
    expect(String((result.specCheck as { error?: string }).error))
      .toContain("the Requirement Coverage Projection settled 3");
    // Typed, not inferred from the prose: the resume loop branches on this.
    expect(result.specCheck).toMatchObject({ cause: "settled-floor" });
  });

  it("admits a report that meets the floor, and one that exceeds it", () => {
    expect(reconcile(3, settled(3)).kind).toBe("captured");
    // A floor, never an equality: the Agent adds its own findings.
    expect(reconcile(7, settled(3)).kind).toBe("captured");
  });

  it("imposes no floor when no projection was available", () => {
    // Unprojected is a real state, and it does impose no floor - the honest
    // statement, not a claim that it is somehow still a check. What keeps it
    // from reading as a pass is the command, which requires the Agent to say
    // in its summary that it worked without a projection.
    expect(reconcile(0, unprojected()).kind).toBe("captured");
  });


  it("takes no default floor, so every settlement path must name one", () => {
    // The defect this pins: the floor argument used to default to `null`, so
    // a settlement path that never passed one silently settled unfloored --
    // and three of the four paths did exactly that. Making the parameter
    // required is what made `tsc` name them all. A reintroduced default would
    // erase that, and `Function.length` stops at the first defaulted parameter.
    expect(reconcileSpecCheck.length).toBe(4);
  });

  it("reports a malformed footer as malformed, not as a floor violation", () => {
    // Ordering matters: a transcript missing its markers must not be reported
    // as having under-counted against a floor it never reached.
    const malformed = reconcileSpecCheck(
      parseSpecCheckOutput("SPEC_CHECK_WAVE: 5\nSPEC_CHECK_HIGH_COUNT: 0"), 5, "2026-09-05T00:00:00.000Z", settled(3),
    );
    expect(malformed.kind).toBe("evidence-failed");
    expect(String((malformed.specCheck as { error?: string }).error)).toContain("SPEC_CHECK_CRITICAL_COUNT marker");
    // And it stays re-applyable: a malformed capture is exactly the crash
    // window the resume loop recovers, unlike a decided floor refusal.
    expect(malformed.specCheck).toMatchObject({ cause: "transcript" });
  });
});

describe("epochSettledFloor reads back the number the Agent was shown", () => {
  const epoch = (floor?: SettledFloor): WaveReviewEpochAuthority => ({
    runId: "run.floor" as WaveReviewEpochAuthority["runId"],
    wave: 5,
    batchEpoch: "a".repeat(64) as WaveReviewEpochAuthority["batchEpoch"],
    ...(floor === undefined ? {} : { settledSpecCheckFloor: floor }),
  });

  it("returns the recorded floor verbatim", () => {
    expect(epochSettledFloor(epoch(settled(4)))).toEqual({ kind: "settled", count: 4 });
  });

  it("states why an absent epoch carries no floor, rather than settling zero", () => {
    // A zero floor and no floor are behaviourally identical for a report of
    // zero, but only one of them can be read back and explained afterwards.
    const floor = epochSettledFloor(undefined);
    expect(floor.kind).toBe("unprojected");
    if (floor.kind !== "unprojected") return;
    expect(floor.reason).toContain("not packet-correlated");
  });

  it("states why an epoch predating the field carries no floor", () => {
    const floor = epochSettledFloor(epoch());
    expect(floor.kind).toBe("unprojected");
    if (floor.kind !== "unprojected") return;
    expect(floor.reason).toContain("predates recorded Requirement Coverage floor authority");
  });
});

describe("a settled-floor refusal survives the resume loop", () => {
  const failed = (cause: "transcript" | "settled-floor"): SpecCheck =>
    ({ wave: 5, run_at: "now", verdict: "EVIDENCE_CAPTURE_FAILED", error: "refused", cause });

  it("does not re-apply a decided floor refusal", () => {
    // The defect this closes: the resume loop re-applies a durable capture
    // exactly when the recorded verdict is EVIDENCE_CAPTURE_FAILED - which is
    // what a floor violation writes - so a resume overwrote the refusal with a
    // fresh reconciliation and left no record it had ever happened.
    expect(specCheckNeedsReapplication(failed("settled-floor"), 5)).toBe(false);
  });

  it("still re-applies a transcript failure, which is what the loop exists for", () => {
    expect(specCheckNeedsReapplication(failed("transcript"), 5)).toBe(true);
  });

  it("re-applies when nothing is recorded, or when what is recorded is another Wave's", () => {
    expect(specCheckNeedsReapplication(undefined, 5)).toBe(true);
    expect(specCheckNeedsReapplication(failed("settled-floor"), 6)).toBe(true);
  });

  it("leaves a successfully captured verdict alone", () => {
    expect(specCheckNeedsReapplication({
      wave: 5, run_at: "now", verdict: "PASSED",
      critical_count: 0, high_count: 0,
      critical_findings: [], high_findings: [], medium_findings: [],
    }, 5)).toBe(false);
  });
});

describe("a persisted evidence failure carries its cause across a reload", () => {
  const stored = (overrides: Record<string, unknown>) => parseStoredSpecCheck({
    wave: 5, run_at: "now", verdict: "EVIDENCE_CAPTURE_FAILED", error: "refused", ...overrides,
  });

  it.each(["transcript", "settled-floor"] as const)("round-trips the %s cause", (cause) => {
    const parsed = stored({ cause });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value).toMatchObject({ verdict: "EVIDENCE_CAPTURE_FAILED", cause });
    expect(Object.isFrozen(parsed.value)).toBe(true);
  });

  it("reads a record written before the cause existed as a transcript failure", () => {
    // Every failure written before the floor existed WAS a transcript failure,
    // so the historical shape has exactly one meaning - and the parse boundary
    // is where it becomes total, not a `?.` at each reader.
    const parsed = stored({});
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value).toMatchObject({ cause: "transcript" });
  });

  it("refuses an unrecognized cause rather than degrading it to transcript", () => {
    // Degrading would silently make a decided refusal re-applyable again, which
    // is exactly the erasure the typed cause exists to stop.
    const parsed = stored({ cause: "waived" });
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.errors.join(" ")).toContain("spec_check.cause");
  });

  it("refuses a cause on a record that captured successfully", () => {
    const parsed = parseStoredSpecCheck({
      wave: 5, run_at: "now", verdict: "PASSED",
      critical_count: 0, high_count: 0,
      critical_findings: [], high_findings: [], medium_findings: [],
      cause: "transcript",
    });
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.errors.join(" ")).toContain("must be absent when evidence capture succeeded");
  });
});
