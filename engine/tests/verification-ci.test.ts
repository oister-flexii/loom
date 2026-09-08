import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const workflow = readFileSync(resolve("../.github/workflows/ci.yml"), "utf8");

describe("Linux CI verification contract", () => {
  it("verifies PRs, branch pushes, and exact tag revisions with the same command", () => {
    expect(workflow).toContain("  pull_request:");
    expect(workflow).toContain('    branches: ["**"]');
    expect(workflow).toContain('    tags: ["**"]');
    expect(workflow.match(/npm run verify/g)).toHaveLength(1);
    expect(workflow).not.toMatch(/npm run (test|typecheck)|bun test|bunx|npx|continue-on-error|@latest|publish/);
  });

  it("pins the measured runtimes and installs both existing frozen dependency graphs", () => {
    expect(workflow).toContain('node-version: "22.23.2"');
    expect(workflow).toContain('bun-version: "1.3.13"');
    expect(workflow.match(/bun install --frozen-lockfile/g)).toHaveLength(2);
    expect(workflow).toContain("(cd engine && bun install --frozen-lockfile)");
    expect(workflow).toContain('test -x node_modules/.bin/pi');
    expect(workflow).toContain('test "$(command -v pi)" = "$GITHUB_WORKSPACE/node_modules/.bin/pi"');
  });

  it("requires non-root Linux tools and preserves failures while retaining the log", () => {
    expect(workflow).toContain("runs-on: ubuntu-24.04");
    expect(workflow).toContain('test "$(id -u)" -ne 0');
    expect(workflow).toContain('test "$BASH_VERSINFO" -ge 4');
    expect(workflow).toContain("for tool in jq bash git timeout node npm bun");
    expect(workflow).toMatch(/set -euo pipefail\n\s+npm run verify 2>&1 \| tee verification.log/);
    expect(workflow).toContain("if: always()");
    expect(workflow).toContain("path: verification.log");
    expect(workflow).toContain("timeout-minutes: 30");
  });
});
