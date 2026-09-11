/**
 * Existing lineage entry surface for source, policy and successor consumers.
 * The Standalone Review aggregate owns implementation and private LC-2 custody;
 * these named exports preserve caller paths without exposing a registration seam.
 */
export {
  standaloneOriginReference,
  standaloneDecisionReference,
  parseFindingOrigin,
  findingOf,
  parseStandaloneLineageInventory,
  prepareStandaloneLineageSource,
  prepareStandaloneDisposition,
  readPublishedStandaloneDisposition,
  projectStandaloneLineageSource,
  prepareStandaloneSuccessor,
  assessStandaloneSuccessor,
  aggregateStandaloneAssessments,
  attributeStandaloneSuccessorFindings,
  type StandaloneLineageSource,
  type PreparedStandaloneDisposition,
  type StandaloneDispositionPublicationReference,
  type PublishedStandaloneDisposition,
  type StandaloneDispositionPublicationReader,
  type StandaloneDispositionSelection,
  type PreparedStandaloneSuccessor,
} from "./standalone-review";
