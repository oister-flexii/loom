/** Bounded current wire codec. Version/issuance/scope joins belong to review-output. */
import { visit } from "jsonc-parser";
import {
  REVIEWER_PAYLOAD_LIMITS, REVIEWER_PAYLOAD_SCHEMA_V2, REVIEWER_IMPACT_RUBRIC_V1,
  REVIEWER_OUTPUT_CONTRACT, REVIEWER_PAYLOAD_EXAMPLE_V2, reviewerPayloadV2Schema,
  type ReviewerPayloadV2, type ReviewerProtocolFailure,
} from "./reviewer-contract";
import { standaloneReviewerPayloadV3Schema, type StandaloneReviewerPayloadV3 } from "./standalone-lineage-contract";
import { canonicalRecord, failure, success, type DomainResult } from "./orchestration-contract/identity";

const encoder = new TextEncoder();
const pointer = (path: readonly PropertyKey[]): string =>
  path.map((key) => `/${String(key).replace(/~/g, "~0").replace(/\//g, "~1")}`).join("");
const rejected = (
  code: ReviewerProtocolFailure["code"], message: string, path = "", byteOffset?: number,
): DomainResult<never, ReviewerProtocolFailure> => failure(canonicalRecord({
  kind: "reviewer-protocol-failed", code, path, message,
  ...(byteOffset === undefined ? {} : { byteOffset }),
}));

/** Only a resource precheck, not another JSON grammar. Local state never escapes. */
function excessiveDepthOffset(text: string): number | null {
  let depth = 0;
  let quoted = false;
  let escaped = false;
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (quoted) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') quoted = false;
    } else if (char === '"') quoted = true;
    else if (char === "{" || char === "[") {
      depth++;
      if (depth > REVIEWER_PAYLOAD_LIMITS.depth) return index;
    } else if (char === "}" || char === "]") depth--;
  }
  return null;
}

function uniqueMembers(text: string): DomainResult<true, ReviewerProtocolFailure> {
  const objects: Set<string>[] = [];
  let problem: DomainResult<never, ReviewerProtocolFailure> | undefined;
  const visited = visit(text, {
    onObjectBegin: () => { objects.push(new Set()); },
    onObjectEnd: () => { objects.pop(); },
    onObjectProperty: (name, offset, _length, _line, _character, getPath) => {
      const names = objects.at(-1);
      if (names === undefined) {
        problem ??= rejected("invalid-json", "Object member has no enclosing object.");
      } else if (names.has(name)) {
        problem ??= rejected("duplicate-key", "Duplicate decoded object member name.", pointer([...getPath(), name]), encoder.encode(text.slice(0, offset)).byteLength);
      } else names.add(name);
    },
    onError: (_error, offset) => {
      problem ??= rejected("invalid-json", "JSON visitor rejected the payload.", "", encoder.encode(text.slice(0, offset)).byteLength);
    },
  }, { disallowComments: true, allowTrailingComma: false, allowEmptyContent: false });
  if (problem !== undefined) return problem;
  return visited && objects.length === 0
    ? success(true)
    : rejected("invalid-json", "JSON visitor did not complete.");
}

/** Shared strict byte grammar; callers select a schema explicitly after this parse. */
export function parseBoundedReviewerJson(rawBytes: Uint8Array, maximumBytes: number): DomainResult<unknown, ReviewerProtocolFailure> {
  if (!Number.isSafeInteger(maximumBytes) || maximumBytes < 1 || rawBytes.byteLength > maximumBytes) {
    return rejected("payload-too-large", `Reviewer payload exceeds ${maximumBytes} UTF-8 bytes.`);
  }
  if (rawBytes[0] === 0xef && rawBytes[1] === 0xbb && rawBytes[2] === 0xbf) {
    return rejected("invalid-utf8", "Reviewer payload must not start with a UTF-8 BOM.", "", 0);
  }
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(rawBytes);
  } catch {
    return rejected("invalid-utf8", "Reviewer payload must contain valid UTF-8.");
  }
  const depthOffset = excessiveDepthOffset(text);
  if (depthOffset !== null) {
    return rejected("depth-exceeded", "Reviewer payload exceeds 32 nested containers.", "", encoder.encode(text.slice(0, depthOffset)).byteLength);
  }
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return rejected("invalid-json", "Reviewer payload must be exactly one strict JSON object.");
  }
  try {
    const unique = uniqueMembers(text);
    if (!unique.ok) return unique;
    return success(raw);
  } catch {
    return rejected("invalid-payload", "Reviewer payload could not be inspected safely.");
  }
}

export function parseStandaloneReviewerPayloadV3(rawBytes: Uint8Array): DomainResult<StandaloneReviewerPayloadV3, ReviewerProtocolFailure> {
  const decoded = parseBoundedReviewerJson(rawBytes, REVIEWER_PAYLOAD_LIMITS.bytes);
  if (!decoded.ok) return decoded;
  const value = decoded.value;
  if (typeof value === "object" && value !== null && (
    ("priorAssessments" in value && Array.isArray(value.priorAssessments) && value.priorAssessments.length > REVIEWER_PAYLOAD_LIMITS.priorFindings) ||
    ("findings" in value && Array.isArray(value.findings) && value.findings.length > REVIEWER_PAYLOAD_LIMITS.findings))) {
    return rejected("invalid-payload", "Standalone v3 inventory exceeds its pre-copy count budget.");
  }
  const parsed = standaloneReviewerPayloadV3Schema.safeParse(value);
  return parsed.success ? success(parsed.data)
    : rejected("invalid-payload", "Reviewer payload does not conform to the issued standalone v3 schema.", pointer(parsed.error.issues[0]?.path ?? []));
}

export function parseReviewerPayloadV2(rawBytes: Uint8Array): DomainResult<ReviewerPayloadV2, ReviewerProtocolFailure> {
  const decoded = parseBoundedReviewerJson(rawBytes, REVIEWER_PAYLOAD_LIMITS.bytes);
  if (!decoded.ok) return decoded;
  try {
    const parsed = reviewerPayloadV2Schema.safeParse(decoded.value);
    if (!parsed.success) {
      return rejected("invalid-payload", "Reviewer payload does not conform to the issued v2 schema.", pointer(parsed.error.issues[0]?.path ?? []));
    }
    return success(parsed.data);
  } catch {
    // Never expose a dependency exception: it can contain the complete input.
    return rejected("invalid-payload", "Reviewer payload could not be inspected safely.");
  }
}

/** The stamper consumes this same executable schema, parsed example and exact rubric. */
export function renderReviewerWireContract(): string {
  return `${REVIEWER_OUTPUT_CONTRACT}\n\n## reviewer-payload-schema\n\n\`\`\`json\n${REVIEWER_PAYLOAD_SCHEMA_V2}\n\`\`\`\n\n## Current example (standalone)\n\n\`\`\`json\n${JSON.stringify(REVIEWER_PAYLOAD_EXAMPLE_V2, null, 2)}\n\`\`\`\n\n## reviewer-impact-rubric\n\n${REVIEWER_IMPACT_RUBRIC_V1}`;
}
