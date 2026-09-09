# Priority 3 — Defect-Family Accounting

## Status and decision

**Implementation status:** initial implementation and adjudicated repair batches A/B/C1/C2/D are implemented and locally verified in the candidate worktree, based on `b9fa2239da60837cc391bfbef6e80f529f71d944`. The single registered review is complete; local verification does not create a Resolved Finding or another adjudication. No live installation, publication, hosted-CI, or merge is claimed.

The user selected the bounded evidence floor: **repair-checked**, never proven closure. Historical RED and semantic claims remain explicitly `DECLARED`; repaired tests must be `ENGINE_OBSERVED`. No new full reviewer roster is required after each repair.

Focused design check: `/tmp/loom-defect-family-design-check.md`. Implementation provenance: `/tmp/loom-defect-family-core-implementation.md`, `/tmp/loom-defect-family-runner-implementation.md`, `/tmp/loom-defect-family-candidate-implementation.md`, and `/tmp/loom-defect-family-integration-implementation.md`. These are handoff/evidence documents, not live Run authority.

## Implemented contract

- Preserve the authoritative Standalone Review Run identity and copy every original surviving-critical Finding ID unchanged. Every such ID has exactly one repaired, unresolved, or out-of-scope disposition. A Declared Repair Group has its own identifier but never replaces or mints Finding identity.
- Keep advisory and refuted Findings outside critical accounting. Advisory accepted/deferred/dismissed policy is unchanged; refuted Findings are never repaired.
- Record `DECLARED` grouping, root cause, invariant, sibling accounting, and Historical RED for selected checks. Repeated sibling paths within one group are invalid; distinct groups may reuse one sibling path with compatible statuses and group-local reasons.
- `unresolved` and `out-of-scope` critical/sibling dispositions are valid declarations that block installation. All-unresolved accounting with `groups: []` is valid and blocked, not malformed.
- Every new schema-v2 remediation input requires `defectFamily`, including explicit `{ "kind": "not-required" }` when the source has zero surviving criticals. That arm requires no manifest or subprocess.
- Critical repairs select fixed commands only from the operator-owned Verification Manifest and require exact `required-file` report paths. Declaration prose supplies no executable, argv, cwd, process outcome, report bytes/counts, or pass status.
- Require a new exact JUnit/Vitest report after removing the old ignored/untracked regular report via no-follow, descriptor-relative unlink anchored to its Linux parent. Touching seeded bytes cannot pass; identical fresh rewrites may. Strict critical reset is Linux-only and Darwin fails before launch; zero-critical remediation and Wave behavior are unchanged. Require normal zero exit, no timeout/signal, positive executed count, zero failures, and unchanged candidate authority in proper `standalone-remediation` scope.
- Bound reports to 8 MiB and XML element depth 128. Bound v2 encoded journals to 12 MiB per event, 64 MiB aggregate, and 1024 records on retained reads, append reconciliation/new appends, and CLI inspection, before oversized decoding/JSON parsing. These are not blanket Run artifact or legacy journal limits. An operator-owned fixed command can still fabricate a valid new report; structured fresh engine observations are not semantic proof.
- Bind registered observations to exact candidate bytes, modes, path roster, HEAD/index witness, source publication, frozen check authority, temporary staging, and the under-lock installation recheck. Only selected ignored/untracked report files are excluded from candidate hashing.
- Mint opaque installable authority only for `repair-checked` or `not-required`. The external schema-v2 `done` action contains the Git adapter's actual nested installation receipt beside the Defect-Family Assessment; callers do not submit staging outcomes, manifests, receipts, events, or Run JSON.
- Completed schema-v1 runs remain read-only with `historical-unknown`, returning the old receipt without reinstalling; unfinished v1 runs block and require a fresh v2 run. Missing v2 fields never downgrade to v1. Source Standalone Review publication remains immutable and does not gain a retroactive P3 assessment. Completed-v2 audit-path arrays are parsed before assessment; missing/malformed arrays yield the explicit checkpoint audit-path diagnostic, never empty-array fallback.

## Applied architecture moves

