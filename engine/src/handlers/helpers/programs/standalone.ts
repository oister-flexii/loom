/**
 * Façade program driver volume (A14): the imperative shell's program drivers
 * were one 2,900-line module; this volume owns ONE program's driver (or, for
 * helpers, the shared recovery/git/scope machinery). The public surface is
 * re-exported by index.ts so all existing import sites are unchanged.
 */
import { createHash } from 'node:crypto';
import { STANDALONE_REVIEWER_PROTOCOL_V3 } from '../../../core/standalone-lineage-contract';
import { prepareStandaloneSuccessorSource, readStandaloneSuccessorAuthority } from './standalone-source';
import { boundedStandaloneReadHandle, observeStandaloneSuccessorSource } from './standalone-successor-source';
import type { StandaloneSuccessorStartInput, RegisteredStandaloneSuccessorProgram } from './standalone-successor-registration';
import { admitCapturedStandaloneTranscript, readStandaloneCaptureWitnesses, replayStandaloneCliCaptures, standaloneRefutationPreparation, type StandaloneCaptureWitness, type StandaloneEvidenceReplayResult } from './standalone-evidence';
// Retain existing caller entry points, not the union of the evidence volume's internal exports.
export { replayStandaloneCliCaptures, replayStandaloneResultFromEvidence, readStandaloneReviewedSource, standaloneRefutationPreparation } from './standalone-evidence';
export type { StandaloneCaptureWitness, StandaloneEvidenceReplayResult, StandaloneReviewedSource, StandaloneReviewedSourceFile } from './standalone-evidence';
import { parseRunDirectoryReference } from '../../../orchestration/run-directory-handle';
import { publishStandalonePanelView } from '../../../orchestration/standalone-panel-context';
import { CURRENT_REVIEWER_PROTOCOL } from '../../../core/reviewer-contract';
import type { AgentRequestAuthority, SpawnRequest } from '../../../core/orchestration-contract';
import { aggregateStandaloneReview, bindStandaloneCaptureAuthority, captureStandaloneReviewerBytes, canonicalStandaloneResultArtifact, completeStandaloneReviewerCapture, parseStandaloneReviewScope, prepareFreshStandaloneReview, proveStandaloneRosterCompletion, serializeStandaloneReviewAuthority, serializeAdjudicatedStandaloneReview, type FrozenStandaloneReviewAuthority } from '../../../core/standalone-review';
import { parseStandaloneReviewMachineState, reduceStandaloneReviewMachine, parseStandaloneRefutationCompletion, serializeStandaloneReviewMachineState, startStandaloneReviewMachine, type StandaloneReviewMachineState } from '../../../core/standalone-review-machine';
import { completePersistentRefutationPanel, panelRequestIdentity, refutationPanelCheckpoint, rejectRefutationVerdict, startPersistentRefutationPanel, submitRefutationVerdict, type PersistentRefutationPanelEvent } from '../../../core/panel-program';
import { readRunBytesNoFollow, writeRunBytesExclusiveNoFollow } from '../../../orchestration/no-follow-fs';
import { captureKey } from '../../../core/harness-capture';
import { type RunDirHandle } from '../../../orchestration/run-directory-handle';
import { standaloneReviewerProtocolResolver, readPublishedStandaloneResult, gitText, deriveChangedPaths, durableCaptureRejection, durablePublicationDigest, durableRefutationRequests, durableRequests, executableRefutationRequests, failed, metadata, readRegisteredStandaloneAuthority, publicationFile, publicationResolver, publishInitialBatch, recoverOrPublishRefutationRetry, recoverOrPublishStandaloneRetry, refutationRejectionDiagnostic, renderSpawnTask, safeScope, standalonePackets, standalonePublicationEffectId, standaloneRetryTask, type FacadeDriveResult, type ProgramParse, type RegisteredStandaloneProgram } from './helpers';

const preparedSuccessorStarts = new WeakSet<object>();

function preparationMetadata(reviewMetadata: ReturnType<typeof metadata>) {
  return {
    requested_kinds: reviewMetadata.requestedKinds,
    docs_only: reviewMetadata.docsOnly,
    source_or_test_changed: reviewMetadata.sourceOrTestChanged,
    types_changed: reviewMetadata.typesChanged,
    comments_changed: reviewMetadata.commentsChanged,
    additions: reviewMetadata.additions,
    file_count: reviewMetadata.fileCount,
    new_structure: reviewMetadata.newStructure,
    languages: reviewMetadata.languages,
  };
}

function initialStandaloneRequests(authority: FrozenStandaloneReviewAuthority) {
  return authority.roster.orderedSlots.map((slot) => {
    const request = slot.attempts[0];
    return Object.freeze({
      authority: request,
      context: Object.freeze({
        digest: request.contextDigest,
        slot: Object.freeze({ kind: "fixed-artifact-slot" as const, path: `contexts/${request.contextDigest}.json` }),
      }),
    });
  });
}

