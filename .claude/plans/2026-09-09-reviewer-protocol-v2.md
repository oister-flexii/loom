# Priority 4 — Reviewer Protocol v2

**Status: B0–B5 integrated in the feature checkout; fresh standalone/Wave registrations issue v2. B5 closed actual CLI inspection, Claude/Pi capture and native-to-P3 fixture paths; its final root run passed 8,473 tests with one inherited skip but correctly failed the then-obsolete B6 façade smoke. The subsequent storage-only packaging adds 105 tests while preserving all original logical evidence. B6 docs/ADR/current façade smoke are implemented; final root verification, strict report parsing, lint baseline comparison and stable candidate inventory are being recorded in `/tmp/loom-priority4-final-validation.md`. Do not infer a green final gate until that report records it. P4 source review, merge, publication and loaded-runtime cutover remain pending; no live Run is claimed. Handoffs: `/tmp/loom-priority4-{authority,standalone,wave,panel,native}-implementation.md`, `/tmp/loom-priority4-fixture-packaging.md`.**

The design-pass sections below retain their original proposed-API language and chronology; they are not current integration status. The status above and batch handoffs describe actual implementation; current operational authority is documented in ADR-0009 and the executable runbooks. The original design pass changed only this Plan and terminology, not code or runtime evidence.

## 1. Decision and scope

Adopt reconnaissance approach **B**: one versioned JSON reviewer payload, engine-derived counts, an impact-based blocking rubric, and unchanged refutation decision authority. Prompt-only correction does not remove redundant ingress; a severity-dispute decision would add authority the user did not approve. Neither alternative is part of this implementation.

A critical must identify a concrete consequence to supported behavior, safety/authority, an explicit acceptance/verification obligation, or safe operator use. Factual incorrectness, high confidence, style preference, architectural shallowness, or a missing test alone does not establish a blocking consequence. Explicit non-negotiable project obligations remain binding: identify the obligation and the delivery consequence, rather than using a score as a substitute.

The engine checks shape, issued identity, scope, complete roster, immutable evidence, and arithmetic. Filled-in fields do **not** prove truth, reachability, impact, execution, or adequate testing. These remain semantic judgments.

**Accepted limitation:** a structurally valid but weakly justified critical remains critical. The existing Refutation Panel assesses the assertion, including its stated preconditions/contract/consequence, using the same lens roster and majority. It must not refute a true assertion merely because fixing it seems unimportant. A surviving critical remains blocking and, for standalone remediation, requires P3 accounting. Parent disagreement is semantic disagreement, not a parser failure, automatic advisory conversion, or new settlement action. Existing explicit Wave operator overrides remain separate, as described in §8; they are not a new standalone severity authority.

Out of scope: Priority 5 lineage/successor ledgers, Priority 6 dual-snapshot executors, new reviewer roles, severity voting, generic program drivers, automatic advisory scope expansion, live review/retry/migration, or changes to P3 installation policy. ADR-0005 per-program drivers and ADR-0006 lifecycle projection remain binding. ADR-0008's refusal of unfinished **remediation v1** remains unchanged; it must NOT be copied onto unfinished **reviewer v1** runs.

## 2. Observed baseline and corrected reconnaissance

Read `/tmp/loom-priority4-design-recon.md` completely, then inspected the current checkout at `224f0d7` and actual readers. Main and this worktree both start at `224f0d7`. The ambient loaded runtime is `/home/peterstorm/dev/claude-plugins/loom`, revision `sha256:bf179868071bdeab682dddc9ec0368163aa47aceda9e1ce17bd98aa6385933c9`. Those remain untouched. Architecture, TypeScript, property-testing rules, architecture-tech-lead, deepen, code-implementer, and TypeScript-test skills were loaded; all eight current ADRs and CONTEXT were read. This pass is design, so no implementation/distill apply pass or test execution is claimed.

| Existing seam | Actual current behavior / required change |
|---|---|
| `core/context-packets.ts` | `ContextPacket` is schema 1; `packetIdentity` hashes request, role, Skill, free-text `outputContract`, and fixed/variable section identities. No typed reviewer descriptor. Preserve its v1 branch byte-for-byte. |
| `core/review-output.ts` | `resolveReviewFindings` arbitrates marker/block multisets, reconciles declared shortfalls into synthetic Findings; `resolveTaskReviewFindings` selects generation-bound vs unbound legacy parsing. Keep that algorithm exclusively for historical v1; add authority-selected ingress for v2. |
| `types.ts`, `core/findings.ts` | `DraftFinding`/`Finding` are interfaces; `makeDraftFinding` collapses whitespace and drops sentinels; stored parsers rebuild only four draft fields. Current v2 needs its own exact-string ADT arm, not optional critical evidence on the old interface. |
| `core/findings.ts:appendAttributedNewFindings` | Existing Wave code filters drafts matching any prior Finding's severity/claim/file/line. This is an additional dedupe seam beyond marker arbitration. Preserve it for v1 only; never silently discard current emitted entries. |
| `core/standalone-review.ts` | `FrozenStandaloneReviewAuthority`, `StandaloneReviewAggregate`, `AdjudicatedStandaloneReview` hard-code readonly schema 1. `aggregateCanonicalTranscripts` and `finalizeStandaloneReview` literally mint 1. Changing only a serializer is insufficient. |
| `core/standalone-review-machine.ts` | `parseAuthoritativeStandaloneReviewResult` reaggregates and re-finalizes before minting WeakSet-backed opaque result authority. `parseStandaloneReviewMachineState` takes only a publication resolver today; it needs independent Context Packet/registration resolution for reviewer protocol replay. |
| `handlers/helpers/programs/standalone.ts` | `replayStandaloneResultFromEvidence` replays witnessed bytes without trusting the checkpoint. Its admission, `scopePacketProblem`, retry selection, and panel preparation need the same protocol join as normal resume. |
| `handlers/helpers/programs/helpers.ts` | Owns registration parsing, `standalonePackets`, publication resolver, initial publication, and legacy retry task text. Preserve exact historical retry and packet reconstruction branches; new starts select v2 internally. |
| `core/wave-review-authority.ts`, `programs/wave-gate.ts` | Wave registration is schema 1. `prepareWaveReviewBatch` currently includes registration schema in slot identity and prepares spec-check plus five reviewer roles per Task. Retry sections have byte-exact legacy preamble/tail parsing. |
| `programs/wave-gate.ts:applyWaveFacadeSubmission` | The manual **registered submission** path joins request/context/epoch/Task/slot and applies review evidence under the StateManager lock. This is the manual reviewer ingress that must gain v2. |
| `handlers/helpers/store-review-findings.ts` | Contrary to the reconnaissance table, this is **not** a reviewer transcript parser: it is an explicit operator override. `updateTaskFindings` replaces findings and audits replaced records under `manual-override`. Preserve that separate authority, never route protocol-invalid reviewer output into it. |
| `handlers/subagent-stop/store-reviewer-findings.ts`, `pi/subagent-result.ts` | Non-façade historical Task routes still parse merged transcript text; the Claude reader polls for CRITICAL_COUNT. Registered v2 must use exact-final-payload capture and its registered settlement route, not this concatenating/polling path. |
| `core/review-panel.ts`, `core/panel-program.ts` | `BriefFinding`, snake_case brief serializers/parsers, and `parseStrictBriefFinding` retain only id/Task/agent/severity/location/claim. Every projection and replay must retain a versioned basis. Verifier verdict grammar and majority are unchanged. |
| `core/defect-family-accounting.ts` | Private `createSourceFindingInventory` accepts only opaque published LC-2 authority. `cloneFinding` explicitly copies old fields, dropping future basis; fix this. Inventory currently sorts partitions by ID; preserve that existing downstream ordering. |
| `core/remediation-machine.ts` | `parsedCanonicalStandaloneResult` requires exact schema-1 JSON keys, not just opaque membership. Extend source format acceptance to 2 without changing remediation schema or index authority. |
| `programs/remediation.ts:authoritativeSource` | Loads a done LC-2 checkpoint using the publication resolver, but not yet the independent protocol/context resolver. This is a mandatory production reader, not just a test fixture concern. |

Seven reviewer shims only: `code-reviewer`, `silent-failure-hunter`, `pr-test-analyzer`, `type-design-analyzer`, `comment-analyzer`, `architecture-tech-lead`, `code-simplifier`. Wave uses the first five. `skill-content-reviewer`, `security-agent`, spec-check, architecture designers/judges, and review-verifier are not reviewer-wire targets.

## 3. Exact current payload and Finding types

### 3.1 Public wire (proposed)

Exactly one UTF-8 JSON object, with JSON whitespace allowed around it. No code fence, narrative, Machine Summary, markers, numeric tallies, reviewer-supplied new Finding IDs, or second lifecycle object.

Standalone exact keys:

```json
{"schemaVersion":2,"kind":"standalone-review","findings":[]}
```

Wave exact keys:

```json
{"schemaVersion":2,"kind":"wave-review","packetId":"<issued SHA-256>","generation":0,"prior_findings":[],"findings":[]}
```

`ReviewerPayloadV2` is exactly the readonly discriminated union `StandaloneReviewerPayloadV2 | WaveReviewerPayloadV2`. The former has `schemaVersion:2`, `kind:"standalone-review"`, and `findings:readonly ReviewerDraftV2[]`; the latter has `schemaVersion:2`, `kind:"wave-review"`, `packetId:string`, `generation:number`, `prior_findings:readonly PriorFindingAssessment[]`, and `findings:readonly ReviewerDraftV2[]`. Bounded constructors prove the refinements below.

`packetId` and `generation` must equal the issued Task binding. `prior_findings` entries retain **exactly** the existing keys `finding_id`, `verdict`, `reason`; verdict is `resolved_by_remediation` or `still_present`. Every issued prior ID is present once in packet order. Empty roster requires an empty array. Standalone forbids these Wave-only fields. The payload version merely declares conformance; it never selects the decoder.

A critical draft's exact keys are `severity`, `file`, `line`, `claim`, `basis`. An advisory's exact required keys are `severity`, `file`, `line`, `claim`, `reason`; `basis` alone is optional. Optional does not mean nullable. Every nested object rejects unknown keys.

The following are proposed readonly wire types. Implement the bounded schemas in the new leaf `engine/src/core/reviewer-contract.ts` using existing Zod; infer public types from schemas, rather than keep an independent handwritten schema. The notation below defines the contract, not another implementation source.

