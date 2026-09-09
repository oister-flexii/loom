# JUnit verification enrollment — 2026-09-09

## Scope and authority

- Branch: `feat/verification-junit-enrollment`; base: `0bbab2a68feb5fe35e7788aef877fda81ae0b5f8`.
- This is the small explicitly user-approved enrollment follow-up before priority 4, not priority 4 implementation or a new verification framework.
- The user explicitly approved enabling JUnit on existing `npm run verify` and enrolling its required report. At a parent-verified idle boundary with no TaskGraph, the parent changed only `.loom/verification-manifest.json`'s `project:verify` report to `{ "kind": "required-file", "path": ".loom/completion-reports/verify.junit.xml" }`. The implementation Agent reads/tests that manifest but never edits it.
- This is operator-owned configuration replacement, distinct from runtime evidence. The existing `helper write-verification-manifest` is create-only, requires an empty loadable TaskGraph, and refuses different existing authority. It was neither used nor changed. Standalone remediation does not require a TaskGraph; existing populated graphs keep their frozen commands.
- Work is isolated in the new worktree. No live Run Directory, State File, primary loaded checkout, runtime source, or real Git index is changed by this implementation. No staging, commit, push, registered review/spawn, or live P3 mutator is performed here.

## Rationale and implementation

Reuse installed Vitest's built-in JUnit reporter rather than inventing a runner, writer, helper, or configuration mode. Append only `--reporter=default --reporter=junit --outputFile=../.loom/completion-reports/verify.junit.xml` to `engine/package.json`'s existing `test:unit`. npm runs that script from `engine/`, so the relative output resolves to the repository-root report. Preserve `env -u PI_CODING_AGENT`, `--testTimeout=15000`, and `--maxWorkers=4` exactly.

Root `npm run verify` still runs prerequisites, compiler, one complete Vitest invocation, then all six existing smokes, stopping on any failure. The manifest executable/argv/root cwd/Wave scope/1,800,000 ms timeout remain unchanged. Only `.loom/completion-reports/` is newly ignored; the rest of `.loom/` is not ignored.

JUnit reports only Vitest test facts, not compiler or smoke testcases. Normal zero exit of the complete fixed command additionally proves the compiler and all six smokes passed. A later smoke failure leaves a green unit report but still makes the root command nonzero. Focused unit commands can overwrite that file with focused results; file presence alone is not full verification. Critical P3 still requires the existing registered runner's fresh process/report observations on unchanged candidate bytes, positive executed count, zero failures, and all existing bounds. These development checks are not a live schema-v2 `repair-checked` result.

## Exact file scope

- Parent-owned operator change: `.loom/verification-manifest.json` (read-only to implementation Agent).
- Implementation: `engine/package.json`, `.gitignore`.
- Regression tests: `engine/tests/verification-command.test.ts`.
- Operational documentation: `README.md`, `docs/README.md`, `docs/operations.md`, `docs/workflows.md`, `docs/deterministic-implementation.md`, `skills/review-and-fix/SKILL.md`.
- Dated ADR follow-through only: `docs/adr/ADR-0008-versioned-defect-family-installation-authority.md`.
- Ordinary support plan: `.claude/plans/2026-09-09-junit-verification-enrollment.md`.

The historical `.claude/plans/2026-09-08-defect-family-accounting.md` and immutable historical reports remain unchanged. No FC/IS seam or public interface is redesigned; the tests reuse `freezeVerificationManifest`, `parseStructuredTestReportBytes`, and the existing composition fixture.

## Regression evidence and validation

1. Before edits, real root `npm run verify`: exit 0; 258 files, 7,858 tests passed, one existing Linux platform skip; compiler and all six smokes passed.
2. Baseline full-tier lint including tests: exit 1, 74 existing violations, zero scanner errors. Default scan excluding tests: exit 1, 71 existing violations, zero scanner errors.
3. New RED before production changes: `npm --prefix engine run test:unit -- tests/verification-command.test.ts`, exit 1; four expected failures and 11 passes. Exact script pin failed and three real installed-Vitest fixtures failed with missing root JUnit. A prior test-authoring mistake using source rather than frozen field names was corrected before this final RED witness.
4. Narrow GREEN: `npm --prefix engine run typecheck` and the same focused test command both exit 0; all 15 tests passed. Existing external raw-TypeScript unused diagnostics remain visible/non-fatal under unchanged compiler policy.
5. Real installed-Vitest cases execute the actual root/package scripts with a small nested fixture: two executed tests plus one skipped. Success gives exit 0 and zero failures; a real unit assertion failure gives exit 1 and one reported failure with no smokes; the last smoke's exit 17 remains nonzero despite an already-green unit report. Strict P3 byte parsing checks safe positive executed counts and report size below 8 MiB. Existing sentinel cases still cover every compiler/unit/smoke short-circuit and exactly one unit invocation, without an extra verification loop.
6. Distill apply pass on the green baseline: no moves applied; existing fixture/parser reuse and minimal reporter flags need no extra abstraction. No interface deepening or out-of-scope simplification is warranted.
7. Full canonical `npm run verify`: exit 0; 258 files, 7,861 tests passed, one existing skip (7,862 total), compiler and all six smokes passed. The actual root JUnit passes `parseStructuredTestReportBytes`: 7,861 safe positive executed tests, zero failures, below 8 MiB; declared JUnit total 7,862 minus one skip exactly reconciles with Vitest console counts. No budgets, skips, selectors, timeouts, or command scope were changed.
8. Full-tier lint including tests: exit 1, unchanged 74 baseline violations, zero scanner errors; exact violation delta exit 0, zero introduced. Touched-test full-tier lint: exit 0, zero violations.
9. `git diff --check`: exit 0. Every untracked source file, including this plan, also receives `git diff --no-index --check /dev/null <file>`: no whitespace diagnostics (raw exit 1 means a new-file difference). The generated root report is Git-ignored and untracked: `git check-ignore` exit 0; `git ls-files --error-unmatch` exit 1 as expected. Parent-owned manifest bytes remain unchanged by this Agent.
10. Detailed logs, final report byte count/digest, exact source hashes, validation exits, and implementation handoff are outside the repository in `/tmp/loom-junit-enrollment-implementation.md` and `/tmp/loom-junit-*`. These are development evidence only, not registered authority.

## Review and publication

The single registered review `2026-09-09-junit-verification-enrollment` is complete. All five issued reviewers returned zero critical and zero advisory Findings; no refutation panel was needed. Canonical `result.json` SHA-256: `22619aea74b057a82c361da6f0bb7f55c6f9f95d9a1bce515ceafa6e4069c58e`. The original publication remains unchanged. No Finding IDs, repair groups, Historical RED authority, or process/report receipts were invented. The RED above is development evidence, not engine-observed execution of a vulnerable P3 snapshot.

The parent next owns actual schema-v2 guarded installation using explicit `defectFamily: { kind: "not-required" }`, because this source review has no surviving criticals. That arm deliberately launches no repair check; the full-command/report validation above remains separately attributed. All 12 source paths were reviewed, so no extra support path is currently needed. Installation, publication, hosted CI, and merge remain pending; this Plan does not claim their completion.
