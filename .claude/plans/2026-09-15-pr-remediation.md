# PR 51 remediation plan — review round 8

## Authority

- Branch: `feat/standalone-lineage` (PR #51 head, worktree `/home/peterstorm/dev/claude-plugins/loom-standalone-lineage`)
- Reviewed revision: `b13bc9bfed1eefeddd84bce73f03cd3fed08ab1b`
- Source review Run Directory: `.claude/reviews/review-and-fix-runs/run.p5-source-review-11`
- Canonical result digest: `d4bec94495509a854b37cd7c1ef7d1b1a19ac0032e36162bf868e974f3b691bd`
- Canonical frozen scope: the exact `.scope` array (99 files) in that immutable `result.json`
- Published result: **0 surviving criticals, 17 advisories, 0 refuted criticals**
- Reviewer protocol: v2 (one code-reviewer attempt-1 capture was rejected `no-final-payload` and reissued as attempt 2, which captured successfully — bounded retry, no synthetic Finding)

## Surviving-critical dispositions

**Zero surviving criticals.** No Finding dispositions, no Declared Repair Groups, no selected checks, no manifests, no repair subprocesses. The round-7 surviving-critical repairs (verified honored at HEAD by the code-reviewer's attempt-2 execution trace) held: the always-bounded Claude transcript reader, the unconditional Pi successor budget, and the audit-events-before-checkpoint orderings are all present at `b13bc9b`.

## Advisory dispositions (all 17, autonomous parent triage)

### Accepted — `code-reviewer-1`

- Claim: `captureStandaloneReviewerBytes` mints in-memory capture intents at `effect:capture:sha256(requestId)` while the durable runtime records receipts at `effect:capture:sha256(requestId:attempt)` — two stable derivations of the same capture effect id.
- Reason for acceptance: verified non-functional today, and the fix is a contained unification — the attempt is available on `request.authority`, so the core intent can derive the same durable form; this removes a latent `reconcileEffectReceipt` trap at one canonical derivation.
- Fix: `engine/src/core/standalone-review.ts` — `captureStandaloneReviewerBytes` derives `effect:capture:sha256(\`${requestId}:${attempt}\`)`, matching `persistNativeCapture`, the Pi capture path, and `readStandaloneCaptureWitnesses`. Update any in-scope test asserting the old intent derivation.

### Accepted — `code-reviewer-2`

- Claim: five frozen-scope files carry standing violations of the project's own programmatic lint policy (max-function-lines on four functions; exhaustive-discriminant-branching on one).
- Reason for acceptance: the claim is sound (reviewer-executed read-only lint), the fix is in-scope and behavior-preserving (distill-mode extractions), and the project's own `Checkable Invariant` vocabulary governs its own source.
- Fix: refactor `parseReviewMetadata` (`engine/src/core/standalone-review.ts:277`), `observeStableStandaloneSuccessorSource` (`engine/src/handlers/helpers/programs/standalone-successor-source.ts:60`), `resolveCorrelatedRequest` (`engine/src/orchestration/harness-capture-runtime.ts:196`), and `parsePiMessages` (`pi/transcript-adapter.ts:83`) to ≤50 lines each without interface change; convert the 4-branch `state.value.kind` if-chain (`engine/src/handlers/helpers/programs/standalone.ts:353`) to an exhaustive `switch` whose `default` arm binds the scrutinee to `never` (the `effects.ts` idiom).

### Accepted — `silent-failure-hunter-1`

- Claim: the bare catch at `pi/transcript-adapter.ts:521` returns a generic rejection and drops the thrown cause.
- Reason for acceptance: debuggability improvement matching the module's own bounded-cause pattern (`boundedParserCause`); failure remains explicit and typed either way.
- Fix: `pi/transcript-adapter.ts` — capture a bounded cause name/message from the thrown error in the `successorTranscriptBudgetProblem` traversal catch.

### Accepted — `silent-failure-hunter-2`

- Claim: the bare catch at `standalone-successor-registration.ts:82` reports "frozen successor source cannot be decoded" without the underlying cause; line 76 conflates a section-encoding failure with a digest mismatch.
- Reason for acceptance: same bounded-cause family; the operator can then distinguish invalid UTF-8 predecessor bytes from other encoding failures.
- Fix: `engine/src/handlers/helpers/programs/standalone-successor-registration.ts` — bounded cause in the outer catch; distinguish `!section.ok` (encoding failure) from the digest/byteLength mismatch at line 76.

### Accepted — `type-design-analyzer-1`

- Claim: the declaration grammar brands `RepairGroupId`/`DeclaredText` but leaves Finding IDs plain string, so a `RepairGroupId`-shaped string is silently assignable where a finding id is expected.
- Reason for acceptance: the loaded `typescript-patterns.md` Branded Types rule is binding for exactly this class (same-typed params, swap-silent bugs); parse-time membership validation preserves correctness, the brand extends the module's swap-proof guarantee to the join key.
- Fix: `engine/src/core/defect-family-accounting.ts` — introduce a branded `FindingId` smart constructor (canonical `parseFindingId` shape) and use it for `findingId` in `CriticalFindingDisposition` and `findingIds` in `DeclaredRepairGroup`; parse dispositions through it.

### Accepted — `type-design-analyzer-2`

- Claim: checkpoint restoration casts the projected JSON record to `RefutationPanelState` via `'as unknown as'`, so the compiler cannot verify the restored shape.
- Reason for acceptance: runtime guards already preserve the invariant; a dedicated projection type makes a security-sensitive seam compile-time visible instead of cast-bridged. Type-only change, runtime behavior identical.
- Fix: `engine/src/core/standalone-review.ts` — introduce a `SerializedRefutationPanelState` projection type describing the lossy serialized shape; `restoreRefutationPanelState` and the three cast sites (`2756`, `3659`, `3689`) become typed; the panel parser accepts the projection.

### Accepted — `comment-analyzer-1`

- Claim: the comment at `engine/src/core/standalone-review.ts:305-309` states a silent-drop justification that is stale since `e8c8065`'s ok-branch normalization.
- Reason for acceptance: comment rot — the code is correct and stays; only the stated justification no longer holds.
- Fix: update the comment to state the check's real remaining value: rejecting a contradictory persisted record outright instead of silently normalizing it (parse-don't-validate honesty at the untrusted-JSON boundary).

### Accepted — `comment-analyzer-2`

- Claim: the comment at `engine/src/core/standalone-review.ts:313-318` carries the same stale causal chain.
- Reason for acceptance: same comment-rot family as `comment-analyzer-1`.
- Fix: update the comment's causal chain accordingly (normalization makes the contradictory pair unreachable; the check's value is rejecting such records outright).

