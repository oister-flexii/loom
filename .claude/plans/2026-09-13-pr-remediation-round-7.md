# PR 51 remediation plan — review round 7

## Authority

- Branch: `feat/standalone-lineage`
- Reviewed revision: `902e13fc8a1477dac3e58e4bd98f45ed35cadaf0`
- Source review Run: `.claude/reviews/review-and-fix-runs/run.p5-source-review-10`
- Canonical result digest: `c6788a3d27dd32a5fe619dcec4bed8035625527de7c8d8368ef2cab5cbc0bf42`
- Canonical frozen scope: the exact `.scope` array in that immutable `result.json`
- Published result: 5 surviving criticals, 9 advisories, 0 refuted criticals

## Exact implementation scope

- `.claude/plans/2026-09-13-pr-remediation-round-7.md` (new support path)
- `docs/operations.md`
- `engine/src/core/remediation-machine.ts`
- `engine/src/core/standalone-review.ts`
- `engine/src/handlers/helpers/programs/standalone-successor-source.ts`
- `engine/src/handlers/helpers/programs/standalone.ts`
- `engine/src/handlers/subagent-stop/capture-orchestration-result.ts`
- `engine/src/orchestration/harness-capture-runtime.ts`
- `engine/tests/handlers/helpers/programs/standalone-successor-native.integration.test.ts`
- `engine/tests/handlers/helpers/programs/standalone-successor-source.test.ts`
- `pi/extension.ts`

No other path may be changed by this remediation.

## Surviving-critical dispositions

### `silent-failure-hunter-1` — repaired

