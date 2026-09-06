/**
 * Auto-store spec-check findings when spec-check-invoker completes.
 * Modern Wave evidence requires exact capture-correlated request authority.
 */

import { reconcileWaveBlock } from "../../core/wave-gate-model";
import {
  parseSpecCheckOutput,
  reconcileSpecCheck,
  specCheckAuthorityProblem,
  type SpecCheckRequestAuthority,
} from "../../core/spec-check";
import { parseSubagentStopStdin } from "../../parsers/parse-subagent-stop-input";
export { parseSpecCheckOutput } from "../../core/spec-check";
import { StateManager } from "../../state-manager";
import { passthroughResult, type HookHandler, type HookResult } from "../../types";
import { readTranscriptWithRetry } from "../../utils/read-transcript-with-retry";
import { resolveAgentTranscriptPath, resolveAgentType } from "../../utils/agent-transcript-path";
import { stripNamespace } from "../../utils/strip-namespace";
import { observeWaveSpecCheckDocuments } from "../../orchestration/wave-spec-check-documents";
import { epochSettledFloor } from "../../core/wave-review-authority";

export const runStoreSpecCheckFindings = async (
  stdin: string,
  _args: string[],
  requestAuthority?: SpecCheckRequestAuthority,
): Promise<HookResult> => {
  const parsedInput = parseSubagentStopStdin(stdin);
  if (!parsedInput.ok) {
    return {
      kind: "error",
      message: `store-spec-check-findings: invalid SubagentStop input — spec-check findings NOT stored: ${parsedInput.error}`,
    };
  }
  const input = parsedInput.value;
  const agentType = stripNamespace(resolveAgentType(input));
  if (agentType === "") {
    return {
      kind: "error",
      message: "store-spec-check-findings: SubagentStop Agent identity is unavailable — spec-check findings NOT stored",
    };
  }
  if (agentType !== "spec-check-invoker") return { kind: "passthrough" };

  let manager: StateManager | null;
  try {
    manager = StateManager.fromSession(input.session_id);
  } catch (error) {
    return {
      kind: "error",
      message: `store-spec-check-findings: session TaskGraph authority unavailable — spec-check findings NOT stored: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
  if (manager === null) {
    return {
      kind: "error",
      message: `store-spec-check-findings: no TaskGraph authority for session ${JSON.stringify(input.session_id)} — spec-check findings NOT stored`,
    };
  }

  const resolvedTranscriptPath = resolveAgentTranscriptPath(input);
  const rawPath = resolvedTranscriptPath ?? input.agent_transcript_path ?? "";
  let transcript: string | null = null;
  let transcriptFailure: string | null = resolvedTranscriptPath === null
    ? `spec-check transcript is unreadable: no transcript can be located at ${rawPath || "<unset>"}`
    : null;
  if (resolvedTranscriptPath !== null) {
    try {
      transcript = await readTranscriptWithRetry(resolvedTranscriptPath, /SPEC_CHECK_CRITICAL_COUNT:\s*\d+/);
    } catch (error) {
      transcriptFailure = `spec-check transcript is unreadable: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
  const findings = parseSpecCheckOutput(transcript ?? "");
  let observation;
  try {
    const observedState = manager.load();
    observation = observeWaveSpecCheckDocuments(observedState.spec_file, observedState.plan_file);
  } catch (error) {
    return {
      kind: "error",
      message: `store-spec-check-findings: spec/plan authority is unreadable — spec-check findings NOT stored: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
  const documents = observation.authority;
  const applied = await manager.updateAndReturn((state) => {
    const authorityProblem = specCheckAuthorityProblem(state, requestAuthority, documents);
    if (authorityProblem !== null) {
      return {
        state,
        value: {
          kind: "error" as const,
          message: `store-spec-check-findings: ${authorityProblem} — spec-check findings NOT stored`,
        },
      };
    }
    // The Wave here NEVER takes findings.wave: that is the Agent's own
    // SPEC_CHECK_WAVE marker, and letting the reported party select it would
    // let the Agent choose both the roster its floor is derived from (a Wave
    // with no CRITICAL rows) AND the veto's target — reconcileWaveBlock
    // attributes the spec-check cause to the record's own wave and marks that
    // wave's gate, so one Wave variable feeds both the stored record and the
    // block. The epoch is the engine's own record of which wave the capture is
    // about; on the legacy path (epoch absent) the state's current wave is the
    // engine's belief. The reported party selects nothing.
    const epochWave = state.wave_review_epoch?.wave ?? null;
    const wave = epochWave ?? state.current_wave ?? 1;
    // Read back from the epoch, never re-projected: only a packet-correlated
    // capture carries a floor at all, and the recorded one is the exact number
    // rendered into the packet this Agent was shown.
    const resolution = transcriptFailure === null
      ? reconcileSpecCheck(findings, wave, new Date().toISOString(),
          epochSettledFloor(state.wave_review_epoch))
      : {
          kind: "evidence-failed" as const,
          specCheck: {
            wave,
            run_at: new Date().toISOString(),
            verdict: "EVIDENCE_CAPTURE_FAILED" as const,
            error: `${transcriptFailure} - re-run /wave-gate`,
            cause: "transcript" as const,
          },
        };
    const value = resolution.kind === "evidence-failed"
      ? passthroughResult(`WARNING: ${resolution.specCheck.error} — marking evidence_capture_failed`)
      : passthroughResult(
          `Spec-check: ${resolution.specCheck.critical_count} critical, ${resolution.specCheck.high_count} high`,
        );
    return {
      state: {
        ...state,
        spec_check: resolution.specCheck,
        wave_gates: reconcileWaveBlock(state.wave_gates, state.tasks, resolution.specCheck, wave),
      },
      value,
    };
  });
  if (applied.kind === "passthrough" && applied.systemMessage !== undefined) {
    process.stderr.write(`${applied.systemMessage}\n`);
  }
  return applied;
};

const handler: HookHandler = (stdin, args) => runStoreSpecCheckFindings(stdin, args);

export default handler;
