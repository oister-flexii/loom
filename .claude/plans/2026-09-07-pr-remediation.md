# PR #43 Remediation — Round 6

- **Branch:** `feat/structural-spec-check`
- **Head reviewed:** `0c699ba56d56db7bd07ccb35778b6a78b1ace4d6`
- **PR:** #43 — `feat(spec-check): structural Requirement Coverage Projection (#11 phase 3)`
- **Review Run Directory:** `.claude/reviews/review-and-fix-runs/2026-09-07-pr43-all-4`
- **Review result:** 4 surviving critical findings, 21 advisories, 0 refuted critical findings
- **Reviewer evidence:** all seven attempt-1 reviewer captures succeeded. The reproduction, intent, and security Refutation Panel captures all succeeded on attempt 1.

## Exact frozen review scope

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
11. `engine/src/core/wave-review-authority.ts`
12. `engine/src/handlers/helpers/populate-task-graph.ts`
13. `engine/src/handlers/helpers/programs/wave-gate.ts`
14. `engine/src/handlers/helpers/store-spec-check.ts`
15. `engine/src/handlers/subagent-stop/store-spec-check-findings.ts`
16. `engine/src/linter/programmatic/no-cross-boundary-imports.ts`
17. `engine/src/orchestration/spec-index-observation.ts`
18. `engine/src/orchestration/wave-spec-check-documents.ts`
19. `engine/src/parsers/index.ts`
20. `engine/src/state-manager.ts`
21. `engine/src/types.ts`
22. `engine/tests/core/parse-spec.property.test.ts`
23. `engine/tests/core/parse-spec.test.ts`
24. `engine/tests/core/requirement-coverage.property.test.ts`
25. `engine/tests/core/requirement-coverage.test.ts`
26. `engine/tests/core/spec-check-floor.test.ts`
27. `engine/tests/handlers/complete-wave-gate.test.ts`
28. `engine/tests/handlers/helpers/orchestration.test.ts`
29. `engine/tests/handlers/helpers/programs/wave-gate-decision-authority.test.ts`
30. `engine/tests/handlers/helpers/store-spec-check.test.ts`
31. `engine/tests/handlers/helpers/wave-spec-check-scope.test.ts`
32. `engine/tests/handlers/populate-task-graph.test.ts`
33. `engine/tests/handlers/store-spec-check-findings.test.ts`
34. `engine/tests/handlers/subagent-stop/dispatch-resilience.test.ts`
35. `engine/tests/orchestration/spec-index-observation.test.ts`
36. `engine/tests/parsers/parse-spec.property.test.ts`
37. `engine/tests/pi/subagent-result.test.ts`
38. `engine/tests/review-round6-core-regressions.test.ts`
39. `engine/tests/spec-check-command-contract.test.ts`
40. `engine/tests/spec-template-contract.test.ts`
41. `engine/tests/state-manager-load-guards.test.ts`
42. `pi/extension.ts`
43. `pi/subagent-result.ts`
44. `scripts/smoke-orchestration-facades.ts`

## Surviving critical findings — mandatory

### C1 — altered Requirement Content Hash can be omitted from the settled floor

- **Finding:** `code-reviewer-1`
- **Location:** `engine/src/core/requirement-coverage.ts:343`
- **Claim:** an `unreadable-record` row is CRITICAL but agent-decided, so count-only floor derivation excludes it and can accept a zero-critical PASSED transcript despite corrupted Requirement-hash authority.
- **Panel:** upheld by reproduction and security; refuted by intent. It survives the 2-of-3 threshold.
- **Fix:** derive canonical, identity-bearing settled CRITICAL footer findings from every projected structural CRITICAL—including agent-decided altered-hash rows—plus unclaimed FR/AS and the synthetic no-trace finding. Persist the exact identities beside a safe count in the epoch floor, render the exact `CRITICAL:` lines into the immutable projection, and require every expected identity in captured transcript evidence while allowing additional Agent findings. Parse old count-only floors as an explicit legacy variant and upgrade byte-identical epochs to the current identity-bearing floor under lock. Add example and property coverage for altered hashes, missing identities, extra findings, persistence, and legacy upgrades.

### C2 — missing or wrong SPEC_CHECK_WAVE settles another Wave

- **Finding:** `code-reviewer-2`
- **Location:** `engine/src/core/spec-check.ts:272`
- **Claim:** reconciliation never requires `parsed.wave` or compares it with protected Wave authority.
- **Panel:** upheld unanimously by reproduction, intent, and security.
- **Fix:** make the Wave marker mandatory and exact in the shared pure reconciliation boundary before any captured evidence is minted. Reject missing, unsafe, or mismatched markers with typed transcript evidence failure. Exercise the pure core and each settlement adapter through shared aggregate tests.

### C3 — standalone spec-check can pair the live graph with an unrelated newest Spec