### Accepted — `code-simplifier-1`

- Claim: `admitStandaloneTranscript` gates its legacy-fallback branch with a double negation logically equivalent to the flat form.
- Reason for acceptance: behavior unchanged (identical truth table; short-circuit preserves the discriminated-union narrowing); removes a negation the reader must unfold.
- Fix: `engine/src/core/standalone-review.ts:1286` — flatten to `parsed.ok || parsed.error.code !== "authority-unavailable"`.

### Accepted — `code-simplifier-2`

- Claim: `fingerprintCapturedReviewerResult` re-implements the sha256-over-JSON pipeline that `canonicalDigest` already provides.
- Reason for acceptance: byte-for-byte identical JSON.stringify input and digest, so every payloadFingerprint is unchanged; one canonical-digest concept instead of two parallel hash pipelines.
- Fix: `engine/src/core/standalone-review.ts:786` — one `canonicalDigest` call over the same projected `{ runId, slot, digest, byteLength, rawBytes }` object.

### Accepted — `code-simplifier-3`

- Claim: in `finalizeStandaloneState`'s exclusive-publication collision path, the content-mismatch branch returns the ORIGINAL EEXIST write error, discarding the detected mismatch.
- Reason for acceptance: diagnostic-only improvement matching the module's own durable-diagnostic pattern (`PendingStandaloneSlot.rejectionDiagnostic` names the ACTUAL defect); fail-closed behavior preserved either way.
- Fix: `engine/src/handlers/helpers/programs/standalone.ts:210` — name the detected content mismatch (with both digests) in the operator-facing diagnostic.

### Accepted — `code-simplifier-4`

- Claim: the ~15-line deadlock-reasoning comment block is maintained in parallel in two `resumeStandaloneFacade` branches plus a third paraphrase in `standalone-evidence.ts`, already drifted in wording.
- Reason for acceptance: one canonical explanation keeps the critical reasoning in one place; the underlying loops genuinely differ so code sharing would be a deepen move — this is comment-only.
- Fix: keep one canonical comment block; shorten the sibling copies to short pointers at `engine/src/handlers/helpers/programs/standalone.ts:373`, `:502`, and the `standalone-evidence.ts` replay site.

