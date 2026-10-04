#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd -- "$(dirname -- "$0")" && pwd -P)"
if ! command -v node >/dev/null 2>&1; then printf '%s\n' 'STOP_NODE_NOT_FOUND: use the approved runtime setup route; no installation is performed.' >&2; exit 2; fi
exec node "$ROOT/tools/tw-kit.mjs" initial