```ts
type ReviewerEvidence =
  | Readonly<{
      kind: "reproduction";
      execution: "not-executed" | "reviewer-reported";
      setup: string;
      input: string;
      observed: string;
      expected: string;
      reference: string;
    }>
  | Readonly<{
      kind: "execution-trace";
      preconditions: readonly [string, ...string[]];
      steps: readonly [string, ...string[]];
      observed: string;
      expected: string;
      reference: string;
    }>;

type FindingBasis = Readonly<{
  evidence: ReviewerEvidence;
  violatedContract: Readonly<{ reference: string; statement: string }>;
  consequence: Readonly<{
    affected: string;
    preconditions: string;
    impact: string;
    evidenceLimits: string;
  }>;
  truthConfidence: number;
  severityRationale: string;
}>;

type ReviewerDraftV2 =
  | Readonly<{ severity: "critical"; file: string | null; line: number | null;
               claim: string; basis: FindingBasis }>
  | Readonly<{ severity: "advisory"; file: string | null; line: number | null;
               claim: string; reason: string; basis?: FindingBasis }>;
```

The six critical fields are **claim**, **evidence**, **violatedContract**, **consequence**, **truthConfidence**, **severityRationale**; the last five are grouped under `basis`, not a second claim copy. An optional advisory basis, if supplied, must be complete. `reason` is a concise nonblocking benefit/reason, not an obligatory full investigation.

Evidence is reviewer-reported. `execution: "reviewer-reported"` does not mint an engine receipt; `not-executed` must describe the observation as predicted, with the limit explicit. A concrete execution trace is valid without executing a repro. References are bounded text pointers, not executable commands or filesystem capabilities. No parser executes commands, fetches links, reads reference paths, or grants additional review scope. A contract reference may name a relevant document outside the file scope; the Finding's `file` must remain in scope or null.

### 3.2 Data bounds (fixed v2 contract)

- Final payload: at most **1,048,576 UTF-8 bytes**, checked before decoding/JSON parsing; nonempty, fatal UTF-8, reject BOM explicitly.
- JSON object/array nesting: at most **32** containers including the root, pre-scanned outside quoted/escaped strings before invoking recursive parsing.
- `findings`: at most **128** per reviewer; `prior_findings`: at most **4,096**. Fresh issuance refuses an unrepresentable prior roster before spawning; never truncate scope/history to fit.
- `claim`, advisory `reason`, `severityRationale`: 1–4,096 UTF-8 bytes; references and paths: 1–2,048 bytes; other narrative strings: 1–8,192 bytes. Whitespace-only strings fail; preserve accepted string contents exactly, including whitespace/line breaks. No sentinel filtering for v2: `findings: []` is the sole no-findings representation.
- `preconditions` and `steps` in execution traces: each 1–32 strings, with the ordinary narrative-string bound. All strings reject NUL and unpaired Unicode surrogates. Renderers escape control/formatting characters; stored strings do not undergo prompt sanitization.
- `truthConfidence`: finite number in [0,100], not an impact score; no severity formula or confidence threshold. Generation is a nonnegative safe integer; line is a positive safe integer or null. `file: null` requires `line: null`; located files may have null line. Paths must equal their canonical `parseReviewPath` representation and belong to the frozen scope.
- Failure diagnostics: one typed first failure, JSON-pointer-like `path`, bounded safe message (at most 2,048 bytes), optional byte offset. Never retain the dependency exception's embedded full input as diagnostic text.

These bounds limit **semantic payload admission**, not all harness transcript bytes, entire Run Directory size, total graph size, or whole-process heap. Raw capture still records original bytes under its existing rules before semantic admission. Do not claim a pre-capture allocation bound this change does not implement. Large genuine reports need more focused review, not silent truncation.

### 3.3 JSON dependency decision

No Loom-owned duplicate-key-rejecting general JSON parser was found. Zod only sees objects after duplicate members are lost. The original `json-bigint@1.0.0` proposal is explicitly **rejected**: its eager stringify dependency and first numeric parse initialize `bignumber.js`, whose initialization calls `Math.random()`, even with `storeAsString:true`. The independent design check records this discovery; its chronology remains unchanged.

Parent-approved M1 resolution: pin exact direct engine dependency `jsonc-parser: "3.3.1"` only after auditing its actual installed source/dependency closure for no entropy or I/O initialization. Its built-in declarations require no extra type package. The tiny adapter in `core/reviewer-protocol.ts` must:

1. Enforce byte/UTF-8/BOM/depth limits before grammar parsing or visiting.
2. Parse with native `JSON.parse` to enforce strict JSON grammar.
3. Run `jsonc-parser`'s `visit` on the same text with comments, trailing commas and empty content disallowed. Track decoded object member names in a separate `Set` per object; reject duplicates with the exact escaped path, including objects nested in arrays. Never use prototype inheritance as membership authority. Require successful visitation and no visitor errors; do not build an AST or use its fault-tolerant object parser.
4. Parse the native unknown object through the executable Zod 4.3.6 strict v2 schema and freeze the admitted value.

Native grammar and visitor must both succeed. This is not fallback: neither failure selects the other result. Native numeric values receive finite/safe-integer checks. The pre-scan only bounds nesting and respects JSON string escapes; it is not a new JSON grammar. No JSONC admission, repair, partial-json, last-key-wins, or generic parser framework. Tests cover escaped duplicate keys at every nested object level, prototype-shaped names, and strict grammar rejection.

B1's prerequisite purity audit pins exact consumed entrypoints and complete installed runtime closure bytes (including Zod parsing/schema generation), with deterministic import/parse sentinels and all existing entropy/filesystem/process/time negative controls preserved. Grants are only for actual consuming modules, never package-prefix/core-directory waivers. If the closure cannot meet this contract, stop and report unresolved rather than waive it. Pin JSON Schema generation options, including fail-closed unrepresentable handling; never use `unrepresentable:"any"`.

### 3.4 Attributed and historical ADT (proposed change in `types.ts`)

Rename the current four-field shape internally to `LegacyDraftFinding`, preserving its wire representation. Define:

```ts
type CurrentDraftFinding = ReviewerDraftV2 & Readonly<{ protocolVersion: 2 }>;
type DraftFinding =
  | (LegacyDraftFinding & Readonly<{ protocolVersion?: never; basis?: never; reason?: never }>)
  | CurrentDraftFinding;

type FindingIdentity = Readonly<{ id: string; agent: string }> & (
  | Readonly<{ review_generation?: never; review_packet_id?: never }>
  | Readonly<{ review_generation: number; review_packet_id: string }>
);
type Finding = DraftFinding & FindingIdentity;
```

`protocolVersion: 2` is **engine-added**, not allowed in reviewer draft wire JSON. It versions an individual durable Finding so a Wave may retain historical v1 priors beside new v2 entries. The shared `DraftFinding` name remains the aggregate vocabulary; the critical current arm cannot lack basis. Refuted/resolved records keep the whole original Finding.

`attributeFindings` remains the sole ID mint: agent + emission ordinal, never model IDs, similarity hashes, or cross-run identity. Preserve original new-entry ordering and explicit duplicates. For v2, `appendAttributedNewFindings` must not apply its historical prior-content filter. Existing exact contradictory `resolved_by_remediation` plus identical re-emission check may still refuse a whole response; it must never silently drop a draft. New entries equal to a still-present prior are retained with new IDs, while the prompt discourages redundant re-emission. Do not broaden this into semantic similarity detection.

V1 keeps normalization, sentinel behavior, multiset reconciliation, synthetic shortfalls, prior-content suppression, ID order, and all serializers. `viewOnlyClaims`/`recoverViewOnlyClaims` must also become version-aware: consume current Findings' exact claim occurrences from the raw derived view first, then apply existing whitespace-normalized legacy multiset reconciliation to the remaining legacy claims. Otherwise preserving a current multiline/space-rich claim would cause the old recovery function to mint a second legacy Finding from its own derived view. Keep exact multiplicity; never normalize or remint a valid current record merely because a legacy view helper used to do so. Current stored parsers dispatch on the Finding discriminator and preserve basis/reason exactly; malformed current entries cannot be reinterpreted as legacy by dropping fields. `fixTaskFindings` must refuse repair of malformed versioned Finding/basis authority before producing a repair candidate, rather than salvage it as a legacy four-field draft. Valid current records survive existing repair/override bookkeeping intact. Presence of `protocolVersion` selects version checking even when unsupported, null or malformed. Absence of that key together with reserved `basis` or `reason` is not ordinary legacy data and must not enter salvage. Dispatch before schema stripping; preserve unrelated historical unknown-field behavior. Test removed discriminator with retained basis/reason, unsupported/null discriminator, absent critical basis, unknown nested evidence, and malformed current records inside refutations/resolutions. Existing legacy salvage otherwise remains unchanged.

## 4. Issuance authority and shared API

### 4.1 Descriptor and frozen bytes

New leaf `reviewer-contract.ts` owns the closed descriptor type, v2 payload schemas, `ReviewerProtocolFailure` type, rubric bytes, and current example. It also owns the unchanged `STANDALONE_REVIEW_SUBJECT = "standalone-review"` constant, re-exported by `standalone-review.ts` for existing callers; `review-panel.ts` imports this constant directly from the leaf before standalone imports the shared current panel projection. This removes the otherwise introduced standalone ↔ review-panel runtime cycle. No filesystem imports or orchestration-driver imports. `types.ts` imports its types only. `context-packets.ts` can import its descriptor parser without importing Findings behavior; keep the runtime import graph acyclic.

Exact descriptor (proposed `ReviewerProtocolDescriptor`):

```ts
type ReviewerProtocolDescriptor = Readonly<{
  protocol: "loom-reviewer";
  version: 2;
  rubricVersion: 1;
  schemaDigest: ArtifactDigest;
  rubricDigest: ArtifactDigest;
}>;
```

`CURRENT_REVIEWER_PROTOCOL` (owned by `reviewer-contract.ts`) is derived once from the exact current schema/rubric UTF-8 bytes using the existing pure SHA-256 primitive; no handwritten digest. A change to schema or rubric bytes requires an explicit supported contract revision, never silently replace bytes under this descriptor. Fixed Context Packet section labels are `reviewer-payload-schema` and `reviewer-impact-rubric`. Schema bytes are the canonical, fixed serialization of the schema generated from the executable Zod definitions; rubric bytes are an engine-owned exact UTF-8 string. The descriptor digest identifies these exact bytes, not their meaning. New reviewer `outputContract` is exactly `Emit exactly one JSON object conforming to reviewer-payload-schema; apply reviewer-impact-rubric. No other final output.`

The initial `REVIEWER_IMPACT_RUBRIC_V1` bytes are the following text, with LF line endings and exactly one final LF; do not paraphrase it independently in shims:

