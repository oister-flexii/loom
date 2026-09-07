# PR #43 Remediation — Round 5

- **Branch:** `feat/structural-spec-check`
- **Head reviewed:** `a6eea765811e85a6fa7d2c2af0e7aa8ce82c03df`
- **PR:** #43 — `feat(spec-check): structural Requirement Coverage Projection (#11 phase 3)`
- **Review Run Directory:** `.claude/reviews/review-and-fix-runs/2026-09-06-pr43-all-3`
- **Review result:** 5 surviving critical findings, 19 advisories, 0 refuted critical findings
- **Reviewer recovery:** all seven attempt-1 reviewer requests ended in provider connection errors; the registered program consumed their durable rejection tombstones and accepted all seven attempt-2 captures. The Refutation Panel completed on attempt 1 for all three lenses.

## Exact frozen review scope

1. `.claude/plans/2026-09-05-pr-43-remediation-round2.md`
2. `.claude/plans/2026-09-05-pr-43-remediation.md`
3. `.claude/plans/2026-09-06-pr-43-remediation-round3.md`
4. `.claude/plans/2026-09-06-pr-43-remediation-round4.md`
5. `CONTEXT.md`
6. `commands/spec-check.md`
7. `engine/src/core/parse-spec.ts`
8. `engine/src/core/requirement-coverage.ts`
9. `engine/src/core/spec-check.ts`
10. `engine/src/core/wave-review-authority.ts`
11. `engine/src/handlers/helpers/populate-task-graph.ts`
12. `engine/src/handlers/helpers/programs/wave-gate.ts`
13. `engine/src/handlers/helpers/store-spec-check.ts`
14. `engine/src/handlers/subagent-stop/store-spec-check-findings.ts`
15. `engine/src/linter/programmatic/no-cross-boundary-imports.ts`
16. `engine/src/orchestration/spec-index-observation.ts`
17. `engine/src/orchestration/wave-spec-check-documents.ts`
18. `engine/src/parsers/index.ts`
19. `engine/src/state-manager.ts`
20. `engine/src/types.ts`
21. `engine/tests/core/parse-spec.property.test.ts`
22. `engine/tests/core/parse-spec.test.ts`
23. `engine/tests/core/requirement-coverage.property.test.ts`
24. `engine/tests/core/requirement-coverage.test.ts`
25. `engine/tests/core/spec-check-floor.test.ts`
26. `engine/tests/handlers/complete-wave-gate.test.ts`
27. `engine/tests/handlers/helpers/orchestration.test.ts`
28. `engine/tests/handlers/helpers/programs/wave-gate-decision-authority.test.ts`
29. `engine/tests/handlers/helpers/store-spec-check.test.ts`
30. `engine/tests/handlers/helpers/wave-spec-check-scope.test.ts`
31. `engine/tests/handlers/populate-task-graph.test.ts`
32. `engine/tests/handlers/store-spec-check-findings.test.ts`
33. `engine/tests/orchestration/spec-index-observation.test.ts`
34. `engine/tests/pi/subagent-result.test.ts`
35. `engine/tests/review-round6-core-regressions.test.ts`
36. `engine/tests/spec-check-command-contract.test.ts`
37. `engine/tests/spec-template-contract.test.ts`
38. `engine/tests/state-manager-load-guards.test.ts`
39. `pi/extension.ts`
40. `pi/subagent-result.ts`

## Surviving critical findings — mandatory

### C1 — unprojected Requirement Coverage can silently pass

- **Finding:** `silent-failure-hunter-1`
- **Location:** `engine/src/core/spec-check.ts:304`
- **Claim:** an `unprojected` floor is ignored, so a zero-finding `PASSED` transcript is accepted and its reason disappears.
- **Panel:** upheld by reproduction and security; refuted by intent. It survives the 2-of-3 threshold.
- **Fix:** make settlement authority exhaustive. A registered/unregistered `unprojected` capture becomes typed `EVIDENCE_CAPTURE_FAILED` with a persisted `projection-unavailable` cause and the exact reason. Add a separate `manual-override` floor variant minted only by the already-authorized `store-spec-check` route, so the human override remains possible without weakening registered evidence. Update persisted-cause parsing, resume semantics, command wording, and regression tests across core, Claude, Pi, façade, and manual-helper paths.

### C2 — floorless historical epoch is treated as exact replay

- **Finding:** `silent-failure-hunter-2`
- **Location:** `engine/src/core/wave-review-authority.ts:826`
- **Claim:** missing floor authority matches every newly prepared floor and preserves an unenforced epoch.
- **Panel:** upheld by reproduction and security; refuted by intent. It survives.
- **Fix:** replace the boolean replay predicate with an exhaustive `exact | upgrade-floor | different` decision. A byte/slot-identical historical epoch with no floor is `upgrade-floor`, never exact.

