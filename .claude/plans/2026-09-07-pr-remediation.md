# PR #43 Remediation Plan — Round 7

## Authority

- Branch: `feat/structural-spec-check`
- Reviewed head: `621b646ab8b815832a34d6400b776c932aca210e`
- Review Run Directory: `.claude/reviews/review-and-fix-runs/2026-09-07-pr43-all-5`
- Canonical result: `.claude/reviews/review-and-fix-runs/2026-09-07-pr43-all-5/result.json`
- Result digest: `3d429b8e9cbe7a86b5d303bf655e9e92dc52bb98080a31cbb16d730e49267c0c`
- Outcome: 9 surviving critical Findings, 19 advisories, 0 refuted critical Findings.

## Frozen review scope

1. `.claude/plans/2026-09-05-pr-43-remediation-round2.md`
2. `.claude/plans/2026-09-05-pr-43-remediation.md`
3. `.claude/plans/2026-09-06-pr-43-remediation-round3.md`
4. `.claude/plans/2026-09-06-pr-43-remediation-round4.md`
5. `.claude/plans/2026-09-07-pr-remediation.md`
6. `CONTEXT.md`
7. `commands/spec-check.md`
8. `engine/src/core/parse-spec.ts`
9. `engine/src/core/requirement-coverage.ts`
10. `engine/src/core/spec-check.ts`
11. `engine/src/core/task-graph-population.ts`
12. `engine/src/core/wave-review-authority.ts`
13. `engine/src/handlers/helpers/populate-task-graph.ts`
14. `engine/src/handlers/helpers/programs/wave-gate.ts`
15. `engine/src/handlers/helpers/store-spec-check.ts`
16. `engine/src/handlers/subagent-stop/store-spec-check-findings.ts`
17. `engine/src/linter/programmatic/no-cross-boundary-imports.ts`
18. `engine/src/orchestration/spec-index-observation.ts`
19. `engine/src/orchestration/wave-spec-check-documents.ts`
20. `engine/src/parsers/index.ts`
21. `engine/src/state-manager.ts`
22. `engine/src/types.ts`
23. `engine/tests/core/parse-spec.property.test.ts`
24. `engine/tests/core/parse-spec.test.ts`
25. `engine/tests/core/requirement-coverage.property.test.ts`
26. `engine/tests/core/requirement-coverage.test.ts`
27. `engine/tests/core/round15.test.ts`
28. `engine/tests/core/spec-check-floor.test.ts`
29. `engine/tests/core/task-graph-population.test.ts`
30. `engine/tests/handlers/complete-wave-gate.test.ts`
31. `engine/tests/handlers/helpers/orchestration.test.ts`
32. `engine/tests/handlers/helpers/programs/wave-gate-decision-authority.test.ts`
33. `engine/tests/handlers/helpers/store-spec-check.test.ts`
34. `engine/tests/handlers/helpers/wave-spec-check-scope.test.ts`
35. `engine/tests/handlers/populate-task-graph.test.ts`
36. `engine/tests/handlers/store-spec-check-findings.test.ts`
37. `engine/tests/handlers/subagent-stop/dispatch-resilience.test.ts`
38. `engine/tests/orchestration/spec-index-observation.test.ts`
39. `engine/tests/parsers/parse-spec.property.test.ts`
40. `engine/tests/pi/subagent-result.test.ts`
41. `engine/tests/review-round6-core-regressions.test.ts`
42. `engine/tests/spec-check-command-contract.test.ts`
43. `engine/tests/spec-template-contract.test.ts`
44. `engine/tests/state-manager-load-guards.test.ts`
45. `pi/extension.ts`
46. `pi/subagent-result.ts`
47. `scripts/smoke-orchestration-facades.ts`

## Mandatory surviving critical Findings

### C1 — `code-reviewer-1`: wrapped Spec entries lose content and hash authority

`parseEntries` currently mints FR/AS/OOS entries from only the physical bullet line. Indented and lazy continuation text can therefore disappear from both projected content and `contentHash`.

**Fix:** collect each canonical list item's complete continuation body, canonicalize the joined content once, and mint the entry from that complete value. Acceptance-block collection must retain continuation lines after its first bullet. Unsupported nested/noncanonical bullets remain fail-closed. Add example and property coverage proving continuation text appears in the projection and any continuation change changes the content hash.

### C2 — `silent-failure-hunter-1`: active Wave Gate can be committed before program registration

`startWaveGateFacade` writes `active_wave_gate` before `program.json`; a failed registration strands protected state with no registered program.

