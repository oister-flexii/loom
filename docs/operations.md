# Operating and developing Loom

This guide covers status, persisted artifacts, recovery, validation, and contributor commands. For lifecycle semantics, read [Workflows](workflows.md); for module boundaries, read [Architecture](architecture.md).

## Prerequisites

- Linux or macOS 13+ for the existing runtime (`/proc/self/fd` descriptor-relative authority on Linux; `O_NOFOLLOW_ANY` on macOS, with older Darwin kernels refused at startup). **Strict critical-remediation report reset requires Linux**; Darwin fails before check launch. This does not change zero-critical remediation or Wave behavior.
- Bun (engine runtime and tests)
- Git
- Claude Code or Pi
- GitHub CLI for `/loom`’s issue tracking and optional push/PR operations

Run commands from the repository being orchestrated unless a command explicitly changes into Loom’s `engine/` directory.

## Canonical status

Prefer the engine-derived status over hand-written `jq` readiness checks:

```bash
bun "$LOOM_PLUGIN_ROOT/engine/src/cli.ts" helper orchestration status \
  --runs-root ".claude/reviews/wave-gate-runs"
bun "$LOOM_PLUGIN_ROOT/engine/src/cli.ts" helper orchestration status --json \
  --runs-root ".claude/reviews/wave-gate-runs"
```

Under Claude Code, command source uses `${CLAUDE_PLUGIN_ROOT}`; under Pi, rendered resources replace that token and export `LOOM_PLUGIN_ROOT` for diagnostics.

Both renderers project one `LoomStatus` value. Status reports:

- active Phase and Wave;
- exhaustive Task counts;
- failed proof obligations;
- test readiness;
- Wave completion-suite outcome and independent `projectVerificationCoverage`;
- Review Run roster gaps and evidence failures;
- active/advisory/resolved/refuted Finding counts;
- whether a Refutation Panel is needed;
- Wave Gate completion eligibility;
- exactly one next action and all reasons.

Unreadable or malformed authority is represented as `unavailable` and leads to `blocked`; status never fabricates empty/ready values. Status probes the conventional Wave Gate runs root by default; pass `--runs-root` when the active run was started under a different root. A missing active directory is reported as orphaned, never as a healthy suspended run.

Modern completion-suite readiness (`required`, `accepted`, `rejected`, or `stale`) includes `projectVerificationCoverage`. `configured` carries non-empty sorted `checkIds`, not a pass. `not-configured` distinguishes `engine-default` (source absent at population), `empty-operator-manifest` (explicit zero project checks), and `historical-unknown` (archived reserved-only receipt without source provenance). Reserved-only suites remain eligible to advance when the existing gates pass; report “Reserved checks accepted; Project verification NOT CONFIGURED,” not “project verification passed.” Completed schema-v2 coverage comes from the archived receipt roster, never today's manifest. `legacy-unavailable` remains unavailable without invented coverage. These are read-model facts, not new persisted authority or waivers.

Raw state inspection remains useful for diagnosis, but it is not gate logic:

```bash
jq '.' .claude/state/active_task_graph.json
jq '.tasks[] | {id, wave, status, proof, review_status}' \
  .claude/state/active_task_graph.json
```

Use `.pi/state/active_task_graph.json` under Pi.

## Run Directory operations

Registered programs require a fresh directory that is a direct child of the supplied runs root. A nested path or unrelated basename is rejected.

Typical roots:

| Program | Conventional root |
|---|---|
| Wave Gate | `.claude/reviews/wave-gate-runs/` |
| Standalone review/remediation | `.claude/reviews/review-and-fix-runs/` |
| Architecture panel evidence | `.claude/specs/<slug>/panel-runs/` |

Create the exact root and a fresh `run.*` child. Never reuse a completed or blocked run.

### Registered program protocol

```bash
# Start with program-specific JSON on stdin
bun "$LOOM_DIR/engine/src/cli.ts" helper orchestration start <program> \
  --runs-root <root> --run <fresh-direct-child>

# After a returned spawn batch finishes
bun "$LOOM_DIR/engine/src/cli.ts" helper orchestration resume \
  --runs-root <root> --run <same-child>

# Supply a requested user decision
bun "$LOOM_DIR/engine/src/cli.ts" helper orchestration decide \
  --runs-root <root> --run <same-child> --request <decision-id>
```

