/**
 * Requirement Coverage Projection — the pure join of one Spec Index against the
 * whole protected Task roster: rows describe the current Wave, while unclaimed
 * completion lists consider every Wave.
 *
 * Every verdict here is decided by structure alone: an identifier is in the
 * Spec Index or it is not, a Task declared artifacts or it did not, a recorded
 * content hash equals the current one or it does not. None of it needs a model,
 * so none of it is prose. What survives as `candidate-pass` is exactly the
 * residue that genuinely requires reading code — the model's job shrinks to
 * behaviour, and `/spec-check` stops re-deriving the graph it was already
 * handed.
 *
 * Two facts about a row are deliberately orthogonal and never collapsed:
 * **who decides it** (`claimDecider`) and **how bad it is** (`claimSeverity`).
 * A Requirement whose text drifted since the claim is a CRITICAL-adjacent fact
 * about the specification AND an open question about the code, so it is graded
 * `MEDIUM` and still handed to the Agent. Folding those two axes into one
 * severity string is what told the Agent to skip the assessment the verdict
 * exists to request.
 *
 * The projection is derived join input, never a second source of truth: the
 * Spec Index owns Requirement identity, the protected TaskGraph owns the
 * Task→Requirement edges, and this module owns neither.
 */

import { match, P } from "ts-pattern";
import type {
  NonEmpty,
  ParsedSpec,
  SpecContentHash,
  SpecEntry,
  SpecEntryId,
  SpecGlossaryEntry,
  SpecParseError,
} from "./parse-spec";
import { specParseErrorMessage } from "./parse-spec";

/**
 * The families a Task may legitimately claim to have completed. `OOS` is
 * absent by construction: claiming to complete an excluded item is a category
 * error, and the branded families make that unrepresentable rather than
 * merely unlikely.
 */
export type CompletableEntry = SpecEntry<"FR"> | SpecEntry<"AS">;

/**
 * A hash as protected Task state actually holds it, classified at the boundary.
 *
 * The persisted form is an unbranded string in a hand-editable file, so it
 * enters the type through this parse rather than by assertion. Carrying the
 * rejected value as its own case is the point: dropping it made a truncated or
 * tampered hash indistinguishable from one that was never recorded.
 */
export type RecordedHash =
  | Readonly<{ kind: "readable"; hash: SpecContentHash }>
  | Readonly<{ kind: "unreadable"; stored: string }>;

/**
 * Whether the Requirement text still says what it said when the Task claimed
 * it. Orthogonal to whether the claim is implemented, so it travels beside the
 * verdict rather than collapsing into it.
 */
export type DriftFact =
  | Readonly<{ kind: "unverifiable" }>
  | Readonly<{ kind: "unreadable-record"; stored: string }>
  | Readonly<{ kind: "stable" }>
  | Readonly<{ kind: "drifted"; recorded: SpecContentHash; current: SpecContentHash }>;

/**
 * One Requirement Completion Claim's structural outcome.
 *
 * `candidate-pass` is the only verdict that hands work to a model; the other
 * four are decided here and are not the model's to overturn.
 */
export type ClaimVerdict =
  | Readonly<{ kind: "unknown-requirement" }>
  | Readonly<{ kind: "excluded-requirement"; entry: SpecEntry<"OOS"> }>
  | Readonly<{ kind: "not-declared"; entry: CompletableEntry }>
  | Readonly<{ kind: "not-implemented"; entry: CompletableEntry }>
  | Readonly<{ kind: "candidate-pass"; entry: CompletableEntry; drift: DriftFact }>;

export type CoverageRow = Readonly<{
  taskId: string;
  claim: string;
  verdict: ClaimVerdict;
}>;

/**
 * Why no Spec Index was available. An absent projection is an honest absence
 * with a stated reason — never a pass, and never silence.
 *
 * `unreadable` arises only where a missing spec is not itself a failure — at
 * decompose, where recording Requirement hashes is an enhancement. The Wave
 * Gate's own observation refuses outright instead, because gate evidence must
 * name exact bytes.
 */
export type SpecIndexUnavailable =
  | Readonly<{ kind: "no-spec-file" }>
  | Readonly<{ kind: "unreadable"; path: string; reason: string }>
  | Readonly<{
      kind: "unparsed";
      path: string;
      /** Digest of the exact bytes whose parse produced `errors`. */
      contentDigest: string;
      errors: NonEmpty<SpecParseError>;
    }>;