**Fix:** prepare and durably register the program first, then register protected active authority. A failed program registration must leave the TaskGraph byte-identical; an active-registration race may leave only a resumable registered Run Directory, never unsupported protected authority. Add regression coverage for the ordering/failure contract.

### C3 — `pr-test-analyzer-1`: ambiguous settled-floor records downgrade to legacy authority

A `settled` record with a misspelled or surplus identity field currently takes the missing-`criticalFindings` compatibility branch and becomes count-only authority.

**Fix:** parse every floor arm against an exact field set. Only exact `{kind,count}` is historical count-only authority; exact `{kind,count,criticalFindings}` is current authority. Reject all surplus/misspelled fields. Add direct and TaskGraph-boundary negative tests.

### C4 — `pr-test-analyzer-2`: historical floor upgrade lacks lock-bound integration coverage

The pure replay decision is covered, but the actual `installWaveReviewRuns` locked transition is not.

**Fix:** add an integration test using a real StateManager and RunDirHandle. Seed an exact historical epoch plus stale count-only `spec_check`, run the real installation, and prove one locked transition replaces it with the identity-bearing floor and clears stale evidence.

### C5 — `type-design-analyzer-1`: persisted `UNKNOWN` is modeled as captured evidence

`CapturedSpecCheck` admits `UNKNOWN`, while Wave Gate retry detection treats every non-failure verdict as settled. A historical UNKNOWN record can suppress bounded recapture while remaining unusable for readiness.

**Fix:** restrict captured evidence to `PASSED | BLOCKED`. Parse a structurally valid historical UNKNOWN count record into an explicit retryable transcript evidence failure, preserving compatibility while making the unusable state unrepresentable after parsing. Add load-boundary and retry tests.

### C6 — `comment-analyzer-1`: glossary delimiter comment overclaims GFM grammar

Panel votes disagreed about the GFM minimum, but the Finding survived. Runtime support for one-hyphen separators is intentional and already tested.

**Fix:** remove the disputed standards claim. Document and test the behavior as Loom's accepted delimiter grammar rather than attributing it to GFM.

### C7 — `comment-analyzer-2`: unavailable Spec Index warning describes only later recovery

Continued projection unavailability blocks with `projection-unavailable`; only a later successful projection without recorded hashes yields unverifiable drift.

**Fix:** rewrite the comment and stderr warning to state both outcomes exactly.

### C8 — `comment-analyzer-3`: manual-store test names the wrong authority arm

The helper uses `manualOverrideFloor`, not `unprojectedFloor`, and the latter would refuse the write.

**Fix:** rewrite the test rationale around attributable manual override authority and remove the false floor-equivalence claim.

### C9 — `comment-analyzer-4`: Findings writer inventory names a nonexistent initializer

Task initialization moved to `sanitizeTask` in `core/task-graph-population.ts`, but three comments still name `sanitizeDecomposedTask` in the old shell module.

**Fix:** update all writer-inventory references to the actual pure aggregate initializer and location.

## Advisory dispositions

All advisories are **accepted**. Each claim is sound, correctness-relevant or clarity-improving, practical within the frozen scope, and low-risk when covered by the tests below.

