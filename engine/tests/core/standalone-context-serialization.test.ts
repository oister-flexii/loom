import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { buildStandaloneReviewerContextPacketV3, encodeByteSection, serializeStandaloneReviewerContextPacketV3 } from "../../src/core/context-packets";
import { parseRequestId } from "../../src/core/orchestration-contract";
const value = <T>(result: { ok: true; value: T } | { ok: false }): T => {
  if (!result.ok) throw Error("fixture parser refused");
  return result.value;
};

describe("immutable successor section serialization", () => {
  it("conserves exact canonical JSON bytes across repeated packets and round trips", () => {
    fc.assert(fc.property(fc.string(), text => {
      const section = value(encodeByteSection("fixture", text));
      for (const role of ["code-reviewer", "type-design-analyzer"] as const) {
        const packet = value(buildStandaloneReviewerContextPacketV3({ requestId: value(parseRequestId(`request:${role}`)),
          role, requiredSkill: "none", fixedContext: [section], variableContext: [] }));
        const expected = JSON.stringify(packet);
        expect(value(serializeStandaloneReviewerContextPacketV3(packet))).toBe(expected);
        expect(value(serializeStandaloneReviewerContextPacketV3(packet))).toBe(expected);
        expect(value(serializeStandaloneReviewerContextPacketV3(JSON.parse(expected)))).toBe(expected);
        const changed = { ...packet, fixedContext: [{ ...section, bytes: [...section.bytes, 0] }, ...packet.fixedContext.slice(1)] };
        expect(serializeStandaloneReviewerContextPacketV3(changed).ok).toBe(false);
        expect(Object.isFrozen(section.bytes)).toBe(true);
      }
    }), { numRuns: 30 });
  });
});
