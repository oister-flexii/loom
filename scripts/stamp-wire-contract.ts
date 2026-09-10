#!/usr/bin/env bun
/**
 * Stamp the Wire Contract (see CONTEXT.md) into every finding-producing
 * reviewer agent file.
 *
 * The contract's single source is renderReviewerWireContract(). The shared
 * fragment AND each reviewer region are generated from the executable codec;
 * a schema/rubric change requires an explicit supported contract revision. The reviewer
 * roster is derived from the Agent Catalog (kind `reviewer`), so a new
 * reviewer is stamped the moment it is catalogued; a reviewer file missing
 * its markers fails loudly here and in engine/tests/wire-contract.test.ts.
 *
 * Usage: bun scripts/stamp-wire-contract.ts [--check]
 *   --check  exit 1 if any stamped region differs from the fragment (no writes)
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { agentsOfKind } from "../engine/src/core/model-profiles";
import { renderReviewerWireContract } from "../engine/src/core/reviewer-protocol";
import { WIRE_CONTRACT_END, WIRE_CONTRACT_START, stampWireContract } from "../engine/src/core/wire-contract";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const check = process.argv.includes("--check");
const fragment = renderReviewerWireContract();
const fragmentPath = join(ROOT, "agents", "_shared", "wire-contract.md");
let drifted = 0;
if (readFileSync(fragmentPath, "utf-8") !== fragment) {
  drifted += 1;
  if (check) console.error("shared wire fragment differs from executable reviewer contract");
  else writeFileSync(fragmentPath, fragment);
}
for (const agent of agentsOfKind("reviewer")) {
  const path = join(ROOT, "agents", `${agent}.md`);
  const current = readFileSync(path, "utf-8");
  const stamped = stampWireContract(current, fragment);
  if (!stamped.ok) {
    console.error(`${agent}: ${stamped.error} (expected ${WIRE_CONTRACT_START} … ${WIRE_CONTRACT_END})`);
    process.exit(1);
  }
  if (stamped.value === current) continue;
  drifted += 1;
  if (check) {
    console.error(`${agent}: stamped region differs from agents/_shared/wire-contract.md`);
  } else {
    writeFileSync(path, stamped.value);
    process.stdout.write(`stamped ${agent}\n`);
  }
}

if (check && drifted > 0) process.exit(1);
process.stdout.write(
  check ? "wire contract regions match the fragment\n" : `done (${drifted} file(s) updated)\n`,
);