1. **`code-reviewer-2` — accepted.** Route Pi's missing-result recovery through `settleSpecCheck`; one aggregate must own evidence plus Wave-block state.
2. **`code-reviewer-3` — accepted.** Same correction as C7; operators need both unavailable-projection outcomes.
3. **`silent-failure-hunter-2` — accepted.** Report unexpected restart exceptions through the existing stack-preserving Wave Gate diagnostic.
4. **`silent-failure-hunter-3` — accepted.** Apply the same stack-preserving diagnostic to orphan recovery.
5. **`silent-failure-hunter-4` — accepted.** Apply the same diagnostic to unexpected start exceptions while retaining the external blocked action.
6. **`silent-failure-hunter-5` — accepted.** Preserve independent best-effort sweeps, but emit full stack diagnostics and an operator-visible warning when UI is available; explicitly state that startup continues and authority remains checked at consumption.
7. **`pr-test-analyzer-3` — accepted.** A population reset must remove active/terminal Wave, epoch, spec-check, completion-suite, reopening, orphan, and trace-retirement authority tied to replaced Tasks; prove this under `--force`.
8. **`pr-test-analyzer-4` — accepted.** Generate canonical contiguous Wave sets beginning at 1 in the success property instead of blessing impossible fixtures.
9. **`type-design-analyzer-2` — accepted.** Replace nullable correlated Pi review fields with a `legacy | slot-bound` discriminated union and test that mixed authority is unrepresentable.
10. **`type-design-analyzer-3` — accepted.** Require a non-empty authored-Task tuple in `TaskGraphPopulationCommand` and retain a defensive runtime refusal at the exported aggregate boundary.
11. **`comment-analyzer-5` — accepted.** Rename `NO_FLOOR` to `UNAVAILABLE_FLOOR` and explain why transcript defects short-circuit before projection refusal.
12. **`comment-analyzer-6` — accepted.** Replace opaque A14/line-count history with the current persistent Wave Gate driver contract.
13. **`comment-analyzer-7` — accepted.** Remove step-label comments that only narrate the import scanner's immediately visible control flow.
14. **`architecture-tech-lead-1` — accepted.** Same Pi single-owner aggregate correction as advisory 1.
15. **`architecture-tech-lead-2` — accepted.** Use private constructors that defensively copy/freeze SpecCheck arrays, nested provenance, evidence, and resolution records; prove deep immutability at `settleSpecCheck`.
16. **`code-simplifier-1` — accepted.** Same Pi aggregate correction as advisories 1 and 14.
17. **`code-simplifier-2` — accepted.** Derive the observed Spec Index digest once before comparison.
18. **`code-simplifier-3` — accepted.** Delete the misleading duplicate `resolvedSpecFile` comparison test; retain the real locked race integration test.
19. **`code-simplifier-4` — accepted.** Keep only the current shared legacy-authority predicate invariant in JSDoc; remove remediation history.

## Refuted-Finding audit

No critical Finding reached the strict-majority refutation threshold, so `refuted_critical_findings` is empty and no critical is excluded from remediation. For audit completeness:

- C5 received one intent refutation but reproduction and security upheld it.
- C6 received one reproduction refutation, one intent uphold, and one security uncertainty.
- C4 received three uncertain votes; uncertainty preserves the Finding by policy.
- Every other critical was upheld by at least two lenses.

## Architecture and implementation order

1. Repair Spec parsing so complete list-item content is the only hash input; update parser properties and the glossary wording.
2. Tighten persisted floor and SpecCheck ADTs at parse boundaries; add exact-schema, UNKNOWN migration, and deep-freeze tests.
3. Make `settleSpecCheck` the exclusive Pi recovery transition and replace nullable Pi review authority with its discriminated union.
4. Make TaskGraph Population accept non-empty authored Tasks and produce a true replacement aggregate with all old Wave authority removed; repair properties and force-reset integration tests.
5. Reorder Wave Gate start publication, preserve stack diagnostics across start/restart/recovery, and add the historical floor-upgrade lock integration test.
6. Correct stale operational/test comments, startup UI diagnostics, duplicate digest derivation, and narrating comments; delete only the specifically identified redundant test.
7. Update `CONTEXT.md` where the domain contract changed: complete Spec entry content, usable captured verdicts, population replacement authority, and registration-before-active publication.
8. Establish a green focused baseline, then run `distill` in apply mode one move at a time without changing behavior or weakening assertions.
9. Run final full validation, audit dirty paths against frozen scope, and let registered remediation stage/verify/install the exact index.

## Validation

```bash
cd engine
npm run typecheck
npx vitest run \
  tests/core/parse-spec.test.ts \
  tests/core/parse-spec.property.test.ts \
  tests/core/spec-check-floor.test.ts \
  tests/core/task-graph-population.test.ts \
  tests/handlers/helpers/orchestration.test.ts \
  tests/handlers/helpers/store-spec-check.test.ts \
  tests/handlers/populate-task-graph.test.ts \
  tests/pi/subagent-result.test.ts \
  tests/review-round6-core-regressions.test.ts \
  tests/spec-check-command-contract.test.ts \
  tests/state-manager-load-guards.test.ts
npm run test:unit
env -u PI_CODING_AGENT npm run test:smoke
cd ..
git diff --check
```

## Remediation support paths

The following three paths are outside `result.json.scope` but contain the same stale writer-inventory terminology as C9. Leaving them unchanged would preserve contradictory documentation for the removed initializer, so they are authorized as comment-only remediation support:

- `engine/src/core/findings.ts`
- `engine/src/handlers/helpers/validate-task-graph.ts`
- `engine/tests/handlers/validate-task-graph.test.ts`

Every other planned path, including this plan, is already inside `result.json.scope`. No other support path is authorized.
