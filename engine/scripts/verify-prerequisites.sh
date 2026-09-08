#!/usr/bin/env bash
set -euo pipefail

for tool in bun node npm jq bash git timeout; do
  command -v "$tool" >/dev/null || { printf 'Verification blocked: missing %s\n' "$tool" >&2; exit 1; }
done
[[ "$BASH_VERSINFO" -ge 4 ]] || { printf 'Verification blocked: Bash 4+ required\n' >&2; exit 1; }

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
for executable in "$ROOT/node_modules/.bin/pi" "$ROOT/engine/node_modules/.bin/vitest"; do
  test -x "$executable" || { printf 'Verification blocked: install both frozen locks; missing %s\n' "$executable" >&2; exit 1; }
done
# npm includes ancestor .bin directories. Reject shadowing as well as global fallback.
[[ "$(command -v pi)" = "$ROOT/node_modules/.bin/pi" ]] || {
  printf 'Verification blocked: pi must resolve to the root locked installation\n' >&2
  exit 1
}