export async function prepareStandaloneSuccessorFacadeStart(runsRoot: string, run: string, input: StandaloneSuccessorStartInput) {
  try {
    const destination = parseRunDirectoryReference(runsRoot, run);
    if (!destination.ok) return { ok: false as const, message: destination.error.message };
    const source = observeStandaloneSuccessorSource(input.files, () => gitText(["rev-parse", "HEAD"]));
    if (!source.ok) return source;
    const changed = deriveChangedPaths();
    const reviewMetadata = metadata(input.kind, input.files, changed);
    const lineage = await prepareStandaloneSuccessorSource(input, destination.value.runId, source.value, reviewMetadata,
      { visited: [destination.value.runDirectory], remaining: 64 * 1024 * 1024 });
    if (!lineage.ok) return lineage;
    const prepared = prepareFreshStandaloneReview({ runId: destination.value.runId, explicitScope: input.files,
      changedPaths: changed.authority, successor: lineage.value.prepared, reviewerContexts: lineage.value.contexts,
      scopeSafety: lineage.value.prepared.snapshot.map(row => ({ path: row.path, status: row.kind === "absent" ? "absent" : "safe" })),
      reviewMetadata: preparationMetadata(reviewMetadata) });
    if (!prepared.ok) return { ok: false as const, message: prepared.error.errors.join("; ") };
    const registration: RegisteredStandaloneSuccessorProgram = Object.freeze({ schemaVersion: 3, kind: "standalone-review",
      reviewerProtocol: STANDALONE_REVIEWER_PROTOCOL_V3, input, currentSource: source.value,
      previousContexts: Object.freeze(lineage.value.packets[0]!.variableContext.slice(1)),
      authority: JSON.parse(serializeStandaloneReviewAuthority(prepared.value.authority), (_key: string, value: unknown) =>
        typeof value === "object" && value !== null ? Object.freeze(value) : value) });
    if (Buffer.byteLength(JSON.stringify(registration)) > 16_777_216) return { ok: false as const, message: "successor registration exceeds byte budget" };
    const start = Object.freeze({ registration, authority: prepared.value.authority, packets: lineage.value.packets });
    preparedSuccessorStarts.add(start);
    return { ok: true as const, value: start };
  } catch (cause) { return { ok: false as const, message: cause instanceof Error ? cause.message : String(cause) }; }
}

export async function startPreparedStandaloneSuccessor(handle: RunDirHandle,
  prepared: Extract<Awaited<ReturnType<typeof prepareStandaloneSuccessorFacadeStart>>, { ok: true }>["value"]): Promise<FacadeDriveResult> {
  if (!preparedSuccessorStarts.has(prepared) || handle.runId !== prepared.authority.runId) return failed("successor start requires this Run's actual bounded preflight");
  const registered = await handle.registerProgram(prepared.registration);
  if (!registered.ok) return failed(registered.error.message);
  if (await handle.readCheckpoint(16_777_216) !== null) return resumeStandaloneFacade(handle, prepared.registration);
  // Initial publication owns attempt-one packets; freeze only retries here to avoid duplicate serialization/writes.
  for (const packet of prepared.packets.filter((_, index) => index % 2 === 1)) {
    const published = await handle.publishContext(packet);
    if (!published.ok) return failed(published.error.message);
  }
  const requests = initialStandaloneRequests(prepared.authority);
  const batch = await publishInitialBatch(handle, requests, prepared.packets.filter((_, index) => index % 2 === 0), "standalone-review");
  if (!batch.ok) return failed(batch.message);
  const awaiting = reduceStandaloneReviewMachine(startStandaloneReviewMachine(prepared.authority), { kind: "review-batch-published", runId: handle.runId });
  if (!awaiting.ok) return failed(awaiting.error.message);
  await handle.writeCheckpoint(serializeStandaloneReviewMachineState(awaiting.value));
  return { ok: true, action: batch.action };
}

