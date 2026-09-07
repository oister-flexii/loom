# PR #43 Remediation — Fresh review round 8

## Authority

- Branch: `feat/structural-spec-check`
- Reviewed head: `44be0fd6da1878d034770cb1c3d0ad47c75e0490`
- Pull request: https://github.com/peterstorm/loom/pull/43
- Standalone Review Run: `.claude/reviews/review-and-fix-runs/2026-09-07-pr43-all-6`
- Canonical result: `.claude/reviews/review-and-fix-runs/2026-09-07-pr43-all-6/result.json`
- Result digest: `f9efb4e6f83444ffe7d6d00180e14d9135cd9aec4e8aacdb978202adb7252973`
- Adjudication: 12 surviving critical Findings, 17 advisories, 1 refuted critical Finding.

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
- `engine/tests/core/parse-spec.property.test.ts`
- `engine/tests/core/parse-spec.test.ts`
- `engine/tests/core/requirement-coverage.property.test.ts`
- `engine/tests/core/requirement-coverage.test.ts`
- `engine/tests/core/round15.test.ts`
- `engine/tests/core/spec-check-floor.test.ts`
- `engine/tests/core/task-graph-population.test.ts`
- `engine/tests/handlers/complete-wave-gate.test.ts`
- `engine/tests/handlers/helpers/orchestration.test.ts`
- `engine/tests/handlers/helpers/programs/wave-gate-decision-authority.test.ts`
- `engine/tests/handlers/helpers/store-spec-check.test.ts`
- `engine/tests/handlers/helpers/wave-spec-check-scope.test.ts`
- `engine/tests/handlers/populate-task-graph.test.ts`
- `engine/tests/handlers/store-spec-check-findings.test.ts`
- `engine/tests/handlers/subagent-stop/dispatch-resilience.test.ts`
- `engine/tests/handlers/validate-task-graph.test.ts`
- `engine/tests/orchestration/spec-index-observation.test.ts`
- `engine/tests/parsers/parse-spec.property.test.ts`
- `engine/tests/pi/subagent-result.test.ts`
- `engine/tests/review-round6-core-regressions.test.ts`
- `engine/tests/spec-check-command-contract.test.ts`
- `engine/tests/spec-template-contract.test.ts`
- `engine/tests/state-manager-load-guards.test.ts`
- `pi/extension.ts`
- `pi/subagent-result.ts`
- `scripts/smoke-orchestration-facades.ts`

## Surviving critical Findings and mandatory fixes

1. **`code-reviewer-1` — stale Wave Gate start authority.** Move `waveGateAuthorityDigest` into the Wave authority functional core. Require `StateManager.registerActiveWaveGate` to consume the published Task roster and, while holding the State File lock, re-derive both the exact current-Wave roster and digest before installing active authority. A mismatch preserves the registered Run Directory but leaves protected state byte-identical.
2. **`code-reviewer-2` — valid four-space continuation removed.** Make fence/code-furniture stripping list-context-aware so a blank-separated, properly indented continuation remains available to the entry parser and participates in content/hash authority.
3. **`code-reviewer-3` — unrelated block absorbed after blank.** Model entry continuation state explicitly: lazy continuation is legal only before a blank; after a blank only properly indented list-item content remains attached. Markdown block boundaries finish the entry.
4. **`silent-failure-hunter-1` — duplicate settled identities.** Reject duplicate persisted settled Finding identities and reconcile required identities as a multiset so even forged typed inputs cannot substitute a required occurrence.
5. **`silent-failure-hunter-2` — malformed persisted locations pass load.** Install parser-produced Finding, Refuted Finding, and Resolved Finding values during TaskGraph migration rather than retaining raw records after using normalized drafts only as predicates. Legacy omitted/object/numeric locations normalize to `null`; downstream panel code receives the exact `string | null` and positive-safe-integer-or-null shapes promised by `Task`. Add load-boundary regressions for these cases.
6. **`pr-test-analyzer-1` — publication-failure test is source inspection only.** Replace the source-order assertion with behavior: a refused/divergent Run Directory registration leaves State File bytes unchanged.
7. **`pr-test-analyzer-2` — no same-Wave start race test.** Simulate publication from snapshot A followed by same-Wave TaskGraph mutation B and prove locked active registration rejects without installing stale authority.
8. **`type-design-analyzer-1` — UNKNOWN migration can create a causeless block.** At the TaskGraph parse boundary, migrate historical `UNKNOWN` evidence and reconcile its Wave block from the migrated evidence plus review Findings, preserving legitimate review blocks while clearing obsolete spec-check-only blocks.
9. **`type-design-analyzer-2` — unrelated prose enters content/hash.** Covered by the explicit continuation grammar in fixes 2–3; add FR/AS/OOS examples and properties for blank-line termination.
10. **`comment-analyzer-1` — State File ownership documentation is false.** Update `CONTEXT.md` to name Hooks and explicitly whitelisted StateManager-backed helpers as the mutation boundary.
11. **`comment-analyzer-3` — DraftFinding path guarantee is overstated.** Document `file` as an unverified reviewer-supplied single-line location hint; do not falsely claim repository-relative validation.
12. **`comment-analyzer-4` — continuation comment overstates implementation.** Replace it with the exact modeled continuation grammar implemented by fixes 2–3.

