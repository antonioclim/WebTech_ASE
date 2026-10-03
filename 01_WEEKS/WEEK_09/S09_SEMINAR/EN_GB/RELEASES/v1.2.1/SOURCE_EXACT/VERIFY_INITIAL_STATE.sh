#!/bin/sh
# NEW source-only launcher; future separately qualified use only.
cd -- "$(dirname -- "$0")" || exit 2
command -v node >/dev/null 2>&1 || { echo "ENVIRONMENT_BLOCK: node unavailable; no installation performed." >&2; exit 2; }
exec node "tools/S09_VERIFY_INITIAL_STATE_v1_2_0.mjs" --check-source "${1-}"
