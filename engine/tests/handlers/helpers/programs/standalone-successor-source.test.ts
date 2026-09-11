import { mkdirSync, rmSync, writeFileSync, chmodSync, truncateSync, symlinkSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import fc from "fast-check";
import { canonicalTempDir } from "../../../fixtures/canonical-temp-dir";
import { disposeFixturePiSessions, withFixturePiSession } from "../../../fixtures/pi-session";
const roots: string[] = [];
const operations = new Set<Promise<void>>();
function owned<T>(root: string, operation: () => Promise<T>) {
  const result = withFixturePiSession(root, operation); const settled = result.then(() => undefined, () => undefined);
  operations.add(settled); void settled.then(() => operations.delete(settled)); return result;
}
afterEach(async () => { await Promise.all([...operations]); disposeFixturePiSessions(); for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }); });
const root = () => { const path = canonicalTempDir("loom-p5-source-bytes-"); roots.push(path); return path; };

describe.sequential("bounded successor source observation", () => {
  it("preserves arbitrary binary bytes and actual modes independent of HEAD", async () => {
    const p = root(); await owned(p, async () => {
      const { observeStandaloneSuccessorSource, successorSourceSnapshot } = await import("../../../../src/handlers/helpers/programs/standalone-successor-source");
      fc.assert(fc.property(fc.uint8Array({ maxLength: 1024 }), fc.boolean(), (bytes, executable) => {
        writeFileSync(join(p, "a.bin"), bytes); chmodSync(join(p, "a.bin"), executable ? 0o755 : 0o644);
        const section = observeStandaloneSuccessorSource(["a.bin"], () => "a".repeat(40));
        expect(section.ok).toBe(true); if (!section.ok) return;
        const source = JSON.parse(Buffer.from(section.value.bytes).toString());
        expect(Buffer.from(source.files[0].contentBase64, "base64")).toEqual(Buffer.from(bytes));
        const parsed = successorSourceSnapshot(section.value, ["a.bin"]);
        expect(parsed).toEqual({ ok: true, value: [{ kind: "present", path: "a.bin", mode: executable ? "100755" : "100644",
          digest: createHash("sha256").update(bytes).digest("hex") }] });
      }));
    });
  });
  it("checks sparse file, combined byte and path budgets before requesting HEAD or allocating file bodies", async () => {
    const p = root(); await owned(p, async () => {
      const { observeStandaloneSuccessorSource, SUCCESSOR_SOURCE_BYTES, SUCCESSOR_SOURCE_FILE_BYTES } = await import("../../../../src/handlers/helpers/programs/standalone-successor-source");
      let heads = 0; const head = () => { heads += 1; return "a".repeat(40); };
      writeFileSync(join(p, "large"), "x"); truncateSync(join(p, "large"), 1024 * 1024 * 1024);
      expect(observeStandaloneSuccessorSource(["large"], head).ok).toBe(false); expect(heads).toBe(0);
      expect(SUCCESSOR_SOURCE_BYTES).toBe(2_097_152); expect(SUCCESSOR_SOURCE_FILE_BYTES).toBe(524_288);
      const paths = ["a", "b", "c", "d"];
      for (const path of paths) writeFileSync(join(p, path), Buffer.alloc(SUCCESSOR_SOURCE_FILE_BYTES));
      writeFileSync(join(p, "extra"), "x");
      expect(observeStandaloneSuccessorSource([...paths, "extra"], head).ok).toBe(false); expect(heads).toBe(0);
      expect(observeStandaloneSuccessorSource(Array.from({ length: 4097 }, (_, i) => String(i)), head).ok).toBe(false); expect(heads).toBe(0);
      expect(observeStandaloneSuccessorSource(paths, head).ok).toBe(true); expect(heads).toBe(1);
    });
  });
  it("refuses symlink/nonregular source rather than widening scope; genuine absence remains absence", async () => {
    const p = root(); await owned(p, async () => {
      const { observeStandaloneSuccessorSource, successorSourceSnapshot } = await import("../../../../src/handlers/helpers/programs/standalone-successor-source");
      writeFileSync(join(p, "target"), "bytes"); symlinkSync(join(p, "target"), join(p, "alias")); mkdirSync(join(p, "directory"));
      for (const path of ["alias", "directory"]) expect(observeStandaloneSuccessorSource([path], () => "a".repeat(40)).ok).toBe(false);
      const absent = observeStandaloneSuccessorSource(["missing"], () => "a".repeat(40));
      expect(absent.ok).toBe(true); if (!absent.ok) return;
      expect(successorSourceSnapshot(absent.value, ["missing"])).toEqual({ ok: true, value: [{ kind: "absent", path: "missing" }] });
    });
  });
});