```text
Classify one assertion per finding. Truth confidence concerns whether that assertion holds; it is not an impact score or a severity formula.

Use critical only for a concrete consequence to supported behavior, safety or authority, an explicit acceptance or verification obligation, or safe operator use that must block this delivery. Identify the affected party or system, supported preconditions, violated contract and evidence limits. Explicit non-negotiable project obligations remain binding; cite the actual obligation and consequence.

Factual incorrectness, high confidence, stylistic preference, architectural shallowness, or a missing test alone does not establish a blocking consequence. Use advisory for a nonblocking correction or improvement, with a concise reason or benefit. A fuller advisory basis is optional, but if supplied must be complete.

For a critical, provide the claim plus evidence or a concrete execution trace, violated contract, consequence, truth confidence, and severity rationale. A reproduction is not universally required. Do not claim execution merely because a command or reference is written down. Reviewer-reported execution is not an engine execution receipt; identify what was not observed or proved.

Use an honest null location rather than invent a file or line. Finding locations must be inside the frozen scope; references supply context, not permission to expand that scope. Assess every prior Finding ID exactly once in packet order when the issued contract requires it. Do not intentionally re-emit a prior Finding as new.

The engine validates structure, attribution, scope, identity, complete evidence and arithmetic. It does not prove truth, impact, reachability, or semantic test adequacy from these fields. Never invent new Finding IDs or numeric tallies; return only the one JSON object required by the issued schema.

The existing Refutation Panel may refute an assertion, including its stated preconditions, contract and consequence, but a true assertion is not refuted merely because its repair seems unimportant. A structurally admitted surviving critical remains blocking. There is no automatic severity downgrade or new severity-dispute action.
```

Schema generation uses fixed Zod JSON Schema output plus descriptions generated from the same bound constants for UTF-8-specific and cross-field constraints not expressible in ordinary JSON Schema. Those descriptions are part of the frozen schema bytes; do not claim JSON Schema alone executes scope/issuance joins. The executable parser remains authoritative and the issued contract tests exercise it.

Context Packet ADT:

- `LegacyContextPacket`: existing schemaVersion 1, unchanged keys/order/digest/serialization.
- `ReviewerContextPacketV2`: same base fields plus `schemaVersion: 2` and required `reviewerProtocol: ReviewerProtocolDescriptor`; `role` must be one of the seven reviewer roles; both fixed section labels must occur once with exact supported bytes/digests. Digest identity adds `reviewerProtocol` immediately after `outputContract`, before section arrays.
- `ContextPacket` is that union. Other roles continue schema 1. No wholesale switch of `CONTEXT_PACKET_SCHEMA_VERSION` to 2; retain its legacy meaning and introduce `REVIEWER_CONTEXT_PACKET_SCHEMA_VERSION = 2`.

Existing `buildContextPacket(input: ContextPacketInput)` remains the historical/non-reviewer schema-1 builder. Proposed `buildReviewerContextPacket(input: Omit<ContextPacketInput,"outputContract">): DomainResult<ReviewerContextPacketV2,ContextPacketError>` supplies current contract/sections internally; caller cannot request legacy. It rejects collisions with reserved section labels. Existing `parseContextPacket(raw)` and `contextPacketDigest` dispatch explicitly on the packet arm without routing schema 1 through the new builder. Historical retry derivation must preserve schema 1.

### 4.2 Registration and subject binding

New `RegisteredStandaloneProgram` and `RegisteredWaveGateProgram` arms have `schemaVersion: 2` and required `reviewerProtocol`. Standalone's `FrozenStandaloneReviewAuthority` also has schemaVersion 2 and the same descriptor, serialized as `schema_version` and `reviewer_protocol`. Registration, frozen authority, every reviewer packet, and descriptor digests must agree. Wave's core `WaveReviewRegistrationAuthority` receives the same v1/v2 union; protected current Review Run and accepted authority retain the descriptor under `reviewer_protocol`.

V1 registration omits the descriptor exactly; it is not `{version:1}` supplied through a start flag. Fresh `startStandaloneFacade`/`prepareFreshStandaloneReview` and `startWaveGateFacade` always choose current v2 in engine code. Existing input grammars remain unchanged and reject protocol-selection fields. V1 only comes from parsed durable historical registration/protected historical Review Run, never output sniffing, a caller hint, or failure fallback.

Use these proposed shared shapes in `core/review-output.ts`:

```ts
type ReviewerSubjectBinding =
  | Readonly<{ kind: "standalone-review"; runId: OrchestrationRunId;
               scope: readonly string[] }>
  | Readonly<{ kind: "wave-review"; runId: OrchestrationRunId;
               taskId: string; packetId: string; generation: number;
               priorFindingIds: readonly string[]; scope: readonly string[] }>;

type ReviewerProtocolRegistration =
  | Readonly<{ schemaVersion: 1; runId: OrchestrationRunId;
               program: "standalone-review" | "wave-gate"; reviewerProtocol?: never }>
  | Readonly<{ schemaVersion: 2; runId: OrchestrationRunId;
               program: "standalone-review" | "wave-gate";
               reviewerProtocol: ReviewerProtocolDescriptor }>;
```

`ReviewerProtocolRegistration` is an internal projection of an independently **read and parsed durable registration**, not public CLI input or an authority mint by itself. The shell constructs it only after parsing the whole registration and checking standalone frozen authority / protected Wave registration. Its fields alone prove nothing. The request's independently published Context Packet prevents a caller's schema-1 projection from downgrading a schema-2 request.

### 4.3 Exact proposed public seams

`DomainResult<T,E>` below is Loom's existing Either-shaped `ok/value | ok/error` vocabulary. `IssuedReviewerProtocol` is a nominal immutable v1/v2 × standalone/Wave ADT, with private runtime membership, not an exported structural constructor. Its exact public data fields are `request:AgentRequestAuthority`, `subject:ReviewerSubjectBinding`, and either `{protocolVersion:1,packet:LegacyContextPacket,reviewerProtocol?:never}` or `{protocolVersion:2,packet:ReviewerContextPacketV2,reviewerProtocol:ReviewerProtocolDescriptor}`. `IssuedStandaloneReviewerProtocol` and `IssuedWaveReviewerProtocol` narrow `subject` to the respective binding arm while retaining the nominal membership and correlated packet/version fields. The mint seals these copies and records runtime membership; spreading the public fields does not mint authority.

```ts
// core/review-output.ts — new; validates, joins, and mints authority.
parseIssuedReviewerProtocol(input: Readonly<{
  request: SpawnRequest;
  packet: ContextPacket;
  registration: ReviewerProtocolRegistration;
  subject: ReviewerSubjectBinding;
}>): DomainResult<IssuedReviewerProtocol, ReviewerProtocolFailure>;

// core/review-output.ts — new; the one authority-selected ingress.
parseReviewerEvidence(
  authority: IssuedReviewerProtocol,
  rawBytes: Uint8Array,
): DomainResult<ParsedReviewerEvidence, ReviewerProtocolFailure>;

type ReviewerProtocolAuthorityResolver = (
  request: AgentRequestAuthority,
) => DomainResult<IssuedReviewerProtocol, ReviewerProtocolFailure>;
```

The mint checks runtime-issued `SpawnRequest` membership using existing issuance machinery (e.g. `acceptedAgentResult(request,null)`), re-parses packet integrity, and joins run/program/request/role/requiredSkill/contextDigest/exact context slot. It parses the existing `standalone-review-authority` or `wave-review-authority` section and compares **every subject-binding field**, including full scope and ordered prior IDs. It checks registration/context version agreement and exact descriptor/fixed bytes. It does not trust a self-hashed packet as provenance. For v1 it recognizes the original schema-1 packet/registration without fabricating a retrospectively frozen rubric.

`ParsedReviewerEvidence` (proposed) is:

```ts
type ParsedReviewerEvidence =
  | Readonly<{ kind: "standalone-review"; protocolVersion: 1 | 2;
               findings: ParsedFindings }>
  | Readonly<{ kind: "wave-review"; protocolVersion: 1 | 2;
               findings: ParsedFindings; bound: BoundReviewEvidence }>;
```

The exact public type is a four-arm union, not the schematic cross-product above: `LegacyStandaloneReviewerEvidence` = standalone kind + `protocolVersion:1` + `findings:LegacyParsedFindings`; `CurrentStandaloneReviewerEvidence` = standalone kind + `protocolVersion:2` + `findings:CurrentParsedFindings`; `LegacyWaveReviewerEvidence` = Wave kind + `protocolVersion:1` + `findings:LegacyParsedFindings` + `bound:BoundReviewEvidence`; `CurrentWaveReviewerEvidence` = Wave kind + `protocolVersion:2` + `findings:CurrentParsedFindings` + `bound:BoundReviewEvidence`. `ParsedReviewerEvidence` is exactly their union. `CurrentParsedFindings` has `protocolVersion:2`, `drafts:readonly CurrentDraftFinding[]`, `critical:readonly string[]`, `advisory:readonly string[]`, `criticalCount:number`, `advisoryCount:number`, and `blockStatus:Readonly<{kind:"json"}>`, all readonly and engine-derived. `LegacyParsedFindings` is today's existing `ParsedFindings` shape with `protocolVersion?:never`; its `FindingsBlockStatus` excludes the current `json` arm. Legacy fields stay byte-compatible with `protocolVersion` absent. Keep `ParsedFindings = LegacyParsedFindings | CurrentParsedFindings` so existing aggregate application remains reusable, and extend logging exhaustively. V2 counts are always numbers derived from arrays; only legacy counts may be null or model-authored. No `reconcileFindings` call on current evidence: narrow `makeParsedFindings`, `reconcileFindings`, marker/block arbitration and historical parser returns to `LegacyParsedFindings`, so the type checker prevents feeding current evidence through legacy normalization/reconciliation.

`ReviewerProtocolFailure` is readonly `{kind:"reviewer-protocol-failed", code, path, message, byteOffset?:number}`. Exact codes: `authority-unavailable`, `authority-mismatch`, `unsupported-protocol`, `payload-too-large`, `invalid-utf8`, `invalid-json`, `duplicate-key`, `depth-exceeded`, `invalid-payload`, `binding-mismatch`, `out-of-scope`, `invalid-prior-assessments`, `legacy-evidence-failed`. It carries **no** partial Findings. A missing descriptor on a current registration is authority failure, not legacy recognition. Hostile object inspection errors become typed failure. Catch dependency exceptions without retaining their input.