## Advisory dispositions

All 17 advisories are **accepted**: each claim is sound, in scope, and has a complete low-risk implementation.

1. **`silent-failure-hunter-3` — accepted.** Decode Spec bytes with fatal UTF-8. Add an `invalid-encoding` unavailable variant carrying path, exact-byte digest, and cause; never hash replacement text as canonical content.
2. **`silent-failure-hunter-4` — accepted.** Decode State File bytes with fatal UTF-8 before JSON parsing and report contextual corruption.
3. **`silent-failure-hunter-5` — accepted.** Return expected Wave submission authority refusals as typed results from the locked transform; route genuinely unexpected exceptions through `reportUncaughtWaveGateFailure` so stacks survive.
4. **`pr-test-analyzer-3` — accepted.** Add parser examples/properties proving blank-line and heading termination and indented continuation behavior.
5. **`pr-test-analyzer-4` — accepted.** Replace the Pi source-substring assertion with a real `tool_result` integration scenario that omits a reserved spec-check result and observes persisted `EVIDENCE_CAPTURE_FAILED` plus Wave block reconciliation.
6. **`pr-test-analyzer-5` — accepted.** Extract the startup sweep sequence behind injected actions/reporting and test that one failing sweep is surfaced with stack/UI diagnostics while later cleanup still executes.
7. **`type-design-analyzer-3` — accepted.** Add a parser-produced authored-Task roster type for TaskGraph Population. The constructor proves non-empty tasks, positive safe Wave numbers, and contiguous Wave numbering before the aggregate can mint Wave Gates; keep a defensive runtime refusal for untyped JavaScript calls.
8. **`type-design-analyzer-4` — accepted.** Add a module-private nominal constructor-origin witness to `CapturedSpecCheck`; only the spec-check smart constructors/parsers may return the exported type. Update tests to construct captured evidence through the parser.
9. **`type-design-analyzer-5` — accepted.** Brand bytes-backed Spec Index digests as `ArtifactDigest` and construct them through one digest helper before authority comparison.
10. **`comment-analyzer-5` — accepted.** Correct the Markdown-cell safety rationale: Task IDs satisfy `T\d+`; claim text is the unrestricted injection concern.
11. **`comment-analyzer-6` — accepted.** Describe accidental SHA-256 collision as negligibly probable, not impossible.
12. **`comment-analyzer-7` — accepted.** State that fast-check samples arbitrary generated cases; the typed renderer supplies exhaustiveness.
13. **`comment-analyzer-8` — accepted.** Describe `###` accurately as a Markdown heading that is not a `##` section boundary recognized by `sections()`.
14. **`code-simplifier-1` — accepted.** Delete historical removal narration from the current import-capability map.
15. **`code-simplifier-2` — accepted.** Introduce one local passing-proof fixture in orchestration tests and replace the repeated construction without weakening assertions.
16. **`code-simplifier-3` — accepted.** Let the spec-check transcript fixture accept either a count or exact Finding identities and derive the footer once.
17. **`code-simplifier-4` — accepted.** Rename `settled` to `legacySettled` so compatibility state is explicit.

## Refuted Finding audit — do not fix

- **`comment-analyzer-2`** — “CompletableEntry JSDoc says excluded-item completion claims are unrepresentable.” Refuted by the strict majority (`intent`, `security`). `CompletableEntry` names only valid typed completion targets; untrusted raw claim strings remain representable specifically so classification can return the fail-closed `excluded-requirement` verdict without admitting OOS into `CompletableEntry`. The reproduction lens upheld only the surface mismatch; no code or comment change will be made for this Finding.

## Architecture and implementation order

1. Parser entry-boundary model and fatal Spec decoding, with example/property regressions.
2. Settled-floor uniqueness/multiset reconciliation, strict persisted Finding locations, UNKNOWN Wave-block migration, and nominal captured evidence.
3. Core-owned Wave authority digest plus lock-time registration command and behavioral publication/race tests.
4. Parsed authored-Task roster authority and population regressions.
5. Typed Wave submission refusals and stack-preserving unexpected-failure boundary.
6. Pi missing-result and startup-sweep behavioral integration tests.
7. Documentation corrections and accepted test-fixture simplifications.
8. Focused tests and typecheck; then required `distill` apply-mode with a green baseline and one move at a time.
9. Full unit and smoke suites, scope audit, registered remediation, exact verified-index installation, commit, and normal push.