1. **Pure aggregate and parse-don't-validate authority.** `engine/src/core/defect-family-accounting.ts` owns exact source inventory, declarations, accounting, candidate/check binding, assessment, and opaque installability. Illegal cross-source and structurally forged states do not cross its constructors.
2. **Functional core / imperative shell.** `engine/src/core/structured-test-report.ts` owns byte-to-count semantics; `engine/src/orchestration/completion-check-runner.ts` owns process containment and stable report observation; `engine/src/orchestration/remediation-candidate.ts` owns read-only repository capture.
3. **Versioned installation proof.** `engine/src/core/remediation-machine.ts` propagates assessment/candidate authority; `engine/src/orchestration/git-remediation.ts` consumes opaque schema-v2 installation authority and rechecks it under the real index lock. See [ADR-0008](../../docs/adr/ADR-0008-versioned-defect-family-installation-authority.md).
4. **Per-program façade locality.** `engine/src/handlers/helpers/programs/remediation-registration.ts`, `remediation-events.ts`, and `remediation.ts` own strict v1/v2 registration, durable engine-event replay, source reauthentication, and sequencing. No generic driver or root task runner was added, consistent with ADR-0005.
5. **Preflight before run creation.** `engine/src/handlers/helpers/orchestration.ts` prepares remediation before calling `createRunDirectory`; invalid input creates no run, while failures after registration return durable blocked run evidence.
6. **Read-only historical projection.** `engine/src/core/run-inspection.ts` authenticates current terminal labels and distinguishes `repair-checked`, `repair-check-not-required`, and completed-v1 historical unknown.

## Final implementation paths

Production paths implemented:

- `engine/src/core/defect-family-accounting.ts`
- `engine/src/core/structured-test-report.ts`
- `engine/src/core/remediation-machine.ts`
- `engine/src/core/run-inspection.ts`
- `engine/src/machine/test-report.ts`
- `engine/src/machine/types.ts`
- `engine/src/orchestration/completion-check-runner.ts`
- `engine/src/orchestration/remediation-candidate.ts`
- `engine/src/orchestration/git-remediation.ts`
- `engine/src/utils/workspace-digest.ts`
- `engine/src/handlers/helpers/programs/remediation-registration.ts`
- `engine/src/handlers/helpers/programs/remediation-events.ts`
- `engine/src/handlers/helpers/programs/remediation.ts`
- `engine/src/handlers/helpers/programs/helpers.ts`
- `engine/src/handlers/helpers/programs/index.ts`
- `engine/src/handlers/helpers/orchestration.ts`
- focused purity/lint integration and orchestration smoke updates already present in the worktree.

Test/support paths implemented:

- pure unit/property accounting tests;
- structured-report and actual-process runner tests;
- real-Git candidate, temporary-index, under-lock drift, and façade integration tests;
- completed/pending schema-v1 compatibility and run-inspection tests;
- shared verified-installation fixture and smoke coverage.

User-facing paths finalized in this docs phase:

- `README.md`
- `docs/operations.md`
- `docs/workflows.md`
- `docs/deterministic-implementation.md`
- `docs/adr/ADR-0008-versioned-defect-family-installation-authority.md`
- `docs/README.md`
- `skills/review-and-fix/SKILL.md` (v4.0.0)
- `CONTEXT.md` (modest parent-added current terms retained)

`commands/review-pr.md` remains unchanged because it documents standalone review only, not remediation. `commands/review-and-fix.md` remains a thin delegate to the versioned canonical Skill and therefore needs no duplicate workflow.

## Deliberate boundaries and operator state

No reviewer wire/severity change, cross-run Finding lineage, general dual-snapshot executor, TaskGraph/Wave receipt rewrite, speculative port/framework, automatic semantic-group confirmation, or extra reviewer per group was added.

The protected `.loom/verification-manifest.json` is deliberately unchanged. Its only project check, `project:verify`, has `report.kind: "not-required"` and is ineligible for critical P3. Operator enrollment requires an explicit approved replacement outside this agent implementation, using a real fixed command that produces an exact ignored/untracked `.loom/completion-reports/...` JUnit/Vitest report. The existing `write-verification-manifest` helper is create-only, requires an idle empty TaskGraph, and refuses overwrite; it is not an update path. Existing populated TaskGraphs retain frozen old commands. Standalone remediation itself has no TaskGraph requirement.