export async function startStandaloneFacade(
  handle: RunDirHandle,
  input: RegisteredStandaloneProgram["input"],
): Promise<FacadeDriveResult> {
  if ("schemaVersion" in input) return failed("successor start requires preflight before Run creation");
  try {
    const changed = deriveChangedPaths();
    const union = [...new Set([
      ...changed.authority.unstaged,
      ...changed.authority.staged,
      ...changed.authority.committed,
    ])].sort();
    const parsedScope = parseStandaloneReviewScope(input.files ?? union);
    if (!parsedScope.ok) return failed(parsedScope.errors.join("; "));
    const scope = parsedScope.value;
    const reviewMetadata = metadata(input.kind, scope, changed);
    const packetSet = standalonePackets(handle.runId, reviewMetadata, scope, changed.authority.head_revision);
    const prepared = prepareFreshStandaloneReview({
      runId: handle.runId,
      ...(input.files === null ? {} : { explicitScope: scope }),
      changedPaths: changed.authority,
      reviewMetadata: preparationMetadata(reviewMetadata),
      scopeSafety: safeScope(scope),
      reviewerContexts: packetSet.contexts,
    });
    if (!prepared.ok) return failed(prepared.error.errors.join("; "));
    const registration: RegisteredStandaloneProgram = Object.freeze({
      schemaVersion: 2,
      reviewerProtocol: CURRENT_REVIEWER_PROTOCOL,
      kind: "standalone-review",
      input,
      authority: JSON.parse(serializeStandaloneReviewAuthority(prepared.value.authority)),
    });
    const registered = await handle.registerProgram(registration);
    if (!registered.ok) return failed(registered.error.message);
    const initialRequests = initialStandaloneRequests(prepared.value.authority);
    // Publish every attempt-1 AND attempt-2 context up front. Attempt 2 is the
    // engine's only recovery path for a semantically rejected reviewer slot; a
    // retry must find its frozen packet already content-addressed in the run
    // directory, so the attempt-2 digest the roster froze at start can never
    // drift from the bytes a later retry reads (the frozen-source section hashes
    // worktree bytes at start time and must not be re-derived later).
    for (const packet of packetSet.packets) {
      const published = await handle.publishContext(packet);
      if (!published.ok) return failed(published.error.message);
    }
    const batch = await publishInitialBatch(handle, initialRequests, packetSet.packets.filter((_, index) => index % 2 === 0), "standalone-review");
    if (!batch.ok) return failed(batch.message);
    const awaiting = reduceStandaloneReviewMachine(startStandaloneReviewMachine(prepared.value.authority), {
      kind: "review-batch-published", runId: handle.runId,
    });
    if (!awaiting.ok) return failed(awaiting.error.message);
    await handle.writeCheckpoint(serializeStandaloneReviewMachineState(awaiting.value));
    return { ok: true, action: batch.action };
  } catch (error) {
    return failed(error instanceof Error ? error.message : String(error));
  }
}

/** Shared durable capture replay; optional process witnesses impose Pi's additional current-session authority. */
export async function replayStandaloneCapturedEvidence(handle: RunDirHandle, registration: RegisteredStandaloneProgram,
  witnesses?: ReadonlyMap<string, StandaloneCaptureWitness>): Promise<StandaloneEvidenceReplayResult> {
  try {
    const authenticated = registration.schemaVersion === 3 ? await readStandaloneSuccessorAuthority(handle, registration) : undefined;
    if (authenticated !== undefined && !authenticated.ok) return authenticated;
    return replayStandaloneCliCaptures(handle, registration, authenticated?.value.prepared, witnesses);
  } catch (cause) { return { ok: false, message: cause instanceof Error ? cause.message : String(cause) }; }
}

export async function finalizeStandaloneState(
  handle: RunDirHandle,
  ready: Extract<StandaloneReviewMachineState, { kind: "ready-to-finalize" }>,
): Promise<FacadeDriveResult> {
  const json = serializeAdjudicatedStandaloneReview(ready.result);
  const artifact = canonicalStandaloneResultArtifact(ready.result);
  if (!artifact.ok) return failed(artifact.error.message);
  const resultBytes = Buffer.from(json, "utf8");
  try { writeRunBytesExclusiveNoFollow(`${handle.runDirectory}/result.json`, resultBytes); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
      return failed(error instanceof Error ? error.message : String(error));
    }
    let existing: Buffer;
    try {
      existing = readRunBytesNoFollow(`${handle.runDirectory}/result.json`);
    } catch (readError) {
      return failed(
        `cannot verify existing standalone result after exclusive publication collision: ${readError instanceof Error ? readError.message : String(readError)}`,
      );
    }
    if (!existing.equals(resultBytes)) {
      return failed(error instanceof Error ? error.message : String(error));
    }
  }
  const receipt = { kind: "artifact-set-published" as const, effectId: ready.publicationIntent.effectId,
    runId: handle.runId, artifacts: Object.freeze([artifact.value]) as readonly [typeof artifact.value] };
  const recorded = await handle.recordReceipt(receipt);
  if (!recorded.ok) return failed(`cannot durably record publication receipt: ${recorded.error.message}`);
  const done = reduceStandaloneReviewMachine(ready, { kind: "result-published", result: JSON.parse(json), receipt });
  if (!done.ok || done.value.kind !== "done") return failed(done.ok ? "standalone result did not reach done" : done.error.message);
  await handle.writeCheckpoint(serializeStandaloneReviewMachineState(done.value));
  return { ok: true, action: { kind: "done", runId: handle.runId, outcome: done.value.outcome } };
}

/**
 * Record that one standalone reviewer result was refused.
 *
 * Phase A (attempt-1 rejections, which stay awaiting-results) and Phase C (an
 * attempt-2 rejection, which terminal-blocks) wrote the same event with the same
 * dedup-key derivation, independently. Note the deliberate asymmetry the shared
 * form preserves: the dedup key is keyed by the SLOT's own attempt, so a replay
 * of the same slot is a no-op, while `eventAttempt` is what the machine already
 * reduced against.
 */
