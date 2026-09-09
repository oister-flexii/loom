import {
  prepareDefectFamilyAccounting,
  evaluateInstallableDefectFamilyAccounting,
  prepareDefectFamilyVerification,
} from "../../src/core/defect-family-accounting";
import {
  auditRemediationPaths,
  parseRepositorySnapshotWitness,
  prepareVerifiedIndexInstallation,
  stageTemporaryIndex,
  startRemediation,
  verifyTemporaryIndex,
  type CurrentVerifiedIndexInstallation,
} from "../../src/core/remediation-machine";
import { captureRemediationCandidateWorkspace } from "../../src/orchestration/remediation-candidate";
import {
  digestTemporaryIndex,
  observeDirtyPaths,
  observeStagedPaths,
  readStagedPaths,
  snapshotRepositoryWitness,
  type GitRepository,
  type TemporaryIndex,
} from "../../src/orchestration/git-remediation";
import { standaloneFixture, valueOf } from "./standalone-remediation-authority";

/** Build real opaque P3 installation authority around an already-staged fixture index. */
export function verifiedRemediationInstallation(
  repository: GitRepository,
  temporary: TemporaryIndex,
): CurrentVerifiedIndexInstallation {
  const stagedPaths = valueOf(readStagedPaths(repository, temporary));
  if (stagedPaths.length === 0) throw new Error("fixture installation requires a non-empty staged path set");
  const standalone = standaloneFixture(stagedPaths, false);
  const accounting = valueOf(prepareDefectFamilyAccounting(standalone.input.standaloneResult, { kind: "not-required" }));
  const plan = valueOf(prepareDefectFamilyVerification(accounting, null));
  if (plan.kind !== "not-required") throw new Error("fixture not-required plan required");
  const started = valueOf(startRemediation(standalone.input));
  const dirty = valueOf(observeDirtyPaths(repository));
  const preexisting = valueOf(observeStagedPaths(repository));
  const rawWitness = valueOf(snapshotRepositoryWitness(repository));
  const repositoryWitness = valueOf(parseRepositorySnapshotWitness(rawWitness));
  const actualPaths = dirty.map(({ path }) => path).sort();
  if (JSON.stringify(actualPaths) !== JSON.stringify(stagedPaths)) {
    throw new Error(`fixture dirty paths must equal temporary staged paths: ${actualPaths.join(", ")}`);
  }
  const audited = valueOf(auditRemediationPaths(started.authority, {
    expectedDirtyPaths: actualPaths,
    actualDirtyPaths: dirty,
    preexistingStagedPaths: preexisting,
    repositoryWitness,
  }));
  const candidate = valueOf(captureRemediationCandidateWorkspace({
    repositoryStartPath: repository.root,
    verification: plan,
    pathSources: {
      reviewedPaths: stagedPaths,
      supportPaths: [],
      siblingPaths: [],
      inputSourcePaths: [],
    },
    runDirectory: temporary.directory,
  }, repositoryWitness));
  const stagedDigest = valueOf(digestTemporaryIndex(repository, temporary));
  const staged = valueOf(stageTemporaryIndex(audited, stagedDigest, repositoryWitness));
  const verified = valueOf(verifyTemporaryIndex(staged, {
    actualTemporaryIndexStagedPaths: stagedPaths,
    actualIndexDigest: stagedDigest,
    currentRepositoryWitness: repositoryWitness,
  }));
  const installable = valueOf(evaluateInstallableDefectFamilyAccounting(plan, candidate.candidateWitness, {
    auditedInstalledPaths: audited.paths.paths,
    dirtyOrStagedPaths: actualPaths,
  }, []));
  return valueOf(prepareVerifiedIndexInstallation(
    verified,
    installable,
    `effect:test-install:${verified.digest}`,
    repositoryWitness,
    candidate.candidateWitness,
  ));
}