The active plugin checkout/runtime at `/home/peterstorm/dev/claude-plugins/loom` remains untouched by the implementation/documentation batches. No live State File, Run Directory, index, or runtime authority was mutated by those batches. Any main-checkout stash remains deferred until the safe `/reload` boundary. After external validation, the currently admitted CLI and loaded Skill 3.1 may review/install this feature under their existing protocol; parent owns that registered installation/publication. Such a completed v1 bootstrap becomes read-only historical-unknown after reload, not this feature's own v2 repair-checked publication. New live P3 requires `/reload` or restart and must never be forced by unsetting Pi/runtime admission variables.

## Original validation provenance (superseded baseline, preserved)

The original implementation integration report records the pre-review/pre-repair baseline:

- `npm run verify`: 253 test files passed, **7,624 tests passed**, 1 pre-existing skip, all six smoke components passed;
- `npm --prefix engine run typecheck`: passed with the unchanged 16 excluded upstream `@fuguejs/framework` unused diagnostics and no project diagnostics;
- full-tier lint: 498 files, 74 existing whole-tree violations in 29 files; changed-file violations were the same three pre-existing `max-function-lines` findings as the HEAD-byte baseline, so P3 added zero lint debt;
- `git diff --check`: passed.

Those counts and `/tmp/loom-defect-family-final-validation.md` describe the original candidate, not the repaired final tree. Its then-READY and review-pending statements are historical, not current acceptance evidence. The resumed-D section below records the final code gate (258 files / 7,858 passing tests); final documentation contracts, links, and parsed examples are recorded separately in `/tmp/loom-defect-family-final-docs.md`. All earlier reports and interrupted/recovery evidence remain preserved.

## Review and publication

Canonical registered review: `2026-09-08-defect-family-accounting`, `result.json` SHA-256 `f163d8133d05b3591d0744e5cbeab9391a46fe24fbfba5eccc97db614b7b34e1`. Both criticals were unanimously upheld by reproduction/intent/security; zero were refuted. Preserve source IDs below (the panel additionally qualifies them with `standalone-review:`).

| Finding ID | Disposition | Repair obligation |
|---|---|---|
| `code-reviewer-1` | Mandatory, implemented; locally verified (A) | Structural JUnit parsing; comments/CDATA/malformed XML cannot authorize execution. |
| `code-reviewer-2` | Mandatory, implemented; locally verified on Linux (C1) | Remove the exact authorized old report safely before execution; touching stale bytes cannot establish freshness. |
| `code-reviewer-3` | Accepted, implemented; locally verified (C1/D) | Bounded report capture/persistence/replay plus retained journal reads, append reconciliation/new appends, and CLI inspection before oversized allocation/decoding. |
| `silent-failure-hunter-1` | Deferred | Pre-existing numstat/reviewer-scope classification, not a demonstrated P3 admission defect; separate review-contract scope. |
| `silent-failure-hunter-2` | Accepted, implemented; locally verified (B) | Only ENOENT is absence; surface other repository-read errors. |
| `silent-failure-hunter-3` | Accepted, implemented; locally verified (D) | Parse terminal audit-path shape before assessment; no empty-array fallback. |
| `type-design-analyzer-1` | Accepted, implemented; locally verified (B) | Versioned installation ADT with required v2 authority and read-only v1 history. |
| `type-design-analyzer-2` | Accepted, implemented; locally verified (B) | Prove candidate membership before property access or recapture I/O. |
| `type-design-analyzer-3` | Accepted, implemented; locally verified (A) | Freeze parser-minted report summaries. |
| `architecture-tech-lead-1` | Accepted, implemented; locally verified (D) | Deepen aggregate commands to own accounting joins and installation assessment ceremony. |
| `architecture-tech-lead-2` | Accepted, implemented; locally verified (C2/D) | Executable purity closure for the new core, without broad I/O waivers. |

Total: two mandatory repairs and eight accepted advisories now have implementation/local verification evidence; one advisory remains deferred. No reviewer roster was restarted. Commit, engine-installed verified index, push, hosted CI, exact-head merge, and durable publication evidence remain pending.

### Interrupted-worker recovery (2026-09-09)

