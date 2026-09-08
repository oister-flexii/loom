# PR #43 remediation — review-and-fix round 10

> **Stopped-plan snapshot (2026-09-07).** The user stopped this remediation run. The body below preserves its original proposals, not completed work or the current scope. Continue from `2026-09-07-pr43-correctness-closure.md`: retain the unfinished edits, close parser/authority defects, and explicitly defer unstarted advisory refactors. In particular, the blanket advisory acceptance and planned-path scope claims below are superseded by that closure record. No Run Directory or canonical result has been rewritten by this note.

## Authority

- Branch: `feat/structural-spec-check`
- Reviewed head: `3aae3ebe70e6094455409e7a6e500d757a752619`
- PR: https://github.com/peterstorm/loom/pull/43
- Review Run Directory: `.claude/reviews/review-and-fix-runs/2026-09-07-pr43-all-8`
- Canonical result digest: `0db67a4615983a5497547a5883324c130b0b626e6d31f039561af59586c4ca2f`
- Frozen scope: the exact 58 paths recorded in the canonical `result.json`; every planned implementation/test path below is in that scope.
- Refutation Panel: 4 surviving critical Findings, 0 refuted Findings; threshold 2 across reproduction, intent, and blast-radius.

## Mandatory surviving critical Findings

1. `code-reviewer-1` — `engine/src/core/parse-spec.ts:288`
   - Blank-separated indented structural IDs can be blanked as code furniture while an open Requirement owns their indentation.
   - Fix: preserve list-owned lines in `withoutFences`; reject every nested colon-full FR/AS/OOS identifier in `parseEntries`; retain ordinary nested clauses and top-level indented code behavior.
2. `type-design-analyzer-1` — `engine/src/core/parse-spec.ts:418`
   - The same parser defect also enters the continuation branch and can absorb an ID into preceding content.
   - Fix: structural-ID rejection must precede continuation acceptance and cover FR, AS, and OOS at minimum and deeper owned indentation, with and without a separating blank.
3. `comment-analyzer-1` — `engine/src/core/findings.ts:321`
   - The structured Findings-block JSDoc falsely says it only adds location/structure, while arbitration preserves block-only claims.
   - Fix: document marker counts as authority and the block as preferred structured evidence whose union may contribute block-only claims.
4. `comment-analyzer-2` — `engine/src/linter/programmatic/no-cross-boundary-imports.ts:82`
   - The allowlist comment falsely calls `extract-task-id` dependency-free although it imports core Task identity.
   - Fix: state the actual narrow pure dependency and why the explicit exception does not grant shell/I/O access.

## Advisory dispositions

All 16 advisories are accepted: each is evidence-backed, in scope, and practical without reopening ADR-0005.

1. `code-reviewer-2` — accepted. Make `parseStoredDraft` reject explicit noncanonical `file`/`line` values exactly like persisted Findings; add Review Run load and finalization regressions.
2. `silent-failure-hunter-1` — accepted. Run every startup sweep, retain channel outcomes as data, and throw one aggregate shell error after the batch only for failures that no reporting channel surfaced; cover failed diagnostic/UI/stderr channels.
3. `silent-failure-hunter-2` — accepted. Persist the immutable decompose-time Spec Index observation/reason on the TaskGraph, parse it at the load boundary, reset it during population, and include it in operator status/gate diagnostics where missing hashes are explained.
4. `pr-test-analyzer-1` — accepted. Add exact two-space FR/AS/OOS continuation-boundary examples.
5. `pr-test-analyzer-2` — accepted. Pin `attributeFindings` end-ordinal overflow by minting multiple drafts at `Number.MAX_SAFE_INTEGER`.
6. `pr-test-analyzer-3` — accepted. Enumerate every complete-minus-one Review Run workspace-authority field shape.
7. `pr-test-analyzer-4` — accepted. Add packet-bound Wave authority coverage where both stored generations carry the same unsafe value.
8. `type-design-analyzer-2` — accepted. Model accepted review run authority as an all-or-none union, preserving the accepted-authority parser as the untrusted boundary.
9. `comment-analyzer-3` — accepted. Correct `idSafeAgent` documentation: normalization enables deterministic suffix parsing and safe composite identities.
10. `comment-analyzer-4` — accepted. This plan now names the actual frozen scope and support-path set consistently.
11. `architecture-tech-lead-1` — accepted. Deepen validation into a pure analysis value containing errors and warnings; render warnings only in the CLI/hook shell. Existing `ValidationResult` callers retain their result interface through a thin projection.
12. `architecture-tech-lead-2` — accepted. Supply authoritative repository root from lint shells to full-tier programmatic rules; replace boundary-prefix root guessing with root-relative parsing and property/example coverage for repeated-prefix checkout parents.
13. `code-simplifier-1` — accepted. Return locked Pi review application through `TaskGraphStore.updateAndReturn`; remove the mutable closure.
14. `code-simplifier-2` — accepted. Share retired-Finding container parsing/duplicate-ID validation behind one private helper while preserving exported diagnostics.
15. `code-simplifier-3` — accepted. Delete `parseWaveNumber` and call `parseIntegerBound` with the existing exact diagnostic contract.
16. `code-simplifier-4` — accepted. Extract one local property assertion for Requirement continuation hashing while retaining three named Markdown-form properties.