New codec module `core/reviewer-protocol.ts` exports only `parseReviewerPayloadV2(rawBytes:Uint8Array): DomainResult<ReviewerPayloadV2,ReviewerProtocolFailure>` to shared ingress/stored codecs and `renderReviewerWireContract():string` to the stamper. It imports the leaf schemas, never `review-output.ts` or `context-packets.ts`. Version dispatch and scope/prior/issuance checks remain in the deeper existing `review-output.ts`, which calls the existing v1 parser only for minted v1 authority. This direction avoids a parser ↔ context ↔ Findings cycle.

Existing protocol-independent `applyReviewResolution` remains the Task transform. New `resolveIssuedTaskReviewFindings(authority:IssuedWaveReviewerProtocol, rawBytes:Uint8Array): ReviewResolution` requires a Wave authority arm and maps shared admission to current `bound-findings` or `evidence-failed`; shell stale-authority checks still return `ignored-stale` without mutating the active slot. There is no unbound v2 merge arm. Historical `resolveTaskReviewFindings` remains available only on actual legacy paths.

Shell adapter (proposed in `programs/helpers.ts`):

```ts
reviewerProtocolResolver(
  handle: RunDirHandle,
  registration: RegisteredStandaloneProgram | RegisteredWaveGateProgram,
): ReviewerProtocolAuthorityResolver;
```

It reads the issued request/publication receipt and packet via the existing no-follow RunDirHandle/publication resolver, reconstructs subject from its fixed section, compares it with full parsed registration/frozen authority, then calls the pure mint. On live Wave settlement, protected Task/epoch/slot authority is checked again **under the existing lock** before applying that value. Missing data is unavailable, never inferred from transcript JSON. Tests use real fixture publications or a plain in-memory adapter with the same parser, not an export that forges opaque membership.

## 5. Durable version matrix and replay

Numbers identify different domains. Do not make one global schema-version constant.

| Durable format | Historical | Current decision |
|---|---|---|
| Reviewer final wire | v1 markers/block/lifecycle | `schemaVersion:2`, one JSON object |
| Reviewer Context Packet | `schemaVersion:1`, exact old bytes | `schemaVersion:2`, required `reviewerProtocol` + exact schema/rubric sections |
| Non-reviewer Context Packet | schema 1 | **schema 1 unchanged** |
| Standalone/Wave program registration | `schemaVersion:1` | `schemaVersion:2`, `reviewerProtocol` required |
| Frozen standalone authority | `schema_version:1` | `schema_version:2`, `reviewer_protocol` required |
| Standalone aggregate | `schema_version:1` | `schema_version:2`, `reviewer_protocol` required; current Findings |
| Standalone final result | `schema_version:1` | `schema_version:2`, `reviewer_protocol` required; current surviving/advisory/refuted Findings |
| LC-2 checkpoint | `schema_version:1` | `schema_version:2`, derived from frozen authority, replay verifies matching aggregate/result/descriptor |
| Raw capture envelope, base64, ArtifactRef, request/publication/effect receipts, roster-completion serialized envelope | existing versions | **unchanged**; protocol authority is joined through existing request/context identities, not fabricated into raw capture |
| Individual stored draft/Finding | no discriminator | `protocolVersion:2`, required current ADT fields; historical records remain untagged |
| Wave Review Run / evidence / accepted authority | existing unversioned shapes | explicit `reviewer_protocol` required on current run and accepted authority; evidence adds `protocolVersion:2`, current drafts and exact request/context fields below |
| Panel brief entries | old untagged shape | individual `protocolVersion:2` + basis (and advisory reason if relevant); mixed historical/current source allowed |
| Frozen standalone panel read authority | `schemaVersion:1` | `schemaVersion:2`, matched to aggregate version and richer brief digest |
| RefutationPanelAuthority / RefutationPanelCheckpoint | schema 2 | **outer schema 2 retained**, versioned brief-entry ADT; exact parent projection proves which arm is required |
| Persistent panel event/verdict schema and tally | existing versions | **unchanged**; nested brief records retain their entry discriminator/basis; parent authority comparison must include them |
| Remediation registration/installation | ADR-0008 v1/v2 | **unchanged**; P3 accepts opaque source review result v1 or v2 |
| Explicit unversioned archive | `core/legacy-archive.ts` | historical-only, never a canonical v2 fallback |

For v2 aggregate/result, retain existing external snake_case fields and their order; add `reviewer_protocol` immediately after `schema_version`. Aggregate rest: `run_id`, `subject_id`, `scope`, `reviewer_evidence`, `findings`. Result rest: `run_id`, `subject_id`, `scope`, `reviewer_evidence`, `surviving_critical_findings`, `advisory_findings`, `refuted_critical_findings`, `panel`. Result `reviewer_evidence` keeps the existing request-bound shape; descriptor is common run authority, not repeated seven times. Current Finding canonical field order: `protocolVersion`, `severity`, `file`, `line`, `claim`, `basis` for critical; `protocolVersion`, `severity`, `file`, `line`, `claim`, `reason`, optional `basis` for advisory; followed by `id`, `agent`, optional paired generation/packet. Legacy serializers retain their original object construction order. JSON indentation is two spaces, no added final newline, as today.

### 5.1 Standalone production signatures to change

Retain names; update all callers in the owning batches. No optional resolver default.

```ts
// Existing APIs, proposed additional authority input:
admitStandaloneTranscript(
  authority: IssuedStandaloneReviewerProtocol,
  rawBytes: Uint8Array,
): StandaloneTranscriptAdmission;

proveStandaloneRosterCompletion(
  authority: FrozenStandaloneReviewAuthority,
  resolver: PublicationAuthorityResolver,
  rawResults: unknown,
  reviewerProtocols: ReviewerProtocolAuthorityResolver,
): DomainResult<StandaloneRosterCompletionProof, CompleteRosterError>;

parseStandaloneRosterCompletionProof(
  authority: FrozenStandaloneReviewAuthority,
  resolver: PublicationAuthorityResolver,
  raw: unknown,
  reviewerProtocols: ReviewerProtocolAuthorityResolver,
): DomainResult<StandaloneRosterCompletionProof, CompleteRosterError>;

parseStandaloneReviewMachineState(
  raw: unknown,
  publicationResolver: PublicationAuthorityResolver,
  reviewerProtocols: ReviewerProtocolAuthorityResolver,
  registeredAuthority: FrozenStandaloneReviewAuthority,
): Readonly<{ok:true; value:StandaloneReviewMachineState}> |
   Readonly<{ok:false; error:StandaloneMachineStateParseError}>;
```

The required `registeredAuthority` argument to `parseStandaloneReviewMachineState` comes from independent `program.json` parsing, never `record.authority` in the checkpoint. Before **any** preparing/awaiting/recoverable/terminal/done branch, the parser compares checkpoint version and serialized authority with this registered authority; recursive predecessor parsing carries the same expected authority. This prevents an unfinished current checkpoint from selecting legacy before the completion resolver is called. No optional historical default is permitted for canonical registered replay.

`proveStandaloneRosterCompletion` still invokes `parseCompleteRoster`; it additionally resolves/admit-checks **each accepted request's** exact protocol and caches admitted evidence alongside the opaque completion proof. Do not require attempt-2 publication before it is issued. Persisted proof keeps existing results/rosterDigest/accepted fields; rehydration recomputes the additional process-local proof from the independent resolvers. Its v2 protocol failure becomes a roster violation, not a synthetic Finding.

`aggregateStandaloneReview({authority,completion})` retains its existing signature and obtains admitted, ordered evidence from that proof. It no longer has a current route accepting bare scope/output strings. Existing `aggregateCanonicalTranscripts(runId,scope,transcripts)` stays explicitly historical for `legacy-archive.ts`; do not use it for new publication. Aggregation mints schema 2 **because the frozen authority is current**, not because entries happen to include basis. A zero-Finding current run still publishes schema 2. `finalizeStandaloneReview`, serializers, artifact digests, and `AuthoritativeStandaloneReviewResult` preserve the correlated v1/v2 arm end to end.

`parseAuthoritativeStandaloneReviewResult(ready,rawResult,rawReceipt)` retains its signature and opaque membership: reaggregation, exact finalization, and receipt reconciliation remain mandatory. A raw result-shaped object never becomes P3 authority. Reject any v2 ready/aggregate/result/descriptor mix before result publication. Every completed v1 replay still yields the **identical** `result.json` bytes/digest/length and original IDs.

`replayStandaloneResultFromEvidence(handle,registration,witnesses)` retains its signature and creates the same resolver from durable registration/context/publication before admission. Checkpoint deletion cannot change protocol. Witnesses still prove exact raw capture digest/length; a v2 result with stripped basis/version cannot be accepted through a reconstructed v1 ready state.

### 5.2 Wave durability and replay

Current `ReviewRun` is a correlated arm: required `reviewer_protocol`, existing workspace/run authority, complete slot roster, and current evidence. Extend each current `ReviewRunSlotAuthority` with `request_id` and `context_digest`; current evidence retains those fields plus `protocolVersion:2`, `slot_id`, `attempted`, `agent`, `prior_assessments`, and current `new_findings`. Retry atomically replaces only that slot's attempt/request/context, preserving descriptor and fixed schema/rubric bytes. Legacy slot/evidence arms keep their old keys.

`AcceptedReviewAuthority` current arm retains `reviewer_protocol` after `review_run` is removed. Review generation/issued packet/accepted authority still prevent retired output from re-entering the unbound parser. Current completion must not be upgraded/downgraded by deleting only the active Review Run. `reviewRunError`, state-load migration, installed-epoch comparisons, and evidence recording check descriptor/slot/current-draft consistency. Loaders do not default malformed new fields.

`prepareWaveReviewBatch` accepts versioned registration; legacy registration reproduces its exact identity/packet computation. Current reviewer request identities may differ, but the **spec-check identity computation uses the old schema-1 registration identity projection** because P4 changes no spec-check contract. Current reviewer identity additionally includes the descriptor; spec-check outputContract, schema, floor, and retry remain unchanged. Existing `batchEpoch` computation stays unchanged: the reviewer context/request joins carry the protocol; do not silently re-key historical epochs.

`deriveWaveAttemptTwo`, `persistedWaveAttemptTwoCompatibilityProblem`, and `parseWaveRetryDiagnosticSection` keep their historical branch byte-exact. For current reviewer retries, preserve fixed sections/descriptor; append one canonical `wave-review-attempt-1-rejection` variable section with bounded rejection text and the instruction to follow the already-frozen schema, not a second handwritten schema. Retry grammar dispatch comes from the original issued packet/registration, not the diagnostic's wording. Proposed v2 diagnostic text: `YOUR PREVIOUS ATTEMPT WAS REJECTED. This is your final attempt.\n\nParser rejection reason: <reason>\n\nEmit exactly one JSON object conforming to the unchanged reviewer-payload-schema and reviewer-impact-rubric sections.` The exact preamble/separator/tail are producer-owned constants. Keep v1 constants and callers intact.