/**
 * A Spec Index observation. Every bytes-backed outcome carries the digest of
 * the exact bytes parsed; digest-less variants mean no bytes were observed.
 * The path is caller-supplied document identity and is proved against protected
 * authority by the Wave observation consumer.
 */
export type SpecIndexAvailability =
  | Readonly<{ kind: "indexed"; path: string; contentDigest: string; index: ParsedSpec }>
  | Readonly<{ kind: "unavailable"; reason: SpecIndexUnavailable }>;

/**
 * One Task's join input. `inCurrentWave` rides on the Task rather than arriving
 * as a separate id list: a roster and a list of ids can disagree, a flag on the
 * row cannot.
 *
 * `anchorHashes` is always a map — an empty one means the graph recorded
 * nothing, which is the same fact a missing field carries and needs no second
 * representation.
 */
export type CoverageTask = Readonly<{
  id: string;
  inCurrentWave: boolean;
  completionAnchors: readonly string[];
  /** Partial Requirement Contributions. Carried because a Wave that claims no
   * completion but contributes to a later one is a legitimate shape in this
   * domain: without this field the projection cannot tell it apart from a Wave
   * that traces nowhere, and asserted the latter about the former. */
  contributions: readonly string[];
  declaredFiles: readonly string[];
  modifiedFiles: readonly string[];
  anchorHashes: ReadonlyMap<string, RecordedHash>;
}>;

export type RequirementCoverage =
  | Readonly<{ kind: "unavailable"; reason: SpecIndexUnavailable }>
  | Readonly<{
      kind: "projected";
      /** One row per current-Wave Requirement Completion Claim, in roster order. */
      rows: readonly CoverageRow[];
      /** Functional Requirements whose *completion* no Task claims at any Wave.
       * Requirement Contributions are deliberately not counted — they are
       * partial traceability and never assert completion — so an FR listed here
       * may still have contributing work planned. Wave-independent, so it is
       * honest at every gate. */
      unclaimed: readonly SpecEntryId<"FR">[];
      /** The same join over Acceptance Scenarios. Without it the Agent has no
       * roster of scenarios to check coverage for, and the step that exists to
       * find uncovered scenarios silently iterates nothing. */
      unclaimedScenarios: readonly SpecEntryId<"AS">[];
      /** Whether this Wave traces to any Requirement at all through partial
       * Contributions, when it claims no completions. Distinguishes a
       * legitimate foundation Wave from work that traces nowhere. */
      tracesByContribution: boolean;
      /** The typed exclusion list, replacing a grep of the Out of Scope section. */
      exclusions: NonEmpty<SpecEntry<"OOS">>;
      /** The typed glossary, replacing a grep of the Appendix table. */
      glossary: NonEmpty<SpecGlossaryEntry>;
    }>;

/**
 * An entry as the join sees it. The family is decided once, at insertion, from
 * the collection the entry came out of — so nothing downstream re-derives it by
 * sniffing the identifier's prefix, which is exactly the drift the branded
 * families exist to prevent.
 */
type IndexedEntry =
  | Readonly<{ family: "completable"; entry: CompletableEntry }>
  | Readonly<{ family: "excluded"; entry: SpecEntry<"OOS"> }>;

const entryById = (index: ParsedSpec): ReadonlyMap<string, IndexedEntry> => {
  const byId = new Map<string, IndexedEntry>();
  for (const entry of [...index.frs, ...index.scenarios]) byId.set(entry.id, { family: "completable", entry });
  for (const entry of index.oos) byId.set(entry.id, { family: "excluded", entry });
  return byId;
};

/**
 * The recorded-vs-current comparison, as the only place a hash equality is
 * decided.
 *
 * Three different absences, three different facts: nothing recorded is
 * `unverifiable`, something recorded that the engine cannot have minted is
 * `unreadable-record`, and a recorded hash that disagrees is `drifted`. None of
 * them may be rendered as another — a graph carrying a value no engine could
 * have written is corrupt authority, not missing authority.
 */
function driftOf(
  anchorHashes: ReadonlyMap<string, RecordedHash>,
  claim: string,
  entry: CompletableEntry,
): DriftFact {
  const recorded = anchorHashes.get(claim);
  if (recorded === undefined) return Object.freeze({ kind: "unverifiable" });
  if (recorded.kind === "unreadable") {
    return Object.freeze({ kind: "unreadable-record", stored: recorded.stored });
  }
  return recorded.hash === entry.contentHash
    ? Object.freeze({ kind: "stable" })
    : Object.freeze({ kind: "drifted", recorded: recorded.hash, current: entry.contentHash });
}

