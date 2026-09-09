/** Executable FC/IS closure for the Guarded Skill Machine and Defect-Family Accounting. */
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import ts from "typescript";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { resolve, posix } from "node:path";
import {
  handler as noIoHandler,
  isPureModule,
  DEFAULT_PURE_MODULES,
} from "../../../src/linter/programmatic/no-io-in-pure-modules";

const REPO_ROOT = resolve(__dirname, "../../../..");
const requireFromEngine = createRequire(resolve(REPO_ROOT, "engine/package.json"));
const ACCOUNTING = "engine/src/core/defect-family-accounting.ts";
const MACHINE_ROOT = "engine/src/machine/advance.ts";
const PARSER = "engine/src/core/structured-test-report.ts";
const SOURCE_AUTHORITY = "engine/src/core/standalone-review-machine.ts";

// Exact runtime entry points, NOT package-prefix allowances. Updates require re-audit.
const SAX_ENTRY = requireFromEngine.resolve("saxes");
const requireFromSaxes = createRequire(SAX_ENTRY);
const XML_CHAR_MODULES = [
  ["xmlchars/xml/1.0/ed5", "ea350479ab6f6553c0c3395c30ec440fb39821f6902081939831ddf1b5e8fd0f"],
  ["xmlchars/xml/1.1/ed2", "461d5c71cc6076dc16aebbfd2d3c506481df5a74f43631d82372a6ffdc239d69"],
  ["xmlchars/xmlns/1.0/ed3", "ff14ffa3a2cdfdd1b6077c4a8443dc949f53d5bb56de5ed89d4dbc5d9fdf08f7"],
] as const;
type AuditedRuntime = Readonly<{ path: string; dependencies: readonly string[]; digest: string }>;
const SAX_RUNTIME: ReadonlyMap<string, AuditedRuntime> = new Map([
  ["saxes", {
    path: SAX_ENTRY,
    dependencies: XML_CHAR_MODULES.map(([specifier]) => specifier),
    digest: "d00e2ba27ed7d6ac961d03ff14d6b8c0eb5bf063ed2c996c22c6df06ac121423",
  }],
  ...XML_CHAR_MODULES.map(([specifier, digest]): readonly [string, AuditedRuntime] => [
    specifier, { path: requireFromSaxes.resolve(specifier), dependencies: [], digest },
  ]),
]);

/** Include type edges, re-exports, side effects, CJS and dynamic imports. No regex over prose. */
function dependencies(content: string): readonly Readonly<{ specifier: string | null; text: string }>[] {
  const source = ts.createSourceFile("module.ts", content, ts.ScriptTarget.Latest, true);
  const found: { specifier: string | null; text: string }[] = [];
  const add = (node: ts.Node, argument: ts.Node | undefined): void => {
    found.push({
      specifier: argument !== undefined && ts.isStringLiteralLike(argument) ? argument.text : null,
      text: node.getText(source),
    });
  };
  const visit = (node: ts.Node): void => {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier !== undefined) {
      add(node, node.moduleSpecifier);
    } else if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference)) {
      add(node, node.moduleReference.expression);
    } else if (ts.isCallExpression(node) &&
        (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
          (ts.isIdentifier(node.expression) && node.expression.text === "require"))) {
      add(node, node.arguments[0]);
    } else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) {
      add(node, node.argument.literal);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
}

const readSource = (mod: string): string => readFileSync(resolve(REPO_ROOT, mod), "utf-8");