- **Finding:** `comment-analyzer-1`
- **Location:** `commands/spec-check.md:83`
- **Claim:** standalone instructions choose the newest Spec by mtime but read Wave/Task authority from `active_task_graph.json`.
- **Panel:** upheld by reproduction and security; refuted by intent. It survives.
- **Fix:** read the live TaskGraph exactly once, take `spec_file`, `current_wave`, and Task scope from that same snapshot, and only use the documented newest-Spec heuristic as an explicit legacy fallback when `spec_file` is null/absent. Update executable command-contract assertions.

### C4 — claimed Acceptance Scenarios escape test-link coverage

- **Finding:** `comment-analyzer-2`
- **Location:** `commands/spec-check.md:150`
- **Claim:** projected Step 5 inspects only unclaimed scenarios even though the contract defines severities for claimed scenarios lacking tests.
- **Panel:** upheld unanimously by reproduction, intent, and security.
- **Fix:** make Step 5 inspect every claimed AS row from the projection for a real test-name link, then inspect unclaimed scenarios separately without replacing their already-settled CRITICAL finding. Preserve happy/error/edge severity policy and add command-contract tests that fail if claimed AS checks disappear.

## Advisory dispositions

### Accepted (21)

1. **`code-reviewer-3` — accepted.** Manual override provenance is audit authority. Add a captured-evidence source union whose manual variant carries the non-empty reason, persist it through `store-spec-check`, and parse it fail-closed while retaining an explicit legacy/registered absence shape.
2. **`code-reviewer-4` — accepted.** Persisted floor counts must be non-negative safe integers. Tighten the parser and prove refusal of `1e100` and `MAX_SAFE_INTEGER + 1`.
3. **`silent-failure-hunter-1` — accepted.** Count-only enforcement can preserve blocking while losing the engine’s actual defects. The C1 identity-bearing floor requires every rendered settled finding verbatim and persists those identities.
4. **`silent-failure-hunter-2` — accepted.** Enforce `PASSED iff critical_count === 0`; contradictory PASSED/BLOCKED evidence becomes a transcript failure.
5. **`silent-failure-hunter-3` — accepted.** Duplicate of safe-integer parsing, also covering persisted captured spec-check counts. Use one shared safe-count parser predicate.
6. **`silent-failure-hunter-4` — accepted.** Preserve unexpected Wave Gate diagnostics rather than collapsing them to ordinary prose: distinguish the outer internal-failure path, emit the full stack/cause to stderr, and retain a clearly typed/prefixed blocked diagnostic while expected domain refusals stay data.
7. **`pr-test-analyzer-1` — accepted.** Add direct and façade-level regression coverage proving `projection-unavailable` is a decided, non-reapplyable refusal.
8. **`type-design-analyzer-1` — accepted.** Brand `ManualOverrideFloor` with a module-private unique-symbol witness so ordinary object literals cannot bypass `decideSpecCheckManualOverride`; only the validating smart constructor mints it.
9. **`type-design-analyzer-2` — accepted.** Make `unprojectedFloor` reject blank reasons at construction so every produced value round-trips through `parseSettledFloor`.
10. **`comment-analyzer-3` — accepted.** Replace “planned by nobody” with “has no planned completion owner” and explicitly distinguish Requirement Contributions from completion ownership.
11. **`comment-analyzer-4` — accepted.** Correct `parsedAnchorHashes` documentation: the StateManager rejects non-string values; only malformed strings reach the unreadable-record arm.
12. **`comment-analyzer-5` — accepted.** Document both missing-hash outcomes: later successful projection yields unverifiable drift; continuing projection failure yields `projection-unavailable` refusal.
13. **`comment-analyzer-6` — accepted.** Correct the contract-test comment to say a section-label mismatch loudly blocks registered spec-check decoding.
14. **`architecture-tech-lead-1` — accepted.** Introduce one pure spec-check settlement aggregate command in `core/spec-check.ts`. It consumes validated authority plus a transcript/capture-failure/manual observation and returns one immutable TaskGraph transition that updates `spec_check` and `wave_gates` together. Claude, Pi, Wave façade, and manual helper become load/authorize/observe → command → persist shells. This is downward shared semantic mechanics and does not violate ADR-0005’s per-program driver decision.
15. **`architecture-tech-lead-2` — accepted.** Extract TaskGraph population policy into `core/task-graph-population.ts`: a pure command consumes parsed authored tasks, prepared manifest/Spec observations, locked TaskGraph, options, and expected Spec identity, returning `Either<PopulationError, TaskGraph>`. The helper retains JSON/CLI parsing, Git/filesystem observations, model checks, locking, diagnostics, and persistence only. Test the pure aggregate directly without temporary repositories.
16. **`code-simplifier-1` — accepted.** Replace historical `PopulateArgs` commentary with the current CLI authority contract.
17. **`code-simplifier-2` — accepted.** Simplify `hashesOf` to trust parser-minted `SpecContentHash` values and remove the impossible null branch.
18. **`code-simplifier-3` — accepted.** Remove duplicate `spec_anchor_hashes` parser cases from the Wave scope suite; retain the stronger table-driven StateManager load-boundary coverage.
19. **`code-simplifier-4` — accepted.** Define one canonical passing spec-check footer helper/fixture in orchestration tests.
20. **`code-simplifier-5` — accepted.** Consolidate and order Wave scope test imports before declarations.
21. **`code-simplifier-6` — accepted.** Reuse one exact passing spec-check footer constant in both façade smoke flows.