### Deferred — `pr-test-analyzer-1`

- Reason: successor review packets that include the request-bound capture adapter should also include its covering suites — a packet-composition policy change affecting future review scope derivation, outside this behavior-preserving round. Coverage is verified present in the delivered state at the frozen HEAD (`engine/tests/orchestration/orchestration-acceptance.test.ts` drives the adapter end to end), so no regression risk is established.

### Deferred — `pr-test-analyzer-2`

- Reason: same packet-composition class for the `no-cross-boundary-imports` boundary rule; its dedicated suites exist (`engine/tests/linter/programmatic/no-cross-boundary-imports*.test.ts`) and were verified at the frozen HEAD, so no regression risk is established. Packet-inclusion policy change deferred with `pr-test-analyzer-1`.

### Deferred — `architecture-tech-lead-1`

- Reason: one deep owner for the frozen-source snapshot vocabulary (four hand-rolled parsers across `standalone-evidence.ts`, `standalone-successor-source.ts`, `context-packet-projection.ts`, `standalone-panel-context.ts` plus two producers) is a module consolidation and interface redesign — deepen-session territory outside this behavior-preserving round. The drift is real but the wire-shape change must land in four parsers plus two producers; recorded as a deepening opportunity.

### Deferred — `architecture-tech-lead-2`

- Reason: the internal file split behind the same curated public surface contradicts ADR-0010's "one cohesive implementation owned by engine/src/core/standalone-review.ts" phrasing; the ADR's cohesion intent survives a physical split, but reopening an ADR and splitting a ~3992-line file is a dedicated deepening pass outside this round. Recorded as a deepening opportunity.

### Deferred — `architecture-tech-lead-3`

- Reason: the in-scope function decompositions and exhaustive-match alignment named as evidence are applied via `code-reviewer-2`'s accepted fix; the remaining proposal — fixing the `max-function-lines` multi-line-signature regex blind spot — is a linter-rule semantics change (the rule file lies outside this frozen scope) that would flag currently-escaping shell functions project-wide, altering the project's lint baseline beyond this round's remediation. Deferred as a separate change.

## Refuted-finding audit

**Zero refuted criticals.** The Refutation Panel was not convened (empty critical set); nothing to audit.

## Accepted advisory fixes (implementation scope)

All fixes are inside the frozen review scope except the plan file:

- `engine/src/core/standalone-review.ts` — code-reviewer-1, code-reviewer-2, comment-analyzer-1, comment-analyzer-2, code-simplifier-1, code-simplifier-2
- `engine/src/core/defect-family-accounting.ts` — type-design-analyzer-1
- `engine/src/handlers/helpers/programs/standalone.ts` — code-reviewer-2, code-simplifier-3, code-simplifier-4
- `engine/src/handlers/helpers/programs/standalone-successor-registration.ts` — silent-failure-hunter-2
- `engine/src/handlers/helpers/programs/standalone-successor-source.ts` — code-reviewer-2
- `engine/src/orchestration/harness-capture-runtime.ts` — code-reviewer-2
- `pi/transcript-adapter.ts` — code-reviewer-2, silent-failure-hunter-1
- `.claude/plans/2026-09-15-pr-remediation.md` (this plan; new support path, NOT in reviewed scope)

## Validation

- `npm run typecheck` (repo code) — baseline green at `b13bc9b`
- `npm run test:unit` — baseline 8887 passed | 1 skipped
- Root `npm run verify` (full gate: typecheck + unit + all six smokes), namespace-isolated
- Iterate to a real fix; stop without staging or committing if validation cannot pass

## Remediation registration (Phase 4)

Fresh remediation Run Directory; schema-v2 start input with exactly `sourceRunsRoot`, `sourceRun`, `supportPaths`, `defectFamily`:

```json
{
  "sourceRunsRoot": ".claude/reviews/review-and-fix-runs",
  "sourceRun": "run.p5-source-review-11",
  "supportPaths": [".claude/plans/2026-09-15-pr-remediation.md"],
  "defectFamily": { "kind": "not-required" }
}
```

`not-required` because zero surviving criticals; the accepted advisory fixes are verified by the full relevant test suites, and the registered runner observes no selected check. Commit the installed index and push.