### C3 — current packet floor is lost after floorless replay

- **Finding:** `type-design-analyzer-1`
- **Location:** `engine/src/core/wave-review-authority.ts:826`
- **Claim:** preserving the floorless epoch makes capture read `unprojected` although the current packet rendered a settled floor.
- **Panel:** upheld by reproduction and security; refuted by intent. It survives.
- **Fix:** the `upgrade-floor` installation arm writes the batch’s exact floor under the TaskGraph lock, clears prior spec-check evidence, and requires a fresh spec-check capture while retaining only byte-identical Task review runs. Tests distinguish exact replay, floor upgrade, and real disagreement.

### C4 — Requirement Coverage module header misstates roster semantics

- **Finding:** `comment-analyzer-1`
- **Location:** `engine/src/core/requirement-coverage.ts:2`
- **Claim:** the header says the join consumes only the current-Wave roster, while unclaimed lists intentionally use all Tasks across all Waves.
- **Panel:** upheld by reproduction and intent; security uncertain. It survives.
- **Fix:** state the actual invariant: current-Wave rows, all-Wave unclaimed completion lists, whole protected Task roster input. Keep terminology aligned with `CONTEXT.md` and `commands/spec-check.md`.

### C5 — phantom brand documentation overclaims unforgeability

- **Finding:** `comment-analyzer-2`
- **Location:** `engine/src/core/parse-spec.ts:17`
- **Claim:** spreading an exported branded entry can preserve the phantom brand while replacing content, so mismatched content/hash values are not unrepresentable outside the module.
- **Panel:** upheld by reproduction and intent; security uncertain. It survives.
- **Fix:** qualify the brand as a constructor-origin convention and compile-time family witness, not forgery-proof proof. Correct the matching `CONTEXT.md` and property-test wording while retaining runtime tests that every parser-minted entry has a matching hash.

## Advisory dispositions

### Accepted (16)

1. **`code-reviewer-1` — accepted.** Non-string `spec_anchor_hashes` values violate the persisted `Record<string,string>` invariant. Make `migrateParsedTask` reject the first such value with a contextual parse error; add load-boundary regression tests.
2. **`silent-failure-hunter-3` — accepted.** Duplicate of the same fail-open normalization defect; resolved by the same parser fix and by replacing the prior renderer test with a load refusal test.
3. **`pr-test-analyzer-1` — accepted.** Unknown/OOS-only Requirement Contributions currently suppress the synthetic no-trace CRITICAL. Count `tracesByContribution` only when a current-Wave Contribution resolves to a completable FR/AS entry; test unknown and OOS cases.
4. **`pr-test-analyzer-2` — accepted.** Arbitrary-string success properties are vacuous. Add a structured canonical-spec arbitrary that always reaches `ok:true`, retains whitespace/punctuation variation, and drives hash/family/uniqueness invariants.
5. **`type-design-analyzer-2` — accepted.** Brand the settled critical count and mint it only from projection derivation or persisted parsing, so invalid numeric floors are not well typed.
6. **`comment-analyzer-3` — accepted.** Rewrite `specCheckNeedsReapplication` documentation to describe deterministic refusal preservation rather than claiming same-floor reapplication can itself produce `PASSED`.
7. **`comment-analyzer-4` — accepted.** The non-string-hash comments and round-4 intended contract disagree with implementation. The fail-closed parser fix makes the intended contract true; update current source/test comments accordingly.
8. **`comment-analyzer-5` — accepted.** Describe `perFileAllow` as an additive capability list; directory-level allowed prefixes still apply.
9. **`comment-analyzer-6` — accepted.** Limit `projectSpecBytes` documentation to what it proves: digest and parse outcome derive from the supplied bytes; the path is caller-provided. Pair this with the accepted digest-carrying observation fix below.
10. **`comment-analyzer-7` — accepted.** State that CRITICAL and HIGH counts match their lines; MEDIUM has no count marker.
11. **`architecture-tech-lead-2` — accepted.** Preserve a digest on the bytes-backed `unparsed` Spec Index variant, return it from `specIndexDigest`, and prove it matches document authority. Digest-less variants remain only no-bytes outcomes.
12. **`code-simplifier-1` — accepted.** Replace `ObservedDocument`’s cross-product with a private `absent | observed` union coupling null authority/bytes and present authority/bytes.
13. **`code-simplifier-2` — accepted.** Inline the single-use `populate` pass-through into the existing `try/catch`; preserve the locked transform and error translation.
14. **`code-simplifier-3` — accepted.** Correct the Wave Gate comment: reconciliation uses the epoch-recorded rendered floor under the lock.
15. **`code-simplifier-4` — accepted.** Correct the SubagentStop comment: epoch/current-Wave authority chooses evidence filing and block target; it does not derive a roster-time floor.
16. **`code-simplifier-5` — accepted.** Correct the Pi comment: every transport enforces the epoch-recorded rendered floor through `reconcileSpecCheck`; none re-projects at capture.

