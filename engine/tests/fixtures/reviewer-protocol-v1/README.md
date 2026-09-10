# Reviewer-v1 byte-exact historical goldens

Captured read-only before parser changes on baseline **224f0d74373ddab619c1620738c5ba4fa6b44e0e**. `inventory.json` lists **every regular file** in each original source, exact relative paths, SHA-256 hashes, byte lengths, and source locations. Source inventories and hashes matched before and after copying. No symlinks were followed, files redacted, metadata rewritten, or live Runs started/resumed.

| Golden | Files | Total bytes | `result.json` bytes | Result SHA-256 |
|---|---:|---:|---:|---|
| `pr48-clean` | 31 | 6,567,072 | 4,485 | `22619aea74b057a82c361da6f0bb7f55c6f9f95d9a1bce515ceafa6e4069c58e` |
| `seven-reviewers-retry` | 59 | 13,683,335 | 16,038 | `78213a071825e206547f8bbabd3b8c2ed8b2f396fad34c5c918c48d0eb83fbb2` |

Inventories retain complete registration, anchoring metadata, checkpoint, all contexts (including source byte sections and unissued attempt-two packets), requests, publications, transcripts, result receipts, and every present capture receipt/event/correlator. PR48 contains **no separate capture receipts**; none were invented. The seven-reviewer source contains 11 capture receipts and its panel authority, three accepted verdict events plus tally event, and completed panel state inside the original checkpoint. No separate panel files were invented.

## Lossless repository storage

The **90 logical files / 20,250,407 original bytes** are stored in two binary gzip packs, not 90 loose files. `inventory.json` is unchanged and remains the logical path/length/SHA-256 authority. No evidence was deleted, redacted, normalized, or replaced with regenerated receipts.

| Pack | Compressed bytes | Decompressed storage JSON bytes | Compressed SHA-256 |
|---|---:|---:|---|
| `pr48-clean.json.gz` | 1,280,350 | 8,759,255 | `17b6f6f1ca1affac114482ed2adbb4ac17871dc5822db02d2e78e6b336a87c4d` |
| `seven-reviewers-retry.json.gz` | 2,115,409 | 18,250,725 | `db6984a71ed38c6dc6191f9c58d15da5f186e9e5c85e1b69b2406afb81c01380` |

Total compressed storage: **3,395,759 bytes** (83.23% smaller than loose logical bytes). `storage.json` records only this storage format and each pack's compressed length/hash and expected decompressed length; it grants no review authority.

Format `gzip-json-path-base64bytes-v1`: UTF-8 `JSON.stringify` of an array of `{path, base64bytes}` objects, with those two keys in that order, entries ordered exactly as the original inventory, standard padded canonical base64, no whitespace/BOM/trailing newline. The committed packs were compressed with Node `gzipSync(bytes, {level: 9})` (zero gzip MTIME, no filename). Tests pin their exact compressed SHA-256/length against `storage.json`, require byte-identical repeated encoding within one runtime, and compare inflated stored/re-encoded bytes to the exact canonical container. Reproduction uses original bytes from `loadReviewerV1Golden`, not parsed/reserialized artifact JSON. Valid deflate encodings are not unique across compression implementations, even with matching runtime version labels; re-encoding need not reproduce the committed gzip bytes and does not require changing storage. An alternative valid level-0 encoding must inflate to the same canonical container and all 90 exact original files, but remains refused by the pinned-pack decoder. This portability control grants no hash bypass: the stored packs and strict parser remain unchanged.

The cold loader opens only the selected fixed pack with no-follow, checks regular-file type/size, and reads at most the known compressed length plus one byte. Inflation uses `maxOutputLength` computed from original inventory path encodings and `4 * ceil(byteLength / 3)` per entry—not from gzip headers or decoded input. The parser rejects oversize input, malformed gzip/UTF-8/JSON, noncanonical or duplicate keys/base64, missing/extra/duplicate/reordered/transposed paths, and every logical length/hash mismatch before returning a map. No unpack directories, shell tools, dependencies, input-directed filesystem reads, path writes or caches are involved. Raw custody copies were independently verified outside the repository before removing only the inventoried loose fixture files; original adjacent-checkout sources were never modified.

## Test-only loader

```ts
loadReviewerV1Golden(name: "pr48-clean" | "seven-reviewers-retry"): ReviewerV1Golden

type ReviewerV1Golden = Readonly<{
  files: ReadonlyMap<string, Uint8Array>;
  resultDigest: string;
  resultByteLength: number;
}>;
```

`index.ts` reads the bounded pack; test-only `pack.ts` checks storage integrity and all inventory hashes/lengths, returning fresh copies of the original bytes on every call. Keys are exact relative artifact paths. The type is readonly; byte arrays are caller-owned copies, not runtime-frozen typed arrays. Mutation tests clone arrays/maps and never change the baseline map or disk fixtures.

## What replay proves—and does not

`engine/tests/core/reviewer-protocol-history.test.ts` replays both actual LC-2 checkpoints through production pure parsers, using the real published receipts through an in-memory publication adapter. Its in-memory reviewer-protocol resolver independently parses the original registration and joins original packets/reservations/subject bindings through production issuance parsing; the integrated LC-2 reader requires that resolver and independently registered authority. A ready-state **in-memory projection** lets the real opaque result parser check the independent `result.json` and publication receipt. Result serialization, bytes, hashes, lengths, counts, IDs, duplicates, attempts, and panel outcomes remain exact.

The integrated `replay` call supplies both required authority inputs. The loader never fabricates opaque result authority or infers protocol from transcript shape. These tests are semantic replay/byte compatibility, **not relocated filesystem admission, checkpoint-independent shell replay, or native CLI evidence**.

Anchoring is intentionally unchanged. PR48 anchors to its original `loom-verification-junit` directory. The seven-reviewer source, although captured from that adjacent checkout, still anchors to `/home/peterstorm/dev/claude-plugins/loom/.claude/reviews/standalone-review-runs/run.Ca7oS7jRRX`. Neither copied inventory is a legitimate relocated `RunDirHandle`. Tests never call `openRunDirectory`, touch the originals, or run a CLI. An old/mismatched fixture must remain refused at native admission, not be repaired by rewriting its authority or unsetting runtime admission variables. Separate native tests use legitimately created disposable fixtures and a matching child-only runtime handshake; their native/P3 evidence does not come from relocating these goldens.

## Clearly separate illustrative cases

`illustrative/*.raw` are authored parser examples, **not historical transcripts or authoritative Runs**. They pin malformed-block fallback, both synthetic shortfalls, whitespace/sentinel normalization, and duplicate multiplicity. Tests also use production reducers over the actual issued v1 inputs to create **in-memory illustrative unfinished prefixes**: pending attempt one, pending attempt two without publication, and partially reserved attempt two, all retaining an accepted sibling. These are not claimed recovered historical unfinished checkpoints and are never written into either golden pack.

Baseline instruction archive: `references/reviewer-protocol-v1/`.
