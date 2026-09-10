# P4 registered-check fixture isolation follow-through

Status: initial publication `e8c8065` was repair-checked; PR #49 hosted CI failed. Bounded fixture corrections are unpublished and require final validation plus a fresh registered installation. This ordinary Plan is not Run authority or an execution receipt.

## Preserved source and failed Run

- Branch: `feat/reviewer-protocol-v2`, base `224f0d74373ddab619c1620738c5ba4fa6b44e0e`.
- Original review: `2026-09-10-reviewer-protocol-v2`; canonical result SHA-256 `f5b98fd121e324b323f902c2028fdba40406e0dce4f9155be702eb580c390d6d`. Its two critical IDs and eleven advisory dispositions remain exactly as recorded in the original P4 Plan; no new Finding or reviewer roster is created.
- Failed registered remediation: `remediation-20260910-reviewer-protocol-v2`. `project:verify` exited 1, without timeout or signal; candidate digests before/after match. No index was installed. Preserve this Run, including its observed event, unchanged; a fresh candidate requires a fresh Run.
- Retained event report: 2,106,609 bytes, SHA-256 `fda745cfff89d8b9ad8e81133a53b9a1074e3b5774d942fe7f01556e838df303`; extracted copy `/tmp/loom-p4-registered-failed.junit.xml`.

## Observed failure and bounded correction

Two `upgrade-spec-trace` cases failed: the missing-abandonment test received the active-subagent refusal; the retirement-success test received an error without its old assertion displaying the reason. Source inspection establishes that the fixture did not select `LOOM_SUBAGENT_DIR`, so the fail-closed observation could read the shared default. It does not establish the precise historical interfering marker or prove that the second hidden error had the same cause.

Only `engine/tests/handlers/helpers/upgrade-spec-trace.test.ts` changes:

- Each shell fixture owns an empty roster directory inside its canonical temporary root.
- Per-test hooks capture and restore incoming state/roster environment values, including absence; cleanup never deletes a caller's pre-existing configuration blindly.
- Two regressions place a malformed roster in a separate **owned** ambient directory before fixture creation. The old fixture inherits it and fails; the repaired fixture preserves the intended missing-abandonment refusal or valid retirement success. No shared `/tmp/claude-subagents` content is altered.
- A separate negative oracle deliberately selects an owned malformed roster and retains the production fail-closed refusal. The original project-bound active-roster test and all sixteen original cases remain.
- No production guard, timeout, worker count, retry policy, enrolled command, report authority, or State File policy changes.

The original local RED log contains two discriminating assertion failures plus one transitional ENOENT from adapting the old active-roster test before the fixture directory existed. Do not count that third failure as a discriminating control. Original local reports remain preserved, including their incorrect environment-restoration claim; parent inspection caught the omission and added the actual restoration hooks.

## Delegation and independent checking

Bounded diagnosis, status drafting and the first fixture patch ran on actual `desktop-vllm/glm-5.3-flash-exl3-k4-vision-fp8kv-mtp-359k-v11.1:low`; parent session dispatch metadata confirms the declared/effective local route. Registered reviewer/model policy and the cloud-worker route were not changed. Parent independently checked source, diff, report provenance and local claims, corrected the teardown omission, and reran tests with the existing matching-identity PI-true child harness.

Parent validation: **85 tests across four suites passed**, including all 19 upgrade cases; canonical `npm --prefix engine run typecheck` passed; whitespace and unchanged real index checks passed. Logs: `/tmp/loom-p4-fixture-isolation-parent-tests.log`, `/tmp/loom-p4-fixture-isolation-parent-typecheck.log`. Final test-file SHA-256 at this checkpoint: `ef460982674a51a77ceaae11a4d2ce3765f365fdf044025d883787f992292b12`.

Distill apply-mode assessment after GREEN: no additional moves; keep the real isolation and negative refusal oracles. Broader fixture/ledger redesign is outside this repair.

## Registered follow-through observations

After this checkpoint, parent verification passed **8,621 tests, one inherited skip and all six smokes** on the 122-path candidate; actual JUnit was strictly parsed and candidate/index stability checked. The next Run, `remediation-20260910-reviewer-protocol-fixture-isolation`, independently observed the same 8,621 passing tests, normal zero exit, fresh report and unchanged candidate, but correctly **blocked installation** on sibling dispositions.

Parent declaration error: `checked-unmodified` had been assigned by comparing against the reviewed working-tree snapshot. Engine accounting checks dirty/staged status against the current repository/HEAD, so several unchanged-since-review feature files were still dirty. This is not a new test failure or a weakened engine rule. The corrected ordinary input must declare those modified candidate implementation paths `repaired`, preserve original critical IDs and root-cause/Historical RED declarations, and use a fresh Run. Both prior registrations/events remain immutable. No index was installed by either blocked Run.

