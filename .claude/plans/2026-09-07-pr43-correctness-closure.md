# PR #43 — scoped correctness closure after stopped remediation

## Status and scope decision

Implemented and locally validated on `feat/structural-spec-check`, starting from HEAD `3aae3ebe70e6094455409e7a6e500d757a752619` plus the user's stopped-run edits. **Not staged, committed, pushed, merged, or canonically re-adjudicated.** This is a closure/validation record, not a new engine-issued review result or installation receipt.

The user stopped the previous remediation and requested the first recommendation from the Loom/Fugue assessment: close actual defects through production-path acceptance instead of restarting a growing full-PR review loop. The preceding `2026-09-07-pr-remediation.md` is retained as a stopped-plan snapshot. Its blanket acceptance of all advisories no longer defines this pass.

Preserved starting delta:
- 19 modified paths, 1,226 additions / 396 deletions; index empty.
- `/tmp/loom-pr43-stopped-run-baseline.patch`, SHA-256 `eeaf49a24557de388802feac5ea120dd77150d02d4bd16d919b621803cac6724`.
- Main checkout's unrelated parser work was not changed.
- Existing canonical source review: `.claude/reviews/review-and-fix-runs/2026-09-07-pr43-all-8/result.json`, SHA-256 `0db67a4615983a5497547a5883324c130b0b626e6d31f039561af59586c4ca2f`.
- That result retains four surviving critical IDs, no refuted criticals, and sixteen advisories. Its bytes/Run Directory were not rewritten. Grouping the two parser claims below does not delete either identity or claim formal resolution.

## Closure obligations and implementation

| Obligation | Implementation and acceptance |
|---|---|
| Preserve complete owned Requirement content | `withoutFences` retains list-owned body before furniture handling; parent ownership survives nested lists. `acceptanceScenarioLines` applies the same ownership before accepting block terminators. |
| Refuse unsupported nested declarations | Retained stopped-run `parseEntries` rejection precedes continuation capture. FR/AS/OOS colon-full nested identifiers fail with section/absolute-line diagnostics; ordinary owned prose remains hashed. |
| Parser failure cannot become clean coverage | New `spec-parser-coverage-contract.test.ts` drives real UTF-8 bytes through `parseSpec`, `projectSpecBytes`, `projectRequirementCoverage`, `settledFloorOf`, and `reconcileSpecCheck`: malformed nested specs become unprojected/evidence-failed, not settled-zero. Canonical fully claimed positive control is accepted. |
| Close inherited-discriminant decoder family | Two own-key guards protect `FLOOR_VARIANTS` and the stopped run's `SPEC_PARSE_ERROR_FIELDS` lookup. New `spec-authority-load-contract.test.ts` drives all Object.prototype names, unsupported JSON kinds, valid modes, and payload mutations through `parseTaskGraph` and real temporary-file `StateManager.load()`. |
| Preserve floor and refusal identity across reload | JSON roundtrips retain current exact findings, historical count policy, absence versus zero, projection-unavailable/settled-floor/transcript causes, and retry behavior. Corrupt loads retain bytes and report attributable corruption. |
| Finish broken stopped-run fixtures | Preserve a genuinely non-empty error tuple in the population fixture; lift existing parser-backed DIGEST fixture to the lexical scope used by packet-consumption tests. No production type weakened. |
| Finish retained comment correction | Boundary allowlist comment names extract-task-id's pure core/task-id dependency without claiming zero imports or changing permissions. The stopped-run Findings arbitration comment correction is retained. |
| Document actual semantics | `references/spec-template.md` describes the bounded owned-body grammar; `CONTEXT.md` names compact explanatory Spec Index Observation provenance. Neither claims full CommonMark or semantic acceptance. |

### Explicit grammar/input limits

Canonical top-level FR/AS/OOS bullets remain valid. Owned body tests cover two/four spaces, tabs and mixed indentation, adjacent/blank-separated continuations, nested clauses, headings, thematic breaks and fence-shaped text. Colon-full reserved identifiers inside that body are unsupported and refused, including inside owned fence-shaped text. Genuine top-level examples remain excluded. Arbitrary CommonMark/HTML containers are not newly promised.

Decoder closure concerns JSON persistence. Arbitrary hostile JavaScript proxies/getters and mutated runtime prototypes are not part of that guarantee.

## Existing canonical finding disposition

### Surviving criticals — all repaired in the candidate

- `code-reviewer-1`, `type-design-analyzer-1`: one parser-ownership/nested-ID family, preserving both original IDs; example/property/public-consumer tests cover it.
- `comment-analyzer-1`: retained Findings-block JSDoc correctly describes structured/marker union arbitration.
- `comment-analyzer-2`: narrow allowlist explanation corrected without linter policy changes.

The inherited-floor defect from the separate assessment and inherited-error-tag defect discovered in stopped-run triage are additional deterministic repairs, not fabricated additions to the canonical result.

### Advisories — retain completed work, explicitly defer unstarted expansion