`resume` is idempotent. Execute only the returned `spawn-batch`, `await-user`, `blocked`, or `done` action. Do not build request lists, Context Packets, verdict manifests, transcript files, model choices, or result artifacts by hand.

The façade also exposes `submit` and `correlate` for transport integration and compatibility. Normal Pi and Claude Code operation records native correlations and captures final bytes automatically. `complete` remains a compatibility adapter for historical panel callers; deterministic operations are executed internally in new façade runs.

### Inspecting one run

`status` answers “where is the graph”; `inspect` answers “what state is this run in, and is it recoverable or stale?”. It is a pure read — it advances nothing.

```bash
bun "$LOOM_DIR/engine/src/cli.ts" helper orchestration inspect \
  --runs-root <root> --run <run-directory> [--json]
```

It reports the registered program, the machine state read through that program’s own checkpoint shape, every issued slot with its attempt, capture status and the diagnostic that refused it, the event tail, and any abandonment marker. Facts it cannot read are reported as `unavailable` with the cause, never defaulted — so an unreadable checkpoint is distinguishable from a run that never wrote one. Prefer it over hand-reading `authority.json`, `program.json`, `checkpoint.json`, and `events/`. Like `status`, it stays available during a Pi runtime-revision skew, because it is exactly what diagnosing that skew needs.

### Retiring a superseded run

Run directories are never deleted — they hold the evidence. When a newer run replaces one, record it so the directory listing stays honest:

```bash
bun "$LOOM_DIR/engine/src/cli.ts" helper orchestration abandon \
  --runs-root <root> --run <retired-run> \
  --superseded-by <replacement-run> \
  --reason "<why this run was retired>"
```

The marker removes nothing. It is written once and is immutable: an identical repeat succeeds, a different one is refused, a run may not supersede itself, and the replacement must already exist as a direct child of the same runs root. Afterwards `inspect` still reads the run’s evidence, but every operation that would advance it — `resume`, `submit`, `correlate`, `decide`, `restart`, `complete` — refuses, and no recovery can adopt it as a pristine replacement. `--superseded-by` is optional; omit it when a run is retired without a successor.

### Pi batch limit

Pi’s native subagent transport accepts at most eight requests per call. Partition a larger engine-issued batch into ordered chunks of at most eight without changing any request. Resume only after all chunks finish.

## Protected state rules

Do not write `active_task_graph.json`, machine bindings, or evidence ledgers directly.

Protection is layered:

1. TaskGraph mode is `0444` at rest.
2. `guard-state-file` denies Bash segments that may write guarded paths.
3. Under Pi, a content-addressed Runtime Revision handshake rejects stale-extension/fresh-CLI mutations before dynamic import; `StateManager` repeats the check before chmod or lock creation.
4. `StateManager` serializes writes with a lock and atomic rename.
5. Only hooks and narrowly allowlisted helpers receive write authority.
6. Run-scoped programs publish immutable evidence outside the protected graph and commit protected state only through typed effects.

If a helper says a direct write is blocked, use the named canonical operation; do not use `chmod`, output redirection, an interpreter, or path obfuscation to bypass it.

## Common operating states

### Task remains `pending`

- If its Agent is still in `executing_tasks`, wait or diagnose a hang.
- If the Agent crashed, SubagentStop/cleanup clears execution attribution; respawn the exact Task.
- If proof is unsatisfied, inspect `proof.obligations` rather than trusting completion prose.

### Test evidence is missing or degraded

The implementation Agent must run recognizable tests. For trusted Claude evidence, prefer a supported machine-readable report. A nonzero exit is trusted failure; a zero exit without an acceptable report may remain untrusted. Pi structured tool results retain their distinct provenance.

Do not use `mark-tests-passed` to fabricate evidence. It is an evidence/status operation, not an escape hatch.

### Reviewer evidence is missing

Registered programs derive the exact missing slots and issue retry requests. Resume the program; do not re-run the whole roster or manually write a transcript.

A malformed semantic output gets one retry. Attempt-2 rejection is terminal for that run. Wave reviewer exhaustion has an explicit `orchestration restart` path; standalone runs should remain blocked audit evidence rather than be edited.

### Completed Wave has post-review workspace-integrity loss

A completed Wave may be reopened only through Loom's independent immutable Review Packet authority. This is the recovery for a missed remediation invalidation; do not edit the graph or decrement a Review Generation.

