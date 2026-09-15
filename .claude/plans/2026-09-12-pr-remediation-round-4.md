# PR 51 remediation plan — review round 4

## Authority

- Branch: `feat/standalone-lineage`
- Reviewed revision: `19c2a016873b7ae6a4b7113491af32d60f757e07`
- Source review Run: `.claude/reviews/review-and-fix-runs/run.p5-source-review-7`
- Canonical result digest: `9cf4077005db5d333fa743543e8f30ed1e0f7fd56569daef02202ad7729f4082`
- Canonical frozen scope: the exact 94-path `.scope` array in that immutable `result.json`
- Published result: 2 surviving criticals, 18 advisories, 0 refuted criticals

## Exact implementation scope

- `.claude/plans/2026-09-12-pr-remediation-round-4.md` (new support path)
- `docs/adr/ADR-0010-standalone-finding-lineage.md`
- `docs/operations.md`
- `engine/src/handlers/helpers/programs/standalone-successor-source.ts`
- `engine/tests/handlers/helpers/programs/standalone-successor-source.test.ts`
- `engine/src/handlers/helpers/programs/standalone.ts`
- `engine/tests/handlers/helpers/programs/standalone-successor-native.integration.test.ts`
- `engine/src/handlers/helpers/programs/standalone-source.ts`
- `engine/src/handlers/helpers/programs/standalone-disposition.ts`
- `engine/src/core/standalone-review.ts`
- `engine/src/core/context-packets.ts`
- `engine/src/handlers/helpers/programs/standalone-evidence.ts`

No other path may be changed by this remediation.

## Surviving-critical dispositions

### `code-reviewer-1` — repaired

- Repair Group: `group.successor-absent-path-confinement`
- Finding: an absent leaf beneath a symlinked parent is frozen as repository absence because ordinary `lstat` reports leaf `ENOENT` before any anchored no-follow parent traversal occurs.
- Root cause (`DECLARED`): The initial-absence branch treats `lstat` `ENOENT` as sufficient authority and bypasses the existing no-follow read adapter that validates every extant parent component.
- Invariant (`DECLARED`): Initial `ENOENT` establishes absence only after a zero-byte bounded no-follow read independently confirms the leaf is absent through a safe parent chain. A symlink/non-directory/unsafe parent, or a leaf that appears during confirmation, rejects source preflight.
- Siblings (`DECLARED`): none declared. Present source paths already cross `readRunBytesNoFollow`; this repair brings the only absent-source branch through the same anchored parent validation.
- Selected check: `project:verify`
- Historical RED (`DECLARED`): At reviewed revision `19c2a01`, `observeStandaloneSuccessorSource(["link/missing.ts"], ...)` returns an absent row when `link` is a directory symlink, while the no-follow reader refuses that parent. The new regression fails on that revision.
- Historical RED reference: `.claude/reviews/review-and-fix-runs/run.p5-source-review-7/result.json#code-reviewer-1`
- Panel: reproduction, intent, and security unanimously upheld.

### `silent-failure-hunter-1` — repaired

- Repair Group: `group.successor-source-snapshot-stability`
- Finding: a later source read can mutate an earlier already-accepted file, producing a torn multi-file snapshot because each path is stability-checked only immediately after its own read.
- Root cause (`DECLARED`): The observer discards each initial stat after constructing that path's row and performs no final whole-scope stability pass before reading HEAD and encoding authority.
- Invariant (`DECLARED`): The observer retains every initial presence/absence observation and, after all bounded reads, re-proves the entire ordered scope: present paths must retain exact stat identity and absent paths must remain anchored-safe and absent. Any drift rejects the whole observation before HEAD is requested or authority is encoded.
- Siblings (`DECLARED`): none declared. `observeStandaloneSuccessorSource` is the sole current-worktree source freezer; predecessor and replay readers consume immutable run artifacts through separate authenticated paths.
- Selected check: `project:verify`
- Historical RED (`DECLARED`): At reviewed revision `19c2a01`, a deterministic source adapter can overwrite file one while reading file two and still return an `ok` source section containing file one's stale bytes. The new whole-scope regression fails on that revision.
- Historical RED reference: `.claude/reviews/review-and-fix-runs/run.p5-source-review-7/result.json#silent-failure-hunter-1`
- Panel: reproduction, intent, and security unanimously upheld.

