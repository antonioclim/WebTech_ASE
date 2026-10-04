#!/usr/bin/env sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
TARGET="$ROOT/02_PROJECTS/tools/run-project.mjs"
[ -f "$TARGET" ] || { printf '%s\n' 'STOP: target is missing.' >&2; exit 2; }
command -v node >/dev/null 2>&1 || { printf '%s\n' 'STOP: Node.js was not found.' >&2; exit 2; }
node "$TARGET" P02
