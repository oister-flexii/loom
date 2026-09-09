import { afterEach, describe, expect, it } from "vitest";
import { chmodSync, cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { freezeVerificationManifest } from "../src/core/verification-manifest";
import { MAX_STRUCTURED_REPORT_BYTES, parseStructuredTestReportBytes } from "../src/core/structured-test-report";

const repository = resolve("..");
const rootPackage = JSON.parse(readFileSync(join(repository, "package.json"), "utf8"));
const enginePackage = JSON.parse(readFileSync("package.json", "utf8"));
const temporaryDirectories: string[] = [];
afterEach(() => temporaryDirectories.splice(0).forEach((path) => rmSync(path, { recursive: true, force: true })));

const smokeFiles = [
  ["scripts/smoke-panel-mode.sh", "panel"],
  ["scripts/smoke-review-panel.sh", "review"],
  ["scripts/smoke-standalone-review.sh", "standalone"],
  ["scripts/smoke-orchestration-facades.ts", "orchestration"],
  ["scripts/smoke-pi-resources.sh", "pi"],
  ["artifacts/tests/test-validate-task-graph.sh", "graph"],
] as const;
const stages = ["unit", ...smokeFiles.map(([, stage]) => stage)];

function fixture(failingStage: string): string {
  const directory = mkdtempSync(join(tmpdir(), "loom-verify-"));
  temporaryDirectories.push(directory);
  const put = (path: string, content: string): void => {
    const target = join(directory, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
  };
  put("package.json", JSON.stringify({ scripts: rootPackage.scripts }));
  put("engine/package.json", JSON.stringify({ type: "module", scripts: enginePackage.scripts }));
  put("engine/tsconfig.json", JSON.stringify({ compilerOptions: { types: [], strict: true }, files: ["input.ts"] }));
  put("engine/input.ts", failingStage === "compiler" ? "export const value: number = 'wrong';" : "export const value = 1;");
  put("sentinel.cjs", `const fs = require('node:fs');
const stage = process.argv[2];
if (process.env.PI_CODING_AGENT) process.exit(91);
fs.appendFileSync(${JSON.stringify(join(directory, "stages"))}, stage + '\\n');
if (stage === ${JSON.stringify(failingStage)}) process.exit(17);
`);
  put("engine/node_modules/.bin/vitest", `#!/usr/bin/env bash\nexec node ../sentinel.cjs unit\n`);
  chmodSync(join(directory, "engine/node_modules/.bin/vitest"), 0o755);
  put("node_modules/.bin/pi", "#!/usr/bin/env bash\nexit 92\n");
  chmodSync(join(directory, "node_modules/.bin/pi"), 0o755);
  for (const [path, stage] of smokeFiles) {
    put(path, path.endsWith(".ts")
      ? `import { spawnSync } from 'node:child_process'; process.exit(spawnSync('node', ['../sentinel.cjs', '${stage}'], {stdio:'inherit'}).status ?? 1);`
      : `#!/usr/bin/env bash\nexec node ../sentinel.cjs ${stage}\n`);
  }
  mkdirSync(join(directory, "engine/scripts"), { recursive: true });
  mkdirSync(join(directory, "engine/src/core"), { recursive: true });
  cpSync(resolve("scripts/typecheck.ts"), join(directory, "engine/scripts/typecheck.ts"));
  cpSync(resolve("scripts/verify-prerequisites.sh"), join(directory, "engine/scripts/verify-prerequisites.sh"));
  cpSync(resolve("src/core/compiler-diagnostic-policy.ts"), join(directory, "engine/src/core/compiler-diagnostic-policy.ts"));
  symlinkSync(resolve("node_modules/typescript"), join(directory, "engine/node_modules/typescript"), "dir");
  return directory;
}

describe("canonical verification command", () => {
  it("has one compiler gate followed by the existing complete test command", () => {
    expect(rootPackage.scripts.verify).toBe("npm --prefix engine run verify");
    expect(enginePackage.scripts.preverify).toBe("bash scripts/verify-prerequisites.sh");
    expect(enginePackage.scripts.verify).toBe("npm run typecheck && npm run test");
    expect(enginePackage.scripts.typecheck).toBe("bun scripts/typecheck.ts");
    expect(enginePackage.scripts["typecheck:unused"]).toBe("npm run typecheck");
    expect(enginePackage.scripts.test).toBe("npm run test:unit && env -u PI_CODING_AGENT npm run test:smoke");
    expect(enginePackage.scripts["test:unit"]).toBe("env -u PI_CODING_AGENT vitest run --testTimeout=15000 --maxWorkers=4 --reporter=default --reporter=junit --outputFile=../.loom/completion-reports/verify.junit.xml");
    expect(enginePackage.scripts["test:smoke"]).toBe(smokeFiles.map(([path]) => `${path.endsWith(".ts") ? "bun" : "bash"} ../${path}`).join(" && "));
  });

  it("missing local Pi is blocked even if a global Pi is on PATH", () => {
    const directory = fixture("none");
    mkdirSync(join(directory, "global-bin"));
    cpSync(join(directory, "node_modules/.bin/pi"), join(directory, "global-bin/pi"));
    rmSync(join(directory, "node_modules/.bin/pi"));
    const result = spawnSync("npm", ["run", "verify"], {
      cwd: directory, encoding: "utf8", timeout: 15_000,
      env: { ...process.env, PATH: `${join(directory, "global-bin")}:${process.env.PATH}` },
    });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Verification blocked: install both frozen locks");
    expect(result.stdout).not.toContain("typecheck.ts");
    expect(() => readFileSync(join(directory, "stages"))).toThrow();
  });

  it("the repository manifest freezes the same root command through the real parser", () => {
    const parsed = freezeVerificationManifest(readFileSync(join(repository, ".loom/verification-manifest.json")));
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) throw new Error(parsed.error.errors.join("\n"));
    expect(parsed.value.projectChecks).toHaveLength(1);
    expect(parsed.value.projectChecks[0]).toEqual({
      kind: "project-command", checkId: "project:verify", executable: "npm", args: ["run", "verify"], cwd: ".", scope: "wave", timeoutMs: 1_800_000,
      reportPolicy: { kind: "required-file", path: ".loom/completion-reports/verify.junit.xml" },
    });
  });

  it.each([
    { failingStage: "none", exitCode: 0, failed: 0, summary: "2 passed | 1 skipped (3)", expectedStages: stages },
    { failingStage: "unit", exitCode: 1, failed: 1, summary: "1 failed | 1 passed | 1 skipped (3)", expectedStages: ["unit"] },
    { failingStage: "graph", exitCode: 17, failed: 0, summary: "2 passed | 1 skipped (3)", expectedStages: stages },
  ])("installed Vitest writes root JUnit once; $failingStage failure still controls root exit", ({ failingStage, exitCode, failed, summary, expectedStages }) => {
    const directory = fixture(failingStage);
    // Use the installed runner and its real reporter, not the composition sentinel.
    rmSync(join(directory, "engine/node_modules/.bin/vitest"));
    symlinkSync(resolve("node_modules/.bin/vitest"), join(directory, "engine/node_modules/.bin/vitest"));
    symlinkSync(resolve("node_modules/vitest"), join(directory, "engine/node_modules/vitest"), "dir");
    writeFileSync(join(directory, "engine/enrollment.test.ts"), `
import { beforeAll, describe, expect, it } from 'vitest';
import { appendFileSync } from 'node:fs';
beforeAll(() => appendFileSync(${JSON.stringify(join(directory, "stages"))}, 'unit\\n'));
describe('enrollment', () => {
  it('normalizes the environment', () => expect(process.env.PI_CODING_AGENT).toBeUndefined());
  describe('nested', () => {
    it('executes a real assertion', () => expect(${JSON.stringify(failingStage)}).not.toBe('unit'));
    it.skip('does not count as executed', () => expect(true).toBe(false));
  });
});
`);
    const result = spawnSync("npm", ["run", "verify"], {
      cwd: directory, encoding: "utf8", timeout: 15_000,
      env: { ...process.env, PI_CODING_AGENT: "true", NO_COLOR: "1", FORCE_COLOR: "0" },
    });
    expect(result.error).toBeUndefined();
    expect(result.signal).toBeNull();
    expect(result.status, result.stdout + result.stderr).toBe(exitCode);
    expect(result.stdout).toContain(enginePackage.scripts["test:unit"]);
    expect(result.stdout).toContain(summary);
    expect(readFileSync(join(directory, "stages"), "utf8").trim().split("\n")).toEqual(expectedStages);
    const bytes = readFileSync(join(directory, ".loom/completion-reports/verify.junit.xml"));
    expect(bytes.byteLength).toBeGreaterThan(0);
    expect(bytes.byteLength).toBeLessThan(MAX_STRUCTURED_REPORT_BYTES);
    const parsed = parseStructuredTestReportBytes(bytes);
    expect(parsed).toEqual({ ok: true, value: { total: 2, failed, source: "junit-xml" } });
    if (!parsed.ok) throw new Error(parsed.error.message);
    expect(Number.isSafeInteger(parsed.value.total)).toBe(true);
    expect(parsed.value.total).toBeGreaterThan(0);
  });

  it.each(["none", "compiler", ...stages])("real npm composition short-circuits after %s, never recursively runs the suite", (failingStage) => {
    const directory = fixture(failingStage);
    const result = spawnSync("npm", ["run", "verify"], {
      cwd: directory, encoding: "utf8", timeout: 15_000,
      env: { ...process.env, PI_CODING_AGENT: "true" },
    });
    expect(result.error).toBeUndefined();
    expect(result.status, result.stdout + result.stderr).toBe(failingStage === "none" ? 0 : failingStage === "compiler" ? 1 : 17);
    if (failingStage === "compiler") {
      expect(result.stderr).toContain("TS2322");
      expect(() => readFileSync(join(directory, "stages"))).toThrow();
    } else {
      const expected = failingStage === "none" ? stages : stages.slice(0, stages.indexOf(failingStage) + 1);
      expect(readFileSync(join(directory, "stages"), "utf8").trim().split("\n")).toEqual(expected);
    }
  });
});
