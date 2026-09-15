# PR 51 Remediation Plan — Round 10 (post round-9 terminal-block recovery)

Source run: `run.p5-source-review-13` (schemaVersion 2, fresh run after round 9's
`run.p5-source-review-12` terminal-blocked on a misattributed attempt-2 capture).
**0 surviving critical findings; 15 advisories; 0 refuted.** No Refutation Panel
was convened (empty critical set); the refuted-finding audit is empty.

Round-9 lessons applied this round: agent↔task pairing verified by reading every
issued task file before spawning (round 9's mismatched pairing captured a wrong
transcript; the engine refused it terminally — attempt 2 is final, duplicate-capture
refuses a tombstone).

## Accepted advisories

### Accepted — `comment-analyzer-1`
- Claim: the `GIT_REVISION` comment cites the sibling boundary as
  `reviewedSourceSchema.headRevision` (packages/pi-goal loom-review.ts); that
  locator names no path in any current checkout.
- Reason for acceptance: comment-only; the substantive SHA-equivalence claim is
  verified true (the regex matches both sibling rules), so updating the locator
  keeps the comment's stated verification path direct.
- Fix: `engine/src/core/standalone-review.ts` — update the comment's locator to
  the resolvable sibling boundary path.

### Accepted — `code-simplifier` (bounded-cause helper)
- Claim: `MAX_CAUSE_TEXT`/`boundedCauseText` (256-char ellipsis truncation) and
  the structurally identical bounded-cause capture are duplicated between
  `pi/transcript-adapter.ts:488-512` and
  `handlers/helpers/programs/standalone-successor-registration.ts:22-44`,
  differing only in per-subject fallback messages.
- Reason for acceptance: one shared bounded-cause helper with the fallback
  message parameterized; both files are in the frozen scope and already import
  from `engine/src/core`. One bounded-cause concept: the 256-char budget and
  truncation shape can no longer drift between the two adapters.
  Behavior-preserving — identical truncation semantics and the same per-subject
  fallback messages.
- Fix: extract one shared bounded-cause helper parameterized on the fallback
  message; both adapters call it.

## Deferred advisories

### Deferred — `pr-test-analyzer-1`
- Reason: the v3 summary assertion is a test-only change, and the covering test
  file (`tests/handlers/helpers/programs/standalone-successor-native.integration.test.ts`)
  is outside the frozen scope (the changed-path union at HEAD is the seven source
  files plus this plan). Test-only parity work deferred as a separate change;
  coverage is verified present at the frozen HEAD via the shared `summaryData`
  v2 assertions.

### Deferred — `code-reviewer-1`
- Reason: `engine/src/cli.ts` stdin bounding on non-orchestration hook routes is
  outside the frozen scope (the changed-path union at HEAD does not include it);
  the authority-retaining routes are already bounded at 16 MiB per
  docs/operations.md. Deferred as a separate hardening change.

### Deferred — `silent-failure-hunter-1`
- Reason: `scripts/read-context-packet.ts` failure classification is outside the
  frozen scope; the fix (property-access name classification or echoing static
  input-free reasons) is a diagnostic-quality change in a file outside this
  round's remediation. Deferred as a separate change.

### Deferred — `type-design-analyzer-1` (decisionPublication discriminator)
- Reason: `engine/src/core/standalone-lineage-contract.ts` is outside the frozen
  scope; a named type-guard export beside the schema is a wire-shape change
  outside this round. Deferred as a deepening opportunity.

### Deferred — `type-design-analyzer-2` (successorSourceSnapshot schema)
- Reason: the dedicated snapshot schema export beside the selection schema lives
  in the contract module (outside the frozen scope); the in-scope site
  (`standalone-successor-source.ts`) consumes the bundled schema. Deferred with
  `type-design-analyzer-1`.

### Deferred — `type-design-analyzer-3` (standaloneLineageRowSchema refinement)
- Reason: the per-row strict-majority refinement belongs in the contract module
  (outside the frozen scope); the aggregate choke point already enforces it.
  Deferred as a deepening change.

### Deferred — `architecture-tech-lead-1` (packet builders parity)
- Reason: named per-attempt collections from both packet builders is a module
  interface redesign (deepen-session territory) affecting four shell call sites;
  outside this behavior-preserving round. Recorded as a deepening opportunity.

### Deferred — `architecture-tech-lead-2` (Phase A admission pure function)
- Reason: extracting one pure admission-decision function into the functional
  core is an interface/seam change (deepen-session territory); the current split
  is integration-tested and correct in both callers. Deferred as a deepening
  opportunity.

### Deferred — `code-simplifier-1` (snapshot schemas duplicate)
- Reason: `engine/src/core/standalone-lineage-contract.ts` is outside the frozen
  scope; the shared row constructor lives there. Deferred as a separate change.

### Deferred — `code-simplifier-2` (role allowlist duplicate)
- Reason: same out-of-scope file; the derivation must land in the contract
  module. Deferred with `code-simplifier-1`.

### Deferred — `code-simplifier-3` (denseArray diverged)
- Reason: the unification is interface-bound (the advisory itself recommends the
  deepen skill) and spans `remediation-machine.ts`, which is outside the frozen
  scope. The divergent corner is unreachable through supported JSON-parsed
  inputs, so no regression risk is established. Deferred as a deepening
  opportunity.

### Deferred — `code-simplifier-4` (canonical JSON-to-bytes triplication)
- Reason: the shared helper must land in all three sites
  (`standalone-review.ts`, `standalone-disposition.ts`,
  `standalone-disposition-source.ts`); two are outside the frozen scope, so a
  partial fix would leave the triplication. Deferred as a separate change.

### Deferred — `code-simplifier-5` (canonical-path refine duplicate)
- Reason: the refined canonical-path field export belongs in
  `reviewer-contract.ts` (outside the frozen scope). Deferred as a separate
  change.

## Refuted-finding audit

**Zero refuted criticals.** The Refutation Panel was not convened (empty
critical set); nothing to audit.

## Accepted advisory fixes (implementation scope)

All fixes are inside the frozen scope except the plan file:

- `engine/src/core/standalone-review.ts` — comment-analyzer-1
- `pi/transcript-adapter.ts` — code-simplifier (bounded-cause helper)
- `engine/src/handlers/helpers/programs/standalone-successor-registration.ts` — code-simplifier (bounded-cause helper)
- `.claude/plans/2026-09-15-pr-remediation.md` (this plan; new support path, NOT in reviewed scope)

## Validation

- `npm run typecheck` — baseline green at `7c20b1d`
- `npm run test:unit` — baseline 8887 passed | 1 skipped
- Root `npm run verify` (full gate: typecheck + unit + all six smokes), namespace-isolated
- Iterate to a real fix; stop without staging or committing if validation cannot pass

## Remediation registration (Phase 4)

Fresh remediation Run Directory; schema-v2 start input with exactly
`sourceRunsRoot`, `sourceRun`, `supportPaths`, `defectFamily`:

```json
{
  "sourceRunsRoot": ".claude/reviews/review-and-fix-runs",
  "sourceRun": "run.p5-source-review-13",
  "supportPaths": [".claude/plans/2026-09-15-pr-remediation.md"],
  "defectFamily": { "kind": "not-required" }
}
```

`not-required` because zero surviving criticals; the accepted advisory fixes are
verified by the full relevant test suites, and the registered runner observes no
selected check. Commit the installed index and push.
