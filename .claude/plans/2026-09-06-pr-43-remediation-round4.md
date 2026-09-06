# PR #43 Remediation — Round 4 (review run `2026-09-06-pr43-all-2`)

- **Branch:** `feat/structural-spec-check` (PR worktree `/home/peterstorm/dev/claude-plugins/loom-structural-spec-check`, head `b9f601e`)
- **Review Run Directory:** `.claude/reviews/review-and-fix-runs/2026-09-06-pr43-all-2` — result.json digest `7559db9ddb0565d19418ab8f89f2f7290f17eac623d6ffbf5614583c28d78983`
- **Superseded run:** `2026-09-06-pr43-all-1` (round-4 review attempt terminally stuck: attempt-2 refutation capture tombstoned pre-local-routing; unrecoverable; abandoned with superseded-by this run)
- **Source scope:** 38 frozen paths (see result.json.scope)
- **Surviving critical findings:** 0
- **Refuted critical findings:** 0 (no critical set — the refutation panel did not route)

## Surviving criticals

None. All seven reviewers reported `CRITICAL_COUNT: 0`.

## Advisory dispositions (15 advisories → 11 accepted fixes, 1 dismissed)

### ACCEPTED

**A1. `store-spec-check-findings.ts:103` — block-filing wave takes its value from the Agent's claim** (pr-test-analyzer + type-design-analyzer, two findings, one fix)
- Claim: the comment justifies keeping `findings.wave` in the chain as "only WHERE the evidence is filed", but the same variable feeds `reconcileWaveBlock` at line 129 — which wave's gate receives the block cause when `critical_count > 0`. On the legacy path (epoch absent) the reported party selects the veto's target, violating the hook's own "the reported party selects nothing" rule.
- Fix: split the wave — `blockWave = epochWave ?? state.current_wave ?? 1` passed to `reconcileWaveBlock`, never `findings.wave`; the stored wave keeps its documented precedence for evidence filing only (round 3's deliberate decision — the split makes its justification true); update the comment to name both consumers; add the discriminating test (epoch absent, `findings.wave` set, block lands on the state wave's gate) in `engine/tests/handlers/store-spec-check-findings.test.ts` (in frozen scope).

**A2. `store-spec-check.ts:75` — no test pins the floor argument the manual helper passes** (pr-test-analyzer)
- Claim: every existing helper fixture has a null `spec_file` where a re-projected floor and the shipped `unprojectedFloor` are behaviorally identical, so a regression to `settledFloorOf(coverageTasks(...))` would re-impose the D2 defect class on the operator's own override and stay green.
- Fix: one test in `engine/tests/handlers/helpers/store-spec-check.test.ts` (OUTSIDE the frozen scope → registered in `supportPaths`) with a canonical spec file present, a modern graph, no active run, and a named override, asserting the recorded floor is the epoch-read value.

**A3. `types.ts:423` — `Task.spec_anchor_hashes` typed but not parsed at the load boundary** (type-design-analyzer)
- Claim: `migrateParsedTask` (`state-manager.ts:1841`) spreads the record verbatim, so a hand-edited graph can hold a non-string and the type asserts what load does not prove; the defense lives one level out (`parsedAnchorHashes`, `wave-review-authority.ts:505`).
- Fix: parse `spec_anchor_hashes` at the load boundary in `migrateParsedTask` — every value must be a string or the load refuses (consistent with the module's translate-catch contract); the type then asserts what load proves. Existing valid graphs unaffected.

**A4. `wave-review-authority.ts:784` — epochSettledFloor JSDoc stacked above isExactEpochReplay** (comment-analyzer + code-simplifier, one fix)
- Fix: move the line-784 block above `epochSettledFloor` (line 829, currently undocumented); `isExactEpochReplay` keeps only its own block (line 799).

**A5. `spec-check.ts:64` — footer-bounding JSDoc stacked above footerFindings** (comment-analyzer + code-simplifier, one fix)
- Fix: relocate the line-64 block above `parseSpecCheckOutput` (lines 76–90, undocumented); keep the one-liner on `footerFindings` (line 69).

**A6. `no-cross-boundary-imports.ts:92` — "dependency-free wrapper" contradiction** (comment-analyzer)
- Fix: drop "dependency-free" from the find-file sentence (the module imports `node:fs`/`node:path`).

**A7. `pi/extension.ts:184` — sentence fragment in the PI_AGENT_DIR freeze comment** (comment-analyzer)
- Fix: complete the fragment: "but it pins the FIRST import of this module to whichever environment is current in that process".

**A8. `wave-review-authority.ts:528` — Task→row field mappings duplicated between `waveSpecCheckScope` and `coverageTasks`** (architecture-tech-lead)
- Claim: both mappers write the same four field expressions twice; round 3's D4 fix had to touch both mappers — the proof the duplication is live; a new field can be carried by one serialization and dropped by the other.
- Fix: extract one shared pure lift `taskRowFields(task)` returning `{completionAnchors, contributions, declaredFiles, modifiedFiles}`, consumed by both mappers. Deletion test earns it: deleting it re-scatters four mappings across two callers; two production adapters make it a real seam.

**A9. `wave-gate.ts:944` — spread-slice finding-id list** (code-simplifier)
- Fix: `plan.value.findings.map(({ id }) => id)` — behavior identical.

**A10. `requirement-coverage.ts:297` — four consecutive CRITICAL branches** (code-simplifier)
- Fix: one `.with({ kind: P.union("unknown-requirement", "excluded-requirement", "not-declared", "not-implemented") }, () => "CRITICAL")` branch — exhaustiveness preserved.

**A11. `pi/subagent-result.ts:305` — explicitlyLegacy predicate written twice** (code-simplifier)
- Fix: one shared `isExplicitlyLegacyTask(task)` helper consumed by `reviewAuthorityForTask` (line 305) and `piReviewAuthorityProblem` (line 349) — one name, one update site for the lockstep domain predicate.

### DISMISSED

**D1. "three sources in the frozen scope are tested only by files outside the frozen scope"** (pr-test-analyzer)
- Reason: not a code defect. The reviewer verified the tests exist at the same head revision (`spec-check-manual-override.test.ts`, `no-cross-boundary-imports*.test.ts`, `handlers/pi-*.test.ts`); the packet's inability to verify coverage claims from its own bytes is a property of the frozen review scope, not the codebase. No in-scope fix exists; the scope-note class was documented in round 3 (D1).

## Refuted-finding audit

None — no critical set was produced, so the refutation panel did not route.

## Validation commands

```bash
cd engine && npm run typecheck          # tsc --noEmit + unused (../pi/, src, tests)
cd engine && npm run test:unit          # full vitest suite
cd engine && npm run test:smoke         # all smoke suites
```

## Support paths (Phase 4 start input)

- `.claude/plans/2026-09-06-pr-43-remediation-round4.md` (this plan — outside the frozen scope)
- `engine/tests/handlers/helpers/store-spec-check.test.ts` (the A2 test file — outside the frozen scope)