/** The optional overlays mutate bytes in memory, never live authority or source files. */
function auditClosure(roots: readonly string[], overlays: ReadonlyMap<string, string> = new Map()): Readonly<{
  visited: ReadonlySet<string>;
  errors: readonly string[];
}> {
  const visited = new Set<string>();
  const errors: string[] = [];
  const queue = [...roots];
  while (queue.length > 0) {
    const mod = queue.pop();
    if (mod === undefined || visited.has(mod)) continue;
    visited.add(mod);
    const runtime = SAX_RUNTIME.get(mod);
    if (runtime === undefined && !DEFAULT_PURE_MODULES.includes(mod)) {
      errors.push(`${mod}: dependency leaves the declared pure closure`);
      continue;
    }
    const content = overlays.get(mod) ?? (runtime === undefined
      ? readSource(mod)
      : readFileSync(runtime.path, "utf-8"));
    errors.push(...noIoHandler(content, mod, [mod]).map((v) => `${mod}:${v.line}: ${v.fixHint}`));
    const imports = dependencies(content);
    if (runtime !== undefined) {
      const actual = imports.map(({ specifier }) => specifier).sort();
      if (JSON.stringify(actual) !== JSON.stringify([...runtime.dependencies].sort())) {
        errors.push(`${mod}: runtime dependencies differ from the audited SAX closure`);
      }
    }
    for (const { specifier, text } of imports) {
      if (specifier === null) {
        errors.push(`${mod}: non-literal dependency cannot prove purity: ${text}`);
      } else if (specifier.startsWith(".")) {
        const base = posix.normalize(posix.join(posix.dirname(mod), specifier));
        const candidates = [base, `${base}.ts`, `${base}/index.ts`];
        const target = candidates.find((candidate) => DEFAULT_PURE_MODULES.includes(candidate));
        if (target === undefined) errors.push(`${mod}: ${specifier} leaves the declared pure closure`);
        else queue.push(target);
      } else if ((mod === PARSER && specifier === "saxes") || runtime?.dependencies.includes(specifier)) {
        queue.push(specifier);
      } else if (runtime !== undefined) {
        errors.push(`${mod}: unaudited runtime package ${specifier}`);
      } else if (["node:crypto", "crypto", "node:util", "util"].includes(specifier)) {
        // The same shipped rule must prove the narrow named capability, not a module waiver.
        errors.push(...noIoHandler(text, mod, [mod]).map((v) => `${mod}: ${v.fixHint}`));
      } else if (!["ts-pattern", "node:path", "path", "node:url", "url"].includes(specifier)) {
        errors.push(`${mod}: unaudited package ${specifier}`);
      }
    }
  }
  return { visited, errors };
}

const IMPURE_PROBES = [
  'import { randomUUID } from "node:crypto";',
  'import { randomUUID } from\n "node:crypto";',
  'import { createHash } from "node:crypto"; import { randomUUID } from "node:crypto";',
  'import { createHash } from "node:crypto"; const entropy = require("crypto");',
  'import { randomBytes } from "crypto";',
  'import { createHash, randomUUID } from "node:crypto";',
  'import {\n createHash,\n randomBytes as entropy,\n} from "node:crypto";',
  'import crypto from "node:crypto";',
  'import * as crypto from "crypto";',
  'export { randomBytes } from "node:crypto";',
  'const { randomUUID } = require("node:crypto");',
  'const entropy = await import("crypto");',
  'import { readFileSync } from "node:fs";',
  'const fs = require("fs/promises");',
  'import { env } from "node:process";',
  'import { cwd } from "process";',
  'const environment = process.env.HOME;',
  'const cwd = process.cwd();',
  'const clock = process.hrtime.bigint();',
  'const clock = Date.now();',
  'const clock = new Date();',
  'const clock = performance.now();',
  'const entropy = Math.random();',
  'const entropy = crypto.randomUUID();',
  'const entropy = crypto.getRandomValues(new Uint8Array(1));',
  'import { debuglog } from "node:util";',
  'import { isDeepStrictEqual, debuglog } from "node:util";',
] as const;

const HASH_MODULES = [
  "engine/src/core/review-packet.ts",
  "engine/src/core/standalone-review.ts",
  SOURCE_AUTHORITY,
  "engine/src/core/panel-program.ts",
  "engine/src/core/parse-spec.ts",
  "engine/src/core/orchestration-contract/bytes.ts",
  "engine/src/core/orchestration-contract/publication.ts",
] as const;