## Refuted Finding audit

None. The panel retained all four candidate criticals. `code-reviewer-1` received one intent refutation but survived through reproduction and blast-radius; remediation is mandatory.

## Planned paths

Production and documentation paths:

- `.claude/plans/2026-09-07-pr-remediation.md`
- `engine/src/core/findings.ts`
- `engine/src/core/parse-spec.ts`
- `engine/src/core/task-graph-population.ts`
- `engine/src/core/wave-review-authority.ts`
- `engine/src/handlers/helpers/populate-task-graph.ts`
- `engine/src/handlers/helpers/programs/wave-gate.ts`
- `engine/src/handlers/helpers/validate-task-graph.ts`
- `engine/src/linter/executor.ts`
- `engine/src/linter/index.ts`
- `engine/src/linter/loader.ts`
- `engine/src/linter/programmatic/index.ts`
- `engine/src/linter/programmatic/no-cross-boundary-imports.ts`
- `engine/src/linter/types.ts`
- `engine/src/state-manager.ts`
- `engine/src/types.ts`
- `pi/extension.ts`
- `pi/subagent-result.ts`
- `scripts/lint-project.ts`

Regression paths:

- `engine/tests/core/findings.test.ts`
- `engine/tests/core/parse-spec.property.test.ts`
- `engine/tests/core/parse-spec.test.ts`
- `engine/tests/core/task-graph-population.test.ts`
- `engine/tests/handlers/helpers/programs/wave-gate-decision-authority.test.ts`
- `engine/tests/handlers/populate-task-graph.test.ts`
- `engine/tests/handlers/validate-task-graph.test.ts`
- `engine/tests/linter/executor.test.ts`
- `engine/tests/linter/index.test.ts`
- `engine/tests/linter/loader.test.ts`
- `engine/tests/linter/programmatic/no-cross-boundary-imports.test.ts`
- `engine/tests/pi-extension-review-events.test.ts`
- `engine/tests/pi/subagent-result.test.ts`
- `engine/tests/state-manager-load-guards.test.ts`

Any dirty path not in canonical scope will be declared as a remediation `supportPath`; currently only this plan is expected and it is already in scope.

## Validation

Runtime-sensitive commands run with `PI_CODING_AGENT`, `LOOM_PI_EXTENSION_RUNTIME_REVISION`, and `LOOM_PI_EXTENSION_RUNTIME_ROOT` unset.

1. Focused parser, Finding, state-load, Wave-authority, linter, population, Pi integration, and property matrices.
2. `cd engine && npm run typecheck` (includes unused locals/parameters).
3. `cd engine && env -u PI_CODING_AGENT -u LOOM_PI_EXTENSION_RUNTIME_REVISION -u LOOM_PI_EXTENSION_RUNTIME_ROOT npm run test:unit`.
4. `cd engine && env -u PI_CODING_AGENT -u LOOM_PI_EXTENSION_RUNTIME_REVISION -u LOOM_PI_EXTENSION_RUNTIME_ROOT npm run test:smoke`.
5. `git diff --check`.
6. Audit dirty paths against canonical frozen scope and explicit support paths; verify no manually staged files.
7. Install only through a fresh registered remediation run, verify exact installed index, commit, and push without force.

## Distill gate

After a green focused baseline, run `distill` in apply mode one behavior-preserving move at a time. Preserve ADR-0005: no shared façade-driver framework. Report applied and skipped opportunities with reasons.