/**
 * The single classification. Order is the point: an identifier that names
 * nothing cannot be assessed, an excluded identifier must not be assessed, and
 * a Requirement with no artifacts behind it has nothing to read — only what
 * survives all four gates earns a model's attention.
 */
function classify(
  task: CoverageTask,
  claim: string,
  byId: ReadonlyMap<string, IndexedEntry>,
): ClaimVerdict {
  const indexed = byId.get(claim);
  if (indexed === undefined) return Object.freeze({ kind: "unknown-requirement" });
  if (indexed.family === "excluded") {
    return Object.freeze({ kind: "excluded-requirement", entry: indexed.entry });
  }
  const entry = indexed.entry;
  if (task.declaredFiles.length === 0) return Object.freeze({ kind: "not-declared", entry });
  if (task.modifiedFiles.length === 0) return Object.freeze({ kind: "not-implemented", entry });
  return Object.freeze({ kind: "candidate-pass", entry, drift: driftOf(task.anchorHashes, claim, entry) });
}

/**
 * The sole Requirement Coverage Projection derivation.
 *
 * Total and deterministic: the same Spec Index and roster always produce the
 * same rows in the same order, so the projection can be hashed into request
 * authority like any other frozen input.
 */
export function projectRequirementCoverage(
  specIndex: SpecIndexAvailability,
  tasks: readonly CoverageTask[],
): RequirementCoverage {
  if (specIndex.kind === "unavailable") {
    return Object.freeze({ kind: "unavailable", reason: specIndex.reason });
  }
  const byId = entryById(specIndex.index);
  const rows: CoverageRow[] = [];
  const claimedAnywhere = new Set<string>();
  for (const task of tasks) {
    for (const claim of task.completionAnchors) {
      claimedAnywhere.add(claim);
      if (!task.inCurrentWave) continue;
      rows.push(Object.freeze({ taskId: task.id, claim, verdict: classify(task, claim, byId) }));
    }
  }
  const unclaimedOf = <F extends "FR" | "AS">(entries: readonly SpecEntry<F>[]): readonly SpecEntryId<F>[] =>
    Object.freeze(entries.filter(({ id }) => !claimedAnywhere.has(id)).map(({ id }) => id));
  return Object.freeze({
    kind: "projected",
    rows: Object.freeze(rows),
    tracesByContribution: tasks.some((task) => task.inCurrentWave && task.contributions.some((claim) =>
      byId.get(claim)?.family === "completable")),
    unclaimed: unclaimedOf(specIndex.index.frs),
    unclaimedScenarios: unclaimedOf(specIndex.index.scenarios),
    exclusions: specIndex.index.oos,
    glossary: specIndex.index.glossary,
  });
}

/**
 * The total renderer for every `SpecIndexUnavailable`. Exhaustive by
 * construction: a new reason cannot reach an operator without text.
 */
export function specIndexUnavailableMessage(reason: SpecIndexUnavailable): string {
  return match<SpecIndexUnavailable, string>(reason)
    .with({ kind: "no-spec-file" }, () => "the TaskGraph records no spec_file, so no Spec Index exists to join against")
    .with({ kind: "unreadable" }, ({ path, reason: cause }) => `spec file ${path} could not be read: ${cause}`)
    .with({ kind: "unparsed" }, ({ path, errors }) =>
      `spec file ${path} is not a canonical specification: ${errors.map(specParseErrorMessage).join("; ")}`)
    .exhaustive();
}

/**
 * Who decided a row. The engine decides everything structure can settle; only
 * a `candidate-pass` is handed to an Agent, whatever its severity — which is
 * why this is derived from the verdict's kind and never from its severity.
 */
export type ClaimDecider = "engine" | "agent";

export function claimDecider(verdict: ClaimVerdict): ClaimDecider {
  return verdict.kind === "candidate-pass" ? "agent" : "engine";
}

/**
 * How bad a row is, independent of who decides it. `NONE` is not "fine" — it
 * means the structure raised nothing and the Agent's assessment supplies the
 * verdict.
 */
