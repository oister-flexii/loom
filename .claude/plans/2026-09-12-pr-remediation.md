# PR 51 remediation plan

## Authority

- Branch: `feat/standalone-lineage`
- Reviewed revision: `73740d5cd40db4f7873de9cee6c33021ce9df1c8`
- Source review Run: `.claude/reviews/review-and-fix-runs/run.p5-source-review-3`
- Canonical result digest: `56225c5cde03a3a2b37ca3bbd00fb3e86550eb9da2850b12b71f4996fd10049f`
- Published result: 1 surviving critical, 14 advisories, 0 refuted criticals

## Surviving-critical disposition

### `pr-test-analyzer-1` — repaired

- Finding: `engine/tests/handlers/helpers/programs/standalone-disposition.integration.test.ts:94` — the process-heavy standalone integration tests can exceed Vitest's generic 15-second per-test timeout under full-suite co-scheduling.
- Repair Group: `group.integration-timeout-budget`
- Root cause (`DECLARED`): Four process-heavy P5 integration suites inherited the generic 15-second unit-test timeout even though each exercises repeated Bun CLI or native-harness subprocess lifecycles. Under full-suite co-scheduling, valid work can exceed that generic budget.
- Invariant (`DECLARED`): The root verification command remains unchanged, while process-heavy standalone integration suites have an explicit finite 60-second suite timeout consistent with existing process-heavy integration tests. Semantic failures remain failures; only the inappropriate generic timing cap is replaced.
- Selected check: `project:verify`
- Historical RED (`DECLARED`): At reviewed revision `73740d5`, reviewer execution of `cd engine && npm run test:unit` reported nine timeouts in the standalone disposition, successor, and successor-native integration suites, including a 19.696-second execution at the cited line. The review panel upheld this report under reproduction, intent, and test-coverage lenses.
- Historical RED reference: `.claude/reviews/review-and-fix-runs/run.p5-source-review-3/result.json`, finding `pr-test-analyzer-1`.

### Repair and sibling accounting for `group.integration-timeout-budget`

| Path | Role | Status | Reason |
|---|---|---|---|
| `engine/tests/handlers/helpers/programs/standalone-disposition.integration.test.ts` | primary finding path | repaired | Repeated CLI process workflows were observed above 15 seconds under suite load. |
| `engine/tests/handlers/helpers/programs/standalone-successor.integration.test.ts` | sibling | repaired | Repeated predecessor/policy/successor CLI workflows were observed timing out under suite load. |
| `engine/tests/handlers/helpers/programs/standalone-successor-native.integration.test.ts` | sibling | repaired | Native Pi/Claude harness and representative-workload tests were observed timing out under suite load. |
| `engine/tests/handlers/helpers/programs/standalone-successor-remediation.integration.test.ts` | sibling | repaired | Same P5 process-heavy fixture family was reported near/over the generic timeout in the first review attempt; applying the same bounded suite policy prevents a sibling recurrence. |

## Advisory dispositions