describe("functional core — executable purity closure", () => {
  it("ships accounting and every transitive source dependency as declared pure", () => {
    expect(DEFAULT_PURE_MODULES).toContain(ACCOUNTING);
    expect(isPureModule(ACCOUNTING)).toBe(true);
    expect(auditClosure(DEFAULT_PURE_MODULES).errors).toEqual([]);
    const audit = auditClosure([ACCOUNTING]);
    expect(audit.errors).toEqual([]);
    for (const required of [SOURCE_AUTHORITY, PARSER, "engine/src/core/standalone-review.ts",
      "engine/src/core/orchestration-contract/index.ts", "engine/src/core/completion-suite.ts",
      "engine/src/core/verification-manifest.ts", "engine/src/types.ts", ...HASH_MODULES, ...SAX_RUNTIME.keys()]) {
      expect(audit.visited, `walk must reach ${required}`).toContain(required);
    }
  });

  it.each(DEFAULT_PURE_MODULES)("%s passes the shipped default rule", (mod) => {
    expect(noIoHandler(readSource(mod), mod)).toEqual([]);
  });

  it.each([
    "engine/src/machine/ledger.ts", "engine/src/machine/report-discovery.ts",
    "engine/src/machine/session-registry.ts", "engine/src/orchestration/remediation-candidate.ts",
    "engine/src/orchestration/completion-check-runner.ts", "engine/src/orchestration/git-remediation.ts",
    "engine/src/handlers/helpers/programs/remediation.ts",
  ])("%s stays in the imperative shell", (mod) => {
    expect(isPureModule(mod)).toBe(false);
  });

  it.each(IMPURE_PROBES)("rejects direct impurity: %s", (probe) => {
    expect(noIoHandler(probe, ACCOUNTING).length).toBeGreaterThan(0);
  });

  it.each(IMPURE_PROBES)("rejects source-authority transitive impurity: %s", (probe) => {
    const audit = auditClosure([ACCOUNTING], new Map([[SOURCE_AUTHORITY, `${readSource(SOURCE_AUTHORITY)}\n${probe}`]]));
    expect(audit.errors.some((error) => error.startsWith(`${SOURCE_AUTHORITY}:`))).toBe(true);
  });

  it.each([ACCOUNTING, ...HASH_MODULES])("%s allows only named deterministic hashing", (mod) => {
    expect(isPureModule(mod)).toBe(true);
    for (const specifier of ["node:crypto", "crypto"]) {
      expect(noIoHandler(`import { createHash } from "${specifier}";\nconst digest = createHash("sha256").update("bytes").digest("hex");`, mod)).toEqual([]);
      expect(noIoHandler(`import {\n createHash as hash,\n} from "${specifier}";`, mod)).toEqual([]);
      expect(noIoHandler(`import { createHash, randomBytes } from "${specifier}";`, mod).length).toBeGreaterThan(0);
    }
  });

  it("allows dates computed from supplied data without granting ambient clock access", () => {
    expect(noIoHandler('const canonical = new Date(epoch).toISOString();', ACCOUNTING)).toEqual([]);
    expect(noIoHandler('const canonical = new Date(\n epoch\n).toISOString();', ACCOUNTING)).toEqual([]);
    expect(noIoHandler('const now = new Date();', ACCOUNTING).length).toBeGreaterThan(0);
  });

  it("never lets a createHash alias hide an entropy import", () => {
    fc.assert(fc.property(fc.stringMatching(/^[a-z][a-zA-Z0-9]{0,20}$/), (alias) => {
      const source = `import { randomBytes as ${alias} } from "node:crypto";`;
      expect(noIoHandler(source, ACCOUNTING).length).toBeGreaterThan(0);
    }), { numRuns: 100 });
  });

  it.each([
    'import "../orchestration/git-remediation";',
    'export * from "../orchestration/remediation-candidate";',
    'const shell = require("../orchestration/completion-check-runner");',
    'const shell = import("../orchestration/git-remediation");',
    'const shell = import(moduleName);',
    'import { parse } from "some-new-package";',
    'import { parse } from "saxes/other";',
    'import * as chars from "xmlchars";',
  ])("rejects an undeclared dependency edge: %s", (probe) => {
    const audit = auditClosure([ACCOUNTING], new Map([[ACCOUNTING, `${readSource(ACCOUNTING)}\n${probe}`]]));
    expect(audit.errors.some((error) => error.startsWith(`${ACCOUNTING}:`))).toBe(true);
  });

  it.each([ACCOUNTING, SOURCE_AUTHORITY, PARSER])("%s cannot expand the exact parser-to-SAX grant", (mod) => {
    for (const specifier of ["saxes/other", "saxes/saxes.js", "saxes-extra", "xmlchars", "node:fs"]) {
      const audit = auditClosure([ACCOUNTING], new Map([[mod, `${readSource(mod)}\nimport * as extra from "${specifier}";`]]));
      expect(audit.errors.some(error => error.startsWith(`${mod}:`)), `${mod} -> ${specifier}`).toBe(true);
    }
    if (mod !== PARSER) {
      const audit = auditClosure([ACCOUNTING], new Map([[mod, `${readSource(mod)}\nimport { SaxesParser } from "saxes";`]]));
      expect(audit.errors.some(error => error.startsWith(`${mod}:`))).toBe(true);
    }
  });

  it("the Guarded Skill Machine reducer's source closure still has no Node import", () => {
    const audit = auditClosure([MACHINE_ROOT]);
    expect(audit.errors).toEqual([]);
    for (const mod of audit.visited) {
      if (SAX_RUNTIME.has(mod)) continue;
      expect(dependencies(readSource(mod)).filter(({ specifier }) => specifier?.startsWith("node:")), mod).toEqual([]);
    }
    expect(audit.visited).toContain("engine/src/machine/test-report.ts");
    expect(audit.visited).toContain("engine/src/machine/types.ts");
    expect(audit.visited).toContain("saxes");
  });

  it("parses dependency syntax without treating comments or strings as imports", () => {
    const source = `// import "node:fs";\nconst prose = 'from "node:fs"';\nimport type { T } from "./types";\nexport * from "./barrel";\nimport "./side-effect";\nconst x = require("./cjs");\nconst y = import("./dynamic");\nimport z = require("./equals");\ntype U = import("./type-expression").U;`;
    expect(dependencies(source).map(({ specifier }) => specifier)).toEqual([
      "./types", "./barrel", "./side-effect", "./cjs", "./dynamic", "./equals", "./type-expression",
    ]);
  });
});