export type ClaimSeverity = "CRITICAL" | "MEDIUM" | "NONE";

export function claimSeverity(verdict: ClaimVerdict): ClaimSeverity {
  return match<ClaimVerdict, ClaimSeverity>(verdict)
    .with(
      P.union(
        { kind: "unknown-requirement" },
        { kind: "excluded-requirement" },
        { kind: "not-declared" },
        { kind: "not-implemented" },
      ),
      () => "CRITICAL",
    )
    .with({ kind: "candidate-pass" }, ({ drift }) => match<DriftFact, ClaimSeverity>(drift)
      // A stored hash the engine cannot have minted is corrupt authority, not
      // missing authority, and outranks every other fact about the row.
      .with({ kind: "unreadable-record" }, () => "CRITICAL")
      .with({ kind: "drifted" }, () => "MEDIUM")
      .with({ kind: "unverifiable" }, () => "NONE")
      .with({ kind: "stable" }, () => "NONE")
      .exhaustive())
    .exhaustive();
}

declare const SETTLED_CRITICAL_COUNT: unique symbol;
export type SettledCriticalCount = number & { readonly [SETTLED_CRITICAL_COUNT]: true };

declare const SETTLED_CRITICAL_FINDING: unique symbol;
export type SettledCriticalFinding = string & { readonly [SETTLED_CRITICAL_FINDING]: true };

const settledFinding = (finding: string): SettledCriticalFinding => finding as SettledCriticalFinding;
const footerIdentity = (value: string): string => JSON.stringify(value).replace(/\|/gu, "\\u007c");

/**
 * The exact engine-derived CRITICAL lines the Agent must preserve in its
 * footer. Identity, not cardinality alone, binds captured evidence to the
 * structural defects rendered into its immutable packet.
 */
export function settledCriticalFindings(
  coverage: RequirementCoverage,
): readonly SettledCriticalFinding[] {
  if (coverage.kind === "unavailable") return Object.freeze([]);
  const rowFindings = coverage.rows
    .filter(({ verdict }) => claimSeverity(verdict) === "CRITICAL")
    .map((row) => settledFinding(
      `Task ${footerIdentity(row.taskId)} claim ${footerIdentity(row.claim)} — ${claimVerdictMessage(row.verdict)}`,
    ));
  const syntheticFinding = coverage.rows.length === 0 && !coverage.tracesByContribution
    ? [settledFinding("Current Wave has no Requirement Completion Claims or valid Requirement Contributions")]
    : [];
  const unclaimedRequirements = coverage.unclaimed.map((id) =>
    settledFinding(`${id} has no planned completion owner`));
  const unclaimedScenarios = coverage.unclaimedScenarios.map((id) =>
    settledFinding(`${id} has no planned completion owner`));
  return Object.freeze([
    ...rowFindings,
    ...syntheticFinding,
    ...unclaimedRequirements,
    ...unclaimedScenarios,
  ]);
}

/** The number and identities are derived from one projection expression. */
export function settledCriticalCount(coverage: RequirementCoverage): SettledCriticalCount {
  return settledCriticalFindings(coverage).length as SettledCriticalCount;
}

/**
 * The settled floor as it travels to a settlement path.
 *
 * Current floors carry the exact engine-derived CRITICAL lines rendered into
 * the Agent packet. `legacy-settled` is a parsed compatibility state for an
 * epoch written before identities were persisted; it remains count-enforced
 * for its original packet and upgrades on the next byte-identical install.
 */
export type SettledFloor =
  | Readonly<{
      kind: "settled";
      count: SettledCriticalCount;
      criticalFindings: readonly SettledCriticalFinding[];
    }>
  | Readonly<{ kind: "legacy-settled"; count: SettledCriticalCount }>
  | Readonly<{ kind: "unprojected"; reason: string }>;

declare const MANUAL_OVERRIDE_FLOOR: unique symbol;
/** Parser-minted authority from the separately authorized manual helper. */
export type ManualOverrideFloor = Readonly<{
  kind: "manual-override";
  reason: string;
  readonly [MANUAL_OVERRIDE_FLOOR]: true;
}>;
export type SpecCheckFloorAuthority = SettledFloor | ManualOverrideFloor;

