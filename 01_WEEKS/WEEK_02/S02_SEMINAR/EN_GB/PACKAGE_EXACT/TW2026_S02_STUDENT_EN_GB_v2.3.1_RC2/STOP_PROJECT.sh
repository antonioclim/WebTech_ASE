#!/usr/bin/env sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
command -v node >/dev/null 2>&1 || { printf '%s\n' 'INFO: Node.js was not found; nothing was stopped.'; exit 0; }
exec node "$ROOT/90_AUDIT/tools/stop-project.mjs"