`resolveWaveReviewerTranscript` and `reviewerRejectionReason` gain the required `IssuedReviewerProtocol` parameter; raw bytes are fatal-decoded through shared admission, not `Buffer.toString` replacement decoding. Both normal resume and `applyWaveFacadeSubmission` resolve protocol before locked application and repeat current epoch/Task/slot joins within the lock. Atomic full-roster prior resolution and accepted-evidence preservation on exhausted retirement remain unchanged.

### 5.3 Historical unfinished reviews

Completed **and unfinished issued** v1 reviews remain on v1, including attempt 2, publication recovery, Wave completion, and panel replay. Do not force a fresh review as a migration, regenerate old packets from today's schema, relabel old synthetic findings, or rewrite historical bytes. The v1 decoder and retry templates must remain available after the current shims change.

Archive the exact baseline v1 fragment and reviewer instructions from `224f0d7` under `references/reviewer-protocol-v1/` during implementation. All seven current shims bootstrap by first reading the issued Context Packet before applying wire, rubric or severity guidance. A genuine issued schema-1 reviewer packet selects the exact archived role file and shared fragment at fixed `references/reviewer-protocol-v1/agents/<role>.md` and `references/reviewer-protocol-v1/agents/_shared/wire-contract.md` paths under the admitted package root; current v2 wire/rubric/severity guidance is explicitly inapplicable to that legacy request. Current packets use their frozen schema/rubric only. Payload shape cannot select the branch. B2/B3 engine-rendered delivery identifies these archive paths for initial publication, outstanding attempt-1 reissue, newly issued attempt 2, and already-published attempt-2 recovery, for both standalone and registered Wave reviewers. B4 owns conditional shim precedence. Archive selection/delivery stays outside frozen packet/request/retry-section bytes; preserve all those bytes exactly. Missing archive delivery fails visibly rather than defaulting to v2. B2/B3/B4 acceptance tests must inspect actual fresh-process shim/task delivery across every named prefix, not just decoder goldens. Non-reviewer/spec-check delivery remains unchanged. Preserve all **already frozen** context/request/source/retry bytes exactly. Old packets did not freeze a full rubric or persona: do not claim these can now be recovered as byte-exact historical facts. The archive supplies the preserved v1 implementation contract, not invented provenance for unrecorded older instructions. No archive bytes are appended to or rehashed into an existing Context Packet. If genuine historical authority is missing/corrupt, report unavailable rather than substitute today's defaults.

New Wave **Run registrations** always choose current, even when the graph contains historical Findings; a retry/resume of an existing registration is not a new registration. Existing explicitly historical non-façade Task evidence keeps its original protected-state-based compatibility route. New v2 output without actual issued authority is refused; an agent-name/prompt/JSON version by itself grants none.

## 6. Panel projection, publication, and P3

### 6.1 Refutation Panel

Extend `BriefFinding` to a historical/current ADT with current `protocolVersion:2` and `basis`; retain any advisory `reason` for existing advisory brief tooling without changing which severity receives adjudication. Update `buildFindingBrief`, `buildStandaloneFindingBrief`, `serializeFindingBrief`, `serializeBriefFinding`, `parseBriefFindingEntry`, `parseStrictBriefFinding`, and `canonicalStandalonePanelFindingAuthority` together.

Use one proposed pure projection `projectFindingForPanel(taskId:string,finding:Finding): BriefFinding` in `core/review-panel.ts` for both standalone and Wave. It preserves original strings as data and renders/escapes them safely for prompts. Keep legacy sanitization exactly for historical entries; for current entries use JSON data encoding for multiline basis/claim rather than lossy `sanitizeProse`. Parent authority and current brief compare the whole projected entry, including basis, not only `{id,claim}`. Existing claim-only helper can remain for its actual tally-claim consumer, not serve as basis authority. Never drop a Finding because sanitized text is empty.

The existing seven-field standalone panel projection and Wave projection are not byte-identical in every historical edge case (e.g. agent sanitization); preserve the historical entry points' exact behavior. Share the current projection without rewriting history to force a false historical equivalence.

Freeze richer brief digest before verifier publication. Thread current entries through `RefutationPanelAuthority`, context sections, manifest/digests, persistent checkpoint, completed-state rehydration, and standalone frozen read authority. Retaining outer refutation schema 2 is intentional: nested entries are versioned and parent source matching proves which entries must carry basis. Stripping `protocolVersion` and basis cannot pass the exact source projection check. Wave may legitimately put historical and current criticals in the same panel; do not require fictitious basis on historical priors.

**Unchanged:** existing default three lenses, complete all-critical-ID coverage per verifier, verifier JSON keys, strict-majority threshold, tie/uncertainty survival, refutation versus resolution distinction. No `downgraded`, severity score, impact ballot, or advisory refutation authority. Refutation remains semantic assessment, not proof from a digest.

### 6.2 P3 source adapter

Keep `SourceFindingInventory`'s existing public fields and sorted partition ordering. Deep-clone full versioned Finding values in `cloneFinding`/`cloneRefutedFinding`. Source digest and length come from `canonicalStandaloneResultArtifact` of the **original versioned result**, not a downgraded projection. Surviving/refuted/advisory IDs remain disjoint and unchanged. P3 source initialization, `freezePathAuthority`, `parsedCanonicalStandaloneResult`, and checkpoint replay accept exact canonical result schema 1 or 2 with their respective keys. They still require opaque published LC-2 result authority and matching publication receipt; a schema-2-looking object is not enough.

`authoritativeSource` must independently read/parse program registration, obtain `parsedAuthority(registration)`, and construct `reviewerProtocolResolver` before passing both to `parseStandaloneReviewMachineState`. Same requirement applies to inspection/reload callers of that parser. No added current-field defaults in old source bytes. A historical source can feed existing P3 schema-2 remediation unchanged; P3's own historical/current installation rules are orthogonal.

Protocol failures never create source Findings, Declared Repair Groups, Historical RED declarations, or repair-check obligations. They prevent LC-2 completion instead. Grouping, declaration parsing, selected operator commands, repaired-check receipts, temporary-index verification and atomic installation are not redesigned.

### 6.3 Human presentation

Proposed pure `reviewFindingCounts(findings:readonly DraftFinding[]): Readonly<{critical:number;advisory:number}>` in `core/findings.ts`; shared admission and display use it. Proposed `renderStandaloneReviewSummary(result:AdjudicatedStandaloneReview):string` in `core/standalone-review.ts` renders tables and labels from final records:

- **Emitted/admitted**: critical = surviving + refuted; advisory = advisory partition.
- **After refutation**: surviving critical, refuted critical, advisory shown separately.
- Each row retains ID, reviewer, severity, location and claim, with current basis/reason detail. Escape Markdown pipes/newlines/HTML as data.

Do not call transport-invalid raw output an emitted/admitted Finding. No additional authoritative summary artifact or result-schema counts are needed; render from the published result for inspection/parent presentation. `skills/review-and-fix/SKILL.md` uses this derived presentation for arithmetic; optional parent decision prose cannot reclassify obligations. Wave existing counts/views remain derived from active Findings; its advisory await-user policy stays distinct from standalone advisory disposition.

## 7. Native path closure and failure matrix

| Route | Required authority/admission behavior |
|---|---|
| Standalone façade start | Current registration + both frozen attempt packets prepared/published under existing ordering; no protocol input flag. |
| Claude native capture | `capture-orchestration-result.ts` → `captureHarnessResult`: resolve native request and exact final bytes first. Semantic parsing stays after capture. |
| Pi native capture | Existing `(toolCallId,index,agent)`/session-run binding → same capture runtime. No global schema sniff or last narrative block extraction. |
| Standalone submit/resume | `admitCapturedStandaloneTranscript` calls changed `admitStandaloneTranscript` with resolved protocol; accepted siblings stay accepted; stored bytes win on duplicate submit. |
| Standalone aggregate/checkpoint/witness replay | The same resolver and shared admission; preserve exact selected attempts/roster/bytes. |
| Wave registered manual submit | `applyWaveFacadeSubmission` uses resolved packet/registration plus current lock-time epoch/slot join; no operator-override fallback. |
| Wave hook/Pi registered output | Recognized registered v2 is captured/settled through the registered route exactly once. Never also invoke concatenated historical `store-reviewer-findings`/`applyReviewPiResult` to settle the same request. |
| Historical Task hooks/Pi | Retain legacy behavior only under genuine historical protected authority. V2-issued or generation-retired evidence cannot fall through when current lookup fails. |
| Panel capture/replay | Same existing verdict authority; richer Finding basis survives input and all replay serializers. |
| P3/inspection | Load version-aware opaque published result via independent protocol proof, then unchanged source accounting semantics. |

Do not change the generic `readTranscriptWithRetry` contract merely to look for braces or `schemaVersion`. Registered v2 bypasses CRITICAL_COUNT polling using the existing exact-final-payload capture seam. Actual Claude `handlers/subagent-stop/dispatch.ts` currently short-circuits only non-Wave registered programs and routes Wave review into `storeReviewerFindings`; B5 must change the current-reviewer branch explicitly. The implementation choice is locked to **capture then registered façade resume**, matching Pi's current `runBound` short-circuit: native stop records raw evidence and returns after normal cleanup, and `resumeWaveGateFacade` owns semantic admission/application. Registered manual submission still applies through `applyWaveFacadeSubmission`. Legacy registered Wave stop behavior and spec-check settlement remain unchanged. Pi already short-circuits run-bound captures; preserve that route, rather than adding an unnecessary direct Task write. If a hook sees current reviewer authority but cannot resolve its registered route, it reports a refusal/unavailable result, not a legacy pass. Non-reviewer hooks and spec-check polling stay unchanged.

Failure behavior:

- Bad identity/context/registration: no semantic authority, no Findings; refuse before task mutation. Already stale/duplicate successful delivery remains inert.
- Missing/ambiguous final payload: existing capture rejection/tombstone semantics. Attempt 1 advances only via existing bounded retry; attempt 2 must terminal-block rather than perpetually reissue an unfillable slot.
- Invalid JSON, duplicate keys, oversized/truncated payload, missing basis, foreign file, malformed priors: capture original bytes, reject the **whole reviewer response**, mint no product Finding, retry the slot under unchanged contract.
- Valid empty JSON findings array: explicit success, provided Wave prior obligations are complete.
- Structurally valid weak claim: admit its stated severity. No semantic strength classifier in the parser.
- Infrastructure read/write/publication failure: retain recoverable effect semantics and current semantic attempt; no evidence-consumption tombstone for an I/O failure alone.
- Exhausted Wave packet: retain already accepted new Findings using their original current fields; no resolution of old Findings from a partial roster.