/** The only mint for a current settled floor: a coverage projection decides it. */
export function settledFloorOf(coverage: RequirementCoverage): SettledFloor {
  if (coverage.kind === "unavailable") {
    return unprojectedFloor(specIndexUnavailableMessage(coverage.reason));
  }
  const criticalFindings = settledCriticalFindings(coverage);
  return Object.freeze({
    kind: "settled",
    count: criticalFindings.length as SettledCriticalCount,
    criticalFindings,
  });
}

/** A stated absence of projection authority; blank absence reasons are illegal. */
export function unprojectedFloor(reason: string): SettledFloor {
  if (reason.trim() === "") throw new Error("unprojected floor requires a non-empty reason");
  return Object.freeze({ kind: "unprojected", reason });
}

/** Mint authority for the already-approved manual helper path only. */
export function manualOverrideFloor(reason: string): ManualOverrideFloor {
  if (reason.trim() === "") throw new Error("manual override floor requires a non-empty reason");
  return Object.freeze({ kind: "manual-override", reason }) as ManualOverrideFloor;
}

const safeCount = (raw: unknown): SettledCriticalCount | null =>
  typeof raw === "number" && Number.isSafeInteger(raw) && raw >= 0
    ? raw as SettledCriticalCount
    : null;

const parseSettledCriticalFindings = (raw: unknown): readonly SettledCriticalFinding[] | null =>
  Array.isArray(raw) && raw.every((finding) => typeof finding === "string" && finding.trim() !== "")
    ? Object.freeze(raw.map((finding) => settledFinding(finding)))
    : null;

const hasExactFields = (record: Record<string, unknown>, fields: readonly string[]): boolean => {
  const actual = Object.keys(record).sort();
  const expected = [...fields].sort();
  return actual.length === expected.length && actual.every((field, index) => field === expected[index]);
};

/** Parse persisted current and historical settled-floor authority. */
const FLOOR_VARIANTS: Readonly<Record<SettledFloor["kind"], (record: Record<string, unknown>) => SettledFloor | null>> =
  Object.freeze({
    settled: (record) => {
      const count = safeCount(record.count);
      if (count === null) return null;
      if (record.criticalFindings === undefined) {
        return hasExactFields(record, ["kind", "count"])
          ? Object.freeze({ kind: "legacy-settled" as const, count })
          : null;
      }
      if (!hasExactFields(record, ["kind", "count", "criticalFindings"])) return null;
      const criticalFindings = parseSettledCriticalFindings(record.criticalFindings);
      return criticalFindings !== null && criticalFindings.length === count
        ? Object.freeze({ kind: "settled" as const, count, criticalFindings })
        : null;
    },
    "legacy-settled": (record) => {
      const count = safeCount(record.count);
      return count !== null && hasExactFields(record, ["kind", "count"])
        ? Object.freeze({ kind: "legacy-settled" as const, count })
        : null;
    },
    unprojected: (record) => hasExactFields(record, ["kind", "reason"]) &&
        typeof record.reason === "string" && record.reason.trim() !== ""
      ? Object.freeze({ kind: "unprojected" as const, reason: record.reason })
      : null,
  });

export function parseSettledFloor(raw: unknown): SettledFloor | null {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return null;
  const record = raw as Record<string, unknown>;
  const variant = typeof record.kind === "string"
    ? FLOOR_VARIANTS[record.kind as SettledFloor["kind"]]
    : undefined;
  return variant === undefined ? null : variant(record);
}

/**
 * The total renderer for every `ClaimVerdict`. Owning the prose in one place is
 * what lets every caller discriminate on `kind` instead of matching text.
 */
export function claimVerdictMessage(verdict: ClaimVerdict): string {
  return match<ClaimVerdict, string>(verdict)
    .with({ kind: "unknown-requirement" }, () =>
      "names no entry in the Spec Index — a Completion Claim that the specification does not define")
    .with({ kind: "excluded-requirement" }, ({ entry }) =>
      `claims completion of the explicitly excluded ${entry.id} — an Out-of-Scope item cannot be completed`)
    .with({ kind: "not-declared" }, ({ entry }) =>
      `claims ${entry.id} but the Task declared no artifacts, so nothing can satisfy it`)
    .with({ kind: "not-implemented" }, ({ entry }) =>
      `claims ${entry.id} but the Task modified no files`)
    .with({ kind: "candidate-pass" }, ({ entry, drift }) => match<DriftFact, string>(drift)
      .with({ kind: "unverifiable" }, () =>
        `${entry.id} is structurally covered; drift is unverifiable because no hash was recorded when the claim was made`)
      .with({ kind: "unreadable-record" }, ({ stored }) =>
        `${entry.id} is structurally covered but its recorded hash is not a value this engine could have written (stored ${JSON.stringify(stored.slice(0, 32))}) — the TaskGraph's Requirement hashes have been altered`)
      .with({ kind: "stable" }, () => `${entry.id} is structurally covered and its text is unchanged since the claim`)
      .with({ kind: "drifted" }, ({ recorded, current }) =>
        `${entry.id} is structurally covered but its text changed since the claim (recorded ${recorded.slice(0, 12)}, now ${current.slice(0, 12)})`)
      .exhaustive())
    .exhaustive();
}

