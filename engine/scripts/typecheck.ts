import ts from "../node_modules/typescript/lib/typescript.js";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { compilerDiagnosticDisposition } from "../src/core/compiler-diagnostic-policy";

type CompilerCheck =
  | Readonly<{ ok: true; value: Readonly<{ excludedDiagnostics: string }> }>
  | Readonly<{ ok: false; error: Readonly<{ kind: "diagnostics"; diagnostics: string; excludedDiagnostics: string }> }>;

function format(diagnostics: readonly ts.Diagnostic[]): string {
  return ts.formatDiagnostics(diagnostics, {
    getCanonicalFileName: (file) => file,
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    getNewLine: () => "\n",
  });
}

function checked(required: readonly ts.Diagnostic[], excluded: readonly ts.Diagnostic[]): CompilerCheck {
  const excludedDiagnostics = format(excluded);
  return required.length === 0
    ? { ok: true, value: { excludedDiagnostics } }
    : { ok: false, error: { kind: "diagnostics", diagnostics: format(required), excludedDiagnostics } };
}

/** Real compiler/config I/O seam. Infrastructure exceptions propagate to the CLI boundary. */
export function checkTypeScriptProject(configPath: string): CompilerCheck {
  const path = resolve(configPath);
  const config = ts.readConfigFile(path, ts.sys.readFile);
  if (config.error) return checked([config.error], []);
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, dirname(path), {
    noEmit: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
  }, path);
  if (parsed.errors.length > 0) return checked(parsed.errors, []);
  if (parsed.fileNames.length === 0) {
    return { ok: false, error: { kind: "diagnostics", diagnostics: `No compiler inputs in ${path}\n`, excludedDiagnostics: "" } };
  }
  const program = ts.createProgram({ rootNames: parsed.fileNames, options: parsed.options, projectReferences: parsed.projectReferences });
  const roots = new Set(program.getRootFileNames());
  const diagnostics = ts.getPreEmitDiagnostics(program);
  const excluded = diagnostics.filter((diagnostic) => {
    const file = diagnostic.file;
    const externalRaw = file !== undefined && !file.isDeclarationFile && /\.[cm]?tsx?$/.test(file.fileName)
      && !roots.has(file.fileName) && program.isSourceFileFromExternalLibrary(file);
    return compilerDiagnosticDisposition(diagnostic.code, externalRaw ? "external-raw-typescript" : "owned-or-other")
      === "excluded-upstream-unused";
  });
  const excludedSet = new Set(excluded);
  return checked(diagnostics.filter((diagnostic) => !excludedSet.has(diagnostic)), excluded);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length > 2) throw new Error("typecheck accepts no arguments; configure engine/tsconfig.json");
    const result = checkTypeScriptProject(fileURLToPath(new URL("../tsconfig.json", import.meta.url)));
    const excluded = result.ok ? result.value.excludedDiagnostics : result.error.excludedDiagnostics;
    if (excluded) console.error(`Excluded upstream raw-TypeScript unused diagnostics (TS6133/6192/6196 only):\n${excluded}`);
    if (!result.ok) console.error(result.error.diagnostics);
    process.exitCode = result.ok ? 0 : 1;
  } catch (cause) {
    console.error("Compiler infrastructure failure:", cause);
    process.exitCode = 2;
  }
}