### Deferred

None.

### Dismissed

None.

## Refuted-finding audit

`refuted_critical_findings` is empty. The panel considered four critical Findings and all four survived. C1 and C3 received intent-lens refutations based on the previous count-only/mtime policies, but reproduction and security upheld the concrete integrity failures, satisfying the 2-of-3 threshold. C2 and C4 were upheld unanimously.

## Deep interface design

### Spec-check settlement aggregate

- **Input ADT:** exact Wave/time, validated floor authority, and one of registered transcript, manual transcript, or capture-failure observation.
- **Output ADT:** applied immutable TaskGraph plus resulting `SpecCheck`, or a typed manual-evidence refusal that preserves the original graph.
- **Hidden invariants:** marker completeness/exact Wave, safe and matching counts, verdict/count consistency, projection availability, settled identity inclusion, evidence-source attribution, and atomic `spec_check`/Wave-block reconciliation.
- **Shell responsibility:** obtain request/document/manual authority, parse bytes, call the command under lock, persist its returned graph, and render its typed outcome.

### TaskGraph population aggregate

- **Input:** locked graph, validated authored decomposition, validated plan path, prepared verification manifest, observed Spec Index/path, CLI metadata, and overwrite authority.
- **Output:** `Either<PopulationError, TaskGraph>` with non-pending overwrite and Spec identity races represented as data.
- **Hidden invariants:** sanitized pending Tasks, parser-derived Requirement hashes, exact Wave gate keys, stale completion-suite removal, fixed current Wave/execution state, and metadata precedence.
- **Shell responsibility:** parse/validate stdin and flags, observe Git/filesystem data, verify executable-model bindings, acquire the StateManager lock, invoke the pure command, and persist only `Right`.

## Implementation order

1. Add failing core tests for identity-bearing floors, altered-hash enforcement, exact Wave markers, verdict consistency, safe persisted counts, non-empty/opaque authority constructors, manual provenance, and non-reapplication.
2. Implement the floor/evidence ADTs and pure settlement aggregate; migrate all four transport shells to the aggregate.
3. Add failing pure population-command tests, extract the aggregate, and reduce `populate-task-graph` to its imperative shell.
4. Correct standalone Spec authority, claimed-scenario coverage, current comments, and `CONTEXT.md` ubiquitous language.
5. Apply accepted fixture/test simplifications without weakening behavior.
6. Run focused tests, typecheck/unused gates, full unit suite, smoke suite, and `git diff --check`.
7. Run `distill` apply mode over a green baseline one behavior-preserving move at a time, re-running covering tests after each move.
8. Start registered remediation with the support paths below; let the façade audit, stage, verify, and atomically install the exact index.

## Validation commands

```bash
cd engine && env -u PI_CODING_AGENT bunx vitest run \
  tests/core/requirement-coverage.test.ts \
  tests/core/requirement-coverage.property.test.ts \
  tests/core/spec-check-floor.test.ts \
  tests/core/task-graph-population.test.ts \
  tests/handlers/helpers/store-spec-check.test.ts \
  tests/handlers/helpers/wave-spec-check-scope.test.ts \
  tests/handlers/populate-task-graph.test.ts \
  tests/handlers/store-spec-check-findings.test.ts \
  tests/handlers/subagent-stop/dispatch-resilience.test.ts \
  tests/handlers/helpers/orchestration.test.ts \
  tests/pi/subagent-result.test.ts \
  tests/spec-check-command-contract.test.ts \
  tests/state-manager-load-guards.test.ts \
  --testTimeout=20000
cd engine && npm run typecheck
cd engine && npm run test:unit
cd engine && env -u PI_CODING_AGENT npm run test:smoke
git diff --check
```

## Registered remediation support paths

- `engine/src/core/task-graph-population.ts` — new functional-core module required by accepted advisory `architecture-tech-lead-2`; it is not in the frozen review scope because it does not yet exist.
- `engine/tests/core/task-graph-population.test.ts` — direct no-I/O tests at the new aggregate interface; it is not in the frozen review scope because it does not yet exist.
- `engine/tests/core/round15.test.ts` — existing compatibility fixture outside the frozen scope; the new verdict/count invariant makes its former `PASSED` plus one-critical record illegal, so the immutability test now uses the equivalent legal `BLOCKED` record without changing its subject.

The plan file itself and every other planned production/test path are already inside `result.json.scope`; no other support path is authorized.