| Finding | Disposition | Reason / implementation |
|---|---|---|
| `silent-failure-hunter-1` | deferred | The inspection boundary already fails closed. Exposing arbitrary caught causes requires a separate bounded-diagnostic design so filesystem details are not leaked inconsistently. |
| `silent-failure-hunter-2` | deferred | The evidence join fails closed; changing durable-artifact diagnostics should be designed consistently across all evidence readers rather than patched at one call site. |
| `silent-failure-hunter-3` | deferred | The conflict remains blocking and preserves `EEXIST`; recovery-copy changes need a broader publication-error vocabulary review. |
| `type-design-analyzer-1` | deferred | Narrowing current versus historical snapshot ADTs is sound but touches serialized compatibility and successor parsing beyond the timing repair. |
| `type-design-analyzer-2` | deferred | Deep-freezing the full admitted result may be desirable, but needs profiling and mutation-boundary tests before changing authority construction. |
| `comment-analyzer-1` | accepted | Rewrite the comment to state that null means no current refutation-panel work; inherited active criticals may remain. |
| `architecture-tech-lead-1` | deferred | Splitting the 3,984-line aggregate is a substantial architecture project requiring an explicit dependency design and migration plan. |
| `architecture-tech-lead-2` | deferred | A shared pure replay/live fold is valuable but is a cross-module lifecycle redesign, not a safe incidental repair. |
| `architecture-tech-lead-3` | deferred | Generalizing the storage capability changes a security-sensitive no-sniffing boundary and needs dedicated design/review. |
| `code-simplifier-1` | accepted | Delete the unreferenced `parseRemediationRegistrationForFacade` pass-through. Repository search confirms no caller. |
| `code-simplifier-2` | deferred | Removing sentinel selection data requires introducing and testing a focused snapshot parser; keep this separate from the blocker repair. |
| `code-simplifier-3` | accepted | Delegate lineage and panel JSON hashes to the existing `canonicalDigest`; remove the now-unused `sha256Hex` import. |
| `code-simplifier-4` | deferred | The proposed state-projection rewrite is behavior-preserving readability work in a high-risk aggregate and deserves isolated tests/review. |
| `code-simplifier-5` | dismissed | The nested expressions are bounded and behaviorally explicit enough; changing them would be preference-only churn without an invariant or defect. |

## Refuted-finding audit

No critical findings were refuted. The sole critical was unanimously upheld by the three registered panel lenses.

## Implementation scope

1. Add a documented finite suite timeout to the four process-heavy P5 integration suites without changing the root verification command.
2. Apply the three accepted advisory fixes only.
3. Do not alter reviewer findings, review evidence, result publication, or historical Run artifacts.

## Exact frozen review scope

The following 91 paths are the immutable scope recorded in the canonical source result:

