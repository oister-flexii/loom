# PR #43 Remediation — Fresh review round 9

## Authority

- Branch: `feat/structural-spec-check`
- Reviewed head: `7c6e9096fb1979fb59c803ebded2f3fdceb0c6e1`
- Pull request: https://github.com/peterstorm/loom/pull/43
- Standalone Review Run: `.claude/reviews/review-and-fix-runs/2026-09-07-pr43-all-7`
- Canonical result: `.claude/reviews/review-and-fix-runs/2026-09-07-pr43-all-7/result.json`
- Result digest: `604a5ea68f7322cb119fea0c319f049a4659e7c84bb3e85f5e50435e7a79e887`
- Adjudication: 6 surviving critical Findings, 21 advisories, 0 refuted critical Findings.

## Frozen review scope

- `.claude/plans/2026-09-05-pr-43-remediation-round2.md`
- `.claude/plans/2026-09-05-pr-43-remediation.md`
- `.claude/plans/2026-09-06-pr-43-remediation-round3.md`
- `.claude/plans/2026-09-06-pr-43-remediation-round4.md`
- `.claude/plans/2026-09-07-pr-remediation.md`
- `CONTEXT.md`
- `commands/spec-check.md`
- `engine/src/core/findings.ts`
- `engine/src/core/parse-spec.ts`
- `engine/src/core/requirement-coverage.ts`
- `engine/src/core/spec-check.ts`
- `engine/src/core/task-graph-population.ts`
- `engine/src/core/wave-review-authority.ts`
- `engine/src/handlers/helpers/populate-task-graph.ts`
- `engine/src/handlers/helpers/programs/wave-gate.ts`
- `engine/src/handlers/helpers/store-spec-check.ts`
- `engine/src/handlers/helpers/validate-task-graph.ts`
- `engine/src/handlers/subagent-stop/store-spec-check-findings.ts`
- `engine/src/linter/programmatic/no-cross-boundary-imports.ts`
- `engine/src/orchestration/spec-index-observation.ts`
- `engine/src/orchestration/wave-spec-check-documents.ts`
- `engine/src/parsers/index.ts`
- `engine/src/state-manager.ts`
- `engine/src/types.ts`
- `engine/tests/core/implementation-application.test.ts`
- `engine/tests/core/parse-spec.property.test.ts`
- `engine/tests/core/parse-spec.test.ts`
- `engine/tests/core/requirement-coverage.property.test.ts`
- `engine/tests/core/requirement-coverage.test.ts`
- `engine/tests/core/round15.test.ts`
- `engine/tests/core/spec-check-floor.test.ts`
- `engine/tests/core/task-graph-population.test.ts`
- `engine/tests/core/wave-completion-readiness.test.ts`
- `engine/tests/handlers/complete-wave-gate.test.ts`
- `engine/tests/handlers/helpers/orchestration.test.ts`
- `engine/tests/handlers/helpers/programs/wave-gate-decision-authority.test.ts`
- `engine/tests/handlers/helpers/store-spec-check.test.ts`
- `engine/tests/handlers/helpers/upgrade-spec-trace.test.ts`
- `engine/tests/handlers/helpers/wave-spec-check-scope.test.ts`
- `engine/tests/handlers/pi-stop-toctou.test.ts`
- `engine/tests/handlers/populate-task-graph.test.ts`
- `engine/tests/handlers/pre-tool-use/validate-task-execution.test.ts`
- `engine/tests/handlers/store-spec-check-findings.test.ts`
- `engine/tests/handlers/subagent-stop/dispatch-resilience.test.ts`
- `engine/tests/handlers/task-execution-attempt-registration.test.ts`
- `engine/tests/handlers/validate-task-graph.test.ts`
- `engine/tests/orchestration/spec-index-observation.test.ts`
- `engine/tests/parsers/parse-spec.property.test.ts`
- `engine/tests/pi-extension-review-events.test.ts`
- `engine/tests/pi/subagent-result.test.ts`
- `engine/tests/review-round6-core-regressions.test.ts`
- `engine/tests/spec-check-command-contract.test.ts`
- `engine/tests/spec-template-contract.test.ts`
- `engine/tests/state-manager-load-guards.test.ts`
- `pi/extension.ts`
- `pi/subagent-result.ts`
- `scripts/smoke-orchestration-facades.ts`

## Surviving critical Findings and mandatory fixes

