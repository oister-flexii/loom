/** Compiler ownership, not a path whitelist, limits the upstream unused exception. */
export function compilerDiagnosticDisposition(
  code: number,
  origin: "external-raw-typescript" | "owned-or-other",
): "required" | "excluded-upstream-unused" {
  return origin === "external-raw-typescript" && [6133, 6192, 6196].includes(code)
    ? "excluded-upstream-unused"
    : "required";
}
