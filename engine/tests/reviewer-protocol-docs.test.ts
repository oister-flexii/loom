import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = fileURLToPath(new URL("../../", import.meta.url));
const prose = (path: string): string => readFileSync(`${root}${path}`, "utf8").replace(/\s+/g, " ");

describe("current reviewer runbooks preserve protocol and decision boundaries", () => {
  it.each(["commands/review-pr.md", "skills/review-and-fix/SKILL.md"])("%s uses canonical inspection rather than authored tallies", (path) => {
    const text = prose(path);
    expect(text).toContain("helper orchestration inspect");
    expect(text).toContain("emitted/admitted");
    expect(text).toContain("after-refutation");
    expect(text).toContain("existing inspection shape");
    expect(text).not.toContain("artifacts/result.json");
    for (const field of ["claim", "evidence", "violatedContract", "consequence", "truthConfidence", "severityRationale"]) {
      expect(text).toContain(field);
    }
    expect(text).toContain("one JSON final payload");
    expect(text).toContain("no synthetic Finding");
    expect(text).toContain("true assertion is not refuted");
    expect(text).toContain("references/reviewer-protocol-v1/");
  });

  it("versions reviewer wire without changing P3 report/install obligations", () => {
    const text = prose("skills/review-and-fix/SKILL.md");
    expect(text).toContain('version: "6.0.0"');
    expect(text).toContain("admitted main CLI and frozen Skill 5.0.0 contract, including its existing Plan advisory triage");
    expect(text).toContain("Feature mutations belong only in owned matching-runtime fixtures until publication/reload");
    expect(text).toContain("Fresh independent reviews remain v2");
    expect(text).toContain("Only explicit schema-3 successor start input selects v3");
    expect(text).toContain("limited current critical coverage blocks even a zero-active-critical install");
    expect(text).toContain("unfinished schema-v1 remediation run");
    expect(text).toContain("operator checks, fresh required reports and verified-index policy are unchanged");
    expect(text).toContain("every original source ID and full basis immutably");
    expect(text).toContain("more than zero executed tests, zero failures");
    expect(text).toContain("Never force-push");
  });

  it("keeps explicit Wave overrides separate and documents the actual enrolled report", () => {
    const text = prose("commands/wave-gate.md");
    expect(text).toContain("never invoke it automatically");
    expect(text).toContain("new standalone severity vote");
    expect(text).toContain("Spec-check grammar, identity, and Requirement Coverage floor are unchanged");
    expect(text).toContain("required report `.loom/completion-reports/verify.junit.xml`");
    expect(text).not.toContain("report not required");
  });

  it("distinguishes historical semantic replay from native fixture evidence", () => {
    const text = prose("docs/operations.md");
    expect(text).toContain("90 exact logical files, 20,250,407 bytes");
    expect(text).toContain("3,395,759 bytes");
    expect(text).toContain("unchanged original inventory");
    expect(text).toContain("not relocated native filesystem admission");
    expect(text).toContain("not positive native evidence");
    for (const prefix of ["initial publication", "outstanding attempt-1 reissue", "newly issued attempt 2", "already-published attempt-2 recovery"]) {
      expect(text).toContain(prefix);
    }
  });

  it.each(["scripts/smoke-review-panel.sh", "scripts/smoke-standalone-review.sh"])("%s labels retained historical/manual coverage", (path) => {
    expect(prose(path).toLowerCase()).toContain("historical/manual");
    expect(prose(path)).toContain("smoke-orchestration-facades.ts");
  });

  it("records the selected audited dependency and rejects retrospective provenance", () => {
    const text = prose("docs/adr/ADR-0009-versioned-reviewer-protocol.md");
    expect(text).toContain("json-bigint@1.0.0");
    expect(text).toContain("ambient `Math.random()`");
    expect(text).toContain('`jsonc-parser: "3.3.1"`');
    expect(text).toContain("no blanket package/core allowlist");
    expect(text).toContain("not invented original provenance");
    expect(text).toContain("P4 merged as `96153edc3dd755b4ac648ed48920b6670753c5a6` on 2026-09-10");
    expect(text).toContain("publication/loaded-runtime reload were verified");
    expect(text).toContain("P5's separate successor implementation is tracked in [ADR-0010]");
    expect(text).toContain("its final validation, registered review and publication remain pending");
    expect(text).not.toContain("Source review, merge, publication and loaded-runtime cutover remain pending");
  });
});