1. **`code-reviewer-1` — nested list clauses disappear from Requirement content/hash.** Keep a blank-separated indented list marker when the current Requirement list item owns its indentation; only top-level indented code is blanked. Add FR/AS/OOS examples proving nested clauses remain canonical content and hash input.
2. **`silent-failure-hunter-1` — a diagnostic-port exception aborts Pi startup sweeps.** Make sweep execution and each reporting port independently failure-isolated. Continue every registered sweep even when the sweep, diagnostic writer, or warning notifier throws; preserve all available causes in best-effort diagnostics without rethrowing from `session_start`.
3. **`silent-failure-hunter-2` — unsafe review generations can stop monotonic advancement.** Require non-negative safe integers for Task review generations, Review Run generations, accepted review authority generations, Finding provenance generations, and resolution generations. Add load-boundary and core regressions at `Number.MAX_SAFE_INTEGER + 1`.
4. **`comment-analyzer-1` — WaveReopeningAudit documentation names orphan replacement.** Rewrite the JSDoc to describe completed-Wave reopening after exact workspace drift or unverifiable legacy workspace authority; keep orphaned active-run replacement exclusively on `OrphanedWaveGateRetirement`.
5. **`comment-analyzer-2` — withoutFences documentation contradicts nested-marker behavior.** Fixed with Finding 1: implementation and JSDoc will agree that indentation owned by an open Requirement survives, including nested list markers.
6. **`architecture-tech-lead-1` — operator validation accepts protected authority the loader rejects.** Make state-file `validateFull` invoke the exported complete `parseTaskGraph` decoder, so every active/terminal Wave Gate, Wave review epoch, completion-suite, verification-manifest, history, and relational rule enforced by `StateManager.load` is also enforced by the operator validator. Preserve decompose-specific authored-policy checks separately. Add mutation regressions for malformed top-level protected fields.

## Advisory dispositions

### Accepted — 19

1. **`code-reviewer-2` — accepted.** Adjacent `*`, `+`, and ordered list items are Markdown block boundaries, not lazy Requirement text. Recognize them as noncanonical entry items and fail closed in entry-only sections.
2. **`silent-failure-hunter-3` — accepted.** Preserve legacy omitted Finding locations as `null`, but reject explicitly present location fields unless they are already parser-canonical (`string | null` and positive safe integer | null). Do not silently erase malformed explicit evidence.
3. **`pr-test-analyzer-1` — accepted.** Add a heading-terminated Requirement followed by indented code and prove code furniture is ignored rather than diagnosed as an unbulleted Requirement.
4. **`pr-test-analyzer-2` — accepted.** Extend load-boundary location normalization/rejection regressions across active, refuted, and resolved Finding containers.
5. **`pr-test-analyzer-3` — accepted.** Drive the real Pi `session_start` event and assert the production startup sweep roster/wiring executes, so direct-helper tests cannot mask removed or miswired registration.
6. **`type-design-analyzer-1` — accepted.** Reject Finding IDs whose numeric suffix cannot safely participate in ordinal minting, and guard constructors from unsafe start/end ordinals. Add huge-suffix and high-water-mark regressions.
7. **`type-design-analyzer-2` — accepted.** Model Review Run workspace authority as a discriminated all-or-none union. The persisted parser rejects every partial combination, including `workspace_head_sha` without `workspace_scope`.
8. **`type-design-analyzer-3` — accepted.** Require positive safe integers at every TaskGraph Wave boundary (`Task.wave`, `current_wave`, registrations, histories, and reopening audits), matching TaskGraph Population authority.
9. **`comment-analyzer-3` — accepted.** Replace the `parseManualEvidenceSource` docblock with its real responsibility: parse and freeze only the nested optional manual-override source.
10. **`comment-analyzer-4` — accepted.** Correct `nextOrdinal` commentary to name kept, refuted, and resolved histories.
11. **`comment-analyzer-5` — accepted.** Rename the stale “three writers” banner to describe the review-path writers without an incorrect count.
12. **`comment-analyzer-6` — accepted.** State that a merged claim enters exactly the one derived severity view matching its severity.
13. **`comment-analyzer-7` — accepted.** Explain that whitespace rejection is a deliberate conservative filter for the line-regex extractor, not a JavaScript grammar claim.
14. **`comment-analyzer-8` — accepted.** Say bytes-backed outcomes carry the digest of observed bytes; only the indexed arm proves successful parsing.
15. **`comment-analyzer-9` — accepted.** Remove the temporary Round 3/D4 archaeology while retaining the durable one-lift/two-serialization rationale.
16. **`code-simplifier-1` — accepted.** Narrow `defaultManifestIfMissing` to `ManifestFile` and remove the impossible catch-path null branch without changing `inspectManifestDirectory`’s meaningful null state.
17. **`code-simplifier-2` — accepted.** Check roster emptiness once in `parseAuthoredTaskRoster`; let Wave-topology validation own only safe positive/contiguous Wave rules.
18. **`code-simplifier-3` — accepted.** Remove redundant `bytes: null` from the `ObservedDocument` absent variant.
19. **`code-simplifier-4` — accepted.** Reuse `specCheckAuthorityProblem` for shared locked capability checks in Wave submission, retaining packet-context authority digest, batch epoch, and current-byte checks locally.

### Deferred — 2