- Repair Group: `group.native-registration-budget-gating`
- Finding: a correlated schema-v3 Claude request can select the unbounded transcript reader when its current registration is corrupt but still parses as another registered program.
- Root cause (`DECLARED`): the Claude observe adapter selected final-payload resources conditionally on a registration/purpose derivation the correlated request cannot authenticate, so a mismatched registration selected the unbounded `readFileSync` branch; the correlated request carries no schema version to compare against.
- Invariant (`DECLARED`): every current capture selects the bounded Claude transcript reader (`claudeFinalPayloadCandidates(transcriptPath, 16_777_216)`) unconditionally, before any transcript observation or decoding; no branch admits an unbounded selection, so the foreign escape is structurally impossible rather than refused.
- Siblings (`DECLARED`): Pi carries the same conditional-selection defect and is repaired in this group under `silent-failure-hunter-2`; the refutation-panel verifier captures are legitimate same-run `refutation-panel` requests and must keep flowing through the shared runtime's refutation contract.
- Selected check: `project:verify`
- Historical RED (`DECLARED`): at `902e13f`, corrupting a correlated successor's registration so it still parses as another registered program selected the unbounded transcript reader before the shared runtime could report the registration fault (reviewer-reported reproduction; the always-bounded selection did not exist).
- Historical RED reference: `.claude/reviews/review-and-fix-runs/run.p5-source-review-10/result.json#standalone-review:silent-failure-hunter-1`
- Panel: intent and security upheld; reproduction uncertain (reviewer-reported reproduction retained as the round's RED evidence).

### `silent-failure-hunter-2` — repaired

- Repair Group: `group.native-registration-budget-gating`
- Finding: a correlated schema-v3 Pi request can bypass all decoded-transcript work limits when its current registration parses successfully as a different or older program (undefined purpose passed).
- Root cause (`DECLARED`): same family as `silent-failure-hunter-1`; the Pi observe adapter derived a legacy/successor purpose and only the successor arm applied `piResultFinalPayloadCandidates`' decoded-work budget, leaving the undefined-purpose arm unbudgeted.
- Invariant (`DECLARED`): every current Pi capture applies the successor decoded-work budget unconditionally (`piResultFinalPayloadCandidates(messages ?? [], "standalone-successor")`) before the legacy adapter allocates copied arrays; missing registration remains resource-bounded before parsing.
- Siblings (`DECLARED`): Claude carries the same defect and is repaired in this group under `silent-failure-hunter-1`; no other native capture adapter performs this preliminary purpose lookup.
- Selected check: `project:verify`
- Historical RED (`DECLARED`): at `902e13f`, the same corrupt-registration reproduction bypassed the successor decoded-work budget because the purpose derivation could not distinguish a corrupt registration parsing as another registered program (reviewer-reported reproduction).
- Historical RED reference: `.claude/reviews/review-and-fix-runs/run.p5-source-review-10/result.json#standalone-review:silent-failure-hunter-2`
- Panel: intent and security upheld; reproduction uncertain (reviewer-reported reproduction retained as the round's RED evidence).

### `silent-failure-hunter-3` — repaired

- Repair Group: `group.rejection-event-checkpoint-reconciliation`
- Finding: standalone semantic rejection commits its checkpoint before appending the rejection audit event, and a later resume can advance and finalize without ever retrying the failed append.
- Root cause (`DECLARED`): the attempt-2 projection checkpoint was written before the append-only rejection audit events at all three commit sites (Phase A and both Phase C sites), so an append failure left the checkpoint already advanced and the journal permanently missing the rejection audit event.
- Invariant (`DECLARED`): the rejection audit events are appended BEFORE each checkpoint commit at every site; a failed append leaves the checkpoint still expecting the pre-commit state so the next resume rediscovers and retries the rejection, and the journal's dedup key makes the repeat idempotent.
- Siblings (`DECLARED`): the harness-capture runtime's `terminalizeCaptureRejection` already appends its audit event after its tombstone under the same idempotency obligation; the standalone facade's three sites are the sole remaining checkpoint-before-append orderings.
- Selected check: `project:verify`
- Historical RED (`DECLARED`): at `902e13f`, a failed rejection append after a committed checkpoint permanently omitted the rejection audit event from the journal; the reordered sites make the repeat rediscoverable.
- Historical RED reference: `.claude/reviews/review-and-fix-runs/run.p5-source-review-10/result.json#standalone-review:silent-failure-hunter-3`
- Panel: intent and security upheld; reproduction uncertain (the append-before-checkpoint reorder is idempotent-safe in either direction, and the journal dedup key makes the repeat rediscoverable).

### `pr-test-analyzer-1` — repaired

- Repair Group: `group.missing-registration-resource-bound`
- Finding: the accepted native-capture repair does not test the missing-registration branch, so its required resource bound can regress while the targeted suite stays green.
- Root cause (`DECLARED`): the native-capture repair tests never removed `program.json`, leaving the raw-null missing-registration branch and its 16 MiB registration resource bound uncovered.
- Invariant (`DECLARED`): the native capture tests cover the missing-registration branch for both harnesses: Pi with a hostile transcript accessor proves the capture bounds missing-registration work before parsing without unbounded transcript work (the getter is never invoked, the tombstone is recorded, and the resume reissues the exact retry roster), and Claude with an oversized transcript proves the bounded registration read fails retriably without a tombstone.
- Siblings (`DECLARED`): the source observer's witness/absence regressions cover the same resource-bound family from the observation side and are repaired in this group's round; no other native capture test performs a missing-registration delivery.
- Selected check: `project:verify`
- Historical RED (`DECLARED`): at `902e13f` the missing-registration branch was uncovered by the native capture tests (the tests did not exist), so the required resource bound could regress while the targeted suite stayed green.
- Historical RED reference: `.claude/reviews/review-and-fix-runs/run.p5-source-review-10/result.json#standalone-review:pr-test-analyzer-1`
- Panel: reproduction, intent, and security unanimously upheld.

### `comment-analyzer-1` — repaired

- Repair Group: `group.missing-registration-resource-bound`
- Finding: the documented Git-authority stability guarantee is false: the witness is rechecked before, not after, the final whole-scope source pass, so authority can encode stale Git facts.
- Root cause (`DECLARED`): `observeStableStandaloneSuccessorSource` confirmed the compact Git-authority witness between its two source passes and documented the witness as covering the final whole-scope pass, while the generic path repeated complete observation only before the final pass.
- Invariant (`DECLARED`): production observes a compact porcelain-v2 Git-status witness at derivation and again AFTER the final whole-scope source pass; the generic path repeats complete observation after the final pass; `confirmAnchoredAbsence` rethrows every non-ENOENT, non-byte-limit cause so the operator sees the actual filesystem fault instead of race diagnosis.
- Siblings (`DECLARED`): `docs/operations.md` carries the same false guarantee and is repaired in this group; no other source observer performs the final whole-scope witness check.
- Selected check: `project:verify`
- Historical RED (`DECLARED`): at `902e13f`, a fake `lstat` that changes the Git authority at the fourth call (the final whole-scope pass) is accepted, producing source authority whose witness was observed stale; the witness-drift regression fails on that revision, and the non-ENOENT repeated-absence regression fails with the raw cause escaped instead of a race diagnosis.
- Historical RED reference: `.claude/reviews/review-and-fix-runs/run.p5-source-review-10/result.json#standalone-review:comment-analyzer-1`
- Panel: reproduction, intent, and security unanimously upheld.

## Accepted advisories (applied in this round)

- `comment-analyzer-2`: `docs/operations.md` qualifies the 128 MiB input limit as a legacy v1/v2-selection ceiling (successor Context Packets are already bounded smaller by the protocol).
- `comment-analyzer-3`: `engine/src/orchestration/harness-capture-runtime.ts` header acknowledges the adapters' preliminary capture responsibilities (request resolution, registration parsing, resource-bound selection).
- `comment-analyzer-4`: `engine/src/core/standalone-review.ts` checkpoint-parser comment states the durable rationale (the persisted attempt is validated as 1 or 2 before it indexes the frozen attempt tuple).
- `code-simplifier-1`: `engine/src/core/standalone-review.ts` passes `authorityErrors` directly to `preparationFailure` (every null branch pushes an error).
- `code-simplifier-2`: `engine/src/core/standalone-review.ts` advisory detail projection as `{ reason: finding.reason, basis: finding.basis }` (the summary serializer's `JSON.stringify` omits undefined).
- `code-simplifier-3`: `engine/src/core/remediation-machine.ts` extracts `firstRecoveryReceiptMismatch`, a sequential [field, actual, expected] guard over the five receipt fields, replacing the five-arm ternary.

## Deferred advisories (not applied)

- `silent-failure-hunter-4`: inspection output-shape/ADT change — an interface redesign outside this round's behavior-preserving scope.
- `type-design-analyzer-1`: source-observation API redesign — a deepening outside this round's scope.

## Validation

- Targeted: source-observer, native-capture, disposition, successor, remediation-machine, and standalone-review suites green (including the three new historical-RED regressions, which fail at `902e13f` and pass on the repaired candidate).
- Full gate: root `npm run verify`, namespace-isolated (`/tmp/claude-subagents` shadowed, UID 1000, capabilities dropped) — 8887 passed | 1 skipped, all six smokes, evidence `/tmp/loom-p5-round7-validation`.