### Deferred (3)

1. **`silent-failure-hunter-4` — deferred.** The claim is sound, but exact settled-finding identity enforcement requires a versioned spec-check wire marker plus a persisted identity-bearing floor migration. Count-only enforcement still blocks the Wave; it can degrade the explanatory finding set but cannot turn a nonzero floor into a pass. Designing that versioned interface inside this remediation would risk an unreviewed protocol migration. Track as the next Requirement Coverage hardening slice.
2. **`architecture-tech-lead-1` — deferred.** Consolidating all transport settlement into one aggregate command is directionally sound and consistent with ADR-0005’s allowance for downward shared mechanics, but it is an interface/depth redesign across façade, Claude, Pi, and manual override authority. The accepted fixes first make the existing shared `reconcileSpecCheck` contract exhaustive; a dedicated deepen/design pass should then define the aggregate command without creating a shallow universal driver forbidden by ADR-0005.
3. **`architecture-tech-lead-3` — deferred.** Extracting TaskGraph population into a pure aggregate command is valuable but independent of Requirement Coverage settlement correctness and spans overwrite policy, manifest/spec authority, Task initialization, and Wave Gate construction. It needs a dedicated command ADT and test migration; doing it opportunistically would broaden this PR remediation beyond the reviewed defect cluster.

### Dismissed

None.

## Refuted-finding audit

`refuted_critical_findings` is empty. No Finding may be omitted from reporting: the panel considered five critical Findings and all five survived. For C1–C3 the intent lens voted refute based on historical compatibility policy, but reproduction and security upheld the fail-open behavior, satisfying the 2-of-3 survival threshold. C4–C5 were upheld by reproduction and intent; security was uncertain.

## Implementation order

1. Add discriminating failing tests for unprojected settlement/manual override, floorless epoch upgrade, non-string hash rejection, valid/invalid Contribution traceability, bytes-backed unparsed digest pairing, and non-vacuous Spec parsing.
2. Implement the pure ADTs and parsers: branded settled count, exhaustive floor authority, replay decision, digest-carrying unparsed observation.
3. Apply the thin-shell changes: epoch installation upgrade, manual override mint, observed-document union, and inline population transform.
4. Correct all accepted documentation/comment findings and ubiquitous-language overclaims.
5. Run focused tests, typecheck/unused gates, full unit suite, smoke suite, and `git diff --check`.
6. Run `distill` apply mode over a green baseline, one behavior-preserving move at a time; re-run focused tests after each move.
7. Start registered remediation with this plan as the only support path; let the façade audit, stage, verify, and atomically install the exact Git index.

## Validation commands

```bash
cd engine && env -u PI_CODING_AGENT bunx vitest run \
  tests/core/spec-check-floor.test.ts \
  tests/core/requirement-coverage.test.ts \
  tests/core/requirement-coverage.property.test.ts \
  tests/core/parse-spec.property.test.ts \
  tests/handlers/helpers/wave-spec-check-scope.test.ts \
  tests/handlers/helpers/store-spec-check.test.ts \
  tests/handlers/store-spec-check-findings.test.ts \
  tests/orchestration/spec-index-observation.test.ts \
  tests/pi/subagent-result.test.ts \
  tests/state-manager-load-guards.test.ts \
  tests/spec-check-command-contract.test.ts \
  --testTimeout=20000
cd engine && npm run typecheck
cd engine && npm run test:unit
cd engine && env -u PI_CODING_AGENT npm run test:smoke
git diff --check
```

## Registered remediation support paths

- `.claude/plans/2026-09-07-pr-remediation.md` — this plan is outside the frozen review scope.
- `engine/tests/handlers/subagent-stop/dispatch-resilience.test.ts` — outside the frozen review scope; its request-bound Wave spec-check fixture must carry an explicit parser-valid zero settled floor under the new fail-closed unprojected policy. The production path it covers is inside scope.
- `scripts/smoke-orchestration-facades.ts` — outside the frozen review scope; the Wave façade smoke fixture must use a canonical Spec with complete FR/AS claims so it exercises genuine settled-zero evidence rather than the newly refused unprojected path.

All production changes and every other regression test are already inside `result.json.scope`; no other support path is authorized.
