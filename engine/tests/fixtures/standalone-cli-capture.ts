import { createHash } from "node:crypto";
import type { AgentRequestAuthority } from "../../src/core/orchestration-contract";
import type { RunDirHandle } from "../../src/orchestration/run-directory-handle";

/** Actual CLI capture effect adapter. Call only inside an owned session, before shell imports.
 * The production runner, not this fixture, creates and reconciles the immutable receipt. */
export async function captureStandaloneCliEvidence(handle: RunDirHandle, request: AgentRequestAuthority, payload: unknown): Promise<void> {
  const { createEffectRunner } = await import("../../src/orchestration/effect-runner");
  const { parseEffectId } = await import("../../src/core/orchestration-contract");
  const unreachable = async (): Promise<never> => { throw Error("run-directory capture reached an external port"); };
  const runner = createEffectRunner({ handle, ports: { commitProtectedWaveState: unreachable,
    inspectGitRemediation: unreachable, installVerifiedIndex: unreachable }, resolveArtifacts: () => [] });
  const effectId = parseEffectId(`effect:capture:${createHash("sha256").update(`${request.requestId}:${request.attempt}`).digest("hex")}`);
  if (!effectId.ok) throw Error(effectId.error.message);
  const captured = await runner({ kind: "capture-raw-transcript", runId: handle.runId, request,
    effectId: effectId.value, bytes: [...Buffer.from(JSON.stringify(payload))] });
  if (!captured.ok || captured.value.kind !== "raw-transcript-captured") throw Error(JSON.stringify(captured));
}
