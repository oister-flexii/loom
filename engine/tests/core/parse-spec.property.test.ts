import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { parseSpec, specContentHash, specParseErrorMessage } from "../../src/core/parse-spec";

const canonicalText = (value: string): string => value.trim().replace(/\s+/gu, " ");

const proseArbitrary = fc.tuple(
  fc.constantFrom(..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")),
  fc.string({
    unit: fc.constantFrom(..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ,.!?_-".split("")),
    maxLength: 40,
  }),
).map(([head, tail]) => `${head}${tail}`);

/** Canonical specifications by construction, with non-empty variable rosters. */
const validSpecArbitrary = fc.record({
  frs: fc.array(proseArbitrary, { minLength: 1, maxLength: 4 }),
  scenarios: fc.array(proseArbitrary, { minLength: 1, maxLength: 4 }),
  oos: fc.array(proseArbitrary, { minLength: 1, maxLength: 3 }),
  glossary: fc.array(proseArbitrary, { minLength: 1, maxLength: 4 }),
  separator: fc.constantFrom(" ", "  ", "\t"),
}).map(({ frs, scenarios, oos, glossary, separator }) => [
  "# Feature: Generated",
  "",
  "## User Scenarios",
  "",
  "### US1: [P1] Generated scenario",
  "",
  "**Acceptance Scenarios:**",
  ...scenarios.map((content, index) => `- AS-${String(index + 1).padStart(3, "0")}:${separator}${content}`),
  "",
  "## Functional Requirements",
  "",
  ...frs.map((content, index) => `- FR-${String(index + 1).padStart(3, "0")}:${separator}${content}`),
  "",
  "## Out of Scope",
  "",
  ...oos.map((content, index) => `- OOS-${String(index + 1).padStart(3, "0")}:${separator}${content}`),
  "",
  "## Appendix: Glossary",
  "",
  "| Term | Definition |",
  "|------|------------|",
  ...glossary.map((definition, index) => `| Concept ${index + 1} | ${definition} |`),
].join("\n"));

const parseValidSpec = (markdown: string) => {
  const parsed = parseSpec(markdown);
  expect(parsed.ok).toBe(true);
  if (!parsed.ok) throw new Error("validSpecArbitrary produced an invalid specification");
  return parsed.value;
};

describe("parseSpec properties", () => {
  it("is total and deterministic for arbitrary markdown", () => {
    fc.assert(fc.property(fc.string(), (markdown) => {
      expect(() => parseSpec(markdown)).not.toThrow();
      expect(parseSpec(markdown)).toEqual(parseSpec(markdown));
    }));
  });

  it("ok:true results always carry unique IDs and 64-hex content hashes", () => {
    fc.assert(fc.property(validSpecArbitrary, (markdown) => {
      const value = parseValidSpec(markdown);
      for (const collection of [value.frs, value.scenarios, value.oos]) {
        const ids = collection.map(({ id }) => id);
        expect(new Set(ids).size).toBe(ids.length);
        for (const entry of collection) expect(entry.contentHash).toMatch(/^[0-9a-f]{64}$/u);
      }
      const terms = value.glossary.map(({ term }) => term.toLocaleLowerCase("en-US"));
      expect(new Set(terms).size).toBe(terms.length);
      for (const entry of value.glossary) expect(entry.contentHash).toMatch(/^[0-9a-f]{64}$/u);
    }));
  });

  it("mints every entry with a hash derived from its own content", () => {
    // Runtime construction proof: the phantom brand records parser provenance
    // but is not itself forgery-proof under structural spreading.
    fc.assert(fc.property(validSpecArbitrary, (markdown) => {
      const value = parseValidSpec(markdown);
      for (const entry of [...value.frs, ...value.scenarios, ...value.oos]) {
        expect(entry.contentHash).toBe(specContentHash(entry.content));
      }
      for (const entry of value.glossary) {
        expect(entry.contentHash).toBe(specContentHash(`${entry.term}: ${entry.definition}`));
      }
    }));
  });

  it("makes every wrapped continuation part of the entry content and hash", () => {
    fc.assert(fc.property(
      validSpecArbitrary,
      fc.tuple(proseArbitrary, proseArbitrary)
        .filter(([left, right]) => canonicalText(left) !== canonicalText(right)),
      (markdown, [left, right]) => {
        const wrapFirstRequirement = (continuation: string): string => markdown.replace(
          /(- FR-001:[^\n]*)/u,
          `$1\n  ${continuation}`,
        );
        const first = parseValidSpec(wrapFirstRequirement(left)).frs[0];
        const second = parseValidSpec(wrapFirstRequirement(right)).frs[0];
        expect(first.content).toContain(canonicalText(left));
        expect(second.content).toContain(canonicalText(right));
        expect(first.contentHash).toBe(specContentHash(first.content));
        expect(second.contentHash).toBe(specContentHash(second.content));
        expect(first.contentHash).not.toBe(second.contentHash);
      },
    ));
  });

  it("hashes blank-separated indented Requirement paragraphs as item content", () => {
    fc.assert(fc.property(
      validSpecArbitrary,
      fc.tuple(proseArbitrary, proseArbitrary)
        .filter(([left, right]) => canonicalText(left) !== canonicalText(right)),
      (markdown, [left, right]) => {
        const continueFirstRequirement = (continuation: string): string => markdown.replace(
          /(- FR-001:[^\n]*)/u,
          `$1\n\n    ${continuation}`,
        );
        const first = parseValidSpec(continueFirstRequirement(left)).frs[0];
        const second = parseValidSpec(continueFirstRequirement(right)).frs[0];
        expect(first.content).toContain(canonicalText(left));
        expect(second.content).toContain(canonicalText(right));
        expect(first.contentHash).toBe(specContentHash(first.content));
        expect(second.contentHash).toBe(specContentHash(second.content));
        expect(first.contentHash).not.toBe(second.contentHash);
      },
    ));
  });

  it("projects each collection under its own identifier family", () => {
    // The runtime witness of the family branding: `frs`, `scenarios`, and `oos`
    // are mutually non-assignable types, and their contents match.
    fc.assert(fc.property(validSpecArbitrary, (markdown) => {
      const value = parseValidSpec(markdown);
      for (const { id } of value.frs) expect(id).toMatch(/^FR-\d{3}$/u);
      for (const { id } of value.scenarios) expect(id).toMatch(/^AS-\d{3}$/u);
      for (const { id } of value.oos) expect(id).toMatch(/^OOS-\d{3}$/u);
    }));
  });

  it("renders every emitted error as non-empty operator text", () => {
    // `specParseErrorMessage` is total over the union by construction; this
    // samples arbitrary parser inputs and proves every observed failure renders
    // to text, while the typed renderer supplies compile-time exhaustiveness.
    fc.assert(fc.property(fc.string(), (markdown) => {
      const parsed = parseSpec(markdown);
      if (parsed.ok) return;
      for (const error of parsed.errors) {
        expect(specParseErrorMessage(error).trim().length).toBeGreaterThan(0);
      }
    }));
  });

  it("hashes canonical content independently of surrounding and repeated whitespace", () => {
    fc.assert(fc.property(
      fc.string({ minLength: 1 }).filter((value) => canonicalText(value) !== ""),
      fc.array(fc.constantFrom(" ", "\t", "\n"), { minLength: 1, maxLength: 5 }),
      (content, whitespace) => {
        const canonical = canonicalText(content);
        const separator = whitespace.join("");
        const expanded = ` ${canonical.split(" ").join(separator)} `;
        expect(specContentHash(expanded)).toBe(specContentHash(canonical));
      },
    ));
  });
});
