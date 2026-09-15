# PR 51 remediation plan — review round 5

## Authority

- Branch: `feat/standalone-lineage`
- Reviewed revision: `81d3fd6b5549017900dcf9410ba392beb28cb322`
- Source review Run: `.claude/reviews/review-and-fix-runs/run.p5-source-review-8`
- Canonical result digest: `3877eb60d3bec8e80bafbcdb272a0ebe1d6b1f5f18e7db2cf7a57b5310a5afb3`
- Canonical frozen scope: the exact `.scope` array in that immutable `result.json`
- Published result: 3 surviving criticals, 15 advisories, 0 refuted criticals

## Exact implementation scope

- `.claude/plans/2026-09-12-pr-remediation-round-5.md` (new support path)
- `CONTEXT.md`
- `docs/adr/ADR-0010-standalone-finding-lineage.md`
- `docs/operations.md`
- `engine/src/handlers/helpers/programs/standalone.ts`
- `engine/src/handlers/helpers/programs/standalone-successor-source.ts`
- `engine/tests/handlers/helpers/programs/standalone-successor-source.test.ts`
- `engine/tests/core/standalone-context-serialization.test.ts`
- `engine/src/orchestration/standalone-panel-context.ts`
- `pi/extension.ts`
- `engine/tests/pi-extension-review-events.test.ts` (regression support path outside frozen review scope)
- `engine/src/core/harness-capture.ts`
- `engine/src/handlers/helpers/programs/helpers.ts`
- `engine/src/handlers/helpers/programs/standalone-disposition-source.ts`

No other path may be changed by this remediation.

## Surviving-critical dispositions

### `code-reviewer-1` — repaired

- Repair Group: `group.successor-preflight-coherence`
- Finding: successor source bytes are frozen before Git changed-path/addition metadata is observed, so a worktree mutation between those operations can select a reviewer roster inconsistent with the delivered source.
- Root cause (`DECLARED`): source observation's stability window ends before `deriveChangedPaths` and metadata derivation, leaving those authority facts outside the final whole-scope source recheck.
- Invariant (`DECLARED`): source bytes, HEAD, changed-path authority, additions, and reviewer-selection metadata are observed in one bounded operation; the Git/metadata callback runs before the source observer's final whole-scope stat/absence pass, and any drift rejects preflight before Run creation.
- Siblings (`DECLARED`): none declared. Explicit schema-v3 successor start is the only path combining frozen current-worktree bytes with retained-roster metadata; ordinary schema-v2 review retains its existing independent start behavior.
- Selected check: `project:verify`
- Historical RED (`DECLARED`): at `81d3fd6`, mutating a scoped file after `observeStandaloneSuccessorSource` returns but while changed-path metadata is derived is not rechecked, so the frozen source and additions can disagree. The new callback-window regression fails on that revision.
- Historical RED reference: `.claude/reviews/review-and-fix-runs/run.p5-source-review-8/result.json#code-reviewer-1`
- Panel: reproduction, intent, and security unanimously upheld.

### `code-reviewer-2` — repaired

- Repair Group: `group.successor-serialized-packet-budget`
- Finding: the 4 MiB component-byte check does not account for decimal JSON byte-array amplification, allowing an emitted v3 packet to exceed its mandatory 16 MiB retained-read ceiling.
- Root cause (`DECLARED`): packet preflight bounds decoded component bytes but never measures the exact canonical serialized packet consumed by retained readers.
- Invariant (`DECLARED`): every constructed v3 successor packet is canonically serialized during preflight and rejected unless its exact UTF-8 byte length is at most `STANDALONE_LINEAGE_LIMITS.retainedBytes`; no oversized packet reaches registration or issuance.
- Siblings (`DECLARED`): none declared. `standaloneSuccessorPackets` is the sole v3 packet constructor used by both fresh and recovered explicit successors; v2 packet/read budgets are separate protocol authority.
- Selected check: `project:verify`
- Historical RED (`DECLARED`): at `81d3fd6`, an emoji-heavy 4,194,304-byte variable payload passes component accounting while canonical packet serialization exceeds 16,777,216 bytes. The exact serialized-budget regression fails on that revision.
- Historical RED reference: `.claude/reviews/review-and-fix-runs/run.p5-source-review-8/result.json#code-reviewer-2`
- Panel: reproduction, intent, and security unanimously upheld.

### `silent-failure-hunter-1` — repaired

