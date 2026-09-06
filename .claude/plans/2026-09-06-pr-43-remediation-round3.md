# PR #43 Remediation — round 3

**Branch:** `feat/structural-spec-check`, head `b59a929`
**Review Run:** `.claude/reviews/review-and-fix-runs/review-20260905T172431Z-15764`
**Result:** 24 surviving criticals, **0 refuted**, 43 advisories. All seven reviewers captured; refutation panel ran on three lenses (`reproduction`, `intent`, `security`).

Round 3 is the first fully adjudicated round of this PR. Two slots needed attempt 2: the engine rejected their attempt-1 captures because they cited `engine/src/handlers/helpers/store-spec-check.ts`, a file outside the frozen scope. That rejection is itself informative — see D1.

## The shape of this round

Round 1 built the projection. Round 2 found the enforcement existed on one of three settlement paths and moved it into `reconcileSpecCheck`. **Round 3 found a fourth path, and that the fix's own guard test could not see it.** The same defect, three generations running, each time one level further out:

| Round | The miss | The thing that should have caught it |
|---|---|---|
| 1 | nothing enforced the projection at all | — |
| 2 | enforcement on 1 of 3 paths, and it erased itself | — |
| 3 | enforcement on 3 of 4 paths | a hand-maintained three-entry list in a source-text scan |

The lesson the reviewers converged on: **a list is not a closure.** The fix is a type, not a longer list.

---

## D1 — `settledFloor` defaults to `null`, and a fourth settlement path takes it
*type-design-analyzer-1, architecture-tech-lead-1, comment-analyzer-2, comment-analyzer-3, code-simplifier-1*

`engine/src/handlers/helpers/store-spec-check.ts:67` calls `reconcileSpecCheck(parsed, wave, runAt)` — three arguments — then writes `spec_check` **and** `reconcileWaveBlock`, exactly as the three floored paths do. It takes the `settledFloor: number | null = null` default silently. On a legacy graph `decideSpecCheckManualOverride` returns `allowed` with no reason demanded, and its `wave` comes from the operator's own stdin marker.

The `null` also collapses two different facts: "no projection was available" (a real domain state) and "this caller never asked" (an omission). Nothing can distinguish an honestly unprojected settlement from an unenforced one.

**Fix:** `SettledFloor = {kind:"settled"; count} | {kind:"unprojected"; reason}`, non-optional, mintable only by `settledSpecCheckFloor`. `tsc` then names every call site — including the fourth — and the two nulls become two constructors. The source-text scan test is deleted with it: a grep that already has a hole reads as a proof of totality and is worse than no test.

**Scope note:** `store-spec-check.ts` is outside the frozen review scope (this PR never modified it). It must change anyway — my signature change is what silently unfloored it — so it is registered as a support path.

## D2 — The floor is applied where the Agent was never shown a projection
*code-reviewer-1*

`specCheckAuthorityProblem` returns `null` on a legacy graph, which is exactly the case where the spec-check Agent ran with **no `LOOM_CONTEXT_PATH`** and is on the Unprojected path. The hook floors it anyway, from a live graph. Legacy graphs frequently carry no `files_modified`, so every claim classifies `not-implemented` → CRITICAL and an honest zero-CRITICAL report is failed against a number the Agent could not see.

**Fix:** floor only a packet-correlated capture. No epoch, no floor.

## D3 — The Agent picks the Wave its own floor is computed over
*code-reviewer-2*

`wave = state.wave_review_epoch?.wave ?? findings.wave ?? state.current_wave ?? 1`. On the path where the epoch is absent by construction, `findings.wave` is the Agent's own `SPEC_CHECK_WAVE` marker, and it selects the roster via `coverageTasks(graph, wave)`. A floor whose scope is chosen by the reported party is not a floor.

**Fix:** the floor's Wave comes from protected state only.

## D4 — The synthetic no-claims row is false for a contributions-only Wave
*code-reviewer-3, type-design-analyzer-3*

`CoverageTask` has no `contributions` field — `waveSpecCheckScope` carries it, `coverageTasks` drops it. So `rows.length === 0` cannot distinguish "claims nothing" from "traces only via `spec_contributions`", and the row asserts *"no work in this Wave traces to a Requirement"* about a Wave where CONTEXT.md says that is legitimate. Round 2 then made the floor count it, so the Agent must emit a CRITICAL it cannot substantiate, with no remedy.

**Fix:** carry `contributions`; split the row into `no-traceability` (floors) and `contributions-only` (renders, does not floor).

## D5 — An agent-decided row counts toward the floor with no rule to emit it
*type-design-analyzer-2, architecture-tech-lead-2*

`claimSeverity` grades `candidate-pass` + `unreadable-record` CRITICAL; `claimDecider` grades it `agent`. `settledCriticalCount` filters on **severity**, but the command's emission rules key off **decider**. The count crossed the axis the module header says must stay orthogonal.

**Fix:** the floor counts engine-decided rows only.

## D6 — Step 5 contradicts Step 4 on the identifiers the floor counts
*comment-analyzer-6*

