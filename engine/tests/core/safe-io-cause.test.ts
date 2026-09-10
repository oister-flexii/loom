import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { safeIoCause } from "../../src/core/safe-io-cause";

describe("safe I/O diagnostic classification", () => {
  it.each(["ENOENT", "EACCES", "EPERM", "ELOOP", "ENOTDIR", "EISDIR", "EIO", "EMFILE", "ENFILE", "EINVAL", "ENOSPC"])("retains useful known %s without secret-bearing exception data", (code) => {
    expect(safeIoCause(Object.assign(new Error("secret path and input"), { code }))).toBe(code);
  });
  it("never calls getters, string conversion or arbitrary error names", () => {
    const hostile = { get code() { throw new Error("must not execute"); }, get name() { throw new Error("must not execute"); }, toString() { throw new Error("must not execute"); } };
    expect(safeIoCause(hostile)).toBe("unknown cause");
    expect(safeIoCause(new Proxy({}, { getOwnPropertyDescriptor() { throw new Error("secret"); } }))).toBe("uninspectable cause");
    expect(safeIoCause({ name: "SyntaxError", message: "secret" })).toBe("SyntaxError");
  });
  it("keeps arbitrary causes bounded and non-throwing", () => {
    fc.assert(fc.property(fc.jsonValue(), (cause) => {
      expect(safeIoCause(cause).length).toBeLessThan(32);
    }), { seed: 4103 });
  });
});