```bash
cat > /tmp/reopen-wave-3.json <<'JSON'
{"runId":"<completed-run-id>","wave":3,"authorityDigest":"<completed-authority-digest>","taskIds":["T19","T22"]}
JSON
bun "$LOOM_DIR/engine/src/cli.ts" helper reopen-completed-wave \
  --runs-root ".claude/reviews/wave-gate-runs" < /tmp/reopen-wave-3.json
```

For modern packets, `workspaceHeadSha` lets the helper derive exactly the completed Tasks whose declared bytes drifted. For historical packets without it, `headSha` is only a batch epoch and is never compared with current bytes: the helper records `legacy-workspace-authority-unverifiable` and requires every completed Task in that Wave. The payload Task list must equal that mode's engine-derived list in protected order. The helper requires execute phase, `current_wave === wave + 1`, no active Wave Gate, and no later-Wave Task progress evidence. It re-proves authority under the StateManager lock, removes only that completed Wave's terminal entry, restores `current_wave`, increments and invalidates reopened Tasks' review generation, and preserves all historical proof, test, artifact, and Finding bytes. Each reopened Task is instead returned to protected `pending` revalidation state; the Wave Gate resets `impl_complete: false`, `tests_passed: null`, and `reviews_complete: false`. Re-spawn **every reopened Task** before starting a new Wave Gate. The implementation Agent may make no production change when current code is correct, but it must run tests and stop with fresh task-linked test evidence; only that stop clears revalidation. An exact replay after success is idempotent; a changed payload is refused. Start a normal fresh Wave Gate only after every reopened Task revalidates.

### Active Wave Gate Run Directory is missing

Do not recreate the old directory or edit `active_wave_gate`. Create a pristine
replacement direct child, copy the exact run ID/wave/digest from protected state,
and use the atomic recovery operation:

```bash
bun "$LOOM_DIR/engine/src/cli.ts" helper orchestration recover-orphan \
  --runs-root ".claude/reviews/wave-gate-runs" \
  --run-id "<active-run-id>" --wave "<active-wave>" \
  --digest "<active-authority-digest>" \
  --new-run "<fresh-replacement-run-directory>"
```

It refuses if the old entry exists or any subagent is active, preserves review
history and generations, records the retirement, installs replacement authority
atomically, and returns the exact new spawn batch. `cleanup-state` remains a
history-discarding last resort, not normal recovery.

### Wave Gate reports critical Findings

Fix surviving criticals through implementation Agents, which increments Review Generation, then open a new Wave Gate run. Do not remove Findings from the graph. The next Review Run verifies every prior id against a new Review Packet.

### Wave Gate awaits advisory disposition

Present the engine’s request and return exactly one disposition/reason object through `decide`. Do not classify advisories silently in parent reasoning.

### Pi reports runtime version skew

Do not repair state. The mutating CLI route compared the Runtime Revision published by Pi's loaded extension with the current checkout and refused before writing. Run `/reload` (or fully restart Pi while preserving the session), then retry the same idempotent operation. Canonical `orchestration status` remains available during skew.

A missing handshake means the Pi session predates this protocol or did not load Loom; it is also resolved by reload/restart, not by deleting fields from the TaskGraph.

### Active graph uses the legacy Requirement trace contract

Legacy graphs without `spec_trace_version` remain readable and auditable. To upgrade exactly one active legacy graph, prepare JSON covering the exact existing Task roster in protected order; provide both arrays for every Task:

```json
{
  "spec_trace_version": 2,
  "tasks": [
    {"id":"T1","spec_anchors":[],"spec_contributions":["FR-001"]},
    {"id":"T2","spec_anchors":["FR-001"],"spec_contributions":[]}
  ]
}
```

