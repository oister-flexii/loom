import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { compilerDiagnosticDisposition } from "../../src/core/compiler-diagnostic-policy";

describe("compiler diagnostic policy", () => {
  it.each([6133, 6192, 6196])("excludes only external raw-source unused TS%i", (code) => {
    expect(compilerDiagnosticDisposition(code, "external-raw-typescript")).toBe("excluded-upstream-unused");
    expect(compilerDiagnosticDisposition(code, "owned-or-other")).toBe("required");
  });

  it("never excludes an owned, config, or other diagnostic", () => {
    fc.assert(fc.property(fc.nat(), (code) => {
      expect(compilerDiagnosticDisposition(code, "owned-or-other")).toBe("required");
      if (![6133, 6192, 6196].includes(code)) {
        expect(compilerDiagnosticDisposition(code, "external-raw-typescript")).toBe("required");
      }
    }));
  });
});