/**
 * Make one value safe to place in a Markdown table cell.
 *
 * `claim` and `taskId` originate in the decompose payload, which is
 * agent-authored and validated only as non-empty strings. Interpolated raw,
 * one pipe or newline forges extra rows in a table the packet declares
 * engine-settled authority — so the untrusted text is neutralized at the one
 * seam where it becomes table structure.
 */
function cell(value: string): string {
  // Backslashes FIRST, then pipes. Escaping pipes alone turned an input that
  // already contained a backslash-pipe into an escaped BACKSLASH followed by a
  // LIVE delimiter — so a claim could still forge its own columns and push the
  // engine-settled ones out of the row entirely.
  return value.replace(/\\/gu, "\\\\").replace(/\|/gu, "\\|").replace(/[\r\n]+/gu, " ");
}

/** The Requirement's own text, for the rows where one exists. */
function requirementText(verdict: ClaimVerdict): string {
  return verdict.kind === "unknown-requirement" ? "—" : verdict.entry.content;
}

/** The honest-absence rendering: what is NOT carried is as load-bearing as what is. */
function renderUnavailable(reason: SpecIndexUnavailable): readonly string[] {
  return [
    "## Requirement Coverage Projection — UNAVAILABLE",
    "",
    `No structural projection was possible: ${specIndexUnavailableMessage(reason)}`,
    "",
    "Nothing below is settled. Every Requirement Completion Claim must be assessed by reading the",
    "specification and the code, and the Out-of-Scope list and glossary must be read from the",
    "specification directly — this projection carries neither.",
    "An unavailable projection is an absence of evidence, never a pass, and the report must say so.",
  ];
}

function renderRows(rows: readonly CoverageRow[], tracesByContribution: boolean): readonly string[] {
  if (rows.length === 0) {
    // Two different facts, and only one of them is a defect. A Wave that traces
    // NOWHERE is a decompose defect and settles CRITICAL. A Wave that traces
    // only through Requirement Contributions is a legitimate foundation Wave —
    // CONTEXT.md defines Contributions as exactly that — and asserting the
    // first about the second forced the Agent to substantiate a finding that
    // was false, with no remedy available to it.
    return tracesByContribution
      ? ["| — | — | engine | NONE | — |" +
          " this Wave's Tasks claim no Requirement completion; they trace through Requirement Contributions, which is a legitimate foundation Wave |"]
      : ["| — | — | engine | CRITICAL | — |" +
          " this Wave's Tasks make no Requirement Completion Claims and no Contributions, so no work in this Wave traces to a Requirement |"];
  }
  return rows.map((row) => [
    "|", cell(row.taskId),
    "|", cell(row.claim),
    "|", claimDecider(row.verdict),
    "|", claimSeverity(row.verdict),
    "|", cell(requirementText(row.verdict)),
    "|", cell(claimVerdictMessage(row.verdict)), "|",
  ].join(" "));
}

/** One unclaimed roster, rendered so an empty one still states its emptiness. */
function renderUnclaimed(heading: string, family: string, ids: readonly string[]): readonly string[] {
  return [
    `### ${heading} whose completion no Task claims, at any Wave`,
    "",
    ...(ids.length === 0
      ? [`Every ${family} in the Spec Index is claimed by some Task.`]
      : ids.map((id) => `- ${id} — CRITICAL: no Task in the graph claims its completion`)),
    "",
  ];
}

/**
 * The Requirement Coverage Projection as the spec-check Agent reads it.
 *
 * Deterministic text: the same projection always renders the same bytes, so the
 * rendering contributes to Context Packet identity like any other frozen input.
 * The `Decided by` column, not the severity, says which rows the Agent still
 * has work to do on.
 */