## Remaining publication obligations

Run the unchanged full root `npm run verify` on stable candidate bytes; preserve and strictly parse its actual JUnit and all six smoke outcomes. Then start a **fresh** registered remediation using the original two declared repair groups and `project:verify`. Add this Plan and the test path to the six previously declared support paths. The failed Run must be explicitly superseded through the admitted facade, not edited, erased or replayed into a success. Parent owns guarded index installation and publication; no development log grants them.

Vault status and a 13-artifact selected-evidence checkpoint were updated on 2026-09-10. They correctly record implementation/review repairs and blocked installation, not DONE or repair-checked. Update them again only after actual new outcomes.

## Hosted CI correction and custody follow-through — 2026-09-10

The fresh `remediation-20260910-reviewer-protocol-publication` subsequently installed the 122-path candidate with `repair-checked`; head `e8c8065f8ad69ae92144b08c810d5546e4daa296` opened PR #49. The two earlier blocked Runs were explicitly superseded through the admitted façade, not rewritten. Push `34440262737` and PR `34440413691` then failed: 16 native fixture cases lacked owned Pi session identity, and two golden tests incorrectly demanded cross-encoder gzip-byte identity. The successful prior receipt authorizes only its old candidate.

Bounded test/support correction, no production changes:

- `engine/tests/fixtures/pi-session.ts` owns persistent per-repository UUID/session file/transport outside candidate bytes, uses the actual fixture runtime, and scopes/restores native cwd/environment after awaited completion or failure. Four helper cases cover missing/poisoned input, rejection, overlapping scopes and failed acquisition. Eight existing fixture/caller files reuse it; original admission refusals and production-path assertions remain.
- History tests retain both original compressed packs, their pinned storage hashes, all 90 logical files and strict decoding. Encoding twice in the same runtime remains byte-identical; stored and alternative gzip encodings must inflate to identical canonical container bytes. Two alternative-compression controls conserve every logical file while the pinned-storage reader still refuses alternate stored bytes. Differential Node/Bun evidence supports nonunique compression, not attribution of the precise hosted encoder mismatch.
- An initial root check passed 8,627 tests/one skip/six smokes but separately lost an older ambient binding. The historical deleter is still unattributed. A parent full-root syscall trace in an isolated mount namespace reproduced a concrete hazard without exposing real session files: the default cleanup-handler test deleted an owned stale replacement binding through the shadow `/tmp/claude-subagents` (PID 728654, trace line 421601, successful unlink).
- `engine/tests/handlers/session-start/cleanup-stale-subagents.test.ts` now invokes the actual default handler in a fresh awaited Bun child whose environment is owned before config import. It preserves passthrough/ELOOP diagnostics, proves selected stale data is swept, protects an unobservable symlink, and preserves stale data in another owned directory. Parent replaced the local patch's unnecessary PI-flag deletion with the shared owned-session fixture and strengthened byte/symlink oracles. Production TTL and cleanup remain unchanged.

The exact candidate union is **125 paths = 114 reviewed + 11 declared support paths**. Add `engine/tests/fixtures/pi-session.ts`, `engine/tests/fixtures/pi-session.test.ts`, and `engine/tests/handlers/session-start/cleanup-stale-subagents.test.ts` to the eight support paths above. This Plan remains the same existing support path. No new critical Finding or review roster is introduced. Preserve the two original Finding IDs/groups and all eleven accepted advisory dispositions from the original P4 Plan. Recompute sibling dispositions against current Git HEAD `e8c8065`, not the review snapshot: previously committed repairs are now `checked-unmodified`; current dirty fixture siblings are `repaired`. CI/custody support is not a fabricated additional product Finding.

Independent bounded validation: canonical compiler exit 0; 139 safe focused tests; full-tier lint raw exit 1 with the same 72 inherited diagnostics, zero introduced; all 90 logical files and original compressed bytes verified; source Review and 629 selected pre-existing source/Run files unchanged. Parent cleanup/helper check: 18 passes. Distill apply-mode assessment after GREEN: retain the shared ownership seam (removing it duplicates policy); no further interface redesign or speculative simplification. Local reports are not acceptance evidence by themselves.

Remaining gate: repeat unchanged `npm run verify` with owned shadow transport and deletion tracing, requiring stale shadow sentinel preservation; inspect its real JUnit and six smokes. Legacy tests may still write their own prefixes in the shadow default: do not claim zero ambient access. Then register a fresh remediation through admitted main CLI with unchanged `project:verify`, original source SHA and corrected declarations, verify the installed listing with `git ls-files --stage -z`, and only then commit/push and await both hosted checks. No real binding restoration, manual staging, review restart, timeout/worker relaxation or source-artifact rewrite is permitted.
