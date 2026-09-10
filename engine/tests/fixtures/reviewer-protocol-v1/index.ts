import { closeSync, constants, fstatSync, openSync, readSync } from "node:fs";
import inventory from "./inventory.json";
import storage from "./storage.json";
import { decodeReviewerV1Pack } from "./pack";

export type ReviewerV1Golden = Readonly<{
  files: ReadonlyMap<string, Uint8Array>;
  resultDigest: string;
  resultByteLength: number;
}>;

/** Test-only byte inventory, not a relocated RunDirHandle or result authority. */
export function loadReviewerV1Golden(
  name: "pr48-clean" | "seven-reviewers-retry",
): ReviewerV1Golden {
  const entry = inventory.goldens.find((golden) => golden.name === name);
  if (entry === undefined) throw new Error(`Unknown historical golden: ${name}`);
  const limit = storage.goldens[name].compressedByteLength;
  const fd = openSync(new URL(`./${name}.json.gz`, import.meta.url), constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const stat = fstatSync(fd);
    if (!stat.isFile() || stat.size !== limit) throw new Error(`Historical golden pack size/type differs: ${name}`);
    // One extra byte detects growth without an unbounded readFileSync allocation.
    const compressed = Buffer.alloc(limit + 1);
    let length = 0;
    while (length < compressed.length) {
      const count = readSync(fd, compressed, length, compressed.length - length, null);
      if (count === 0) break;
      length += count;
    }
    const decoded = decodeReviewerV1Pack(name, compressed.subarray(0, length));
    if (!decoded.ok) throw new Error(`Historical golden pack refused: ${name}/${decoded.error}`);
    return Object.freeze({ files: decoded.value, resultDigest: entry.resultDigest, resultByteLength: entry.resultByteLength });
  } finally {
    closeSync(fd);
  }
}
