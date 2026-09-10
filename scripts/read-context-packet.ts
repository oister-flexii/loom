#!/usr/bin/env bun
/** Read-only shell for already-issued context; never opens a Run handle or publishes authority. */
import { parseContextProjectionArguments, projectContextPacket } from "../engine/src/core/context-packet-projection";
import { safeIoCause } from "../engine/src/core/safe-io-cause";
import { readRunBytesNoFollow } from "../engine/src/orchestration/no-follow-fs";

const input = parseContextProjectionArguments(process.argv.slice(2));
try {
  if (!input.ok) throw new Error(input.error);
  // This is a helper resource bound, not a new Context Packet protocol bound.
  const bytes = readRunBytesNoFollow(input.value.path, 128 * 1024 * 1024);
  const raw: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  const projected = projectContextPacket(raw, input.value);
  if (!projected.ok) throw new Error(projected.error);
  const output = JSON.stringify(projected.value);
  if (Buffer.byteLength(output) > 48 * 1024) throw new Error("projection exceeds output bound");
  process.stdout.write(output + "\n");
} catch (cause) {
  process.stderr.write(`Context Packet read failed (${safeIoCause(cause)}): unavailable/unsafe file, invalid packet or expected identity, or invalid selection/page. No authority granted.\n`);
  process.exitCode = 1;
}
