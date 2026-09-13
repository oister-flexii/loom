import { mkdirSync, rmSync, writeFileSync, chmodSync, truncateSync, symlinkSync, lstatSync, readFileSync } from "node:fs";
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
      mkdirSync(join(p, "outside")); symlinkSync(join(p, "outside"), join(p, "linked-directory"));
      for (const path of ["alias", "directory", "linked-directory/missing.ts"]) {
        expect(observeStandaloneSuccessorSource([path], () => "a".repeat(40)).ok).toBe(false);
      }
      const absent = observeStandaloneSuccessorSource(["missing"], () => "a".repeat(40));
      expect(absent.ok).toBe(true); if (!absent.ok) return;
      expect(successorSourceSnapshot(absent.value, ["missing"])).toEqual({ ok: true, value: [{ kind: "absent", path: "missing" }] });
    });
  });
  it("rejects disappearance during reading or the post-read stability probe after observing presence", async () => {
    const p = root(); await owned(p, async () => {
      const { observeStandaloneSuccessorSource } = await import("../../../../src/handlers/helpers/programs/standalone-successor-source");
      const path = join(p, "raced"); writeFileSync(path, "bytes");
      const present = lstatSync(path);
      const missing = () => Object.assign(new Error("removed"), { code: "ENOENT" });
      let heads = 0; const head = () => { heads += 1; return "a".repeat(40); };

      const duringRead = observeStandaloneSuccessorSource([path], head, {
        lstat: () => present,
        read: () => { throw missing(); },
      });
      expect(duringRead).toEqual({ ok: false, message: `successor source unavailable: successor source ${path} changed during observation` });

      let probes = 0;
      const afterRead = observeStandaloneSuccessorSource([path], head, {
        lstat: () => { probes += 1; if (probes === 1) return present; throw missing(); },
        read: () => Buffer.from("bytes"),
      });
      expect(afterRead).toEqual({ ok: false, message: `successor source unavailable: successor source ${path} changed during observation` });
      expect(heads).toBe(0);
    });
  });
  it("rejects a torn multi-file snapshot when a later read changes an earlier observed file", async () => {
    const p = root(); await owned(p, async () => {
      const { observeStandaloneSuccessorSource } = await import("../../../../src/handlers/helpers/programs/standalone-successor-source");
      writeFileSync("first", "old"); writeFileSync("second", "trigger");
      let heads = 0;
      const observed = observeStandaloneSuccessorSource(["first", "second"], () => { heads += 1; return "a".repeat(40); }, {
        lstat: lstatSync,
        read: (path) => {
          const bytes = readFileSync(path);
          if (path === "second") writeFileSync("first", "new content");
          return bytes;
        },
      });
      expect(observed).toEqual({ ok: false, message: "successor source unavailable: successor source first changed during observation" });
      expect(heads).toBe(1);
    });
  });

  it("keeps Git/reviewer metadata inside the final source stability window", async () => {
    const p = root(); await owned(p, async () => {
      const { observeStableStandaloneSuccessorSource } = await import("../../../../src/handlers/helpers/programs/standalone-successor-source");
      writeFileSync("source.ts", "old");
      const changedDuringMetadata = observeStableStandaloneSuccessorSource(["source.ts"], () => {
        writeFileSync("source.ts", "new metadata-era bytes");
        return { headRevision: "a".repeat(40), value: { additions: 1 } };
      });
      expect(changedDuringMetadata).toEqual({
        ok: false,
        message: "successor source unavailable: successor source source.ts changed during observation",
      });

      rmSync("missing.ts", { force: true });
      const appearedDuringMetadata = observeStableStandaloneSuccessorSource(["missing.ts"], () => {
        writeFileSync("missing.ts", "appeared");
        return { headRevision: "a".repeat(40), value: { additions: 1 } };
      });
      expect(appearedDuringMetadata).toEqual({
        ok: false,
        message: "successor source unavailable: successor source missing.ts changed during observation",
      });
    });
  });

  it("rejects forged frozen-source section identity and malformed source facts", async () => {
    const p = root(); await owned(p, async () => {
      const { encodeByteSection } = await import("../../../../src/core/context-packets");
      const { observeStandaloneSuccessorSource, successorSourceSnapshot, SUCCESSOR_SOURCE_BYTES } =
        await import("../../../../src/handlers/helpers/programs/standalone-successor-source");
      writeFileSync("source.ts", "bytes");
      const section = observeStandaloneSuccessorSource(["source.ts"], () => "a".repeat(40));
      if (!section.ok) throw new Error(section.message);
      const source = JSON.parse(Buffer.from(section.value.bytes).toString()) as {
        schemaVersion: number;
        headRevision: string;
        files: Record<string, unknown>[];
      };
      const binary = source.files[0]!;

      for (const forged of [
        { ...section.value, label: "other" },
        { ...section.value, byteLength: section.value.byteLength + 1 },
        { ...section.value, digest: "f".repeat(64) },
      ]) {
        expect(successorSourceSnapshot(forged as never, ["source.ts"]).ok).toBe(false);
      }

      const mutations: unknown[] = [
        { ...source, extra: true },
        { ...source, schemaVersion: 1 },
        { ...source, headRevision: "not-a-revision" },
        { ...source, files: [] },
        { ...source, files: [{ ...binary, path: "other.ts" }] },
        { ...source, files: [{ ...binary, mode: "100777" }] },
        { ...source, files: [{ ...binary, contentBase64: "%%%" }] },
        { ...source, files: [{ ...binary, byteLength: 99 }] },
        { ...source, files: [{ ...binary, digest: "f".repeat(64) }] },
        { ...source, files: [{ ...binary, byteLength: SUCCESSOR_SOURCE_BYTES + 1 }] },
        { ...source, files: [{ path: "source.ts", kind: "absent", digest: null, byteLength: 0, extra: true }] },
      ];
      for (const mutation of mutations) {
        const encoded = encodeByteSection("standalone-frozen-source", JSON.stringify(mutation));
        if (!encoded.ok) throw new Error(encoded.error.message);
        expect(successorSourceSnapshot(encoded.value, ["source.ts"]).ok).toBe(false);
      }
    });
  });
});