```text
.claude/plans/2026-09-10-standalone-lineage.md
CONTEXT.md
README.md
agents/architecture-tech-lead.md
agents/code-reviewer.md
agents/code-simplifier.md
agents/comment-analyzer.md
agents/pr-test-analyzer.md
agents/review-verifier-agent.md
agents/silent-failure-hunter.md
agents/type-design-analyzer.md
commands/review-pr.md
docs/README.md
docs/adr/ADR-0009-versioned-reviewer-protocol.md
docs/adr/ADR-0010-standalone-finding-lineage.md
docs/architecture.md
docs/operations.md
engine/src/cli.ts
engine/src/core/context-packet-projection.ts
engine/src/core/context-packets.ts
engine/src/core/defect-family-accounting.ts
engine/src/core/harness-capture.ts
engine/src/core/remediation-machine.ts
engine/src/core/reviewer-contract.ts
engine/src/core/reviewer-protocol.ts
engine/src/core/run-inspection.ts
engine/src/core/standalone-disposition-machine.ts
engine/src/core/standalone-lineage-contract.ts
engine/src/core/standalone-lineage.ts
engine/src/core/standalone-review-machine.ts
engine/src/core/standalone-review.ts
engine/src/core/standalone-successor-reviewer.ts
engine/src/handlers/helpers/orchestration.ts
engine/src/handlers/helpers/programs/helpers.ts
engine/src/handlers/helpers/programs/index.ts
engine/src/handlers/helpers/programs/program-result.ts
engine/src/handlers/helpers/programs/remediation.ts
engine/src/handlers/helpers/programs/standalone-disposition-source.ts
engine/src/handlers/helpers/programs/standalone-disposition.ts
engine/src/handlers/helpers/programs/standalone-evidence.ts
engine/src/handlers/helpers/programs/standalone-source.ts
engine/src/handlers/helpers/programs/standalone-successor-registration.ts
engine/src/handlers/helpers/programs/standalone-successor-source.ts
engine/src/handlers/helpers/programs/standalone.ts
engine/src/handlers/subagent-stop/capture-orchestration-result.ts
engine/src/linter/programmatic/no-cross-boundary-imports.ts
engine/src/linter/programmatic/no-io-in-pure-modules.ts
engine/src/orchestration/harness-capture-runtime.ts
engine/src/orchestration/run-directory-handle.ts
engine/src/orchestration/standalone-panel-context.ts
engine/tests/core/context-packet-projection.test.ts
engine/tests/core/native-capture-recovery.test.ts
engine/tests/core/reviewer-protocol-publication.test.ts
engine/tests/core/standalone-context-serialization.test.ts
engine/tests/core/standalone-disposition-machine.test.ts
engine/tests/core/standalone-lineage.test.ts
engine/tests/core/standalone-successor-lifecycle.test.ts
engine/tests/core/standalone-successor-reviewer.test.ts
engine/tests/fixtures/standalone-cli-capture.ts
engine/tests/fixtures/standalone-disposition-publication.ts
engine/tests/fixtures/standalone-native-capture.ts
engine/tests/fixtures/standalone-native-history.ts
engine/tests/fixtures/standalone-native-workload.ts
engine/tests/fixtures/standalone-remediation-authority.ts
engine/tests/fixtures/standalone-successor-remediation.ts
engine/tests/handlers/helpers/orchestration.test.ts
engine/tests/handlers/helpers/programs/standalone-disposition.integration.test.ts
engine/tests/handlers/helpers/programs/standalone-successor-native.integration.test.ts
engine/tests/handlers/helpers/programs/standalone-successor-registration.test.ts
engine/tests/handlers/helpers/programs/standalone-successor-remediation.integration.test.ts
engine/tests/handlers/helpers/programs/standalone-successor-source.test.ts
engine/tests/handlers/helpers/programs/standalone-successor.integration.test.ts
engine/tests/handlers/helpers/quality-programs.test.ts
engine/tests/handlers/remediated-branches.test.ts
engine/tests/linter/programmatic/machine-purity.test.ts
engine/tests/reviewer-protocol-docs.test.ts
pi/extension.ts
pi/transcript-adapter.ts
references/reviewer-protocol-v2/README.md
references/reviewer-protocol-v2/agents/_shared/wire-contract.md
references/reviewer-protocol-v2/agents/architecture-tech-lead.md
references/reviewer-protocol-v2/agents/code-reviewer.md
references/reviewer-protocol-v2/agents/code-simplifier.md
references/reviewer-protocol-v2/agents/comment-analyzer.md
references/reviewer-protocol-v2/agents/pr-test-analyzer.md
references/reviewer-protocol-v2/agents/review-verifier-agent.md
references/reviewer-protocol-v2/agents/silent-failure-hunter.md
references/reviewer-protocol-v2/agents/type-design-analyzer.md
references/standalone-successor-context.md
scripts/read-context-packet.ts
skills/review-and-fix/SKILL.md
```

The new plan file `.claude/plans/2026-09-12-pr-remediation.md` is outside that frozen scope and must be supplied as a remediation `supportPath`.

## Validation

Development validation, in order:

1. `cd engine && npm exec -- vitest run --testTimeout=15000 --maxWorkers=4 tests/handlers/helpers/programs/standalone-disposition.integration.test.ts tests/handlers/helpers/programs/standalone-successor.integration.test.ts tests/handlers/helpers/programs/standalone-successor-native.integration.test.ts tests/handlers/helpers/programs/standalone-successor-remediation.integration.test.ts`
2. Root `npm run verify` unchanged, on the required quiet Linux/Node 22/Bun 1.3.13 environment.
3. Registered remediation with source finding `pr-test-analyzer-1`, Repair Group `group.integration-timeout-budget`, support path `.claude/plans/2026-09-12-pr-remediation.md`, and selected check `project:verify`.
4. Read success only from the remediation action's verified-index installation receipt and `repair-checked` Defect-Family Assessment.