The standalone final-attempt no-final-payload path is a known test dependency from reconnaissance, not a claimed verified behavior. Implementation must close it through the actual capture/façade route, not merely adjust a helper and assert the reducer works.

## 8. Existing operator override is not reviewer admission

`helper store-review-findings --task ...` currently accepts CRITICAL/ADVISORY lines or explicit `--dismiss-all`, attributes new records to `manual-override`, and audits replaced records as refutations. Preserve its CLI grammar and decision authority. Current Findings moved into its audit retain full basis, ID, and severity; any newly operator-authored four-field records remain honestly manual, not v2 reviewer claims with fabricated basis. It must not be invoked automatically on reviewer parse failure, by a severity rationale, or by parent preference. Standalone LC-2/P3 has no corresponding severity override; none is added.

A true-but-weak current critical therefore cannot be silently downgraded by parser/panel/P3. An operator may still exercise an already-existing explicit Wave override outside normal reviewer settlement. This is not evidence that the reviewer assertion was false. A future demand for an in-run standalone severity-dispute action requires a separate approved domain decision. No blocking domain ambiguity remains for P4 under this bounded interpretation.

## 9. Exclusive implementation batches and handoffs

These are implementation ownership batches, **not new live Loom Runs or synthetic Waves/Tasks**. The parent must independently review this design first. One owner edits each file at a time, including tests. Do not let a generic “test worker” simultaneously edit every test file.

### B0 — Baseline and fixture owner (before any parser changes)

Owns new `engine/tests/fixtures/reviewer-protocol-v1/**`, new `engine/tests/core/reviewer-protocol-history.test.ts`, and `references/reviewer-protocol-v1/**`. Capture byte-exact legitimate completed-source fixtures from §10; inventory hashes/lengths with provenance. Pin current legacy parser/result behavior before modifications. Provide fixture load APIs **only for tests**:

- `loadReviewerV1Golden(name:"pr48-clean"|"seven-reviewers-retry"): ReviewerV1Golden`, where `ReviewerV1Golden = Readonly<{files:ReadonlyMap<string,Uint8Array>;resultDigest:string;resultByteLength:number}>`; map keys are the exact relative artifact paths and values are copied original bytes.
- Do not invent `AuthoritativeStandaloneReviewResult`; replay originals through real parser/publication resolvers.

Handoff: exact fixture inventory, read-only originals, baseline test output, and any genuine pre-existing replay refusal. No source edits. Fixtures with pruned/redacted bytes are not byte-exact goldens; use intact originals or explicitly separate sanitized illustrative tests.

### B1 — Shared contract/authority owner (serial prerequisite)

Owns new `engine/src/core/reviewer-contract.ts`, new `engine/src/core/reviewer-protocol.ts`, existing `engine/src/core/context-packets.ts`, `engine/src/core/review-output.ts`, `engine/src/types.ts`, `engine/src/core/findings.ts`, `engine/src/handlers/helpers/validate-task-graph.ts`, and the actual state-load reader `engine/src/state-manager.ts` (`reviewRunError`/Finding guards and current accepted-authority parsing). Owns `engine/package.json`, `engine/bun.lock`, root `bun.lock` for the direct JSON dependency; do not alter verification commands. Also exclusively owns `engine/src/linter/programmatic/no-io-in-pure-modules.ts`, `engine/src/linter/programmatic/no-cross-boundary-imports.ts`, `engine/tests/linter/programmatic/machine-purity.test.ts`, and actual related boundary tests. The exact dependency/consumer capability audit in §3.3 is mandatory before downstream B2/B4, not deferred until final integration. B1a delivers only leaf contract, codec, context ADT and these prerequisite gates/tests, leaving production issuance v1. B1b subsequently owns Findings/stored authority/shared ingress changes; no permissive compilation-only overloads.

Tests exclusively owned: new `engine/tests/core/reviewer-protocol.test.ts`, new `engine/tests/core/reviewer-protocol-authority.test.ts`, existing `engine/tests/core/review-output.test.ts`, `engine/tests/core/findings.test.ts`, `engine/tests/core/findings-guards.test.ts`, `engine/tests/core/review-remediation-lifecycle.test.ts`, new `engine/tests/core/reviewer-context-packets.test.ts`, and existing `engine/tests/state-manager-load-guards.test.ts`. Existing context-packet coverage in `engine/tests/orchestration/uncovered-branches.test.ts` and `engine/tests/orchestration/orchestration-acceptance.test.ts` belongs to B1 if changes are required; B5 does not edit them. Register any extra state parser/repair test file with parent before editing; no guessed names/API stubs.

Deliver exact exported types/functions from §§3–4, current/legacy ADTs, v2 no-synthetic-finding failure, strict codec, immutable stored basis, and authority tests. Baseline production remains v1 until downstream slices are complete; new codec is not a shipped ingress-only cutover. No generic authority framework. Share compile signatures before B2/B3.

### B2 — Registration, standalone, replay and P3 owner

**Implementation status (bounded handoff):** standalone registration/packet issuance, opaque roster admission/cache, versioned aggregate/result/checkpoint replay, current panel projection, witnessed replay, reviewed-source provenance, actual result/receipt reads and P3 v1/v2 source integration are implemented. The read-only `inspectStandaloneFacade` is implemented and tested, but B5 must wire the CLI `observeRun` inspection path to it (and then curate its index export); the existing CLI inspection still projects raw checkpoint observations. Full completion is NOT claimed: `bun run typecheck` fails at the two B3 Wave registration-to-`WaveReviewRegistrationAuthority` joins (`programs/wave-gate.ts:401,728`), exposed by B2's required registration ADT. No casts, optional resolver defaults or fake Wave implementation hide them. Fresh standalone starts in this checkout select v2; issued v1 resumes retain v1.

B2 final focused validation: **785 passed / 15 suites**, both original completed-source byte goldens unchanged, actual disposable P3 repair-checked installation with one survivor/one refuted critical/one advisory, admitted child-CLI manual submit/retry/reload/witness replay, all seven legacy roles across initial/outstanding/new-retry/published-retry delivery, and missing/ambiguous final-attempt exhaustion through the common capture runtime. These are not claims of both full native adapter paths (B5). Three test-gated distill moves applied; compiler remained blocked at the same two B3 joins after each. Scoped lint: zero introduced findings against an actual HEAD baseline, seven inherited findings remain (one removed), no lint/purity grants changed. Exact paths, APIs, remaining joins and raw logs: `/tmp/loom-priority4-standalone-implementation.md`.

Owns `engine/src/handlers/helpers/programs/helpers.ts`, `engine/src/handlers/helpers/programs/standalone.ts`, `engine/src/core/standalone-review.ts`, `engine/src/core/standalone-review-machine.ts`, `engine/src/handlers/helpers/programs/remediation.ts`, `engine/src/core/remediation-machine.ts`, `engine/src/core/defect-family-accounting.ts`, and necessary curated exports in `engine/src/handlers/helpers/programs/index.ts`. Owns new pure presentation function in standalone core. **This owner alone edits helpers.ts** including Wave registration parser arms and protocol resolver; B3 supplies requirements, not overlapping patches.

Tests: existing `engine/tests/core/standalone-review.test.ts`, `engine/tests/handlers/helpers/programs/defect-family-accounting.integration.test.ts`; new `engine/tests/handlers/helpers/programs/reviewer-protocol-standalone.integration.test.ts` and `engine/tests/core/reviewer-protocol-publication.test.ts`. Coordinate updates to other existing machine/remediation tests by exact path before edits. Historical archive keeps old behavior; any necessary `core/legacy-archive.ts` typing changes belong here and must not change output.

Deliver the version matrix, unchanged v1 result bytes, opaque completed current authority, P3 digest/ID/basis retention, normal and checkpoint-independent replay. Freeze helpers/signatures for B3/B4. B2 owns current-start cutover in its files only once B1 APIs and B4 panel integration exist; do not run live starts to bridge an incomplete branch.

### B3 — Wave authority/settlement owner

**Implementation status:** complete for the owned Wave authority/settlement slice. Fresh start/restart/orphan-recovery registrations select current v2; historical registered requests retain v1. Current protected Review Runs carry complete descriptor/workspace/run/slot request/context authority. Actual publication-selected protocol admission, original captured-byte reads, lock-time epoch/Task/slot/scope/five-role joins, atomic retry replacement, current accepted-descriptor checks, completed protocol replay, and whole-basis panel projection are integrated. Spec-check identity uses the original schema-1 projection; epoch computation, floor, grammar and retry remain unchanged. Historical diagnostic-rich AND earlier unchanged-context retries recover without rewriting packets/requests. All five legacy roles receive archive delivery at all four prefixes. Current failure creates no synthetic Findings; full-roster resolution and exhausted retirement preserve original current/historical Findings and evidence.

B3 final validation: **1,632 passed / 31 suites**, compiler green, six owned TS paths clean under actual full-tier lint (zero introduced; zero total), diff check green and Git index unchanged. The new disposable integration suite has 11 cases, including registered CLI manual submit, all five slots, mixed prior resolution, current/legacy retry recovery, majority refutation with full basis, advisory approval, invalid UTF-8/shape/scope/roster, missing/ambiguous/marker-only exhaustion, stale output and retry-commit inertia, and done replay. Two test-gated distill moves applied; final post-correction apply pass retained all remaining authority/history checks. `/tmp/loom-priority4-wave-implementation.md` records exact paths/APIs/receipts and bounded B5/B6 requirements. Earlier B2/B4 handoff compiler failures are now closed; their historical validation receipts are not rewritten.

Full native Claude/Pi capture-adapter chains are **not** claimed by these scripted capture/common-runtime tests. Root verification was not run: B5/B6 must first migrate the known checkout-writing `quality-programs.test.ts` fixtures and the PI-unsetting `wave-gate-completion-suite.integration.test.ts` child harness, alongside broad native current-payload fixtures. No skipped/relaxed production gate, manifest change, live Run, main-runtime mutation, staging or commit occurred.

Owns `engine/src/core/wave-review-authority.ts`, `engine/src/handlers/helpers/programs/wave-gate.ts`, and only necessary review-protocol joins in `engine/src/core/wave-gate-machine.ts`/`engine/src/core/wave-gate-model.ts`. No `helpers.ts`, `types.ts`, `findings.ts`, or panel edits: ask B1/B2/B4 owner for coordinated changes. Preserve spec-check contract/floor and registration/retry legacy identity.

