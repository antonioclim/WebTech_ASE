#!/bin/sh
set -eu
SCRIPT_ROOT=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd -- "$SCRIPT_ROOT"
command -v node >/dev/null 2>&1 || { printf "%s\n" "STOP: Node is unavailable. No installation was performed." >&2; exit 2; }
exec node "tools/test-project.mjs" "p02"
