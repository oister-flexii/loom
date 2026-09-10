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
    return "unknown cause";
  } catch { return "uninspectable cause"; }
}
