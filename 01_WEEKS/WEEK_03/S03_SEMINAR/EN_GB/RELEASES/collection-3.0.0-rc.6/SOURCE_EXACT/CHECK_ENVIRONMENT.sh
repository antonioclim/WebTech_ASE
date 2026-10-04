#!/usr/bin/env sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
command -v node >/dev/null 2>&1 || { printf '%s
' 'STOP: Node.js was not found.' >&2; exit 2; }
node "$ROOT/90_AUDIT/tools/check-environment.mjs"