## Advisory dispositions

| Finding | Disposition | Reason / implementation |
|---|---|---|
| `silent-failure-hunter-2` | accepted | Preserve the bounded inspection exception text so checkpoint corruption, permissions, size, and filesystem-safety failures remain distinguishable while still failing closed. |
| `pr-test-analyzer-1` | accepted | Add direct fake-handle regressions proving issued-roster and captured-roster failures retain their distinct underlying diagnostics. |
| `type-design-analyzer-1` | deferred | Making review metadata opaque and scope-derived changes preparation, persistence, and legacy parsing and needs a dedicated migration. |
| `type-design-analyzer-2` | deferred | Branding `FinalPayload` changes the shared capture interface and recovery tests; parser ownership should be redesigned separately. |
| `type-design-analyzer-3` | deferred | The successor ingress parser already produces canonical `ReviewPath` values at runtime, but changing all exposed `files` signatures to branded non-empty collections is a broader API migration. This repair enforces confinement independently at the filesystem seam. |
| `type-design-analyzer-4` | deferred | Moving reviewer-role vocabulary to avoid a core import cycle requires a shared-kernel extraction and coordinated schema tests. |
| `comment-analyzer-1` | accepted | Replace the false linear-growth claim with the narrower guarantee that published-byte references avoid recursive packet embedding. |
| `comment-analyzer-2` | accepted | Correct the disposition lifecycle header and operations text to document registered and artifact-published write-ahead checkpoints before the final receipt-backed done checkpoint. |
| `comment-analyzer-3` | accepted | Document null rejection diagnostics as the supported generic-fallback case, not only as legacy compatibility. |
| `architecture-tech-lead-1` | deferred | Extracting the Trusted Review Witness Aggregate is a worthwhile Pi architecture project, not a local blocker repair. |
| `architecture-tech-lead-2` | deferred | Deepening the standalone helper seam requires cross-module lifecycle design and broad test movement; defer to a dedicated architecture pass. |
| `architecture-tech-lead-3` | deferred | Narrowing `boundedStandaloneReadHandle` changes several successor authentication interfaces and fakes; handle as a capability-design migration. |
| `code-simplifier-1` | accepted | Extract one private common reviewer-packet contract validator while retaining version-specific identities, diagnostics, and sealing. |
| `code-simplifier-2` | deferred | Splitting the large live driver is sound but high-risk around effect ordering and recovery; do it with a dedicated lifecycle refactor. |
| `code-simplifier-3` | deferred | Extracting refutation replay from evidence reconstruction is similarly effect/order-sensitive and not incidental to these blockers. |
| `code-simplifier-4` | accepted | Remove the two pass-through digest aliases and call `canonicalDigest` directly. |
| `code-simplifier-5` | accepted | Replace nested file-kind ternary with explicit branching before shared validation. |
| `code-simplifier-6` | accepted | Replace nested panel-outcome ternary with explicit missing/surviving/refuted branches. |

## Refuted-finding audit

No critical finding was refuted. Both source-observation findings were upheld by all three panel lenses: reproduction, intent, and security.

## Validation

1. Typecheck.
2. Targeted source-observation, context-packet, standalone-evidence/native, standalone-disposition, and successor integration tests.
3. Root `npm run verify` unchanged in a private `/tmp/claude-subagents` namespace.
4. Registered schema-v2 remediation sourced from `run.p5-source-review-7`, retaining both original finding IDs, both Declared Repair Groups, support path `.claude/plans/2026-09-12-pr-remediation-round-4.md`, and selected check `project:verify`.
5. Read success only from the registered action's verified-index installation receipt and `repair-checked` Defect-Family Assessment.
