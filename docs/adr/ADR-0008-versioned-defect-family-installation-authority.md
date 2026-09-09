# ADR-0008: Version Defect-Family evidence at the verified-index installation seam

## Status
Accepted

## Context

Standalone remediation previously authenticated a completed Standalone Review Run, audited paths, verified a temporary Git index, and atomically installed that index. It did not record whether every surviving critical Finding and declared sibling had been accounted for, nor whether repaired-state regression checks ran under engine observation. Adding those facts only to remediation prose or a terminal label would not strengthen installation authority: a caller could still reach the existing installer without them.

Historical runs also matter. Completed schema-v1 remediations are real installation facts and must remain readable, but they cannot retroactively acquire evidence that was never collected. Conversely, allowing an unfinished v1 run to continue through the old installation path would create a grandfathered bypass after the new evidence floor exists.

The bounded evidence available here is intentionally narrower than semantic closure. Grouping, root cause, invariant, sibling completeness, and Historical RED come from declarations. The engine can observe repaired-state command execution and exact structured report bytes, but it does not execute a vulnerable historical snapshot or ask a new reviewer roster to prove every group.

## Options Considered

1. **Keep one unversioned installation shape and add a terminal label**
   - Pros: smallest schema change; historical and current runs share one path.
   - Cons: the label is not installation authority; old or structurally forged state can be mistaken for current evidence; missing fields invite fail-open fallback.

2. **Require new evidence while rewriting or rejecting all historical runs**
   - Pros: one strict current interpretation; no compatibility branch.
   - Cons: rewrites immutable history or discards valid prior installation receipts; claims evidence that historical runs never produced.

3. **Version registration and installation authority, with asymmetric legacy compatibility**
   - Pros: current installation cannot bypass Defect-Family Assessment; completed history remains honest and readable; unfinished history cannot install; missing v2 fields fail closed.
   - Cons: parsers and inspection must retain explicit v1/v2 branches; completed legacy runs expose less information than current runs.

## Decision

**Adopt schema-v2 remediation registration and verified-index installation authority; preserve completed schema-v1 runs as read-only `historical-unknown` and block unfinished schema-v1 runs.**

Every new remediation start requires the exact `defectFamily` field, including `{ "kind": "not-required" }` when the authoritative source has zero surviving criticals. For critical work, the declaration accounts for every original surviving-critical Finding ID exactly once. Repair group IDs are separately named grouping identifiers and never replace or mint Finding IDs. Unresolved or out-of-scope critical/sibling dispositions are valid declarations but cannot produce installable authority.

Semantic fields retain `DECLARED` provenance: group membership, root cause, invariant, sibling accounting, and Historical RED. Selected repaired-state checks are resolved only from the frozen operator Verification Manifest and accepted only from registered engine events carrying fresh exact JUnit/Vitest report bytes, a normal zero exit, positive executed count, zero failures, and unchanged candidate authority. The bounded successful assessment is `repair-checked`, not proven closure or `ResolvedFinding` status. An operator-owned fixed command can still fabricate a syntactically valid new report: observing fresh structured bytes is not proof that tests exercised the declared semantics.

Before a critical check launches, the shell removes the exact old ignored/untracked regular report via no-follow, descriptor-relative unlink through its retained Linux parent descriptor. The command must create a new report; touching seeded bytes is insufficient, while identical fresh bytes remain legal. Unsafe or unsupported reset fails before launch. This destructive reset is **Linux-only**; Darwin refuses before launch rather than rely on the pathname adapter's parent-swap race. Zero-critical remediation and Wave behavior are unchanged.

Reports are bounded to **8 MiB** and actual XML element depth **128**, including diagnostics. V2 remediation applies a checked resource policy to retained-event reads, append reconciliation/new appends, and CLI inspection: **12 MiB per encoded event, 64 MiB per encoded journal, 1024 records**, enforced before oversized decoding/JSON parsing with bounded enumeration. Report capture/persistence/base64 replay have their own pre-allocation bounds. This is not a whole-Run artifact or decoded-heap budget; default/legacy journal policy is unchanged.

Remediation preflight authenticates the source, parses accounting, selects fixed check authority, and captures the candidate before the requested Run Directory is created. The pure aggregate commands `prepareDefectFamilyAccounting`, `prepareDefectFamilyVerification`, and `evaluateInstallableDefectFamilyAccounting` own the source/declaration join, check selection, audit-path projection, assessment, and opaque minting. Callers cannot assemble authority from exported intermediate constructors. The pure core mints an opaque installable assessment only for `repair-checked` or `not-required`. `prepareVerifiedIndexInstallation` binds that assessment and the candidate witness into schema-v2 installation authority. `installVerifiedIndex` consumes that opaque authority, repeats candidate/Git/temporary-index checks under the real index lock, and returns the actual installation receipt. The external `done` outcome nests that receipt beside the Defect-Family Assessment; callers cannot submit either.

`VerifiedIndexInstallation` is a historical/current discriminated union: schema 1 carries separately nominal immutable history; schema 2 requires assessment, assessment digest, candidate witness, and candidate digest. The Git installer consumes only the current arm and re-proves runtime membership before property access or I/O. A completed schema-v1 checkpoint retains its existing receipt and projects `historical-unknown`. It is never rewritten or used to reinstall the index. An unfinished v1 run returns a block requiring a fresh v2 run. A record claiming schema v2 must contain and re-prove all v2 authority; malformed or missing v2 fields never downgrade to v1.

Completed-v2 replay parses both checkpoint audit-path arrays before event assessment; missing/malformed facts produce `remediation checkpoint audit paths are missing or malformed`, never empty-array fallback. An actual installation followed by checkpoint-recording failure retains its receipt and explicit installed-index diagnostic; it is not rollback evidence. Source Standalone Review schema/publication history remains unchanged and does not acquire a retroactive P3 assessment.

## Consequences

**Positive:**

- Defect-Family evidence is an installation precondition rather than an advisory terminal annotation.
- Source Finding identity, operator command authority, exact report bytes, candidate bytes/modes/path roster, and installed index are joined by one versioned authority chain.
- Historical truth is preserved without retroactive evidence claims.
- Zero-critical remediation remains possible without a Verification Manifest or subprocess while still using explicit v2 input.
- The design adds no synthetic Task/Wave, Wave receipt, dual-snapshot executor, or reviewer wire change.

**Negative:**

- New callers must always provide `defectFamily`; old three-field remediation examples are invalid.
- A failed repaired check or candidate drift requires a fresh immutable remediation run rather than reusing prior success.
- Critical P3 operation depends on operator enrollment of a required-file structured-report check. A `report.kind: "not-required"` command is ineligible.
- Pi must `/reload` or restart after package installation so the loaded runtime revision matches the schema-v2 mutator. Bootstrap review/installation of this feature may use the currently admitted CLI and loaded Skill 3.1 under their existing protocol **after external validation**; that completed v1 history is not this feature's own v2 repair-checked publication. No runtime-admission bypass is permitted.
