# PR 51 remediation plan — review round 3

## Authority

- Branch: `feat/standalone-lineage`
- Reviewed revision: `4b00e10d3c7d27c9e6d2d3d7ae2f01b1067a1d01`
- Source review Run: `.claude/reviews/review-and-fix-runs/run.p5-source-review-6`
- Canonical result digest: `4a5237cecad7804d46052e7928c456a361459aa153678a2f03bfb7f822a736c3`
- Canonical frozen scope: the exact 93-path `.scope` array in that immutable `result.json`
- Published result: 1 surviving critical, 11 advisories, 0 refuted criticals
- Retired predecessor: `run.p5-source-review-5`, superseded because one refutation task was transcribed with a malformed context path and therefore did not preserve exact issued-task authority.

## Exact implementation scope

- `.claude/plans/2026-09-12-pr-remediation-round-3.md` (new support path)
- `engine/src/handlers/helpers/programs/standalone-successor-source.ts`
- `engine/tests/handlers/helpers/programs/standalone-successor-source.test.ts`
- `engine/src/handlers/helpers/programs/standalone-evidence.ts`
- `engine/src/core/context-packets.ts`
- `engine/src/core/standalone-review.ts`
- `engine/src/linter/programmatic/no-io-in-pure-modules.ts`
- `engine/src/handlers/helpers/programs/standalone.ts`
- `engine/src/orchestration/harness-capture-runtime.ts`
- `engine/src/core/standalone-disposition-machine.ts`
- `engine/src/core/context-packet-projection.ts`

No other path may be changed by this remediation.

## Surviving-critical disposition

### `silent-failure-hunter-1` — repaired

- Repair Group: `group.successor-source-observation-race`
- Finding: an in-flight deletion after an initially successful source-file `lstat` is caught as ordinary absence and frozen into authenticated successor source.
- Root cause (`DECLARED`): One `try`/`catch` encloses the initial presence probe, no-follow byte read, and post-read stability probe, and its `ENOENT` branch cannot distinguish initial absence from disappearance after presence was observed.
- Invariant (`DECLARED`): Only `ENOENT` from the initial presence probe establishes an absent source row. Once a path is observed present, any disappearance during byte reading or the post-read stability probe rejects the complete source observation as changed/unavailable before HEAD is requested or authority is frozen.
- Siblings (`DECLARED`): none declared. `observeStandaloneSuccessorSource` is the single current-worktree observer used to create successor source authority; retained-source replay reads immutable run artifacts through separate no-follow readers.
- Selected check: `project:verify`
- Historical RED (`DECLARED`): At reviewed revision `4b00e10`, a deterministic source adapter that returns a regular-file stat and then throws `ENOENT` from the read or second stat is accepted as an absent row. The new regression requiring rejection in both post-presence windows would fail.
- Historical RED reference: `.claude/reviews/review-and-fix-runs/run.p5-source-review-6/result.json#silent-failure-hunter-1`
- Panel: intent and security upheld; reproduction was uncertain only because no concurrent execution had been supplied. Strict-majority threshold 2 was met.

## Advisory dispositions

| Finding | Disposition | Reason / implementation |
|---|---|---|
| `silent-failure-hunter-2` | accepted | Preserve whether issued-request or captured-attempt durable roster loading failed, including the bounded underlying diagnostic, while retaining fail-closed behavior. |
| `type-design-analyzer-1` | deferred | Transition-valid lineage history is a sound deeper model, but an opaque history type requires parser, constructor, migration, and replay redesign beyond this race repair. |
| `type-design-analyzer-2` | deferred | Branding disposition publication identity changes durable reference types and all publication/parser seams; runtime parsing already fails closed and this deserves a dedicated migration. |
| `comment-analyzer-1` | accepted | Replace temporary “future successor” wording with the implemented explicit v3 successor issuance contract. |
| `comment-analyzer-2` | accepted | Scope the binary survive/refute comment to legacy v1/v2 finalization; v3 has lineage states. |
| `comment-analyzer-3` | accepted | Explain that pure files are enumerated because core/parser directories are mixed, not because most files there perform I/O. |
| `architecture-tech-lead-1` | deferred | Centralizing stdin budget in route metadata is valuable, but it requires changing routing authority and tests outside the frozen 93-path review scope. The current three-route policy is covered by direct integration tests and remains unchanged here. |
| `code-simplifier-1` | accepted | Use `initialStandaloneRequests` for fresh review startup as well as successor startup. |
| `code-simplifier-2` | accepted | Remove the redundant correlator-role field and post-resolution equality branch after `resolveCorrelatedRequest` has proved role/attempt equality. |
| `code-simplifier-3` | accepted | Derive the disposition digest once and derive the expected receipt once per reducer transition. |
| `code-simplifier-4` | accepted | Replace nested ternaries in context-reader numeric and selection parsing with explicit guards and branches. |

## Refuted-finding audit

No critical finding was refuted. `silent-failure-hunter-1` survived because intent and security upheld it; reproduction returned uncertain rather than refuted due to the absence of an executed race reproduction in the reviewed revision.

## Validation

1. Typecheck.
2. Targeted source-observation, context projection, disposition-machine, capture-runtime, and standalone integration tests.
3. Root `npm run verify` unchanged in a private `/tmp/claude-subagents` namespace.
4. Registered schema-v2 remediation sourced from `run.p5-source-review-6`, retaining original finding ID `silent-failure-hunter-1`, Declared Repair Group `group.successor-source-observation-race`, support path `.claude/plans/2026-09-12-pr-remediation-round-3.md`, and selected check `project:verify`.
5. Read success only from the registered action's verified-index installation receipt and `repair-checked` Defect-Family Assessment.