The Wave Gate remains one aggregate. No horizontal façade-driver framework is introduced (ADR-0005). Pure authority derivation and migration decisions stay in core modules; Run Directory, State File, byte decoding, and Pi UI effects remain in thin shells (ADR-0004 and FC/IS).

## Planned changed paths

In frozen scope:

- `.claude/plans/2026-09-07-pr-remediation.md`
- `CONTEXT.md`
- `engine/src/core/findings.ts`
- `engine/src/core/parse-spec.ts`
- `engine/src/core/requirement-coverage.ts`
- `engine/src/core/spec-check.ts`
- `engine/src/core/task-graph-population.ts`
- `engine/src/core/wave-review-authority.ts`
- `engine/src/handlers/helpers/populate-task-graph.ts`
- `engine/src/handlers/helpers/programs/wave-gate.ts`
- `engine/src/linter/programmatic/no-cross-boundary-imports.ts`
- `engine/src/orchestration/spec-index-observation.ts`
- `engine/src/state-manager.ts`
- `engine/src/types.ts`
- `engine/tests/core/parse-spec.property.test.ts`
- `engine/tests/core/parse-spec.test.ts`
- `engine/tests/core/requirement-coverage.property.test.ts`
- `engine/tests/core/requirement-coverage.test.ts`
- `engine/tests/core/spec-check-floor.test.ts`
- `engine/tests/core/task-graph-population.test.ts`
- `engine/tests/handlers/complete-wave-gate.test.ts`
- `engine/tests/handlers/helpers/orchestration.test.ts`
- `engine/tests/handlers/helpers/programs/wave-gate-decision-authority.test.ts`
- `engine/tests/handlers/populate-task-graph.test.ts`
- `engine/tests/orchestration/spec-index-observation.test.ts`
- `engine/tests/pi/subagent-result.test.ts`
- `engine/tests/state-manager-load-guards.test.ts`
- `pi/extension.ts`
- `pi/subagent-result.ts`

Registered support paths outside frozen scope:

- `engine/tests/pi-extension-review-events.test.ts` — real Pi extension event integration for missing reserved spec-check settlement.
- `engine/tests/core/implementation-application.test.ts` — migrate a captured-evidence fixture through the nominal smart constructor.
- `engine/tests/core/wave-completion-readiness.test.ts` — migrate a captured-evidence fixture through the nominal smart constructor.
- `engine/tests/handlers/helpers/upgrade-spec-trace.test.ts` — migrate a captured-evidence fixture through the nominal smart constructor.
- `engine/tests/handlers/pi-stop-toctou.test.ts` — migrate captured-evidence fixtures through the nominal smart constructor.
- `engine/tests/handlers/pre-tool-use/validate-task-execution.test.ts` — migrate a captured-evidence fixture through the nominal smart constructor.
- `engine/tests/handlers/task-execution-attempt-registration.test.ts` — migrate a captured-evidence fixture through the nominal smart constructor.

## Validation

Run with `PI_CODING_AGENT`, `LOOM_PI_EXTENSION_RUNTIME_REVISION`, and `LOOM_PI_EXTENSION_RUNTIME_ROOT` unset where tests launch runtime-sensitive children.

```bash
cd engine
env -u PI_CODING_AGENT -u LOOM_PI_EXTENSION_RUNTIME_REVISION -u LOOM_PI_EXTENSION_RUNTIME_ROOT npx vitest run \
  tests/core/parse-spec.test.ts \
  tests/core/parse-spec.property.test.ts \
  tests/core/requirement-coverage.test.ts \
  tests/core/requirement-coverage.property.test.ts \
  tests/core/spec-check-floor.test.ts \
  tests/core/task-graph-population.test.ts \
  tests/state-manager-load-guards.test.ts \
  tests/handlers/complete-wave-gate.test.ts \
  tests/handlers/helpers/programs/wave-gate-decision-authority.test.ts \
  tests/handlers/helpers/orchestration.test.ts \
  tests/handlers/populate-task-graph.test.ts \
  tests/orchestration/spec-index-observation.test.ts \
  tests/pi/subagent-result.test.ts \
  tests/pi-extension-review-events.test.ts
npm run typecheck
env -u PI_CODING_AGENT -u LOOM_PI_EXTENSION_RUNTIME_REVISION -u LOOM_PI_EXTENSION_RUNTIME_ROOT npm run test:unit
env -u PI_CODING_AGENT -u LOOM_PI_EXTENSION_RUNTIME_REVISION -u LOOM_PI_EXTENSION_RUNTIME_ROOT npm run test:smoke
cd ..
git diff --check
```

Validation must pass before the remediation façade is started. The parent will not manually stage files.