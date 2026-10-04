#!/usr/bin/env sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
if ! command -v node >/dev/null 2>&1; then
  printf '%s\n' 'STOP: Node.js was not found. Opening the offline fallback only.' >&2
  if command -v open >/dev/null 2>&1; then open "$ROOT/04_OFFLINE_FALLBACK/OFFLINE_VIEWPORT_LAB_S02_v2.3_EN_GB.html"; elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$ROOT/04_OFFLINE_FALLBACK/OFFLINE_VIEWPORT_LAB_S02_v2.3_EN_GB.html"; fi
  exit 2
fi
exec node "$ROOT/90_AUDIT/tools/run-project.mjs"
