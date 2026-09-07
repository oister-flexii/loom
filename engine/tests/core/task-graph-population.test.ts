import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { parseSpec } from "../../src/core/parse-spec";
import {
  populateTaskGraph,
  type AuthoredTask,
  type TaskGraphPopulationCommand,
} from "../../src/core/task-graph-population";
import { defaultVerificationManifest } from "../../src/core/verification-manifest";
import type { TaskGraph } from "../../src/types";

const specSource = `# Feature: Population

## User Scenarios

### US1: [P1] Populate a graph

**Acceptance Scenarios:**
- AS-001: Given validated Tasks, When population runs, Then pending Tasks are installed

## Functional Requirements

- FR-001: System MUST populate the TaskGraph through a pure aggregate command

## Out of Scope

- OOS-001: External scheduling

## Appendix: Glossary

| Term | Definition |
|------|------------|
| TaskGraph | Protected orchestration state |
`;

const parsedSpec = parseSpec(specSource);
if (!parsedSpec.ok) throw new Error("population fixture specification must parse");
const specIndex = Object.freeze({
  kind: "indexed" as const,
  path: "spec.md",
  contentDigest: "a".repeat(64),
  index: parsedSpec.value,
});

const authoredTask = (id: string, wave: number, anchors: readonly string[] = ["FR-001"]): AuthoredTask =>
  Object.freeze({
    id,
    description: `implement ${id}`,
    agent: "code-implementer-agent",
    wave,
    depends_on: Object.freeze([]),
    spec_anchors: Object.freeze([...anchors]),
    spec_contributions: Object.freeze([]),
    verification_policy: Object.freeze({
      regression: Object.freeze({ kind: "required" as const }),
      new_tests: Object.freeze({ kind: "waived" as const, reason: "existing-tests-sufficient" as const }),
    }),
    file_list: Object.freeze([`src/${id}.ts`]),
  });

const graph = (overrides: Partial<TaskGraph> = {}): TaskGraph => ({
  current_phase: "decompose",
  phase_artifacts: {},
  skipped_phases: [],
  spec_file: "spec.md",
  plan_file: "plan.md",
  tasks: [],
  wave_gates: {},
  ...overrides,
});

const command = (overrides: Partial<TaskGraphPopulationCommand> = {}): TaskGraphPopulationCommand => ({
  planTitle: "Population plan",
  validatedPlanFile: "plan.md",
  authoredSpecFile: "spec.md",
  tasks: [authoredTask("T1", 1)],
  verificationManifest: defaultVerificationManifest(),
  specIndex,
  observedSpecFile: "spec.md",
  force: false,
  ...overrides,
});

describe("populateTaskGraph aggregate command", () => {
  it("installs sanitized pending Tasks, Requirement hashes, and exact Wave gates", () => {
    const result = populateTaskGraph(graph({
      active_wave_completion_suite: { stale: true } as never,
    }), command({
      tasks: [authoredTask("T1", 1), authoredTask("T2", 2, ["AS-001"])],
      issue: 43,
      repo: "peterstorm/loom",
    }));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.waves).toEqual([1, 2]);
    expect(Object.keys(result.value.state.wave_gates)).toEqual(["1", "2"]);
    expect(result.value.state).toMatchObject({
      spec_trace_version: 2,
      plan_title: "Population plan",
      plan_file: "plan.md",
      spec_file: "spec.md",
      current_wave: 1,
      executing_tasks: [],
      github_issue: 43,
      github_repo: "peterstorm/loom",
    });
    expect(result.value.state.active_wave_completion_suite).toBeUndefined();
    expect(result.value.state.tasks).toEqual([
      expect.objectContaining({
        id: "T1",
        status: "pending",
        review_status: "pending",
        review_generation: 0,
        spec_anchor_hashes: { "FR-001": parsedSpec.value.frs[0]!.contentHash },
      }),
      expect.objectContaining({
        id: "T2",
        status: "pending",
        spec_anchor_hashes: { "AS-001": parsedSpec.value.scenarios[0]!.contentHash },
      }),
    ]);
  });

  it("returns typed overwrite refusal and preserves the aggregate", () => {
    const existing = graph({
      tasks: [{ ...authoredTask("T0", 1), status: "completed" } as never],
    });
    const result = populateTaskGraph(existing, command());

    expect(result).toMatchObject({
      ok: false,
      error: { kind: "non-pending-tasks", message: expect.stringContaining("--force") },
    });
    expect(existing.tasks[0]?.status).toBe("completed");
  });

  it("detects locked spec_file drift without stamping hashes from another document", () => {
    const result = populateTaskGraph(graph({ spec_file: "changed.md" }), command());

    expect(result).toMatchObject({
      ok: false,
      error: {
        kind: "spec-authority-changed",
        message: expect.stringContaining("changed from spec.md to changed.md"),
      },
    });
  });

  it("rejects a Spec Index that does not name the observed document", () => {
    const result = populateTaskGraph(graph(), command({
      specIndex: { ...specIndex, path: "other.md" },
    }));

    expect(result).toMatchObject({
      ok: false,
      error: { kind: "spec-observation-mismatch" },
    });
  });

  it("derives exactly one pending gate and sanitized Task per generated Wave", () => {
    fc.assert(fc.property(
      fc.uniqueArray(fc.integer({ min: 1, max: 8 }), { minLength: 1, maxLength: 8 }),
      (generatedWaves) => {
        const waves = [...generatedWaves].sort((left, right) => left - right);
        const tasks = waves.map((wave, index) => authoredTask(`T${index + 1}`, wave));
        const result = populateTaskGraph(graph(), command({ tasks }));
        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.value.waves).toEqual(waves);
        expect(Object.keys(result.value.state.wave_gates).map(Number)).toEqual(waves);
        expect(result.value.state.tasks).toHaveLength(tasks.length);
        for (const task of result.value.state.tasks) {
          expect(task).toMatchObject({
            status: "pending",
            review_status: "pending",
            findings: [],
            critical_findings: [],
            advisory_findings: [],
          });
        }
      },
    ));
  });
});
