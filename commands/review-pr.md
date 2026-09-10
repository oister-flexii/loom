---
description: "Adjudicated multi-Agent review of an exact repository scope"
argument-hint: "[code|errors|tests|types|comments|architecture|simplify|all] [--files file1,file2] [--dry-run]"
allowed-tools: ["Bash", "Read", "Task", "Agent", "subagent"]
---

# Review PR

Run a registered Standalone Review Program. The engine owns scope derivation,
reviewer/model/Skill policy, Context Packets, request authority, exact transcript
capture, retries, aggregation, critical-Finding refutation, and canonical result
publication. This workflow never mutates the feature TaskGraph.

**Arguments:** "$ARGUMENTS"

## 1. Resolve Loom

```bash
LOOM_DIR="${CLAUDE_PLUGIN_ROOT}"
test -f "$LOOM_DIR/engine/src/cli.ts" || exit 1
```

Claude Code expands the shared token; Pi receives an absolute rendered path.
Never infer package identity from cwd or another harness installation.

## 2. Parse user policy

Accepted review kinds:

- `code`
- `errors`
- `tests`
- `types`
- `comments`
- `architecture`
- `simplify`
- `all` (default)

`simplify` selects the `code-simplifier` reviewer (preloading the `distill`
skill) unconditionally; under `all` the engine adds it whenever the frozen
scope changes source or test files.

`architecture` selects the `architecture-tech-lead` reviewer (preloading the
`deepen` skill in review mode) unconditionally; under `all` it always joins the
roster, and it is auto-selected for >500 additions, >10 files, or new
structure.

`--files` is a comma-separated explicit scope. Without it, the engine freezes
the canonical sorted union of branch-committed, staged, unstaged tracked, and
untracked non-ignored paths, excluding Loom run/state evidence. Empty scope is a
hard stop. `--dry-run` is recorded in review authority; it does not weaken
review/adjudication.

Do not use this command to feed one Wave Task. `/wave-gate` owns packet-bound
per-Task review and Wave-wide adjudication.

## Reviewer wire and judgment

Fresh registrations use Reviewer Protocol v2: exactly one JSON final payload,
no Machine Summary, markers, numeric tallies, or reviewer-chosen new IDs.
The issued Context Packet freezes `reviewer-payload-schema` and
`reviewer-impact-rubric`; payload contents never select the decoder.
A critical has six fields: claim plus basis evidence, violatedContract,
consequence, truthConfidence, and severityRationale. An advisory needs a concise
reason; its optional basis must be complete. Structure is not proof of truth,
impact, reachability, execution, or test adequacy. A missing test or factual
error alone does not establish a blocking consequence.

Malformed current output fails evidence admission, creates no synthetic Finding,
and uses only the existing one retry. The same Refutation Panel/strict majority
assesses the assertion including its stated basis; a true assertion is not refuted
merely because repair seems unimportant. A surviving critical stays blocking;
there is no standalone severity override.

Completed and unfinished issued v1 reviews retain their original protocol.
Read the issued packet first, then the archived role and shared contract under
`references/reviewer-protocol-v1/` when instructed; do not apply current guidance
to those requests. See [operations](../docs/operations.md#reviewer-protocol-v2).

## 3. Start one fresh run

Create a fresh direct child beneath the runs root, for example:

```bash
RUNS_ROOT=".claude/reviews/standalone-review-runs"
mkdir -p "$RUNS_ROOT"
RUN_DIR="$(mktemp -d "$RUNS_ROOT/run.XXXXXXXXXX")"
```

Pass only parsed user policy:

```bash
bun "$LOOM_DIR/engine/src/cli.ts" helper orchestration start standalone-review \
  --runs-root "$RUNS_ROOT" \
  --run "$RUN_DIR" <<'JSON'
{"kind":"all","files":null,"dryRun":false}
JSON
```

For explicit files, `files` is a non-empty JSON string array. Never hand-build
scope metadata, reviewer rosters, model lookups, transcript slots, findings,
verdict manifests, or panel events.

## 4. Execute returned actions

Execute only the single typed action returned by `start` or `resume`:

- `spawn-batch` — spawn every exact request, preserving Agent, model, required
  Skill, task text, Context Packet reference, `LOOM_REQUEST_ID`, and cwd.
  Claude may send the batch in one message. Pi accepts at most eight requests
  per native subagent call; partition larger batches into ordered chunks of at
  most eight without changing/dropping/duplicating a request, then wait for all
  chunks before resume.
- `blocked` — stop and report the complete diagnostic.
- `done` — read/report the authoritative result receipt.

Standalone review has no advisory `await-user` stage: it reports advisories; it
does not choose remediation policy.

After a complete harness batch:

```bash
bun "$LOOM_DIR/engine/src/cli.ts" helper orchestration resume \
  --runs-root "$RUNS_ROOT" \
  --run "$RUN_DIR"
```

Resume until `done` or `blocked`. Resume is idempotent. Pi and Claude adapters
bind native result identities and write exact final bytes directly into
engine-reserved slots. Never copy Agent output into files yourself.

## 5. Report only canonical results

Use the existing read-only inspection command against the completed Run:

```bash
bun "$LOOM_DIR/engine/src/cli.ts" helper orchestration inspect \
  --runs-root "$RUNS_ROOT" --run "$RUN_DIR"
```

Inspection re-proves registered protocol/publication authority and reads canonical
`result.json` at the Run Directory root. Its human summary derives emitted/admitted
and after-refutation counts and Finding details from that published result;
`--json` retains the existing inspection shape. Never author replacement tallies
or a summary authority artifact. Report:

- exact frozen scope and selected reviewer roster;
- surviving critical Findings;
- advisory Findings;
- refuted critical Findings with lenses/votes/reasoning;
- evidence/retry diagnostics, if any;
- Run Directory and result artifact path.

Do not merge refuted Findings into “fixed,” hide them, or summarize an
incomplete/blocked run as a review result. A missing roster member, malformed
attempt-2 output, or publication failure is blocked evidence—not a partial
success.

## Examples

One review kind per invocation (the orchestration input carries exactly one
`kind`); omit it for `all`.

```text
/review-pr
/review-pr code
/review-pr tests
/review-pr architecture
/review-pr comments --files README.md,docs/architecture.md
/review-pr all --dry-run
```