Then run the sanctioned atomic helper (use `.pi/state/...` through Loom's normal `LOOM_STATE_PATH` under Pi):

```bash
bun "$LOOM_DIR/engine/src/cli.ts" helper upgrade-spec-trace \
  < /path/to/exact-trace-ownership.json
```

The helper uses StateManager's lock, validates the resulting v2 graph through the same pure trace parser used by normal loading and `validate-task-graph`, and changes only `spec_trace_version`, `spec_anchors`, and `spec_contributions`. It rejects duplicate, missing, reordered, or foreign roster entries; stale conflicting replays; active subagents; and invalid ownership. An exact replay is idempotent.

By default the helper refuses while protected `active_wave_gate` authority exists. Normally, resume and finish that registered Wave Gate until the engine archives it and clears active authority. If the run is blocked specifically because its legacy Requirement scope is wrong, finishing it is impossible. Use this explicit retirement sequence instead, substituting the exact `runsRoot` and `runId` stored in `active_wave_gate`:

```bash
bun "$LOOM_DIR/engine/src/cli.ts" helper orchestration abandon \
  --runs-root "<exact-protected-runsRoot>" \
  --run "<exact-protected-active-runId>" \
  --reason "legacy Requirement scope prevents this Wave Gate from completing"

bun "$LOOM_DIR/engine/src/cli.ts" helper upgrade-spec-trace \
  --retire-abandoned-run \
  < /path/to/exact-trace-ownership.json
```

Usually omit `--superseded-by` and start the replacement only after migration. If an already-created successor Run Directory was deliberately named during abandonment, the upgrade re-proves that exact direct child and preserves the pointer as audit data; it does not install the successor as protected authority. The upgrade opens the exact protected Run Directory, proves its engine-owned Wave Gate program (Wave, Task roster, and authority digest), reads the immutable abandonment marker, then repeats those proofs under StateManager's lock. Missing/unreadable/foreign markers, authority drift, missing or foreign supersession targets, and non-abandoned runs cause no TaskGraph mutation.

On success, one immutable `SpecTraceWaveGateRetirement` audit preserves the old run id, Wave, authority digest, revision, runs root, and exact abandonment reason/supersession. The same locked commit installs trace v2 and clears only stale `active_wave_gate`, `wave_review_epoch`, and `spec_check` scope. Tasks, proofs, Review Runs, Findings, Refutations, Resolutions, issued packets, completed/orphan retirement history, and implementation evidence remain intact. An exact replay does not append another audit; a different mapping remains refused.

### State is malformed

Use only when the load boundary explicitly directs recovery:

```bash
bun "$LOOM_DIR/engine/src/cli.ts" helper repair-task-graph
```

The repair path parses rejected bytes, applies conservative repair, refuses loss of Findings/audit data, validates both full and typed forms, installs atomically, and restores mode `0444`.

### Abandoning an orchestration

`/loom --complete` and `--abort` are not implemented lifecycle flags. The canonical emergency teardown is the guarded helper:

```bash
bun "$LOOM_DIR/engine/src/cli.ts" helper cleanup-state
```

Use it only with explicit operator intent. Preserve specs, plans, review runs, and the GitHub Issue as audit/recovery material.

## Remediation and Git safety

`/review-and-fix` must use the registered remediation program. Standalone remediation itself does **not** require a feature TaskGraph. Every new start is schema v2 and requires `defectFamily`, even when the source review has zero surviving criticals. Use the canonical Skill runbook for the complete input shape; do not hand-write a registration, checkpoint, event, or result.

Before creating or claiming the requested Run Directory, start preflight authenticates the completed source review and its published result, parses complete critical-Finding accounting, selects any required operator checks, and captures the candidate baseline. Invalid input returns an ordinary start error and creates **no run**. Once preflight succeeds, the engine creates and registers the run; any later process/report failure, candidate drift, path audit failure, or installation refusal returns a durable `blocked` action for that registered run. Do not describe these two cases as the same recovery state.

The program rejects:

- a missing, duplicate, foreign, advisory, or refuted Finding ID in critical accounting;
- unresolved or out-of-scope critical/sibling dispositions (valid declarations, but installation blockers);
- dirty paths absent from review scope and explicit support paths;
- Loom state, review, panel, and Run Directory evidence;
- unrelated pre-staged work;
- symlinks or non-canonical repository-relative paths at authority boundaries;
- staged sets that differ from the audited set;
- selected checks without a fresh required-file JUnit/Vitest report containing at least one executed and zero failed tests;
- candidate byte, mode, path-roster, HEAD, or index drift through execution and installation.

A failed check or changed candidate is immutable evidence for that run; start a fresh remediation run after correcting the cause. Removing unrelated dirty/staged state also changes the registered candidate, so it requires a fresh run rather than reuse of the old registration. A registered blocked run may be resumed idempotently for diagnosis or after a transient external condition only when source, registration, and candidate authority remain byte-identical. If remediation itself needs an omitted support path, the immutable registration cannot gain it: start a fresh run that names it and retain/abandon the older run as evidence.

The engine stages into a temporary index with literal path semantics, verifies that index, and installs it under the real index lock only after an opaque installable Defect-Family Assessment exists. In the external schema-v2 `done` action, `outcome.kind` is `remediation-installed`, `outcome.installation` is the actual receipt returned by the Git adapter, and `outcome.defectFamilyAssessment` is the authenticated assessment. Read that action; never construct it. For zero surviving criticals, the assessment status is `not-required`; for critical repairs it is `repair-checked`. Neither means proven defect-family closure or a `ResolvedFinding`. Commit only after this `done` action. Never hand-stage, and never force-push.

Completed schema-v1 remediation runs remain read-only and inspect as `done — historical P3 assessment unknown`; their external assessment is `historical-unknown`. Reading/resuming that history returns the existing receipt, never reinstalls the index or grants current installation authority. An unfinished schema-v1 run is blocked and must be replaced by a fresh schema-v2 run. Missing v2 fields never fall back to v1. The source Standalone Review Run retains its own schema and immutable publication; versioning remediation does not rewrite or invalidate that source history.

Completed-v2 replay parses both checkpoint audit-path arrays before assessing retained observations. Missing or malformed arrays produce `remediation checkpoint audit paths are missing or malformed`, not invented empty-path evidence. If installation succeeds but checkpoint recording fails, preserve the explicit installed-index diagnostic and actual receipt: that failure does not mean rollback or “nothing was installed.” Do not hand-repair the checkpoint or reinstall from its prose; use read-only inspection and retain the interrupted evidence.

**Runtime bootstrap:** after external validation, the currently admitted CLI and loaded Skill 3.1 may review and install this feature under their existing protocol. That bootstrap is not a schema-v2 `repair-checked` publication; after reload, its completed v1 run is historical-unknown. New live P3 operation requires the updated package and matching runtime revision: run `/reload` or restart Pi. Do not unset runtime-admission variables or use a fresh checkout's CLI against an older loaded extension. Installation/publication remains the parent's registered workflow, not a documentation operation.

### Enrolling a critical-repair check

Critical remediation selects check IDs from the operator-owned `.loom/verification-manifest.json`. The selected fixed executable/argv must itself create a **new** report at the **exact** configured path on every run. The file must be a fresh parseable JUnit XML or Vitest/Jest JSON report beneath `.loom/completion-reports/`, remain untracked, and be Git-ignored. A normal process exit is insufficient: the parsed report must show more than zero executed tests, zero failures, and not an all-skipped run.

Before each selected critical check launches, the engine proves that exact literal report path is Git-ignored and untracked, then removes any old regular file through a retained Linux parent descriptor using no-follow, descriptor-relative unlink. Only ENOENT counts as absence; directories, symlinks, permission failures, and unsupported reset fail before launch with `required report reset failed before launch`. Merely touching seeded green bytes cannot pass. A newly written report may have identical bytes to the previous report. **Darwin is deliberately unsupported for this destructive reset**, because the existing pathname adapter cannot prove race-free parent anchoring. Zero-critical remediation launches no check, and Wave report freshness behavior is unchanged.

Strict reports are capped at **8 MiB (8,388,608 bytes)** and actual XML element depth **128** (root depth 1, including diagnostic elements). Structural XML parsing rejects malformed documents and DTDs; comments/CDATA do not create tests. Capture, persistence, and base64 replay enforce the report byte bound before oversized allocation/decoding. V2 remediation additionally caps each encoded event file at **12 MiB**, the aggregate encoded journal at **64 MiB**, and the journal at **1024 records**. These limits apply to retained-event reads, append reconciliation/new appends, and CLI inspection's event-tail read, before oversized file decoding/JSON parsing; enumeration is bounded too. They are not blanket limits on every Run artifact/checkpoint, or a claim that decoded heap usage equals encoded bytes. Legacy/default journal consumers retain their existing policy.

These are fresh structured engine observations, **not semantic proof**: an operator-owned fixed command can still fabricate a syntactically valid new report. Neither process success nor a report digest proves that tests exercised the declared invariant, root cause, sibling completeness, or Historical RED.

The `helper write-verification-manifest` operation is **create-only**. It requires an existing loadable TaskGraph whose Task roster is empty, accepts an identical replay, refuses a different existing manifest, and refuses after Task population. It does not update this repository's existing manifest. Standalone remediation has no TaskGraph requirement; this enrollment helper's idle-TaskGraph requirement is a separate configuration-installation constraint.

**Current repository enrollment (2026-09-09):** with explicit user approval, the parent replaced only `project:verify`'s report policy at a verified idle boundary with no TaskGraph: `{ "kind": "required-file", "path": ".loom/completion-reports/verify.junit.xml" }`. The fixed executable `npm`, argv `["run", "verify"]`, root cwd, Wave scope, and 30-minute timeout are unchanged. This was operator configuration replacement, not use or modification of the create-only helper and not a live graph mutation. The existing `test:unit` script emits JUnit using installed Vitest; no runner or report writer was added. Only `.loom/completion-reports/` is newly Git-ignored. Existing populated TaskGraphs retain their already-frozen commands. Enrollment makes the check selectable for critical P3; it does not establish a passing check or completed live schema-v2 remediation. Do not bypass protected paths or edit a live graph. See [Verification manifest](workflows.md#verification-manifest) and the [dated enrollment follow-up](../.claude/plans/2026-09-09-junit-verification-enrollment.md).

## Linter operations

### Scan a path

```bash
bun scripts/lint-project.ts engine/src
```

### Validate rule files

```bash
bun engine/src/cli.ts helper validate-lint-rules .claude/linter/rules
# Pi project:
bun engine/src/cli.ts helper validate-lint-rules .pi/linter/rules
```

A nonexistent directory is an error for explicit validation. Runtime loading, by contrast, treats an absent project rules directory as “no project overrides.”

See [Lint Rules](../lint-rules/README.md) for configuration and tiers.

## Model policy operations

```bash
# Inspect one Agent’s semantic profile and both bindings
bun engine/src/cli.ts helper model-profiles agent --agent code-reviewer

# Validate all source definitions
bun engine/src/cli.ts helper model-profiles validate

# Regenerate Pi Agent definitions
bash scripts/sync-pi-agents.sh
```

Generated Pi Agents live under `${PI_CODING_AGENT_DIR:-$HOME/.pi/agent}/agents`. Regenerate after Agent, Skill, model-profile, or package-root changes, then `/reload` Pi.

## Model calibration

Calibration is live-model work and is opt-in:

```bash
cd /path/to/loom
LOOM_RUN_MODEL_CALIBRATION=1 bun scripts/run-model-calibration.ts \
  --profile focused-review \
  --corpus calibration/corpus.json \
  --output calibration/results/focused-review.json
```

Without `LOOM_RUN_MODEL_CALIBRATION=1`, the script exits without running models. Score predictions separately with the `helper model-calibration` operations. Read [Model profiles and calibration](model-profiles-and-calibration.md) before changing policy.

## Development validation

### Locked bootstrap and mandatory full gate

The development/CI baseline is a full-history Git checkout on non-root Linux, Node **22.23.2**, Bun **1.3.13**, npm, Git, jq, Bash **4+**, and GNU `timeout` on PATH. The existing macOS 13+ runtime support excludes strict critical-remediation report reset and is not a claim that this verification change was tested there; macOS would also need the development tools, including GNU coreutils and a suitable Bash. Full history is required because deterministic tests resolve the committed model-calibration corpus against historical revisions available through remote refs. A normal full clone checked out on `main` contains those objects; for an existing single-branch shallow clone, fetch every remote head before verification:

```bash
git fetch --unshallow origin '+refs/heads/*:refs/remotes/origin/*' --tags
```

From the Loom repository root:

```bash
bun install --frozen-lockfile
(cd engine && bun install --frozen-lockfile)
npm run verify
```

Both locks are required: root dependencies supply Pi/runtime resources; engine dependencies supply the compiler and Vitest. `preverify` checks required tools, executable local Vitest/Pi, and that Pi resolves to the root-local locked CLI through npm's PATH. No global/latest Pi or network-fetching compiler fallback is accepted. Local preflight checks availability, not exact runtime versions; CI explicitly checks the pinned Node/Bun versions.

The same **root `npm run verify`** runs locally, in `.github/workflows/ci.yml` for PRs/branch pushes/tags, and through this repository's runtime Verification Manifest. CI checks out full history with `fetch-depth: 0`, installs both frozen graphs, preserves failures through `pipefail`, and attempts log artifact upload even after failure. It has a 30-minute job budget; the manifest separately bounds its command to 30 minutes. Neither is proof of a successful hosted CI run.

Root `verify` delegates to engine `verify`: prerequisites → typecheck → existing `test`. That test script runs the entire existing Vitest suite (including property/integration tests) followed by all six unchanged smoke commands, once each on success:

1. `scripts/smoke-panel-mode.sh`
2. `scripts/smoke-review-panel.sh`
3. `scripts/smoke-standalone-review.sh`
4. `scripts/smoke-orchestration-facades.ts`
5. `scripts/smoke-pi-resources.sh`
6. `artifacts/tests/test-validate-task-graph.sh`

The one Vitest invocation retains the default console reporter and also writes `.loom/completion-reports/verify.junit.xml` at the repository root. Its script uses `--reporter=default --reporter=junit --outputFile=../.loom/completion-reports/verify.junit.xml` because npm runs it from `engine/`. JUnit contains only Vitest test facts, including skipped/failed cases; it does not contain compiler or smoke testcases. Normal zero exit of the entire fixed command proves those other tiers passed too. A later smoke failure leaves the green unit report but the root command remains nonzero. Focused `test:unit` invocations overwrite the same file with focused facts: report existence alone is never full-gate or registered remediation evidence.

Failure stops later stages. The existing test scripts normalize `PI_CODING_AGENT` for their subprocesses; do not replace them with Bun's built-in test runner. The mandatory full gate has **no file/test selectors or omitted smoke tier**. Existing platform-dependent skips must be reported (for example the Darwin-only filesystem case on Linux), not hidden behind a universal zero-skips claim. Live-model calibration remains opt-in and outside this gate.

### Compiler boundary

`engine/scripts/typecheck.ts` uses the explicitly installed TypeScript API with `noEmit`, `noUnusedLocals`, and `noUnusedParameters`. `engine/tsconfig.json` owns all `src`, `tests`, `../pi`, and `scripts/typecheck.ts` roots. Standalone repository-root scripts are not all explicit compiler roots; imported portions may be checked transitively.

Only TS6133/TS6192/TS6196 unused diagnostics on compiler-proven external raw TypeScript, excluding declaration files and explicit roots, are non-fatal. Each original file/position/code/message remains visible. Owned diagnostics, ordinary external dependency errors, config/input failures, and compiler infrastructure failures remain fatal. This intentionally replaces the old fail-open path grep; `skipLibCheck` cannot suppress raw-source unused diagnostics. `typecheck:unused` is an alias of the same complete gate, not a weaker path.

### Focused iteration (not full-gate evidence)

```bash
npm --prefix engine run typecheck
npm --prefix engine run test:unit -- tests/runbook-contract.test.ts tests/panel-config.test.ts
npm --prefix engine run test:unit -- tests/handlers/helpers/orchestration.test.ts
npm --prefix engine run test:unit -- tests/pi-extension-review-events.test.ts
npm --prefix engine run test:smoke
# entire test script without the compiler gate:
npm --prefix engine run test
# equivalent package-script invocation from engine/:
# bun run test
```

**Bare `bun test` is Bun's built-in runner, not `npm run test` / `bun run test`.** Report the exact command, exit status, test counts/skips, smoke completion or not-run stages, and environment. Focused green checks or separately green tiers are not a green canonical run. Do not claim full validation when concurrent work prevents a complete run on the final tree.

## Repository map for operators

```text
.claude-plugin/plugin.json     Claude plugin metadata
package.json                   Pi package registration and runtime dependencies
commands/                      executable user runbooks
skills/                        reusable Skill runbooks and knowledge
agents/                        source Agent definitions
hooks/                         Claude Code hook registration and shims
pi/                            Pi adapter, renderer, transcript adapter, grants
engine/src/core/               parsers, policy, reducers, domain values
engine/src/orchestration/      anchored persistence, effects, Fugue runtime/DAGs
engine/src/handlers/           harness/CLI shell
engine/tests/                  unit, property, integration, contract tests
scripts/                       sync, lint, calibration, smoke scripts
calibration/                   committed corpus; generated results are ignored
```