Tests: new `engine/tests/handlers/helpers/programs/reviewer-protocol-wave.integration.test.ts`, existing `engine/tests/handlers/wave-attempt-two-stored-authority.test.ts`, `engine/tests/handlers/helpers/wave-spec-check-scope.test.ts`, and `engine/tests/handlers/helpers/programs/wave-gate-decision-authority.test.ts`. New test file exercises all five reviewer slots, current/legacy contexts, prior lifecycle, retries/exhaustion, completed replay, stale delivery and advisory decision. No artificial live TaskGraph.

Handoff exact updated signatures for `resolveWaveReviewerTranscript`, `reviewerRejectionReason`, `deriveWaveAttemptTwo`, `applyWaveFacadeSubmission`, and protected-state fields. Pure helpers receive the minted authority; façade supplies it.

### B4 — Panel and prompt owner

Owns `engine/src/core/review-panel.ts`, `engine/src/core/panel-program.ts`, `engine/src/core/wire-contract.ts`, `scripts/stamp-wire-contract.ts`, `agents/_shared/wire-contract.md`, the seven reviewer Agent files, `references/review-lenses.md`, and required reviewer-wire guidance in `skills/deepen/SKILL.md` and `skills/distill/SKILL.md`. B0 owns historical archives. No v2 changes to other Agent kinds.

Tests: `engine/tests/core/review-panel.test.ts`, `engine/tests/core/panel-program.test.ts`, `engine/tests/review-agent-contract.test.ts`, `engine/tests/wire-contract.test.ts`; new `engine/tests/core/reviewer-protocol-panel.test.ts` for mixed legacy/current basis and tamper replay.

Shared fragment becomes **generated** from `renderReviewerWireContract()`; stamp script updates that fragment and all seven regions, including the exact same executable schema/example and rubric issued in packets. No second hand-authored current schema. Revise contradictory severity prose outside stamped regions (comment factual-error=critical, confidence/impact conflation, universal unreported-error=critical, scored architecture severity) for current review only. Legacy issued packets defer to archived v1 instructions. Agents report only JSON as final payload; explanatory detail lives in fields.

Handoff `projectFindingForPanel` and versioned `BriefFinding` before B2 current publication is integrated. B2 retains exclusive standalone panel authority code; use its shared projection rather than editing it independently.

### B5 — Native integration/test owner (after B2–B4 seams freeze)

Owns `engine/src/handlers/helpers/orchestration.ts`, `engine/src/handlers/subagent-stop/dispatch.ts`, `engine/src/handlers/subagent-stop/store-reviewer-findings.ts`, `engine/src/handlers/subagent-stop/capture-orchestration-result.ts`, `engine/src/orchestration/harness-capture-runtime.ts`, `pi/subagent-result.ts`, and `pi/extension.ts` for protocol-aware route closure only. Existing raw capture semantics should need minimal/no changes; avoid gratuitous transport refactors. Owns `engine/src/handlers/helpers/store-review-findings.ts` only if full-current-record conservation requires a concrete fix (not protocol conversion).

Tests: existing `engine/tests/handlers/helpers/orchestration.test.ts`, `engine/tests/handlers/review-findings-parity.test.ts`, `engine/tests/handlers/subagent-stop/dispatch-resilience.test.ts`, `engine/tests/pi-extension-review-events.test.ts`, `engine/tests/orchestration/capture-slot-authority.test.ts`, `engine/tests/orchestration/publication-faults.test.ts`. This batch alone edits these broad shared native suites. Test fixture CLI admission is maintained, not bypassed. Coordinate any discovered direct machine-parser callers with B2 before editing owner files.

### B6 — Documentation and final verification owner

**Final-pass status:** assigned docs, ADR-0009, Skill 5.0.0 and current façade smoke are updated. The six original façade scenario outcomes remain, including real disposable index installation; historical/manual helper smokes retain coverage rather than pretending current ingress. B5's early inherited bad cwd/handshake executions are not positive native evidence; corrected child-only matching-runtime native/P3 tests are independently recorded. No verification enrollment, command composition, timeout, worker count, report path, parser/purity grant or P3 policy change is part of B6. Final command receipts and candidate byte/mode inventory are external development records, not authored engine receipts.

Owns `CONTEXT.md`, this Plan status, `commands/review-pr.md`, `commands/wave-gate.md`, `skills/review-and-fix/SKILL.md`, `docs/operations.md`, `docs/workflows.md`, `docs/README.md`, `README.md`, `agents/README.md`, and proposed `docs/adr/ADR-0009-versioned-reviewer-protocol.md`. Update other actual current reviewer-wire references by search with exclusive assignment. Do not rewrite historical plans/ADRs as if they used v2. ADR records preserved unfinished reviewer-v1 versus refused unfinished remediation-v1 distinction.

Owns smoke updates `scripts/smoke-standalone-review.sh`, `scripts/smoke-review-panel.sh`, `scripts/smoke-orchestration-facades.ts` only where fixture reviewer payloads need current issuance. No verification enrollment or runtime gate changes. Final green baseline → distill apply mode one move at a time with reruns; report applied moves and skipped opportunities. Do not use distill to redesign interfaces or “simplify” away legacy proof.

### Ordering and integration discipline

B0 → B1 → B2 registration/shared signatures → B3 and B4 may run in parallel on disjoint files → B2 completes standalone/panel/P3 integration → B5 → B6. B2 waits rather than duplicate B4 projection. Worker handoffs name exact files, functions/types and tests run. A new caller requiring a shared API change goes back to its owner; no independently invented overloads or copied parsers. New files above are proposed, not claims that tests/APIs already exist.

## 10. Test and fixture acceptance contract (implementation phase only)

### Real historical golden sources available read-only

**Implemented storage:** 90 exact logical files totaling 20,250,407 bytes now live in two lossless gzip packs totaling 3,395,759 bytes. All original inventory paths/lengths/hashes, anchoring and receipt bytes are unchanged and independently verified after decoding. No newly authored receipt or relocated native admission is implied: historical replay uses production pure parsers with in-memory resolvers; legitimate disposable native/P3 fixtures prove the separate shell path. See `/tmp/loom-priority4-fixture-packaging.md` and the fixture README for storage details.

Adjacent checkout `/home/peterstorm/dev/claude-plugins/loom-verification-junit` contains:

1. **PR #48 clean source**: `.claude/reviews/review-and-fix-runs/2026-09-09-junit-verification-enrollment/`. Despite the parent directory name, `program.json` is `kind:"standalone-review"`, schema 1; checkpoint is `kind:"done"`. Result is 4,485 bytes, SHA-256 `22619aea74b057a82c361da6f0bb7f55c6f9f95d9a1bce515ceafa6e4069c58e`. Five reviewer evidence entries, no final Findings, no panel.
2. **Seven-reviewer/retry source**: `.claude/reviews/standalone-review-runs/run.Ca7oS7jRRX/`. Schema-1 result and done checkpoint; result is 16,038 bytes, SHA-256 `78213a071825e206547f8bbabd3b8c2ed8b2f396fad34c5c918c48d0eb83fbb2`. Contains code-reviewer attempt 2, seven reviewer roles, a completed three-lens panel, two surviving criticals, and reworded duplicate advisory IDs `pr-test-analyzer-1`/`pr-test-analyzer-2`.

Both result files were read fully and their exact lengths/digests computed by read-only filesystem inspection. No replay or current semantic evaluation was run. These observations describe recorded evidence, not renewed endorsement of old assertions. B0 must copy the necessary complete byte inventory (`program.json`, `authority.json`, `checkpoint.json`, contexts, raw transcripts, request/publication/capture/result receipts and panel artifacts/events), recording hashes of every included file. Never edit, resume, retry, or install against the originals. Result-only copies cannot establish issuance/replay authority. Use opaque authority rebuilt through actual readers. The inspected PR48 `authority.json` explicitly binds its original absolute `runsRoot`/`runDirectory`, so an intact copied Run Directory cannot honestly be opened under another root. Golden tests replay exact program/checkpoint/context/publication bytes through production pure parsers with in-memory read resolvers over the captured inventory; they do not call filesystem RunDirHandle operations against the originals or rewrite anchoring metadata to make a relocated handle pass. These tests prove golden semantic replay/result-byte compatibility, not relocated filesystem admission. Native CLI/openRunDirectory/inspection/P3 shell behavior is tested separately in legitimately created disposable fixtures using the real admission path. Both surfaces are required; neither substitutes for the other.

The real completed sources do not prove all malformed-block/synthetic-shortfall/refuted-partition cases; retain/add explicit isolated legacy fixture examples for those. Unfinished v1 fixtures are legitimate **test fixtures** representing an issued prefix under the archived v1 producer, not fabricated live Runs or modified historical originals. Include both a pending attempt-1 result and a pending/partially published attempt-2 recovery, with an accepted sibling.

### Pure properties and exact mutation cases

Use fast-check valid generators plus one-field mutations. Every property crosses the production parser/aggregate seam.

- Current valid payload round-trip preserves exact strings, ordered entries, multiplicity and evidence. Current counts equal severity partitions. Confidence changes alone cannot change severity or counts.
- Empty current array is valid; missing array, authored counts, unknown keys, wrong root kind/version, fences/preamble/postscript/two objects, BOM/invalid UTF-8, escaped/nested duplicate keys, control/unpaired-surrogate strings and size/depth boundaries refuse with no Findings.
- Missing any critical floor field refuses the whole response. In-range but implausible consequence text remains structurally admissible: tests do not claim semantic impact was proved.
- Wave missing/foreign/duplicate/reordered prior IDs, packet/generation mismatch, and canonical out-of-scope location fail before evidence application. Exact new duplicates stay distinct; v1 prior suppression remains pinned separately.
- V2 context + v1-looking output, v1 registration hint beside v2 context, removed descriptor, swapped rubric/schema section, wrong request/role/Skill/context, or tampered retry cannot select legacy.
- Runtime nominal membership tests reject spreads/forged authority; deep immutability and no caller object mutation. Context/hash integrity alone cannot mint issued authority.
- Current stored critical cannot lose basis through parse, refutation, resolution, override, repair, serializer or P3 clone. Malformed current repair refuses rather than downgrade/salvage. Mixed legacy/current Wave history stays loadable.
- V1 golden byte equality includes result serialization, raw digests, IDs/order/duplicates, retry contexts and original parser failure/synthetic behavior. No normalization “improvement” on history.

### Integration: native authority, not hand-built result objects

Exercise production start → packet publication → reservation/receipt → native harness capture → shared admission → bounded retry → complete roster → full panel → canonical result publication → done → reload and idempotent resume. Use scripted Agent outputs in disposable fixture repos; do not spawn live Agents.

