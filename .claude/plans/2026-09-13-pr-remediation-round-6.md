# PR 51 remediation plan — review round 6

## Authority

- Branch: `feat/standalone-lineage`
- Reviewed revision: `3102ba196e3644a5a5eefb60f26a1311a0483f33`
- Source review Run: `.claude/reviews/review-and-fix-runs/run.p5-source-review-9`
- Canonical result digest: `6395362881847fe2aee6c741eec1d40c9c1ea86243998e6c199a9858018b7f10`
- Canonical frozen scope: the exact `.scope` array in that immutable `result.json`
- Published result: 3 surviving criticals, 14 advisories, 0 refuted criticals

## Exact implementation scope

- `.claude/plans/2026-09-13-pr-remediation-round-6.md` (new support path)
- `docs/operations.md`
- `engine/src/core/standalone-review.ts`
- `engine/src/handlers/helpers/programs/helpers.ts`
- `engine/src/handlers/helpers/programs/standalone-successor-source.ts`
- `engine/src/handlers/helpers/programs/standalone.ts`
- `engine/src/handlers/subagent-stop/capture-orchestration-result.ts`
- `engine/tests/core/standalone-context-serialization.test.ts`
- `engine/tests/handlers/helpers/programs/standalone-successor-source.test.ts`
- `engine/tests/handlers/helpers/programs/standalone-successor.integration.test.ts`
- `engine/tests/handlers/helpers/programs/standalone-successor-native.integration.test.ts`
- `engine/tests/pi-extension-review-events.test.ts`
- `pi/extension.ts`

No other path may be changed by this remediation.

## Surviving-critical dispositions

### `code-reviewer-1` — repaired

- Repair Group: `group.successor-git-authority-stability`
- Finding: a HEAD transition during metadata observation can leave `headRevision` from one commit and changed-path facts from another while source stats remain unchanged.
- Root cause (`DECLARED`): the source observer rechecks only filesystem facts after one multi-command Git observation; it neither pins HEAD-derived Git commands to the captured revision nor brackets derivation with repository-status authority before encoding.
- Invariant (`DECLARED`): every HEAD-derived Git command uses its captured immutable revision, the complete derivation is bracketed by identical porcelain-v2 HEAD/index/worktree status witnesses, and that witness remains identical across the source observer's final whole-scope pass.
- Siblings (`DECLARED`): none declared. Explicit schema-v3 successor preflight is the sole path joining frozen source bytes to Git/reviewer metadata; independent schema-v2 review keeps its existing source model.
- Selected check: `project:verify`
- Historical RED (`DECLARED`): at `3102ba1`, a Git shim that advances HEAD after the first `rev-parse HEAD` leaves source stats unchanged and `observeStableStandaloneSuccessorSource` accepts metadata derived across old/new revisions. The repeated-authority and facade preflight regressions fail on that revision.
- Historical RED reference: `.claude/reviews/review-and-fix-runs/run.p5-source-review-9/result.json#code-reviewer-1`
- Panel: reproduction, intent, and security unanimously upheld.

### `silent-failure-hunter-1` — repaired

- Repair Group: `group.current-capture-registration-before-observation`
- Finding: Pi discards a failed registration probe, omits successor native transcript limits, and traverses/copies untrusted messages before the shared runtime can report registration failure.
- Root cause (`DECLARED`): preliminary registration observation was collapsed into `null`, making unavailable current authority indistinguishable from a non-successor purpose before payload observation.
- Invariant (`DECLARED`): a correlated Pi request whose registration read fails returns explicit retriable registration unavailability before native transcript traversal; missing registration remains resource-bounded before parsing.
- Siblings (`DECLARED`): Claude carries the same registration-before-observation defect and is repaired in this group under `silent-failure-hunter-2`; no other native capture adapter performs this preliminary purpose lookup.
- Selected check: `project:verify`
- Historical RED (`DECLARED`): at `3102ba1`, corrupting a correlated successor's `program.json` still invokes `piResultFinalPayloadCandidates` without the successor budget before the later shared registration refusal. The unreadable-registration/no-traversal regression fails on that revision.
- Historical RED reference: `.claude/reviews/review-and-fix-runs/run.p5-source-review-9/result.json#silent-failure-hunter-1`
- Panel: reproduction, intent, and security unanimously upheld.

### `silent-failure-hunter-2` — repaired