The unpinned worker fell back to local GLM and exhausted its context. It corrupted `structured-test-report.ts` and prematurely described all repairs as fixed in this Plan. Those statements were not verification evidence. Both damaged files were preserved under `/tmp/loom-defect-family-recovery/`, then restored from frozen review copies matching the pre-review inventory. The restored parser hash is `89324f5c00b14c0caaef4150b6719b80d04bdeaac125685126a1681c6da200d9`; all four independent frozen copies agree. Whole Git-visible comparison established that only the Plan and the `engine/package.json`/`engine/bun.lock` addition of pinned `saxes@6.0.0` differed after recovery. The dependency addition is retained for the planned structural parser repair, not claimed as its completion.

Cloud-session generic workers now explicitly inherit their parent model; local-parent rules and registered reviewer declarations are unchanged. Recovery typecheck and the existing parser/accounting tests passed. The earlier full gate is a baseline, not evidence for unfinished adjudicated repairs.

### Resumed D integration — verified candidate, not publication

The resumed cloud batch preserved all partial changes and first reproduced the interrupted state: compiler failure from removed constructors still imported by tests; focused baseline 15 failures / 63 passes. Tests were migrated to the actual aggregate seam rather than restoring the wide API.

- `prepareDefectFamilyAccounting(source, declaration)` owns the exact source/declaration join and canonical selected-check/sibling projections. `prepareDefectFamilyVerification(accounting, manifest)` consumes that aggregate. `evaluateInstallableDefectFamilyAccounting(plan, candidate, auditFacts, observations)` owns path projection, assessment, and opaque minting. Preflight, registration replay, terminal inspection, and installation drive use these commands; old intermediate constructors are not exported. Emitted declarations were inspected as well as source.
- Completed v2 audit arrays are shape-parsed before event assessment, never defaulted to `[]`. Missing/null/object/string/non-string-array corruption yields an explicit checkpoint audit-path diagnostic; real fixture indexes remain unchanged on refusal.
- Parser-minted, immutable `RunEventResourcePolicy` applies to v2 remediation replay, append reconciliation, and CLI inspection's event-tail read. Limits: **12 MiB encoded event file, 64 MiB aggregate journal, 1024 records**. Retained-fd reads reject oversize before allocation/JSON parsing, cap reads during growth, and bound directory enumeration including lock recovery. Default/legacy journal users are not silently capped. Tests cover real sparse oversized files, small-budget aggregate/count/append failures through the actual façade, bounded concurrent append/dedup, and lock cleanup when post-claim enumeration exceeds its budget.
- `no-cross-boundary-imports.perFileAllow` adds only `engine/src/core/structured-test-report.ts` → `saxes`. The C2 executable closure additionally rejects direct imports by other core modules, SAX subpaths/lookalikes, xmlchars roots, and I/O; no whole-core package/Node wildcard was added.
- Distill: deleted redundant declaration/source bookkeeping now guaranteed by prepared aggregate membership; reordered the event module's imports. Covering tests stayed green after each move. A final scan after inspection wiring found no further worthwhile move.

Actual final code verification (`/tmp/loom-D-verify-final.log`): `npm run verify` passed — **258 files, 7,858 tests passed, one pre-existing Darwin-only skip on Linux**, plus all six smoke components. Compiler passes with only the unchanged 16 excluded upstream raw-TypeScript unused diagnostics. Full-tier lint: **503 files, 74 existing violations in 29 files**; 44 changed source/test files have exactly the same three pre-existing max-function-lines findings as the 29-file HEAD-byte comparison. **Zero introduced lint violations.** `git diff --check` passed. No timeout increases, skips, or waivers were added.

C1 report reset is intentionally **Linux-only**: Darwin fails closed before launching a remediation check because the existing pathname adapter cannot prove descriptor-relative destructive reset. These results do not claim Darwin remediation success; parent documentation/publication work must retain that limitation.

Batch provenance: `/tmp/loom-defect-family-{parser,type,report-boundary,purity}-repair.md`; final D report: `/tmp/loom-defect-family-final-integration-repair.md`. Canonical review result SHA remains `f163d8133d05b3591d0744e5cbeab9391a46fe24fbfba5eccc97db614b7b34e1`. All Git installation/journal mutation tests used disposable fixtures. No live authority, protected manifest, real index, main runtime, stash, staging, commit, or publication was changed.
