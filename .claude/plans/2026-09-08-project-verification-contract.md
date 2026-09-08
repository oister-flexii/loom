# Project verification contract — Priority 2

## Status and scope

Implementation decision record for `feat/project-verification-contract`, rebased onto `37b8a82dff842c531604bc9b521578b65211180f` (merged PR #43). Command/compiler/CI, coverage projection, and ambient-state test isolation are implemented in the working tree. Documentation is aligned below. **The registered review is finalized; its surviving critical and accepted advisories have now been remediated within tests/docs only. Final root verification passed again (7,567 tests and all six smokes), with no live TaskGraph; the parent's earlier official idle-graph validation remains separate evidence. Verified-index/commit/publication and hosted CI remain parent-owned and unclaimed.** Focused evidence is not a completed full gate, hosted CI result, or runtime Wave acceptance.

This work establishes one real repository verification command and makes project-check configuration explicit without replacing Loom's existing completion authority. It does not introduce a new workflow engine, lifecycle, waiver, strict require-all-projects mode, admitted-verifier system, or receipt-binding machinery. Task Verification Policy, command admission, completion evaluation, protected receipt installation, and legacy compatibility keep their existing authority.

This document is not populated TaskGraph state. Implementation components and acceptance cases below do not manufacture Tasks, Waves, registrations, or receipts.

## Adjudicated remediation dispositions — recorded before code edits

Authoritative input: `.claude/reviews/review-and-fix-runs/2026-09-08-project-verification-contract/result.json`, SHA-256 `7ada2c71c6dd7a03fa9a988382a3bd2d876645d3eb55e9b1081a6ea416aee549`, read in full. The registered review has **1 surviving critical, 6 advisories, 0 refuted criticals**. The intent lens dissented on cleanup, but reproduction and test-coverage upheld it; dissent is not a refuted outcome. This is final scoped remediation of that result, not a new review or a rewritten Run artifact.

| Finding | Disposition and exact closure scope |
|---|---|
| `silent-failure-hunter-1` | **Mandatory remediation.** Remove the empty teardown catch in `engine/tests/handlers/subagent-stop/dispatch-resilience.test.ts`; retain `rmSync` with `recursive: true, force: true`. ENOENT is already tolerated; other cleanup errors must fail teardown. Preserve all ambient-state isolation controls. |
| `silent-failure-hunter-2` | **Accept.** Make the actual Bun prerequisite snippet in `commands/loom.md` exit nonzero and print its actionable dev-shell diagnostic to stderr when Bun is missing. |
| `silent-failure-hunter-3` | **Accept.** Keep the same package preflight boundary in `commands/wave-gate.md`, adding actionable stderr before its existing nonzero exit when the resolved package is absent/incomplete. |
| `pr-test-analyzer-1` | **Accept.** Existing readiness cases cover missing receipts, workspace drift, and invalid persisted results, but none assert `accepted-suite-invalid` for a structurally parsed accepted receipt disagreeing with current registration/manifest/roster/report policy. Add only that focused matrix to `engine/tests/core/wave-completion-readiness.test.ts`, with canonical acceptance controls and real receipt parsing/readiness refusal, not fake passing evidence. |
| `pr-test-analyzer-2` | **Dismissed as already covered after inspection.** `engine/tests/core/verification-manifest.property.test.ts`, `fixed-command execution authority > rejects tampering with every frozen authority field`, already constructs a valid manifest with `freezeVerificationManifest`, mutates only `manifestDigest` to `digest("f")`, and asserts `parseFrozenVerificationManifest(mutation).ok` is false (also tests a valid executable mutation). `verification manifest exact parsing > round-trips valid documents and deeply freezes parsed and frozen authority` supplies the positive canonical rehydration property. These assertions are already in the declared compiler project and will be executed unchanged with typecheck; no redundant test or new support path for this file. |
| `type-design-analyzer-1` | **Defer.** The pre-existing exported `FrozenVerificationManifest` structural type cannot express engine-default/empty-roster correlation, but constructors/parsers enforce it and no new bypass is demonstrated. Redesigning that existing exported union is outside this tests/docs closure. |
| `type-design-analyzer-2` | **Defer.** Historical projection excludes the one reserved ID in the exact closed current Wave roster. No current receipt misclassification is demonstrated. Future check-origin/receipt-schema evolution requires a separate policy decision, not a speculative schema change here. |

Only new support path planned: `engine/tests/command-preflight-contract.test.ts`; inspected `runbook-contract.test.ts` and verification command tests have no appropriate executable command-preflight harness. Tests will execute only the extracted actual preflight snippets in disposable cwd with a restricted temporary PATH, never full bootstrap or installations. No production manifest/readiness API/schema, protected manifest/State File/Run, Git index, stash, or commit edits are authorized. Existing feature diffs remain intact. Final gates: focused tests, apply-mode distill from green (one move at a time), typecheck, full-tier lint, complete root `npm run verify`, then post-Plan document checks and refreshed byte inventory. No live graph currently exists; the parent's earlier true-active validation remains separate evidence, and no new active-graph run is claimed unless performed.

## Decisions

### One root command, existing engine leaf

Canonical command, from the Loom repository root:

```bash
bun install --frozen-lockfile
(cd engine && bun install --frozen-lockfile)
npm run verify
```

Both frozen installs are mandatory; neither lockfile nor dependency version is changed. Root `verify` delegates to `npm --prefix engine run verify`. Engine `preverify` runs prerequisite checks; engine `verify` then runs `npm run typecheck && npm run test`.

The existing test command stays intact: complete Vitest, then all six existing smoke commands, each once on success, with failure short-circuiting subsequent stages. The existing scripts remove `PI_CODING_AGENT` for test subprocesses. The six smokes are architecture panel, refutation panel, standalone review, orchestration façades, real Pi resources, and task-graph validation. No selector, omitted smoke, calibration run, second suite runner, or recursive self-test is added to the full gate. Focused commands remain useful but do not satisfy final acceptance.

`npm run test` / `bun run test` explicitly invoke the engine package script. Bare `bun test` is Bun's built-in runner and is not equivalent. This corrects the former README/Operations guidance.

Local development, Linux CI (PRs, branch pushes, and tags), and this repository's registered runtime Wave check all invoke the **same root `npm run verify`**, not a runtime-only engine-cwd variation proposed during reconnaissance. Package scripts never invoke manifest execution or a Wave Gate: the manifest invokes the command, not vice versa.

### Locked environment and honest platform evidence

Baseline: non-root Linux, Node **22.23.2**, Bun **1.3.13**, npm, Git, jq, Bash **4+**, and GNU `timeout`. Root-local locked Pi must resolve exactly; global/latest Pi is not a substitute. Engine-local Vitest and the explicitly installed TypeScript compiler are required. No network-capable compiler fallback or dependency stub is allowed.

`preverify` checks tools and local executable resolution, not exact Node/Bun versions. CI pins and checks those versions on `ubuntu-24.04`, installs both frozen graphs, preserves verification failure through Bash `pipefail`, and always attempts log upload. The CI job has a 30-minute budget; the runtime command independently has a 30-minute timeout.

Recorded local versions include Pi 0.84.2 and TypeScript 5.9.3 from the existing locks. macOS 13+ remains the existing runtime support contract, but this work has **no macOS test evidence** and no completed GitHub-hosted CI result. Report existing platform-dependent skips, such as the Darwin-only filesystem case on Linux; do not claim universal zero skips. Non-root execution keeps permission-denial tests meaningful.

### Complete declared compiler project, narrow explicit exception

`engine/scripts/typecheck.ts` uses the installed TypeScript API, parses `engine/tsconfig.json`, forces `noEmit`, `noUnusedLocals`, and `noUnusedParameters`, and checks all configured roots:

- `engine/src`
- `engine/tests`
- all `pi`
- `engine/scripts/typecheck.ts`

Every ordinary, owned, global, option/config/input, and infrastructure failure stays fatal. Only diagnostic codes **TS6133, TS6192, TS6196** may be excluded, and only when the compiler identifies external-library raw TypeScript that is neither a declaration file nor an explicit root. Each exclusion prints its original file/position/code/message. Ordinary external dependency errors are fatal; this is not a blanket `node_modules` exclusion. `typecheck:unused` aliases the same complete gate.

This deliberately corrects the old `typescript-patterns.md` grep example rather than reproducing it: path filtering plus shell status handling could hide ordinary errors and missing compiler/config failures. `skipLibCheck` only covers declarations, not raw dependency sources. The locked baseline exposed 16 Fugue 0.4.0 raw-source unused diagnostics in exactly the three excluded categories. This is an intentional, visible upstream-unused policy, not a pass disguised by grep.

Not every standalone repository-root script is a compiler root. `scripts/lint-project.ts`, `scripts/run-model-calibration.ts`, `scripts/smoke-orchestration-facades.ts`, and `scripts/stamp-wire-contract.ts` are not newly claimed as explicit roots; imported portions may be checked transitively, and their existing tests/smokes remain intact. The prerequisite Bash script is checked as Bash, not TypeScript.

### Operator source, existing runtime authority

The installed `.loom/verification-manifest.json` contains exactly:

```json
{
  "schemaVersion": 1,
  "kind": "loom-verification-manifest",
  "checks": [
    {
      "id": "project:verify",
      "scope": "wave",
      "executable": "npm",
      "args": ["run", "verify"],
      "cwd": ".",
      "timeoutMs": 1800000,
      "report": { "kind": "not-required" }
    }
  ]
}
```

This is operator-owned source configuration. TaskGraph population later parses and freezes its exact executable/argv/cwd/timeout/report authority. Decompose output cannot authorize commands. Later source changes do not replace frozen authority. The registered quiescent Wave suite executes the command through the existing fixed-command runner and owns its immutable results and protected acceptance. Local/CI exit zero is evidence of that process, not a manually minted Wave receipt. The existing `not-required` report arm does not waive tests.

**Actual installation handling:** there is no live TaskGraph at documentation handoff. The parent used official `init-state` for an empty bootstrap at the canonical metadata State File path, then `helper write-verification-manifest`, then sanctioned `helper cleanup-state`. The source manifest remains. The writer requires a real, loadable empty graph at `.claude/state/active_task_graph.json` or `.pi/state/active_task_graph.json`; an arbitrary `/tmp` graph path is not a valid target-root substitute. Initialization prepares the real metadata directory, and supplied spec-directory metadata is not proof of a Spec, Task, or Wave. `/tmp/loom-verification-manifest-bootstrap-state.json` records the empty initialization shape, not an authority to install by hand. No Task population, Wave registration, manual session-pointer creation, or completion receipt is needed to install source configuration. Never clean up an unrelated active graph or bypass a Pi runtime-revision handshake.

The parent subsequently used another official idle bootstrap for canonical validation: the complete root gate passed while the graph was present, its SHA-256 remained `581ff296f6dda6c8069a15b0dda6c15a4f40eadecb43ebfe765df77c02ab3011`, and authorized `cleanup-state` followed. The final pass confirmed both canonical graph paths absent and the installed source intact; it did not repeat or independently reconstruct that lifecycle. An empty bootstrap cannot establish runtime Wave acceptance.

### Project Verification Coverage is a projection, not authority

`ProjectVerificationCoverage` is an immutable discriminated union:

| Shape | Meaning |
|---|---|
| `not-configured`, `reason: engine-default` | Source absent at population; reserved checks only. |
| `not-configured`, `reason: empty-operator-manifest` | Explicit source with zero project checks. |
| `not-configured`, `reason: historical-unknown` | Archived reserved-only receipt; original absent-versus-empty provenance unavailable. |
| `configured`, non-empty sorted `checkIds` | Exact configured project-check roster, independent of pass/fail. |

The pure projection consumes the frozen manifest for current readiness and the archived accepted receipt for completed schema-v2 Waves. It never consults today's source to rewrite history. Canonical readiness carries `projectVerificationCoverage` on `required`, `accepted`, `rejected`, and `stale`. `legacy-unavailable` remains unchanged without invented coverage. No new persisted field or manifest/receipt schema is introduced.

Population emits the shared diagnostic immediately; human status, JSON status, and gate summaries use the same canonical fact. Configured means configured, not passed. Accepted reserved-only suites may still advance under existing policy, but must say reserved checks accepted / Project verification NOT CONFIGURED, not project verification passed. No projection asserts that unconfigured test/build/typecheck categories ran. Direct `done` envelope/receipt bytes stay unchanged; operator guidance uses canonical status alongside completion rather than manufacturing sibling authority.

### Ambient-state isolation is a real fix

Two tests accidentally consulted the authoring checkout's TaskGraph. Removing that graph made them pass but was not the fix. Runtime discovery subprocesses now use disposable real Git repositories with absent/legacy/native graph controls and unset inherited selectors. Dispatch tests use disposable cwd, explicit graph paths, and isolated metadata/capture directories; absent and genuinely present graph controls retain real handler behavior and verify graph bytes remain unchanged. No production path is stubbed or weakened.

## Components and acceptance tests

| Component | Files / key seam | Required evidence |
|---|---|---|
| Command composition | `package.json`, `engine/package.json`, `engine/scripts/verify-prerequisites.sh` | Real npm process tests prove ordering/exact-once and failure at compiler, Vitest, and each smoke prevents later execution; global Pi cannot replace absent local Pi. |
| Compiler shell and policy | `engine/scripts/typecheck.ts` (`checkTypeScriptProject`), `engine/src/core/compiler-diagnostic-policy.ts` (`compilerDiagnosticDisposition`), `engine/tsconfig.json` | Real temporary compiler projects cover all owned root categories, malformed/missing config, missing/empty inputs, unknown options, no emission, missing local compiler, external-unused success, and ordinary external failure. Properties exclude no other origins/codes. |
| CI | `.github/workflows/ci.yml`, `engine/tests/verification-ci.test.ts` | PR/branch/tag triggers, exact runtimes, two frozen installs, local executables, non-root Linux tools, same root command, failure-preserving log upload. Hosted execution remains separate evidence. |
| Source command | `.loom/verification-manifest.json`, `engine/tests/verification-command.test.ts` | Real `freezeVerificationManifest` parses the actual repository source and proves the root command. Do not skip the manifest test. |
| Coverage core/read model | `engine/src/core/verification-manifest.ts`, `engine/src/types.ts`, `engine/src/core/wave-gate-machine.ts` | Immutability, determinism, permutation invariance, sorted nonempty IDs, all absence reasons, independent required/rejected/stale/accepted outcomes, reserved-only advancement, historical roster despite current-manifest replacement, legacy honesty, unchanged persisted shape. |
| Population and façade | `engine/src/handlers/helpers/populate-task-graph.ts`; population/readiness/façade integration tests | Absent directory/file, explicit empty and configured source, immediate diagnostic, source-freeze stability across reload, guarded malformed/symlink/unreadable refusal, real registered execution counts, idempotent resume and read-only status. |
| Test isolation | `engine/tests/runtime-resource-portability.test.ts`, `engine/tests/handlers/subagent-stop/dispatch-resilience.test.ts` | Absent and present real graph controls, original malformed-input/capture/cleanup assertions, selector isolation, no local-state fallback for unbound sessions, unchanged present-graph bytes. |
| Documentation | `CONTEXT.md`, `README.md`, `docs/operations.md`, `docs/workflows.md`, `commands/loom.md`, `commands/wave-gate.md` | Shared command, exact coverage vocabulary, no authority inflation, truthful environment/skips, sanctioned bootstrap/install/cleanup only. |

No new lifecycle or speculative driver seam is required. Existing per-program façade drivers remain intact (ADR-0005), with pure projection over existing evidence rather than redundant persistence (ADR-0006). Compiler failure handling follows the fail-closed principle (ADR-0003).

## Evidence recorded so far

Detailed source-of-evidence reports:

- `/tmp/loom-verification-command-implementation.md`: both frozen installs succeeded; compiler/CI focused baseline 22 tests passed; separate unchanged six-smoke chain passed. First canonical run failed only at then-absent parent manifest and correctly did not run smokes. Those pre-rebase counts are not final-tree evidence.
- `/tmp/loom-verification-coverage-implementation.md`: 279 tests across 12 files plus 99 orchestration tests passed; final 84 covering tests, typecheck, and full-tier lint passed. Tests-first and isolated prior-production façade controls demonstrate regression sensitivity. No full canonical command was claimed by that worker.
- `/tmp/loom-verification-rebaseline.md`: exact delta preserved onto `37b8a82`; typecheck passed; eight focused files had 109 passes with the then-missing-manifest case explicitly excluded; six #43 parser/authority regression files had 1,208 passes. That selector-bearing run is not full-gate acceptance.
- `/tmp/loom-verification-rebased-verify.log`: subsequent canonical run before isolation fixes had 246 files passed / 2 failed, 7,543 tests passed / 2 failed / 1 skipped. The two ambient-graph defects prevented reaching smokes. This is red historical evidence, not a successful gate.
- `/tmp/loom-verification-state-isolation.md`: final two-file isolation suite had 363 passes, plus successful typecheck, full-tier lint, and diff checks. Removing the graph alone was explicitly rejected as a fix; real presence/absence controls were added.
- `/tmp/loom-verification-docs-tests.log`: documentation handoff ran `npm --prefix engine run test:unit -- tests/runbook-contract.test.ts tests/verification-command.test.ts tests/verification-ci.test.ts`; all 3 files / 38 tests passed, including the real installed-manifest parser case, with no excluded cases. This remains focused evidence, not the final full gate.

### Final measured validation

- Parent's unfiltered root `npm run verify`: **exit 0; 248 files passed; 7,551 tests passed, 1 platform skip; Vitest duration 198.49 seconds**. Compiler and all six smokes completed in that same invocation. Log: `/tmp/loom-verification-active-graph-verify.log`, SHA-256 `d3d44182107b12686d272cb9a457661ad7c4ef60c7aa37e4952e48bfb9a896e9`. This supersedes the earlier red canonical run; no focused runs are composed into it.
- Smokes: architecture panel **22/22**, refutation panel **19/19**, standalone review **PASS**, orchestration façades **PASS**, real Pi resource discovery **PASS**, task-graph validation **23/23**. The sole Vitest skip is the existing Darwin-only swapped-parent filesystem case in `engine/tests/orchestration/no-follow-fs.test.ts`.
- Measured local environment: Linux, UID **1000**, Node **22.23.2**, Bun **1.3.13**, npm **10.9.8**, Git **2.55.0**, jq **1.8.2**, Bash **5.3.15**, GNU timeout **9.11**, locked Pi **0.84.2**, TypeScript **5.9.3**. Compiler output visibly excludes the same **16** upstream Fugue raw-source unused diagnostics only.
- Source manifest SHA-256: `3e6d35b37328330015c914935f096390cb92d93981fe0bc2e186ab46960b8fcc`; real parser-derived `manifestDigest`: `64c9fc59c127993afffd0a1113d4b7903c4d9743992818a396353b8d7acb8657`. Parsing for this check installs no frozen TaskGraph authority.
- Full-tier lint: **all 16 dirty TypeScript source/test files passed**, zero violations/errors, using this Loom package's default rules; no project-local rules exist and none were created/disabled. Log: `/tmp/loom-verification-final-lint.log`.
- Config checks passed: package/source-manifest JSON, TypeScript-parsed JSONC config, actual CI YAML parsing, all four CI Bash bodies and prerequisite Bash syntax, and manifest examples matching installed source. Log: `/tmp/loom-verification-final-config.log`. An initial strict-JSON probe incorrectly treated the existing commented tsconfig as JSON; the corrected probe uses TypeScript's actual JSONC parser, with no config edit.
- Final document/command/CI contract check: `npm --prefix engine run test:unit -- tests/runbook-contract.test.ts tests/verification-command.test.ts tests/verification-ci.test.ts`; **3 files / 38 tests passed**, no exclusions. Re-executed after the final Plan edit; log: `/tmp/loom-verification-final-document-tests.log`.
- Whitespace validation covers tracked and cached diffs plus the entire untracked Plan as an added file, without staging. The new Plan uses no Markdown trailing-space hardbreaks. The earlier unrelated Fugue Plan hardbreak false-positive is not a reason to relax whitespace checking or edit historical files. For `git diff --no-index --check`, exit 1 with no diagnostics denotes the added-file difference, not a whitespace defect; an initial probe incorrectly rejected that status and was corrected without changing content.
- Final candidate inventory: `/tmp/loom-verification-candidate.json`, covering source and documentation from NUL-delimited Git tracked/nonignored-untracked listings plus HEAD paths for deletion markers; `.claude/reviews`, `.claude/state`, and Pi equivalents excluded. This is byte evidence, not review approval or an installed verified index. The final-pass report records inventory/stability hashes.

### Final adjudicated remediation validation

The pre-code dispositions above are now implemented or evidence-closed:

- `silent-failure-hunter-1`: empty teardown catch removed; `recursive: true, force: true` unchanged. All 34 dispatch tests pass, including cleanup-lock failure and absent/present/unbound-session isolation. Missing files remain benign through `force`; other `rmSync` errors now fail teardown rather than disappearing.
- `silent-failure-hunter-2` and `silent-failure-hunter-3`: actual documented snippets now emit actionable stderr and exit 1 at their existing preflight boundaries. New `engine/tests/command-preflight-contract.test.ts` executes those exact extracted snippets with isolated cwd/HOME/PATH, disabled shell startup inheritance, and fail-fast executable sentinels; no engine bootstrap, runtime receipt, or network installation is exercised or claimed. Five cases cover missing/present Bun and absent/incomplete/CLI-present package paths (including spaces).
- `pr-test-analyzer-1`: eleven new cases in the existing readiness file cover run, Wave, revision, registration authority, manifest digest, suite digest, missing project check, same-size wrong roster, omitted required report, wrong report path, and unexpected reserved-check report. Every case first proves a real evaluator-produced, parser-accepted canonical receipt passes readiness, then recomputes only mutated receipt integrity and requires real parser success followed by `accepted-suite-invalid`, failing gate check, and refused completion commit. No fake passed readiness evidence substitutes for the parser/authority path.
- `pr-test-analyzer-2`: dismissed after executing the existing digest-tamper assertion and canonical positive rehydration property unchanged. The complete compiler gate includes `engine/tests/core/verification-manifest.property.test.ts`; its existing compiled assertion at lines 321–333 mutates only `manifestDigest` to `digest("f")` and refuses it through the actual parser. No new support path or duplicate test for this already-covered case.
- Both type-design advisories remain explicitly deferred for the reasons recorded before edits. Production manifest/readiness APIs and persisted schemas were not changed. No production defect surfaced that required broader scope.

Measured gates:

1. Pre-edit baseline: **3 files / 67 tests passed** (`/tmp/loom-verification-adjudicated-baseline.log`).
2. Tests-first shell proof: **3 expected failures / 31 passes** (`/tmp/loom-verification-adjudicated-tests-first.log`): missing Bun exited 0; absent/incomplete packages exited silently. All 11 new receipt mismatch cases already passed unchanged production.
3. Focused closure including existing isolation, manifest, readiness, runbook, command and CI tests: **8 files / 450 tests passed**, no exclusions (`/tmp/loom-verification-adjudicated-focused.log`). Separate typecheck passed with the same 16 explicitly reported upstream-unused exclusions (`/tmp/loom-verification-adjudicated-typecheck.log`).
4. Distill apply mode used that green baseline. **One catalog move applied:** collapsed two test-only preflight pass-through wrappers, keeping extraction/execution guards and all assertions. Re-ran **5/5** covering cases (`/tmp/loom-verification-adjudicated-distill.log`). Skipped exported-type/schema redesign, broad façade changes, generic fixture frameworks, and duplicate manifest tests: outside scope or already covered. No new deepen session is needed for this closure.
5. After the final test-code edit, **unfiltered root `npm run verify` exited 0: 249 files, 7,567 tests passed, 1 existing Darwin-only skip; Vitest 190.32 seconds**, compiler and all six smokes in the same invocation (`/tmp/loom-verification-adjudicated-verify.log`). Architecture panel **22/22**, refutation panel **19/19**, standalone review, orchestration façades and real Pi discovery **PASS**, task-graph validation **23/23**. Both canonical live graph paths were absent; **no new active-graph run** was performed. The earlier parent's true-active run is not relabeled as this run.
6. Full-tier lint: **17 changed TypeScript files, 0 violations/errors**, owning package defaults, no project-local overrides (`/tmp/loom-verification-adjudicated-lint.log`). No linter/compiler policy was relaxed.

Closing post-Plan document checks, exact source/document byte inventory, support-path roster, log hashes and before/after preservation evidence are recorded in `/tmp/loom-verification-adjudicated-remediation.md`. The sole new support path beyond the original registered 29-path scope is `engine/tests/command-preflight-contract.test.ts` (30 total feature paths). The existing manifest property test was executed, not modified. These records are verification evidence, not an installed verified index or a new formal review result.

### Remaining parent workflow

The authoritative registered review remains immutable with **1 surviving critical, 6 advisories, 0 refuted criticals**; this Plan records implementation closure, not a forged replacement review outcome or formally resolved Finding. No new formal review is requested for this adjudicated tests/docs-only closure. Proceed to the parent-owned exact verified-index/publication gates rather than reopening an indefinite review loop. GitHub-hosted CI, macOS validation, and runtime Wave acceptance are still unclaimed. Protected manifest/State File/Run artifacts, index, HEAD and safety stash were not modified by this remediation.

## Rebaseline safety and simplification bounds

Retain stash **`ad9053aefb22563a999341099598d315fafe8806`** and `/tmp/loom-verification-pre-update/` as safety material until parent-approved removal. The stash was applied, not popped; it is not cleanup debris.

Worker distill passes retained the shared coverage renderer and narrow compiler policy rather than introducing another runner/framework. Coverage reused immutable `toSorted`; isolation reused the fixed config URL. Broad façade/interface cleanup and persisted coverage were deliberately skipped. Documentation changes stay in the six current homes above; old plans/reconnaissance are historical evidence, not competing current instructions.

The earlier pre-review final distill apply-mode inspection covered every then-current feature modification: command/manifest/CI/compiler, coverage/readiness/population, isolated tests, and documentation. The green canonical parent run supplied the behavior baseline. **Zero additional code moves applied; only this validation record changed.** Retained the shared coverage renderer (real population/status/gate callers), diagnostic formatter/result constructor and partition (observable compiler diagnostics), immutable nonempty coverage union, and explicit absence/presence and process-order test controls. Shared fixture extraction, merging independent coverage/outcome states, generic runners, broad façade cleanup, and cross-document deduplication were skipped: they change seams, conflate distinct contracts, or trade local clarity for indirection. No assertion was weakened, no test path moved, and no out-of-request code was accepted. No interface redesign or new deepen session was warranted within this scope.