20. **`architecture-tech-lead-2` — deferred.** A pure aggregate decision for the entire 600-line `resumeWaveGateFacade` would redesign the per-program façade seam. ADR-0005 explicitly accepts the Wave Gate driver’s program-essential length and directs only shared computations downward; no concrete duplicated cross-program computation is identified here. Revisit only through a dedicated deepen/ADR session, not inline remediation.
21. **`architecture-tech-lead-3` — deferred.** Consolidating Pi reservation, grant, roster, pointer, and cleanup maps into one session-runtime aggregate changes multiple asynchronous handler interfaces and lifecycle ownership. The finding identifies real locality friction but no current invariant violation; a safe change requires a dedicated design tree, migration strategy, and event-order model beyond this reviewed feature’s scope.

## Refuted Finding audit

None. All six critical Findings were upheld independently by reproduction, intent, and security lenses.

## Architecture and implementation order

1. Repair Markdown ownership/block-boundary parsing and add example/property regressions.
2. Harden safe-integer invariants for review generations, Waves, and Finding ordinals; make Review Run workspace authority all-or-none.
3. Tighten persisted Finding locations while preserving legacy omitted fields; cover active/refuted/resolved containers.
4. Route state-file validation through `parseTaskGraph` and add protected-authority mutation tests.
5. Isolate Pi startup sweep/reporting failures and test the real `session_start` wiring.
6. Reuse spec-check capability authority and apply the accepted state-space/dead-branch simplifications.
7. Correct durable documentation and comments.
8. Run focused tests and typecheck; then perform the required `distill` apply-mode pass from a green baseline, one move at a time.
9. Run the full unit and smoke suites, audit scope/index cleanliness, install only through registered remediation, commit the verified index, and push normally.

The functional core owns parsing and authority decisions. Filesystem, State File, and Pi event/UI effects remain in imperative shells. No horizontal façade-driver framework is introduced, preserving ADR-0005.

## Planned changed paths

All planned production and regression paths are already in the frozen scope:

- `.claude/plans/2026-09-07-pr-remediation.md`
- `engine/src/core/findings.ts`
- `engine/src/core/parse-spec.ts`
- `engine/src/core/requirement-coverage.ts`
- `engine/src/core/spec-check.ts`
- `engine/src/core/task-graph-population.ts`
- `engine/src/core/wave-review-authority.ts`
- `engine/src/handlers/helpers/populate-task-graph.ts`
- `engine/src/handlers/helpers/programs/wave-gate.ts`
- `engine/src/handlers/helpers/validate-task-graph.ts`
- `engine/src/linter/programmatic/no-cross-boundary-imports.ts`
- `engine/src/orchestration/wave-spec-check-documents.ts`
- `engine/src/state-manager.ts`
- `engine/src/types.ts`
- `engine/tests/core/findings.test.ts` if needed; this path is outside frozen scope and must be registered as support before remediation installation.
- `engine/tests/core/parse-spec.property.test.ts`
- `engine/tests/core/parse-spec.test.ts`
- `engine/tests/core/task-graph-population.test.ts`
- `engine/tests/handlers/helpers/programs/wave-gate-decision-authority.test.ts`
- `engine/tests/handlers/populate-task-graph.test.ts`
- `engine/tests/handlers/validate-task-graph.test.ts`
- `engine/tests/handlers/validate-task-graph.property.test.ts`
- `engine/tests/pi-extension-review-events.test.ts`
- `engine/tests/state-manager-load-guards.test.ts`
- `pi/extension.ts`

Any additional regression path outside frozen scope must be added to the fresh remediation run’s `supportPaths`; the parent will never stage manually.

## Validation

Run runtime-sensitive tests with `PI_CODING_AGENT`, `LOOM_PI_EXTENSION_RUNTIME_REVISION`, and `LOOM_PI_EXTENSION_RUNTIME_ROOT` unset.

```bash
cd engine
env -u PI_CODING_AGENT -u LOOM_PI_EXTENSION_RUNTIME_REVISION -u LOOM_PI_EXTENSION_RUNTIME_ROOT npx vitest run \
  tests/core/findings.test.ts \
  tests/core/parse-spec.test.ts \
  tests/core/parse-spec.property.test.ts \
  tests/core/task-graph-population.test.ts \
  tests/state-manager-load-guards.test.ts \
  tests/handlers/validate-task-graph.test.ts \
  tests/handlers/helpers/programs/wave-gate-decision-authority.test.ts \
  tests/handlers/populate-task-graph.test.ts \
  tests/pi-extension-review-events.test.ts
npm run typecheck
env -u PI_CODING_AGENT -u LOOM_PI_EXTENSION_RUNTIME_REVISION -u LOOM_PI_EXTENSION_RUNTIME_ROOT npm run test:unit
env -u PI_CODING_AGENT -u LOOM_PI_EXTENSION_RUNTIME_REVISION -u LOOM_PI_EXTENSION_RUNTIME_ROOT npm run test:smoke
cd ..
git diff --check
```

Validation must pass before registered remediation starts. No manual staging or protected-state mutation is permitted.
