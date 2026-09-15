/** Bounded diagnostic classification only: never echo paths, messages, stacks or arbitrary thrown data. */
export function safeIoCause(cause: unknown): string {
  try {
    if (typeof cause !== "object" || cause === null) return "unknown cause";
    const code = Object.getOwnPropertyDescriptor(cause, "code");
    if (code !== undefined && "value" in code && typeof code.value === "string" &&
        ["ENOENT", "EACCES", "EPERM", "ELOOP", "ENOTDIR", "EISDIR", "EIO", "EMFILE", "ENFILE", "EINVAL", "ENOSPC"].includes(code.value)) return code.value;
    const name = Object.getOwnPropertyDescriptor(cause, "name");
    if (name !== undefined && "value" in name && typeof name.value === "string" &&
        ["Error", "TypeError", "SyntaxError", "RangeError", "AggregateError"].includes(name.value)) return name.value;
    // Standard-error branch: standard Error instances carry `name` on the prototype,
    // so the own-property read above never fires and every non-filesystem throw used
    // to degrade to "unknown cause" with zero discriminating signal. instanceof walks
    // the prototype chain via [[GetPrototypeOf]] and the standard [[HasInstance]] —
    // neither invokes hostile own getters. The allowlist still bounds the result — no
    // untrusted echo. `instanceof Error` narrows the type, so `cause.name` is
    // type-safe without an assertion.
    if (cause instanceof Error && ["Error", "TypeError", "SyntaxError", "RangeError", "AggregateError"].includes(cause.name)) return cause.name;
    return "unknown cause";
  } catch { return "uninspectable cause"; }
}