export function renderRequirementCoverage(coverage: RequirementCoverage): string {
  if (coverage.kind === "unavailable") return renderUnavailable(coverage.reason).join("\n");
  const criticalFindings = settledCriticalFindings(coverage);
  return [
    "## Requirement Coverage Projection",
    "",
    "Engine-derived structural verdicts. A row decided by `engine` is settled — copy it into the",
    "report verbatim; it is not yours to overturn. A row decided by `agent` still needs you to read",
    "the code, **including** rows already carrying a `MEDIUM` or `CRITICAL` severity: severity says",
    "how bad the structural fact is, `Decided by` says whether an assessment is still owed.",
    "",
    "| Task | Claim | Decided by | Severity | Requirement | Detail |",
    "|---|---|---|---|---|---|",
    ...renderRows(coverage.rows, coverage.tracesByContribution),
    "",
    ...renderUnclaimed("Functional Requirements", "Functional Requirement", coverage.unclaimed),
    ...renderUnclaimed("Acceptance Scenarios", "Acceptance Scenario", coverage.unclaimedScenarios),
    "### Required settled CRITICAL footer lines",
    "",
    "Copy every line below verbatim into the machine-readable footer. These structural findings remain",
    "CRITICAL even when an agent-decided row's implementation assessment passes.",
    "",
    ...(criticalFindings.length === 0
      ? ["No settled CRITICAL footer lines."]
      : criticalFindings.map((finding) => `CRITICAL: ${finding}`)),
    "",
    "### Out of Scope (typed exclusion list)",
    "",
    ...coverage.exclusions.map(({ id, content }) => `- ${id}: ${content}`),
    "",
    "### Glossary (typed terms)",
    "",
    ...coverage.glossary.map(({ term, definition }) => `- ${term}: ${definition}`),
    "",
    `Settled CRITICAL findings: ${criticalFindings.length}. Your report may not fall below this count.`,
  ].join("\n");
}

/**
 * The Spec Index content hash for every claim the Task can be joined to, as the
 * specification stands at the moment the Task→Requirement edge is created.
 *
 * The inverse of the drift comparison above, and the reason `driftOf` can ever
 * answer anything but `unverifiable`. Hashes are taken from the entries
 * themselves, never recomputed: an entry's hash is derived from its own
 * canonical content by the parser's smart constructor, so re-deriving it here
 * would introduce a second canonicalization that could disagree with the first.
 * The brand rides all the way to the persistence edge, where the caller widens
 * it once rather than every reader re-earning it.
 *
 * Unknown identifiers are omitted rather than stamped with a placeholder. A
 * recorded hash asserts "the Requirement said this when the edge was made", and
 * there is nothing to assert about an identifier the specification does not
 * define — the projection reports that separately, as `unknown-requirement`.
 */
export function recordedAnchorHashes(
  index: ParsedSpec,
  completionAnchors: readonly string[],
): Readonly<Record<string, SpecContentHash>> {
  const byId = entryById(index);
  const hashes: Record<string, SpecContentHash> = {};
  for (const claim of completionAnchors) {
    const indexed = byId.get(claim);
    if (indexed !== undefined) hashes[claim] = indexed.entry.contentHash;
  }
  return Object.freeze(hashes);
}

/**
 * The spec file an observation was taken from, whichever way it turned out.
 *
 * Total accessor owned by the type, so a caller proving the observation names
 * the protected `spec_file` does not have to re-derive the path from each
 * variant — and a new variant cannot silently answer `null`.
 */
export function specIndexPath(availability: SpecIndexAvailability): string | null {
  return match<SpecIndexAvailability, string | null>(availability)
    .with({ kind: "indexed" }, ({ path }) => path)
    .with({ kind: "unavailable", reason: { kind: "no-spec-file" } }, () => null)
    .with({ kind: "unavailable", reason: { kind: "unreadable" } }, ({ reason }) => reason.path)
    .with({ kind: "unavailable", reason: { kind: "unparsed" } }, ({ reason }) => reason.path)
    .exhaustive();
}

/** The digest of every bytes-backed parse outcome; `null` when no bytes were observed. */
export function specIndexDigest(availability: SpecIndexAvailability): string | null {
  if (availability.kind === "indexed") return availability.contentDigest;
  return availability.reason.kind === "unparsed" ? availability.reason.contentDigest : null;
}