async function appendStandaloneRejection(
  handle: RunDirHandle,
  slot: Readonly<{ requestId: string; slotId: string; attempt: number }>,
  eventAttempt: number,
  diagnostic: string,
): Promise<void> {
  await handle.appendEvent({
    schemaVersion: 1,
    sequence: 0,
    dedupKey: `standalone-result-rejected:${createHash("sha256").update(`${slot.requestId}:${slot.attempt}`).digest("hex")}`,
    recordedAtMs: Date.now(),
    event: {
      kind: "standalone-result-rejected",
      runId: handle.runId,
      requestId: slot.requestId,
      slotId: slot.slotId,
      attempt: eventAttempt,
      diagnostic,
    },
  });
}

/** Read-only LC-2 inspection: independent registration/protocol/publication proof, never checkpoint self-authority. */
export async function inspectStandaloneFacade(
  opened: RunDirHandle,
  registration: RegisteredStandaloneProgram,
): Promise<ProgramParse<StandaloneReviewMachineState>> {
  const handle = registration.schemaVersion === 3 ? boundedStandaloneReadHandle(opened) : opened;
  try {
    if (registration.schemaVersion === 3) {
      const captures = readStandaloneCaptureWitnesses(handle);
      if (!captures.ok) return captures;
    }
    const authenticated = registration.schemaVersion === 3 ? await readStandaloneSuccessorAuthority(handle, registration) : undefined;
    if (authenticated !== undefined && !authenticated.ok) return authenticated;
    const successor = authenticated?.value.prepared;
    const authority = readRegisteredStandaloneAuthority(handle, registration, successor);
    if (!authority.ok) return authority;
    const checkpoint = await handle.readCheckpoint(16_777_216);
    if (checkpoint === null) return { ok: false, message: "standalone review checkpoint is missing" };
    const state = parseStandaloneReviewMachineState(JSON.parse(checkpoint), publicationResolver(handle),
      standaloneReviewerProtocolResolver(handle, registration, successor), authority.value);
    if (!state.ok) return { ok: false, message: state.error.message };
    return state.value.kind === "done" ? readPublishedStandaloneResult(handle, state.value) : state;
  } catch {
    return { ok: false, message: "standalone review checkpoint cannot be inspected safely" };
  }
}