- Repair Group: `group.pi-current-review-run`
- Finding: Pi records a run in `trustedReviewRuns` only after a successful capture, so a newer run's rejected first result leaves an older accepted run selectable as current authority.
- Root cause (`DECLARED`): current-run selection is inferred from successful capture timestamps rather than recording run identity when an exact standalone spawn is bound.
- Invariant (`DECLARED`): the first successfully bound standalone spawn for a run records that run as current before child dispatch; retries and later captures preserve that run's original ordering, and verification of an empty/rejected current run fails without considering older runs.
- Siblings (`DECLARED`): none declared. Claude capture authority is durable-run based rather than this Pi process-local bridge; Pi session restart and shutdown handling retain their existing separate recovery/pruning paths.
- Selected check: `project:verify`
- Historical RED (`DECLARED`): at `81d3fd6`, after an accepted run, binding and rejecting the first capture of a second run leaves the second run absent from `trustedReviewRuns`, so verification can return the first run's receipt. The new current-empty-run regression fails on that revision.
- Historical RED reference: `.claude/reviews/review-and-fix-runs/run.p5-source-review-8/result.json#silent-failure-hunter-1`
- Panel: reproduction, intent, and security unanimously upheld.

## Advisory dispositions

| Finding | Disposition | Reason / implementation |
|---|---|---|
| `code-reviewer-3` | accepted | Chunk panel text on Unicode code-point boundaries so astral characters are never split into replacement characters. |
| `pr-test-analyzer-1` | accepted | Add a deterministic absent-then-present final-pass regression for the anchored absence branch. |
| `pr-test-analyzer-2` | accepted | Add table-driven malformed frozen-source mutations covering field shape, scope, mode, base64, length, digest, and aggregate budget. |
| `type-design-analyzer-1` | deferred | Branding every lineage identity changes the published schema types and all lineage parsers/builders; handle as a coordinated nominal-type migration. |
| `type-design-analyzer-2` | deferred | The canonical tuple currently lives in `standalone-review.ts`, which imports this contract; eliminating the duplicate requires a shared-kernel extraction to avoid a cycle. |
| `comment-analyzer-1` | accepted | Replace the stale pseudo-exhaustive capture-failure inventory with an accurate reference to the discriminated union and boundary constructors. |
| `comment-analyzer-2` | accepted | Describe `reviewablePath` honestly as omission/filtering rather than fail-closed rejection. |
| `architecture-tech-lead-1` | deferred | A typed cross-program action algebra changes the common façade interface and all program consumers; it warrants a dedicated deepening migration. |
| `architecture-tech-lead-2` | deferred | Making disposition publication reconciliation atomic changes a stateful I/O seam and call ordering; address in a dedicated capability redesign. |
| `code-simplifier-1` | deferred | Deduplicating repository-witness checks in the central remediation machine is unrelated to these blockers and should be isolated with its own effect-order validation. |
| `code-simplifier-2` | deferred | Recovery-receipt mismatch cleanup is valid but belongs with a focused remediation-machine distillation pass. |
| `code-simplifier-3` | deferred | Active-state field dispatch is valid cleanup but touches broad persisted-state compatibility and is deferred to that same dedicated pass. |
| `code-simplifier-4` | deferred | The panel-materialization parser is outside the repaired lifecycle paths; keep its diagnostic refactor isolated with the broader orchestration distillation pass. |
| `code-simplifier-5` | deferred | Protocol dispatch cleanup is behavior-preserving but unrelated to these blockers and belongs in a focused standalone-aggregate distillation pass. |
| `code-simplifier-6` | accepted | Separate missing-artifact and reducer-failure branches and remove the unreachable success-side diagnostic arm. |

## Refuted-finding audit

No critical finding was refuted. All three findings were upheld by reproduction, intent, and security.

## Validation

1. Typecheck.
2. Targeted successor source/packet, Pi review-authority, panel projection, orchestration, standalone parsing, and disposition-source tests.
3. Distill apply-mode pass from a green targeted baseline, one accepted simplification at a time.
4. Root `npm run verify` unchanged in a private `/tmp/claude-subagents` namespace.
5. Registered schema-v2 remediation sourced from `run.p5-source-review-8`, retaining all three original finding IDs, three Declared Repair Groups, support paths `.claude/plans/2026-09-12-pr-remediation-round-5.md` and `engine/tests/pi-extension-review-events.test.ts`, and selected check `project:verify`.
6. Read success only from the registered action's verified-index installation receipt and `repair-checked` Defect-Family Assessment.