Cover all seven reviewer contracts through the schema/example actually issued in Context Packets and stamped shims, not only string-presence tests or a parallel hand-authored test transcript. Cover empty/mixed payload, explicit duplicates, multiple responses, no-final and ambiguous-final at **both** attempts, stale delivery, duplicate delivery, accepted siblings, and infrastructure refusal without consuming semantic attempt authority. Current finalized source must replay both from checkpoint and through `replayStandaloneResultFromEvidence` after checkpoint omission in a fixture copy.

For Wave cover all five reviewers, legacy/current priors, full-roster resolution, accepted evidence retained on retirement, current epoch and late stale output, refutation and advisory await-user. Spec-check grammar and Requirement Coverage floor must stay unchanged. Test manual registered submit, Claude and Pi routes against the same frozen payload/binding and compare resulting Findings/diagnostics. Separately test explicit operator override semantics; never invoke it as reviewer failure recovery.

P3 integration must create a **real fixture-published** v2 LC-2 source with one survivor, one refuted critical and one advisory; derive inventory via opaque authority, assert original IDs/basis/result digest, refuse missing/foreign/reclassified IDs, then exercise the existing repair-check/verified-install path **only in the disposable repository**. Coexist with both actual completed v1 sources. Reject source result/context/basis tampering, missing registration/publication proof, and malformed review evidence before remediation starts. Existing `completeCriticalStandaloneReview` currently constructs a schema-1 registration literal; change the test to read/parse the actual registration instead of hard-coding current protocol.

Fault boundaries: raw capture, packet publication, registration/reservation, retry publication, aggregate/refutation state, result write, result receipt and checkpoint. Refusal leaves authority/accepted bytes intact. Target mutants: remove protocol join; infer legacy from payload; bypass strict duplicate parse; trust authored count; drop basis in panel/P3; regenerate v1 with current builder; accept partial prior roster; downgrade malformed v2 during repair; accept current source without result publication proof.

### Legitimate fixture runtime admission

No ad-hoc live root probes, fabricated semantic facts, live Runs, or runtime-variable unsetting. Preserve outer loaded main/runtime unchanged. Use existing disposable fixture harnesses and real CLI fixture admission: `captureLoomRuntimeIdentity` for the fixture CLI package root and the corresponding `LOOM_PI_EXTENSION_RUNTIME_ROOT`/`LOOM_PI_EXTENSION_RUNTIME_REVISION`, with `PI_CODING_AGENT:"true"`, passed only to the isolated child. `engine/tests/handlers/helpers/orchestration.test.ts:runCli` already establishes a checkout-consistent test handshake; reuse that pattern and test missing/mismatched handshake refusal separately. Do not export a feature-checkout handshake into the parent session or run its mutator against a live root.

Repository scripts currently include historical test-process environment handling. This design neither executes those scripts nor changes that policy. For P4 native admission evidence, use the explicit admitted fixture path above, not `env -u PI_CODING_AGENT` as a way to make a mismatched live feature CLI run. Final verification is performed only after implementation with the normal isolated harness and separately attributed output; configuration, parser properties, and root probes are not semantic execution evidence.

## 11. Done criteria and design-pass report

Implementation is complete only when every production reader/writer above supports the version matrix; all native/legacy/publication/P3 tests pass with actual command output; docs/ADR are updated honestly; final distill reports applied/skipped moves; and no runtime-admission bypass or historical rewrite occurred. A feature working only at ingress is not complete.

The original bounded design pass delivered design only. No tests were run during that pass, no source function was added, no current-v2 authority was minted, and no claim of semantic test coverage, review completion, repair-checked installation, or live cutover is made. `/tmp/loom-priority4-design-contract.md` is a copy of this finalized handoff contract for the parent. The parent should independently check the contract, especially historical retry/replay joins and batch ownership, before delegating implementation.

## 12. Adjudicated P4 source repairs — ordinary declarations, not engine authority

The single registered source review completed with seven reviewers, two unanimously
UPHELD criticals (reproduction/intent/test-coverage), eleven advisories and zero
refuted Findings. Its opaque Run ID remains `2026-09-10-reviewer-protocol-v2` even
though registration began September 9. Original canonical `result.json` SHA-256
`f5b98fd121e324b323f902c2028fdba40406e0dce4f9155be702eb580c390d6d`
is immutable. No reviewer restart or reassessment is part of these repairs. The
initial missing-runs-root failure and external 120-second tool deadline did not
change authority; the same idempotent start completed with a 900-second tool
budget. Engine verification timeouts did not change. The loaded main runtime
`sha256:bf179868071bdeab682dddc9ec0368163aa47aceda9e1ce17bd98aa6385933c9`
and HEAD `224f0d74373ddab619c1620738c5ba4fa6b44e0e` are not cut over by this work.

These are two **DECLARED Repair Groups**, using original canonical IDs, not
panel-qualified Finding IDs, and selecting the existing `project:verify` check.
They are ordinary Plan data, not a registration, accounting input, Run event,
Historical RED execution receipt or installation authorization.

1. **DECLARED `reviewer-context-delivery` — `code-reviewer-1`.** Root cause:
   reviewer bootstrap named a pure API as a harness tool, with no executable
   decoding path for large single-line byte-array Context Packets. Invariant:
   every reviewer delivery must provide an available cross-harness read-only
   command for the actual immutable packet, checking its supplied expected
   identity/integrity and rendering bounded useful sections/source-text pages.
   Engine issuance, not supplied IDs/self-hashes, provides publication authority.
   Siblings: all seven `agents/{code-reviewer,silent-failure-hunter,pr-test-analyzer,
   type-design-analyzer,comment-analyzer,architecture-tech-lead,code-simplifier}.md`;
   `engine/src/handlers/helpers/programs/helpers.ts` shared task delivery;
   `engine/src/core/context-packets.ts` existing parser (retained unchanged);
   new `engine/src/core/context-packet-projection.ts` and
   `scripts/read-context-packet.ts`. Genuine current/v1 packets select their
   respective guidance; all four legacy delivery prefixes and archived bytes
   remain intact. **Historical RED DECLARED:** actual development
   `/tmp/loom-p4-repairs/red.log` shows missing executable commands on current and
   genuine v1 delivery, before production repair. This is not engine execution
   of a registered vulnerable snapshot. GREEN execution is recorded in
   `green-first.log` (304 tests) and subsequent per-move logs; final command,
   native/P3, actual immutable 30,479,027-byte packet, and bounds evidence are
   reported in `/tmp/loom-priority4-adjudicated-repairs.md`.
2. **DECLARED `reviewer-schema-volume` — `code-reviewer-2`.** Root cause:
   repeated inline JSON Schema definitions amplified repeated immutable context
   hashing/parsing/replay work under the unchanged four-worker root gate.
   Invariant: unchanged executable schema/refinements and authority rechecks,
   but bounded issued-schema byte volume (12 KiB) with generated local `$defs`
   reference reuse. Siblings: `engine/src/core/reviewer-contract.ts`, existing
   `reviewer-protocol.ts` codec and `context-packets.ts` parser/issuance family,
   all seven stamped shims, `agents/_shared/wire-contract.md`, stamper, schema
   pins and deterministic VM audit. Only `reused:"inline"` → `reused:"ref"`
   generation changes; 57,099 → 10,257 pretty bytes (5,721 compact), current
   schema SHA-256 `3ac3395301c1d38f41cd93accb19b942e832d7ebced990976335208259f40c37`.
   This is an explicit prerelease current-byte correction, not a distill claim;
   no live current-v2 production authority had been issued. V1 source review
   and all historical goldens are unchanged. **Historical RED DECLARED:**
   `/tmp/loom-p4-repairs/red.log` fails 57,099 > 12,288 before repair;
   `/tmp/loom-priority4-review-observed.junit.xml`, SHA-256
   `05f36100bbad55e24fbce16fe2addaf2faa09892f365a88a3abb7ed174bfd51f`,
   strictly parses as 8,586 executed/one failed, with the original approval
   test timing out at 15.038809109s. These retained observations are not an
   engine-authored counterfactual receipt. Reference expansion equals the old
   inline schema; generated valid/invalid values agree with executable Zod.
   No timeout/worker/retry/oracle/provenance-cache change. Full root/fresh-process
   restart evidence is recorded externally, without a universal flakiness claim.

Accepted advisory dispositions (all bounded; no refuted Finding repaired):
- `silent-failure-hunter-1`: neutral truthful rejected-evidence logging, no claim
  that an ignored result mutated state; original inert application retained.
- `silent-failure-hunter-2`: retain the specific current-slot problem in refusal.
- `silent-failure-hunter-3`, `silent-failure-hunter-4`: safe bounded allowlisted
  I/O code/name classification in the existing catches; never echo arbitrary
  message/path/stack/input or execute getters. Unknown causes remain honest.
- `comment-analyzer-1`: explicitly v1-only marker/block arbitration comment.
- `comment-analyzer-2`: narrow location fallback comment to marker-only entries.
- `code-simplifier-1`, `code-simplifier-2`: strict request parsing then existing
  `sameAgentRequestAuthority`; all identity fields retained, no valid key-order
  dependence, no unknown-field acceptance.
- `code-simplifier-3`: remove unused `decodeReviewerTranscript` after repository
  search found no caller; the actual strict decoder stays unchanged.
- `code-simplifier-4`: remove unused local `critical_findings` view, retaining
  legacy brief serialization. Four moves separately stayed green (66, 14,
  108 and 114 covering tests in `distill-{1,2,3,4}.log`).
- `type-design-analyzer-1`: small readonly metadata union encodes
  `docsOnly ⇒ !sourceOrTestChanged && commentsChanged`; existing classification,
  roster selection and external serialization remain unchanged. The selection
  test factory now refuses contradictory fixtures rather than casting them.

New supporting source/test paths for parent registration:
`engine/src/core/context-packet-projection.ts`, `engine/src/core/safe-io-cause.ts`,
`scripts/read-context-packet.ts`, `engine/tests/core/context-packet-projection.test.ts`,
`engine/tests/core/safe-io-cause.test.ts`. Additional previously out-of-source-scope
modified tests: `engine/tests/core/standalone-reviewer-selection.test.ts`.
The two new pure leaves are explicitly enrolled in the existing exact closure
check; no purity/boundary rule is weakened. Final applicable verification and
candidate byte/mode stability live in the ordinary external repair report.
No live CLI/Run/accounting/check-input authority, operator manifest, staging,
commit/push/stash, loaded-runtime cutover or verified-index installation is
performed here; the parent owns fresh registered validation and installation.