| ID | Current disposition and evidence/reason |
|---|---|
| `code-reviewer-2` | Retained: malformed stored draft locations refused; load/finalization tests pass. |
| `silent-failure-hunter-1` | Retained: Pi startup sweeps preserve all outcomes and aggregate wholly unreported failures; existing integration tests pass. No new logging redesign. |
| `silent-failure-hunter-2` | Retained, narrowed to actual complaint: compact population observation is persisted, parsed/frozen, and consumed by Wave packet diagnostics. Additional operator-status UI projection is deferred; not needed to retain the original cause or explain missing hashes in the packet. |
| `pr-test-analyzer-1` | Retained and extended: minimum two-space continuation plus FR/AS/OOS ownership matrix. |
| `pr-test-analyzer-2` | Retained: end-ordinal overflow regression. |
| `pr-test-analyzer-3` | Retained: complete-minus-one workspace-authority cases. |
| `pr-test-analyzer-4` | Retained: matching unsafe packet/Task generations refused. |
| `type-design-analyzer-2` | Retained: accepted run binding is all-or-none; negative type/load cases pass. |
| `comment-analyzer-3` | Retained: idSafeAgent explanation reflects suffix parsing. |
| `comment-analyzer-4` | Corrected here: distinguish canonical scope from support paths; prior inaccurate plan explicitly marked historical. |
| `architecture-tech-lead-1` | Deferred: pure warning-analysis refactor is unstarted, independent of this closure, and no retained partial code requires it. Existing warning effects are not claimed fixed. |
| `architecture-tech-lead-2` | Deferred: authoritative repository-root plumbing is an unstarted multi-module linter change, not required by parser/settlement closure. Known boundary-prefix inference limitation remains recorded. |
| `code-simplifier-1` | Retained: Pi locked review application returns through updateAndReturn; tests pass. |
| `code-simplifier-2` | Retained: shared retired-Finding container parsing; diagnostics retained. |
| `code-simplifier-3` | Retained: integer-bound reuse; load tests pass. |
| `code-simplifier-4` | Retained: common continuation-hash assertion with distinct named properties. |

No refuted finding was repaired. No new reviewer roster, wire-contract change, general parser framework, linter-root redesign, or verification-platform feature was added.

## Counterfactual and independent evidence

Counterfactuals ran in isolated source copies; no live source was swapped:

- Original HEAD parser with the new parser tests: **640 failed / 407 passed**. All 24 malformed-spec consumer cases failed; canonical positive control passed.
- Exact stopped-run parser: **178 failed / 869 passed**. The retained nested-ID consumer test already passed; the new exact-body matrix and generated laws expose the remaining earlier preprocessing loss. These are distinct regression claims.
- Pre-fix authority decoder with new public-load contract: **27 failed / 98 passed**; same isolated tests after the two own-key guards: **125 passed**. Positive modes passed on both sides.
- Independent targeted check: **1,365 focused tests passed**, plus real-parser production of all 17 error variants through observation/JSON/load and 24 independent content/hash/coverage contexts. No consequential finding within the incremental scope. This was not a new canonical panel or approval of unrelated baseline behavior.

Reports/logs are archived in the vault follow-through note; original scratch paths:
- `/tmp/loom-pr43-parser-closure.md`
- `/tmp/loom-pr43-authority-closure.md`
- `/tmp/loom-pr43-stopped-delta-triage.md`
- `/tmp/loom-pr43-loader-distill.md`
- `/tmp/loom-pr43-closure-independent-check.md`

## Final combined validation

Executed after all production/test changes and length-only extractions, with `PI_CODING_AGENT`, `LOOM_PI_EXTENSION_RUNTIME_REVISION`, and `LOOM_PI_EXTENSION_RUNTIME_ROOT` unset for test fixtures. No live mutating helper was run under an environment override.

| Check | Actual result | Retained scratch log |
|---|---|---|
| `cd engine && npm run typecheck` | Exit 0, including project unused gate | `/tmp/loom-pr43-final-typecheck.log` |
| `cd engine && npm run test:unit` | Exit 0; **243 files, 7,495 passed, 1 skipped** | `/tmp/loom-pr43-final-unit.log` |
| `cd engine && npm run test:smoke` | Exit 0; all six smoke suites pass | `/tmp/loom-pr43-final-smoke.log` |
| Full-tier lint on all 21 dirty/new TypeScript files | Exit 0; no violations or errors | `/tmp/loom-pr43-final-lint.log` |
| `git diff --check` | Exit 0 | `/tmp/loom-pr43-final-whitespace.log` |

Runtime: Bun **1.3.13**. No claim of a new remote CI run, live-model acceptance, or different runtime certification.

Candidate inventory: `/tmp/loom-pr43-closure-candidate.json`, **3,242 Git-listed files**, digest `39124a6e7ec810c95a2bdd3993a5949e6a92890a8a25fd0662d8b146a00a108a`. It includes tracked/untracked source/config/docs and excludes `.claude/plans/`, `.claude/reviews/`, `.claude/state/`. Recomputed after validation: identical. This is local evidence binding, not a new engine-authoritative receipt; this plan itself is outside that digest.

### Distill apply

Green baseline first; covering tests remained green after each move:
- Parser: remove a redundant later ownership condition, then extract private `nonFenceLine` and `closeAcceptanceBlock` so existing full-tier length limits hold without changing the public grammar interface.
- TaskGraph loader: private `parseTaskGraphDocumentFields` groups existing adjacent document/lifecycle/observation checks, preserving evaluation/error order; top-level parser falls below the existing length limit.
- Authority guards: no further move warranted; stdlib own-key check is already the simplest scoped expression.
- Skipped generic schema/parser frameworks, public seam redesign, broad legacy cleanup, and extra logging/status work: not necessary for the demonstrated obligations.

## Scope and publication handoff

The canonical source review has **58 paths**, not every file proposed in the stopped plan. All retained existing dirty implementation paths lie in that scope. These additional paths belong to this closure and would need explicit support-path registration for a later remediation install:

1. `.claude/plans/2026-09-07-pr43-correctness-closure.md`
2. `engine/tests/core/spec-parser-coverage-contract.test.ts`
3. `engine/tests/core/spec-authority-load-contract.test.ts`
4. `references/spec-template.md`

Do not stage via an ad-hoc recipe or claim an index was installed. No Run Directory was abandoned, restarted, or changed by this pass. Before a later registered install, recheck candidate/runtime authority and honor the active harness's runtime-revision checks; do not unset them to bypass live mutation admission. The working-tree result is locally verified, not shipped.