Step 4 mandates every unclaimed `AS-NNN` as CRITICAL; Step 5 grades the same roster COVERED / HIGH / MEDIUM / LOW. `settledCriticalCount` counts them into the floor.

**Fix:** Step 5 assesses *coverage* of scenarios that already have their CRITICAL from Step 4; the two stop competing.

## D7 — Three comments state things that are false
*comment-analyzer-1, -4, -5*

"a `null` floor is not a pass" (it is behaviourally identical to `0`); "the number shown and the number enforced come from one place" (refuted by probe: 0 vs 1); "`prepareWaveReviewBatch` PROVES the pairing" (the `unavailable` arm short-circuits to path equality).

## D8 — A floor refusal is not durable
*silent-failure-hunter-2*

`wave-gate.ts:1712` re-applies a capture precisely when the verdict is `EVIDENCE_CAPTURE_FAILED` — what a floor violation writes. Round 2 made the façade floor *inside* its lock, which makes re-application idempotent **given the same floor**; D9 shows the floor is not stable, so a resume can overwrite the refusal with `PASSED` and leave no record it existed.

**Fix:** give the evidence failure a typed cause so the loop can tell a re-applyable transcript failure from a decided refusal.

## D9 — Enforced and rendered floors can diverge
*silent-failure-hunter-1, comment-analyzer-4*

Round 2 **deferred** this with the justification "always weakening, never a false block". The `intent` lens refuted the finding on exactly that ground — and lost 2–1, because `comment-analyzer` proved the justification false: an added unreadable hash raises the enforced floor *above* the rendered one, failing an honest report. The deferral's premise does not hold, so it is no longer deferrable.

**Fix:** carry the settled floor in the packet's authority section and enforce the number the Agent was actually shown.

## D10 — Seven test gaps
*pr-test-analyzer-1 … -7*

57 mutations, 13 survived. The façade and Pi floors are never behaviourally exercised (every fixture uses `spec_file: null`); the scan is substring-only, so a wrong-Wave floor passes it; the one end-to-end fixture settles 3 under three different derivations and cannot tell them apart; swapping the FR and AS rosters is invisible; `cell()`'s newline replace is unpinned; the populate TOCTOU guard is unpinned.

**Partial correction, recorded honestly:** `pr-test-analyzer-1` and `-2` each carry a true headline (no test supplies a non-null floor to those paths) and a **false** corroborating detail (that deleting the argument passes the suite — the scan does catch deletion). Both the `reproduction` and `intent` verifiers caught this. The findings survive on their headline; the false half is not repeated in the fix.

---

## Advisory dispositions (43)

**Accepted** — subsumed by D1 (`settledFloorProblem` dead / duplicated rule / the "defaults to no floor" test that pins the defect as intent), by D5 (severity-vs-decider), by D7 (orphaned JSDoc on `footerFindings` and `renderUnavailable`; the "frozen current-Wave roster" framing in the module header and CONTEXT.md; the round-2 plan's two inaccurate claims), and by D10 (the property test that transcribes `settledCriticalCount`'s body; `claimArb` unable to emit a newline).

**Accepted, fixed here:** the dead `const resolution = captured` alias; the duplicate `withTaskGraphPointer`; `reducePiSpecCheckResult` splitting one `WaveSpecCheckObservation` into two parameters; the evolving-`any` `let specObservation`; `SpecIndexAvailability` imported from two module paths; `exactObject` and `hasBlank(declaredFiles)` unpinned; `inCurrentWave` widening unpinned.

**Deferred, with reason:** `prepareWaveReviewBatch`'s size and the two parallel Task→row mappers (`deepen`-shaped seam extractions, unchanged since round 1); `modifiedFiles` on `WaveSpecCheckTaskAuthority` being unread by engine code (removing a persisted field needs its own compatibility pass); `contentDigest` unbranded; `NONE` naming; the nine duplicated spec fixtures; the hoisted command table's five restatements; the shared test-fixture builder.

---

## Refuted findings audit

**None survived refutation.** Four were refuted by the `intent` lens alone and lost 2–1:
- `silent-failure-hunter-1` and `pr-test-analyzer-5` — refuted as knowingly deferred in the round-2 plan. `reproduction` upheld both on reachability; for `-1`, `comment-analyzer-4` independently falsified the deferral's stated justification, which is why it is fixed here rather than deferred again.
- `pr-test-analyzer-1` and `-2` — refuted because the scan *does* catch literal argument deletion. Correct on that point, and recorded above; the headline gap is real and upheld.

## What landed, and what the fixes turned out to be

**D1 closed structurally.** `SettledFloor` is a required ADT. Making the parameter non-optional is what made `tsc` name all four settlement paths, including the one the hand-maintained scan list missed. The scan test is deleted; in its place `spec-check-floor.test.ts` asserts `reconcileSpecCheck.length === 4`, which fails the moment a default is reintroduced.