export async function resumeStandaloneFacade(
  opened: RunDirHandle,
  registration: RegisteredStandaloneProgram,
): Promise<FacadeDriveResult> {
  const handle = registration.schemaVersion === 3 ? boundedStandaloneReadHandle(opened) : opened;
  try {
    if (registration.schemaVersion === 3) {
      const captures = readStandaloneCaptureWitnesses(handle);
      if (!captures.ok) return failed(captures.message);
    }
    const authenticated = registration.schemaVersion === 3 ? await readStandaloneSuccessorAuthority(handle, registration) : undefined;
    if (authenticated !== undefined && !authenticated.ok) return failed(authenticated.message);
    const successor = authenticated?.value.prepared;
    if (authenticated?.ok) {
      for (const packet of authenticated.value.packets) {
        const published = await handle.publishContext(packet);
        if (!published.ok) return failed(published.error.message);
      }
    }
    const authorityResult = readRegisteredStandaloneAuthority(handle, registration, successor);
    if (!authorityResult.ok) return failed(authorityResult.message);
    const resolver = publicationResolver(handle);
    const checkpoint = await handle.readCheckpoint();
    let rawState: unknown;
    if (checkpoint === null) {
      // Initial-batch crash window: publishInitialBatch persists contexts,
      // requests, and the publication receipt BEFORE the awaiting-results
      // checkpoint is written. A crash inside that window leaves no checkpoint;
      // reconstruct the exact awaiting-results state from the registered frozen
      // authority (the same pure state start would have checkpointed) so
      // reviewer evidence captured before the crash is not discarded.
      const effectId = standalonePublicationEffectId(authorityResult.value);
      if (!effectId.ok) return failed(effectId.error.message);
      const publication = durablePublicationDigest(handle, effectId.value);
      if (publication.kind === "corrupt") return failed(publication.message);
      if (publication.kind === "absent") {
        if (registration.schemaVersion !== 3 || authenticated === undefined || !authenticated.ok) {
          return failed("standalone review checkpoint is missing and no durable batch publication exists");
        }
        const published = await publishInitialBatch(
          handle,
          initialStandaloneRequests(authorityResult.value),
          authenticated.value.packets.filter((_, index) => index % 2 === 0),
          "standalone-review",
        );
        if (!published.ok) return failed(published.message);
      }
      const reconstructed = reduceStandaloneReviewMachine(
        startStandaloneReviewMachine(authorityResult.value),
        { kind: "review-batch-published", runId: handle.runId },
      );
      if (!reconstructed.ok || reconstructed.value.kind !== "awaiting-results") {
        return failed(reconstructed.ok
          ? "standalone recovery did not reach awaiting-results"
          : reconstructed.error.message);
      }
      const serialized = serializeStandaloneReviewMachineState(reconstructed.value);
      await handle.writeCheckpoint(serialized);
      rawState = JSON.parse(serialized) as unknown;
    } else {
      try {
        rawState = JSON.parse(checkpoint);
      } catch (error) {
        return failed(
          `standalone review checkpoint is invalid JSON for ${handle.runDirectory}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
    const reviewerProtocols = standaloneReviewerProtocolResolver(handle, registration, successor);
    const state = parseStandaloneReviewMachineState(rawState, resolver, reviewerProtocols, authorityResult.value);
    if (!state.ok) return failed(state.error.message);
    if (state.value.kind === "done") {
      const published = readPublishedStandaloneResult(handle, state.value);
      return published.ok ? { ok: true, action: { kind: "done", runId: handle.runId, outcome: published.value.outcome } } : failed(published.message);
    }
    if (state.value.kind === "terminal-blocked" || state.value.kind === "recoverable-blocked") {
      return { ok: true, action: { kind: "blocked", runId: handle.runId, diagnostic: state.value } };
    }
    if (state.value.kind === "ready-to-finalize") return finalizeStandaloneState(handle, state.value);
    if (state.value.kind === "awaiting-refutation") {
      const preparation = standaloneRefutationPreparation(handle, state.value.authority, state.value.aggregate);
      if (state.value.authority.schemaVersion === 3) for (const packet of preparation.packets) await publishStandalonePanelView(handle, packet);
      const recovered = durableRefutationRequests(handle, preparation.inputs, resolver);
      if (recovered.kind === "corrupt") return failed(recovered.message);
      if (recovered.kind === "absent") {
        const published = await publishInitialBatch(handle, preparation.inputs, preparation.packets, "standalone-refutation");
        return published.ok ? { ok: true, action: published.action } : failed(published.message);
      }
      const panelRequests = recovered.requests;
      const captured = handle.readCapturedAttempts();
      if (!captured.ok) return failed(captured.error.message);
      // Phase A — admission check for every attempt-1 slot the panel still
      // expects at attempt 1. Two independent refusal classes both REJECT the
      // slot HERE — where the panel machine can advance it to attempt 2 —
      // instead of dead-locking the roster on every resume:
      //   1. captured transcript the frozen-scope validator refuses (semantic);
      //   2. capture terminally rejected by the harness runtime (no bytes
      //      landed at all — a child that exited without a final payload).
      // Without case 2 the refutation resume re-issues the terminally rejected
      // attempt-1 request forever — the capture runtime will never accept its
      // bytes again — dead-locking the panel. The tombstoned slot is dead for
      // capture, so it is NOT re-issued here; the verdict loop below advances
      // it to its attempt-2 retry through the panel's rejection path.
      const reissues: (typeof panelRequests)[number][] = [];
      const tombstones = new Map<string, string>();
      for (const request of panelRequests) {
        if (captured.value.has(captureKey(request.authority.slotId, request.authority.attempt))) continue;
        const rejection = await durableCaptureRejection(handle, request.authority);
        if (rejection === null) reissues.push(request);
        else tombstones.set(request.authority.slotId, rejection);
      }
      if (reissues.length > 0) {
        return {
          ok: true,
          action: { kind: "spawn-batch", runId: handle.runId, requests: executableRefutationRequests(handle, reissues, true) },
        };
      }
      let panelState = startPersistentRefutationPanel(preparation.panel).state;
      // Collect the FULL immutable event prefix as the panel runs. The legacy
      // completed-state projection records accepted verdicts only, so a slot
      // accepted on attempt 2 (after an attempt-1 verdict was rejected) cannot
      // be replayed from it — the durable restart would see the slot still
      // awaiting attempt 1 and reject the :2 request. The canonical T2
      // checkpoint below carries the rejection events and replay reaches the
      // exact terminal state.
      const panelEvents: PersistentRefutationPanelEvent[] = [];
      for (const request of panelRequests) {
        const bytes = handle.readTranscriptBytes(request.authority);
        // A tombstoned attempt-1 slot has no evidence: the capture runtime
        // terminally rejected the attempt, so there is no verdict to parse.
        // The slot advances to its attempt-2 retry through the panel's
        // rejection path — with the capture diagnostic as the rejection
        // message, which the attempt-2 task repeats to the verifier. Kept
        // as a fail-closed guard: a runtime whose missing-filter and this
        // loop disagree must fail loudly, not pass an undefined tombstone
        // downstream as if the slot had a verdict.
        let submitted = bytes.ok
          ? submitRefutationVerdict(panelState, resolver, panelRequestIdentity(request), Buffer.from(bytes.value).toString("utf8"))
          : rejectRefutationVerdict(panelState, resolver, panelRequestIdentity(request), tombstones.get(request.authority.slotId) ?? bytes.error.message);
        if (!submitted.ok) return failed(submitted.error.message);
        panelState = submitted.value.state;
        if (submitted.value.recordedEvent !== undefined) panelEvents.push(submitted.value.recordedEvent);
        if (submitted.value.action?.kind === "spawn-refutation-verifiers") {
          const retryAuthority = submitted.value.action.requests[0];
          const retry = await recoverOrPublishRefutationRetry(
            handle, retryAuthority, preparation.retryInputs, resolver, "standalone-refutation",
          );
          if (!retry.ok) {
            // The attempt-2 capture was TERMINALLY rejected: the capture
            // runtime refuses any future capture for this slot, so re-issuing
            // the spawn can never land evidence — that is the attempt-2 doom
            // loop this exists to break. Attempt 2 is the FINAL attempt, so
            // the panel machine records the rejection as an explicit panel
            // rejection (terminal-blocked) instead of the resume re-failing
            // the same raw recovery error forever — the same terminal path a
            // semantic attempt-2 rejection already takes.
            if (retry.kind !== "capture-rejected" || retry.request === null) return failed(retry.message);
            submitted = rejectRefutationVerdict(panelState, resolver, panelRequestIdentity(retry.request), retry.rejection);
            if (!submitted.ok) return failed(submitted.error.message);
            panelState = submitted.value.state;
            if (submitted.value.recordedEvent !== undefined) panelEvents.push(submitted.value.recordedEvent);
            if (submitted.value.action?.kind === "refutation-blocked") {
              return failed(submitted.value.action.diagnostic.message);
            }
            return failed("refutation capture rejection did not terminal-block the panel");
          }
          const attempts = handle.readCapturedAttempts();
          if (!attempts.ok) return failed(attempts.error.message);
          if (!attempts.value.has(captureKey(retry.request.authority.slotId, retry.request.authority.attempt))) {
            return { ok: true, action: {
              kind: "spawn-batch", runId: handle.runId,
              requests: executableRefutationRequests(
                handle, [retry.request], true, refutationRejectionDiagnostic(submitted.value.recordedEvent),
              ),
            } };
          }
          const retryBytes = handle.readTranscriptBytes(retry.request.authority);
          if (!retryBytes.ok) return failed(retryBytes.error.message);
          submitted = submitRefutationVerdict(
            panelState, resolver, panelRequestIdentity(retry.request), Buffer.from(retryBytes.value).toString("utf8"),
          );
          if (!submitted.ok) return failed(submitted.error.message);
          panelState = submitted.value.state;
          if (submitted.value.recordedEvent !== undefined) panelEvents.push(submitted.value.recordedEvent);
          if (submitted.value.action?.kind === "refutation-blocked") {
            return failed(submitted.value.action.diagnostic.message);
          }
        }
      }
      const completed = completePersistentRefutationPanel(panelState, resolver, preparation.threshold);
      if (!completed.ok || completed.value.state.stage !== "done") return failed(completed.ok ? "refutation did not reach done" : completed.error.message);
      if (completed.value.recordedEvent !== undefined) panelEvents.push(completed.value.recordedEvent);
      const canonical = refutationPanelCheckpoint(completed.value.state, panelEvents, resolver);
      if (!canonical.ok) return failed(canonical.error.message);
      const completion = parseStandaloneRefutationCompletion({
        panelAuthority: preparation.frozen,
        aggregate: state.value.aggregate,
        completedPanelState: completed.value.state,
        completedPanelCheckpoint: canonical.value,
        publicationResolver: resolver,
      });
      if (!completion.ok) return failed(completion.error.message);
      const ready = reduceStandaloneReviewMachine(state.value, { kind: "refutation-completed", completion: completion.value });
      if (!ready.ok || ready.value.kind !== "ready-to-finalize") return failed(ready.ok ? "refutation did not unlock finalization" : ready.error.message);
      return finalizeStandaloneState(handle, ready.value);
    }
    if (state.value.kind !== "awaiting-results") return failed(`unsupported standalone resume state ${state.value.kind}`);

    const activeAuthority = state.value.authority;
    const recovered = durableRequests(handle, activeAuthority, resolver);
    if (recovered.kind !== "found") {
      return failed(recovered.kind === "absent"
        ? "standalone publication authority is absent"
        : recovered.message);
    }
    const attemptOneBySlot = new Map(recovered.requests.map((request) => [request.authority.slotId, request] as const));
    const captured = handle.readCapturedAttempts();
    if (!captured.ok) return failed(captured.error.message);
    const pendingBySlot = new Map(state.value.pending.map(({ slotId, expectedAttempt }) => [slotId, expectedAttempt] as const));

    // Phase A — admission check for every attempt-1 slot the machine still
    // expects at attempt 1. Two independent refusal classes both REJECT the
    // slot HERE — where the LC-2 lifecycle can advance it to attempt 2 —
    // instead of dead-ending the whole run with no recovery path:
    //   1. captured transcript the frozen-scope validator refuses (semantic);
    //   2. capture that was terminally rejected by the harness runtime (no
    //      bytes landed at all, e.g. a child that exited without a final
    //      payload). Without case 2 the façade re-issues the terminally
    //      rejected attempt-1 request on every resume — the capture runtime
    //      will never accept its bytes again — dead-locking the roster.
    const rejected: Readonly<{ slot: AgentRequestAuthority; problems: readonly string[] }>[] = [];
    for (const slot of activeAuthority.roster.orderedSlots) {
      if ((pendingBySlot.get(slot.slotId) ?? 1) !== 1) continue;
      const attemptOne = attemptOneBySlot.get(slot.slotId);
      if (attemptOne === undefined) {
        return failed(`standalone attempt-1 issuance authority is missing for ${slot.slotId}`);
      }
      if (!captured.value.has(captureKey(attemptOne.authority.slotId, 1))) {
        const captureRejection = await durableCaptureRejection(handle, attemptOne.authority);
        if (captureRejection !== null) {
          rejected.push({ slot: attemptOne.authority, problems: Object.freeze([captureRejection]) });
        }
        continue;
      }
      const bytes = handle.readTranscriptBytes(attemptOne.authority);
      if (!bytes.ok) return failed(bytes.error.message);
      const admission = admitCapturedStandaloneTranscript(
        reviewerProtocols,
        attemptOne.authority,
        bytes.value,
      );
      if (!admission.ok) rejected.push({ slot: attemptOne.authority, problems: [...admission.problems] });
    }
    let machine: StandaloneReviewMachineState = state.value;
    if (rejected.length > 0) {
      for (const { slot, problems } of rejected) {
        const reduced = reduceStandaloneReviewMachine(machine, {
          kind: "result-rejected",
          request: { runId: handle.runId, slotId: slot.slotId, requestId: slot.requestId, attempt: 1 },
          message: problems.join("; "),
        });
        if (!reduced.ok || reduced.value.kind !== "awaiting-results") {
          return failed(reduced.ok ? "standalone semantic rejection did not remain awaiting results" : reduced.error.message);
        }
        machine = reduced.value;
      }
      await handle.writeCheckpoint(serializeStandaloneReviewMachineState(machine));
      for (const { slot, problems } of rejected) {
        await appendStandaloneRejection(handle, slot, slot.attempt, problems.join("; "));
      }
    }

    // Phase B — assemble the issued-request set. Slots still expected at
    // attempt 1 come from the original batch publication; slots at attempt 2
    // (freshly rejected here or retried in an earlier resume) come from the
    // per-slot retry batch, published now if a crash left it unpublished.
    const rejectedSlotIds = new Set(rejected.map(({ slot }) => slot.slotId));
    // Read the diagnostic off the REDUCED machine, not off this pass's `rejected`
    // set: a resume that merely re-issues an already-recorded retry has an empty
    // `rejected` set, and reading from it there silently degraded the attempt-2
    // prompt to the generic fallback.
    const rejectedDiagnostics = new Map(machine.pending.flatMap(({ slotId, rejectionDiagnostic }) =>
      rejectionDiagnostic === null ? [] : [[slotId, rejectionDiagnostic] as const]));
    const issued: SpawnRequest[] = [];
    for (const slot of activeAuthority.roster.orderedSlots) {
      const expected = rejectedSlotIds.has(slot.slotId) ? 2 : (pendingBySlot.get(slot.slotId) ?? 1);
      if (expected === 1) {
        const attemptOne = attemptOneBySlot.get(slot.slotId);
        if (attemptOne === undefined) {
          return failed(`standalone attempt-1 issuance authority is missing for ${slot.slotId}`);
        }
        issued.push(attemptOne);
        continue;
      }
      const retry = await recoverOrPublishStandaloneRetry(handle, activeAuthority, slot, resolver);
      if (!retry.ok) return failed(retry.message);
      issued.push(retry.request);
    }
    const captureAuthority = bindStandaloneCaptureAuthority(activeAuthority, issued);
    if (!captureAuthority.ok) return failed(captureAuthority.error.message);

    // Phase C — accept captured expected attempts. A captured attempt 2 that
    // STILL fails the frozen-scope validator terminal-blocks the run exactly as
    // the LC-2 lifecycle prescribes for a second and final attempt.
    const accepted = [];
    const missing: SpawnRequest[] = [];
    for (const request of issued) {
      if (!captured.value.has(captureKey(request.authority.slotId, request.authority.attempt))) {
        const rejection = request.authority.attempt === 2 ? await durableCaptureRejection(handle, request.authority) : null;
        if (rejection !== null) {
          const terminal = reduceStandaloneReviewMachine(machine, { kind: "result-rejected", request: request.authority, message: rejection });
          if (!terminal.ok || terminal.value.kind !== "terminal-blocked") {
            return failed(terminal.ok ? "final capture rejection did not terminal-block" : terminal.error.message);
          }
          await handle.writeCheckpoint(serializeStandaloneReviewMachineState(terminal.value));
          await appendStandaloneRejection(handle, request.authority, 2, rejection);
          return { ok: true, action: { kind: "blocked", runId: handle.runId, diagnostic: terminal.value } };
        }
        missing.push(request);
        continue;
      }
      const bytes = handle.readTranscriptBytes(request.authority);
      if (!bytes.ok) return failed(bytes.error.message);
      if (request.authority.attempt === 2) {
        const admission = admitCapturedStandaloneTranscript(
          reviewerProtocols,
          request.authority,
          bytes.value,
        );
        if (!admission.ok) {
          const problems = [...admission.problems];
          const terminal = reduceStandaloneReviewMachine(machine, {
            kind: "result-rejected",
            request: { runId: handle.runId, slotId: request.authority.slotId, requestId: request.authority.requestId, attempt: 2 },
            message: problems.join("; "),
          });
          if (!terminal.ok || terminal.value.kind !== "terminal-blocked") {
            return failed(terminal.ok ? "standalone attempt-2 rejection did not terminal-block" : terminal.error.message);
          }
          await handle.writeCheckpoint(serializeStandaloneReviewMachineState(terminal.value));
          await appendStandaloneRejection(handle, request.authority, 2, problems.join("; "));
          return { ok: true, action: { kind: "blocked", runId: handle.runId, diagnostic: terminal.value } };
        }
      }
      const prepared = captureStandaloneReviewerBytes(captureAuthority.value, request.authority.requestId, bytes.value);
      if (!prepared.ok) return failed(prepared.error.message);
      const completed = completeStandaloneReviewerCapture(prepared.value, {
        kind: "raw-transcript-captured",
        effectId: prepared.value.intent.effectId,
        runId: handle.runId,
        requestId: request.authority.requestId,
        artifact: prepared.value.expectedArtifact,
      });
      if (!completed.ok) return failed(completed.error.message);
      accepted.push(completed.value);
    }
    if (missing.length > 0) {
      const effectId = standalonePublicationEffectId(activeAuthority);
      if (!effectId.ok) return failed(effectId.error.message);
      const receipt = JSON.parse(readRunBytesNoFollow(
        `${handle.runDirectory}/artifacts/${publicationFile(effectId.value)}`,
      ).toString("utf8")) as Record<string, unknown>;
      return { ok: true, action: {
        kind: "spawn-batch",
        runId: handle.runId,
        publicationIdentity: {
          schemaVersion: 1,
          kind: "batch-publication-identity",
          runId: handle.runId,
          effectId: effectId.value,
          publicationDigest: receipt.publicationDigest,
        },
        idempotencyKey: { runId: handle.runId, effectId: effectId.value },
        receipt,
        requests: missing.map((request) => {
          const task = renderSpawnTask(
            handle,
            request.authority,
            "Read the immutable context packet at LOOM_CONTEXT_PATH and emit only the required reviewer result.",
            { standalone: true },
          );
          return {
            ...request,
            task: request.authority.attempt === 2
              ? standaloneRetryTask(task, rejectedDiagnostics.get(request.authority.slotId) ?? null, activeAuthority)
              : task,
          };
        }),
      } };
    }
    const completion = proveStandaloneRosterCompletion(activeAuthority, resolver, accepted, reviewerProtocols);
    if (!completion.ok) return failed(completion.error.violations.map((entry) => JSON.stringify(entry)).join("; "));
    let reduced = reduceStandaloneReviewMachine(machine, { kind: "complete-roster-proved", completion: completion.value });
    if (!reduced.ok) return failed(reduced.error.message);
    if (reduced.value.kind !== "aggregating") return failed("standalone roster did not reach aggregation");
    const aggregate = aggregateStandaloneReview({ authority: activeAuthority, completion: completion.value });
    if (!aggregate.ok) return failed(aggregate.errors.join("; "));
    if (aggregate.value.kind !== "clean") {
      const preparation = standaloneRefutationPreparation(handle, activeAuthority, aggregate.value.aggregate);
      reduced = reduceStandaloneReviewMachine(reduced.value, {
        kind: "aggregate-has-criticals",
        aggregate: aggregate.value.aggregate,
        panelAuthority: preparation.frozen,
        refutationAuthority: preparation.panel,
      });
      if (!reduced.ok || reduced.value.kind !== "awaiting-refutation") return failed(reduced.ok ? "critical route did not reach refutation" : reduced.error.message);
      await handle.writeCheckpoint(serializeStandaloneReviewMachineState(reduced.value));
      const published = await publishInitialBatch(handle, preparation.inputs, preparation.packets, "standalone-refutation");
      return published.ok ? { ok: true, action: published.action } : failed(published.message);
    }
    reduced = reduceStandaloneReviewMachine(reduced.value, { kind: "aggregate-clean", aggregate: aggregate.value.aggregate });
    if (!reduced.ok || reduced.value.kind !== "ready-to-finalize") return failed(reduced.ok ? "standalone finalization did not become ready" : reduced.error.message);
    return finalizeStandaloneState(handle, reduced.value);
  } catch (error) {
    return failed(error instanceof Error ? error.message : String(error));
  }
}