describe("audited in-process SAX runtime closure", () => {
  it("pins actual runtime versions, entrypoints and dependency manifests", () => {
    const saxes = JSON.parse(readFileSync(requireFromEngine.resolve("saxes/package.json"), "utf-8"));
    const xmlchars = JSON.parse(readFileSync(requireFromSaxes.resolve("xmlchars/package.json"), "utf-8"));
    expect(saxes.version).toBe("6.0.0");
    expect(saxes.main).toBe("saxes.js");
    expect(saxes.exports).toBeUndefined();
    expect(saxes.type).toBeUndefined();
    expect(saxes.dependencies).toEqual({ xmlchars: "^2.2.0" });
    expect(xmlchars.version).toBe("2.2.0");
    expect(xmlchars.exports).toBeUndefined();
    expect(xmlchars.type).toBeUndefined();
    expect(xmlchars.dependencies).toEqual({});
    expect(auditClosure(["saxes"]).errors).toEqual([]);
  });

  it.each([...SAX_RUNTIME])("%s has exactly its audited imports and no ambient I/O", (mod, runtime) => {
    const content = readFileSync(runtime.path, "utf-8");
    expect(dependencies(content).map(({ specifier }) => specifier)).toEqual(runtime.dependencies);
    expect(noIoHandler(content, mod, [mod])).toEqual([]);
    // Changed implementation (not just changed imports) requires a fresh audit.
    expect(createHash("sha256").update(content).digest("hex")).toBe(runtime.digest);
  });

  it.each([...SAX_RUNTIME])("%s cannot conceal transitive entropy, filesystem, process or time", (mod, runtime) => {
    const content = readFileSync(runtime.path, "utf-8");
    for (const probe of IMPURE_PROBES) {
      const audit = auditClosure(["saxes"], new Map([[mod, `${content}\n${probe}`]]));
      expect(audit.errors.some((error) => error.startsWith(`${mod}:`)), `${mod}: ${probe}`).toBe(true);
    }
  });
});