**D2 and D3 stopped being guards and became structure.** D9's fix removed the re-projection entirely, so there is no longer a Wave to pick or a live graph to floor against: the floor is read back from the epoch that rendered it, and an absent epoch has no floor by construction. `settledSpecCheckFloor(specIndex, graph, wave)` is deleted; `epochSettledFloor(epoch)` replaces it at all three consumers.

**D8 and D9 are one change.** D8's typed cause is only sound because D9 made the floor stable: re-applying a capture against a *recorded* floor can only reach the same answer, which is what makes skipping the re-application safe rather than lossy. Both decisions moved out of the Wave Gate shell into the functional core as pure predicates — `specCheckNeedsReapplication` and `isExactEpochReplay` — because a decision no test can reach is the defect class this PR has now produced three times.

- `WaveRequestBatch.settledFloor` is derived from the same `requirementCoverage` value the packet renders, so recorded and rendered are one expression.
- `WaveReviewEpochAuthority.settledSpecCheckFloor` persists it; `parseSettledFloor` is keyed by `SettledFloor["kind"]`, so a third variant fails to compile rather than parsing as `null` and unflooring every restored epoch.
- A corrupt floor is refused at load. An **absent** one is not: it is an epoch installed before the field existed, and `epochSettledFloor` states that rather than inventing a number.
- `isExactEpochReplay` treats an absent recorded floor as compatible. Refusing it would turn an engine upgrade mid-Wave into a hard failure for no added safety.

**One correction to D1's framing, found while fixing it.** `evidenceFailure` first took `cause` as a defaulted parameter — the same shape D1 condemns, one level down. It is required at all seven call sites.

## Mutation ledger

Fifteen mutations over the round-3 fixes, each run against the tests that should catch it. **15 killed, 0 survived.**

| # | Mutation | Killed by |
|---|---|---|
| M1 | `epochSettledFloor` always unprojected | handler + Pi floor cases |
| M2 | `specCheckNeedsReapplication` always true | floor unit + end-to-end resume |
| M3 | floor compares `<=` instead of `<` | meets-the-floor cases |
| M4 | `isExactEpochReplay` ignores the floor | replay predicate cases |
| M5 | installation stops recording the floor | epoch install + end-to-end |
| M6 | every failure reports `cause: "transcript"` | cause assertions, three transports |
| M7 | `cell()` drops the newline collapse | row-forging case |
| M8 | populate TOCTOU guard disabled | new pre-lock divergence case |
| M9 | `parseSettledFloor` accepts any object | load guards |
| M10 | unclaimed FR/AS rosters swapped in the render | per-heading roster case |
| M11 | floor counts by severity, not decider | decider/severity separation |
| M12 | contributions-only Wave floors a synthetic CRITICAL | foundation-Wave case |
| M13 | `spec_check.cause` unvalidated on load | stored-record cases |
| M14 | captured record tolerates a `cause` | stored-record cases |
| M15 | historical `cause` defaults to `settled-floor` | stored-record cases |

M12 and M13 SURVIVED on the first pass. Both were real gaps and both are now closed — recorded here rather than quietly fixed, because a ledger that only lists kills is not evidence.

## Test gaps closed (D10)

- The façade and Pi floors are now exercised behaviourally. Every prior fixture used `spec_file: null`; `orchestration.test.ts` now drives a real specification end to end through `start` → capture → `resume`, asserts the epoch recorded `{kind:"settled",count:3}`, and asserts the refusal survives a second `resume` byte for byte, `run_at` included.
- The substring scan is deleted, not repaired.
- The one end-to-end fixture no longer settles 3 under three indistinguishable derivations: the recorded floor is an explicit parameter, and a fixture whose live graph settles 3 while its epoch recorded 1 proves the recorded value is the one in force.
- Unclaimed identifiers are bound to their own family heading, sliced per heading rather than searched across the whole render.
- `cell()`'s newline replace is pinned.
- The populate TOCTOU guard is pinned by diverting the pre-lock read.
- `spec-check-command-contract.test.ts` slices each step to the NEXT heading instead of a fixed 1400 characters — the old slice had already started failing for the sole reason that Step 5 grew.

**A real defect the round-3 tests caught in my own fix:** the floor-violation message had lost both `${}` interpolations to an earlier editing accident and read "spec-check reported  CRITICAL but ... settled ;". The operator-facing numbers were gone. Caught by the assertions, fixed, and now asserted on both numbers.

## Validation

```
cd engine
bunx tsc --noEmit && npm run typecheck:unused
npx vitest run --testTimeout=15000 --maxWorkers=4
```
plus all six smoke suites, full-tier lint over every changed file, \`git diff --check\`, and the fifteen-mutation ledger above.

**Result:** 240 test files, 6277 passing, 1 skipped. \`tsc --noEmit\` and \`typecheck:unused\` clean. Full-tier lint over all 33 changed TypeScript files: 0 violations (\`parseStoredSpecCheck\` crossed the 50-line gate once the cause rules were added, and is split into its two verdict arms). All six smoke suites pass. \`git diff --check\` clean.
