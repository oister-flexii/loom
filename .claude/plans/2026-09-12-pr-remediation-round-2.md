# PR 51 remediation plan — review round 2

## Authority

- Branch: `feat/standalone-lineage`
- Reviewed revision: `58a3cf86a9e91d29accf2670a8b2c987ae5eab12`
- Source review Run: `.claude/reviews/review-and-fix-runs/run.p5-source-review-4`
- Canonical result digest: `ca949efc6575f5c20912c193f6f8f4241b413d17a02ae954c1b9a2f2bc6a7a86`
- Canonical frozen scope: the exact 92-path `.scope` array in that immutable `result.json`
- Published result: 2 surviving criticals, 11 advisories, 0 refuted criticals

## Exact implementation scope

- `.claude/plans/2026-09-12-pr-remediation-round-2.md` (new support path)
- `docs/adr/ADR-0010-standalone-finding-lineage.md`
- `docs/operations.md`
- `engine/src/cli.ts`
- `engine/src/core/standalone-review.ts`
- `engine/src/handlers/helpers/orchestration.ts`
- `engine/src/handlers/helpers/programs/standalone-evidence.ts`
- `engine/src/handlers/helpers/programs/standalone.ts`
- `engine/tests/handlers/helpers/programs/standalone-successor.integration.test.ts`
- `pi/transcript-adapter.ts`

No other path may be changed by this remediation.

## Surviving-critical dispositions

### `code-reviewer-1` — repaired

- Repair Group: `group.cli-submit-raw-bound`
- Finding: orchestration `submit` receives an infinite stdin allowance, allowing unbounded chunk retention and Buffer-to-number-array amplification before semantic admission.
- Root cause (`DECLARED`): The outer CLI's finite raw-input policy recognized standalone start routes but omitted the shared orchestration submit route, even though submit is the CLI boundary that transports untrusted reviewer final bytes into durable capture.
- Invariant (`DECLARED`): Every orchestration submit is rejected before handler invocation once its raw stdin exceeds the existing finite 16,777,216-byte capture/retained-input budget. The separately documented 1,048,576-byte reviewer-response limit remains a semantic-admission bound and may reject a durably captured attempt.
- Panel nuance retained: the intent lens refuted the reviewer's proposed 1 MiB pre-capture threshold because operations explicitly defines 1 MiB as semantic admission. Reproduction and security still upheld the unbounded-memory consequence. The repair therefore applies 16 MiB at raw ingress, not 1 MiB.
- Siblings (`DECLARED`): none declared. The one outer CLI stdin reader owns all orchestration submit routes; native harness capture already applies its separate bounded candidate extraction.
- Selected check: `project:verify`
- Historical RED (`DECLARED`): At reviewed revision `58a3cf8`, a v3 orchestration submit larger than 16 MiB enters the handler because `maximumStdinBytes` is infinite for submit. The new regression's no-handler/no-transcript assertion would fail against that revision.
- Historical RED reference: `.claude/reviews/review-and-fix-runs/run.p5-source-review-4/result.json#code-reviewer-1`

### `code-reviewer-2` — repaired

- Repair Group: `group.successor-initial-publication-recovery`
- Finding: a v3 successor interrupted after registration but before initial batch receipt/checkpoint cannot recover through resume.
- Root cause (`DECLARED`): The checkpoint-null recovery branch can reconstruct state only after finding an existing durable batch receipt; unlike refutation/retry recovery, it does not invoke the idempotent batch publisher when authenticated registration exists but the receipt is absent.
- Invariant (`DECLARED`): For a schema-v3 successor with authenticated registration/source and no checkpoint, resume either reconciles an existing exact initial-batch publication or idempotently publishes the frozen attempt-1 packets and request authority, writes the reconstructed awaiting-results checkpoint, and returns the exact spawn action. Corrupt or conflicting publication evidence still fails closed.
- Siblings (`DECLARED`): none declared. Refutation and retry publication already have separate recover-or-publish paths; legacy v1/v2 behavior remains unchanged by the v3-only repair.
- Selected check: `project:verify`
- Historical RED (`DECLARED`): At reviewed revision `58a3cf8`, a registration-only v3 successor reaches the explicit error `standalone review checkpoint is missing and no durable batch publication exists`; the new recovery regression would fail.
- Historical RED reference: `.claude/reviews/review-and-fix-runs/run.p5-source-review-4/result.json#code-reviewer-2`

## Advisory dispositions

| Finding | Disposition | Reason / implementation |
|---|---|---|
| `type-design-analyzer-1` | deferred | A PendingStandaloneSlot ADT would improve compiler enforcement but changes durable state construction/parsing across the lifecycle and deserves a dedicated migration. |
| `type-design-analyzer-2` | deferred | Splitting ready-to-finalize into clean/refutation variants is sound but touches reducer, parser, serializer, replay, and publication authority; it is not incidental to these blockers. |
| `comment-analyzer-1` | accepted | Correct orchestration header: each call drives deterministic work until the next external boundary and returns one action. |
| `comment-analyzer-2` | accepted | Correct prepareFreshStandaloneReview input documentation while preserving internally derived role/model/request/slot authority. |
| `comment-analyzer-3` | accepted | Correct generic replay documentation: durable witnesses are sufficient generically; Pi may additionally require current-session witnesses. |
| `comment-analyzer-4` | accepted | Correct Claude adapter wording to “final non-empty line, if it is an assistant message.” |
| `comment-analyzer-5` | accepted | State that comment-analyzer is selected specifically for docs, not that it alone can read docs. |
| `architecture-tech-lead-1` | deferred | A shared pure live/replay lifecycle projection is valuable but is a substantial cross-shell deepening requiring its own architecture plan. |
| `code-simplifier-1` | accepted | Extract one private reviewer-evidence wire projection used by aggregate and result serializers. |
| `code-simplifier-2` | accepted | Extract one private review-metadata preparation projection used by fresh and successor startup. |
| `code-simplifier-3` | accepted | Reuse imported `sha256Bytes` for byte-oriented transcript/result hashing. |

## Refuted-finding audit

No critical finding was refuted by strict majority. For `code-reviewer-1`, only the intent lens refuted the asserted 1 MiB ingress threshold; reproduction and security upheld the unbounded raw-ingress consequence, so the finding survived. `code-reviewer-2` was upheld by all three lenses.

## Validation

1. Typecheck.
2. Targeted successor integration regressions, including over-16-MiB submit refusal and registration-only v3 recovery.
3. Root `npm run verify` unchanged in the private `/tmp/claude-subagents` namespace used for prior accepted evidence.
4. Registered schema-v2 remediation sourced from `run.p5-source-review-4`, with both original finding IDs, both Declared Repair Groups, support path `.claude/plans/2026-09-12-pr-remediation-round-2.md`, and selected check `project:verify`.
5. Read success only from the registered action's verified-index installation receipt and `repair-checked` Defect-Family Assessment.
