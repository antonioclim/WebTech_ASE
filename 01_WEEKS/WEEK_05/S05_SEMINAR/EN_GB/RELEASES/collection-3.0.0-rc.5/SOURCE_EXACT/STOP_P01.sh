#!/usr/bin/env sh
set -eu
cd "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
[ -f "90_AUDIT/tools/stop-p01.mjs" ] || { echo "STOP. Target missing: 90_AUDIT/tools/stop-p01.mjs" >&2; exit 2; }
command -v node >/dev/null 2>&1 || { echo "NODE_NOT_FOUND. Select the authorised Node.js runtime, reopen the terminal, then retry." >&2; exit 2; }
node "90_AUDIT/tools/stop-p01.mjs" 