- Repair Group: `group.current-capture-registration-before-observation`
- Finding: Claude discards a failed registration probe and selects the unbounded transcript reader before the shared runtime reports registration failure.
- Root cause (`DECLARED`): same family as `silent-failure-hunter-1`; unavailable preliminary registration was represented as false successor classification rather than an explicit unavailable observation.
- Invariant (`DECLARED`): a correlated Claude request whose registration read fails returns explicit retriable registration unavailability before reading the transcript; missing registration uses the bounded reader before parsing.
- Siblings (`DECLARED`): Pi is the only sibling native adapter and is repaired in the same group; no additional sibling path was identified.
- Selected check: `project:verify`
- Historical RED (`DECLARED`): at `3102ba1`, corrupting a correlated successor's `program.json` makes `captureClaudeResult` call `readPayload(transcriptPath)` without `maximumBytes`. The unreadable-registration/no-read regression fails on that revision.
- Historical RED reference: `.claude/reviews/review-and-fix-runs/run.p5-source-review-9/result.json#silent-failure-hunter-2`
- Panel: reproduction, intent, and security unanimously upheld.

## Advisory dispositions

| Finding | Disposition | Reason / implementation |
|---|---|---|
| `pr-test-analyzer-1` | accepted | Exercise serialized-size refusal through `standaloneSuccessorPackets`, not only the leaf admission helper. |
| `pr-test-analyzer-2` | accepted | Add facade-level HEAD-drift preflight coverage using a controlled Git shim and prove no Run is created. |
| `type-design-analyzer-1` | deferred | A transition-safe opaque history changes the published lineage model, parsers, replay, and persistence; handle as a dedicated model migration. |
| `type-design-analyzer-2` | deferred | Splitting predecessor/current snapshot variants changes successor preparation and all consumers; coordinate it with the lineage model migration. |
| `type-design-analyzer-3` | deferred | Removing roster duplication requires extracting a shared source tuple to avoid the existing contract/review dependency cycle. |
| `type-design-analyzer-4` | deferred | Persisting finding relation changes lineage rows, serialization, successor parsing, and backward compatibility; it is a schema evolution rather than a narrow repair. |
| `comment-analyzer-1` | accepted | Document that v3 frozen binary representation is decodable when its exact bytes are valid UTF-8, while v1/v2 binary sections and invalid UTF-8 remain refused. |
| `comment-analyzer-2` | accepted | Replace transient P5 publication/digest prose with the stable admitted-runtime selection rule; dated rollout evidence remains in ADR/plans. |
| `comment-analyzer-3` | accepted | Rewrite the serializer comment around discriminant-preserving narrowing rather than removed implementation history. |
| `code-simplifier-1` | deferred | Moving the exact-object predicate to a neutral module changes a safety-sensitive seam and import graph unrelated to these repairs; isolate it with direct predicate parity tests. |
| `code-simplifier-2` | accepted | Route Pi current-run touch/capture updates through one private immutable updater while preserving first-binding order. |
| `code-simplifier-3` | accepted | Extract the disposition precedence into one pure ordered-return function without changing the inventory interface. |
| `code-simplifier-4` | deferred | Splitting the 270-line evidence replay is a broad lifecycle deepening with effect-order risk; perform it as a dedicated refactor. |
| `code-simplifier-5` | accepted | Replace remediation-history comment blocks with one concise canonical `docsOnly` implication comment. |

## Refuted-finding audit

No critical finding was refuted. All three were upheld by reproduction, intent, and security.

## Validation

1. Establish a green targeted baseline before accepted distillation.
2. Typecheck.
3. Run targeted successor source/facade/serialization and native Pi/Claude capture suites.
4. Distill apply-mode one move at a time, rerunning the covering suites after each move.
5. Run root `npm run verify` unchanged in a private `/tmp/claude-subagents` namespace. If a registered check exposes a candidate-caused timing regression, preserve that blocked run, correct the candidate, rerun the full gate, and supersede it with a fresh remediation run.
6. Start registered schema-v2 remediation from `run.p5-source-review-9`, retaining all three original Finding IDs in two Declared Repair Groups, support path `.claude/plans/2026-09-13-pr-remediation-round-6.md`, and selected check `project:verify`.
7. Read success only from the registered `verified-index-installed` receipt and `repair-checked` Defect-Family Assessment, then commit and push without force.
