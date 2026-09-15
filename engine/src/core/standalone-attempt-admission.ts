/**
 * Pure attempt-1 admission decision.
 *
 * The imperative shell's standalone resume orchestrators interleaved the
 * admission policy with capture-rejection I/O in two loops; this volume owns
 * the policy as one pure decision so both orchestrators apply the same
 * trichotomy and the canonical deadlock reasoning lives at one seam.
 */
import { captureKey } from "./harness-capture";
import type { SemanticAttempt } from "./orchestration-contract";

export type AttemptOneSlotDecision =
  | { kind: "captured" }
  | { kind: "reissue" }
  | { kind: "tombstoned"; diagnostic: string };

/**
 * One pure admission decision for every expected attempt-1 slot the machine
 * still expects at attempt 1. Two independent refusal classes both REJECT the
 * slot HERE — where the machine can advance it to attempt 2 — instead of
 * dead-locking the roster on every resume:
 *
 *   1. a captured transcript the frozen-scope validator refuses (semantic) —
 *      reported by the caller's admission of captured bytes, never here;
 *   2. capture terminally rejected by the harness runtime (no bytes landed
 *      at all — a child that exited without a final payload).
 *
 * Without class 2 the resume re-issues the terminally rejected attempt-1
 * request forever — the capture runtime will never accept its bytes again —
 * dead-locking the panel and dead-ending the whole run with no recovery path.
 * A tombstoned slot is dead for capture, so it is NOT re-issued; the caller's
 * machine advances it to its attempt-2 retry through the rejection path. The
 * decision is pure: the shell gathers the captured-attempt set and every
 * capture-rejection receipt first, then applies the returned trichotomy — the
 * I/O is never interleaved with the policy.
 */
export function decideAttemptOneSlots(
  slots: readonly { readonly slotId: string; readonly attempt: SemanticAttempt }[],
  capturedKeys: ReadonlySet<string>,
  rejectionReceipts: ReadonlyMap<string, string>,
): ReadonlyMap<string, AttemptOneSlotDecision> {
  const decisions = new Map<string, AttemptOneSlotDecision>();
  for (const slot of slots) {
    if (capturedKeys.has(captureKey(slot.slotId, slot.attempt))) {
      decisions.set(slot.slotId, { kind: "captured" });
      continue;
    }
    const receipt = rejectionReceipts.get(slot.slotId);
    decisions.set(slot.slotId, receipt === undefined
      ? { kind: "reissue" }
      : { kind: "tombstoned", diagnostic: receipt });
  }
  return decisions;
}
