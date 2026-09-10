# P4 registered-check fixture isolation follow-through

Status: fixture repair independently checked; full candidate validation and fresh registered installation pending. This ordinary Plan is not Run authority or an execution receipt.

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
