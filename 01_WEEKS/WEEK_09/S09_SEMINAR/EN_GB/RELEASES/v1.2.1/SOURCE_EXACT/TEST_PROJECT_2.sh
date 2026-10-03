#!/bin/sh
# NEW source-only launcher; future separately qualified use only.
cd -- "$(dirname -- "$0")" || exit 2
command -v node >/dev/null 2>&1 || { echo "ENVIRONMENT_BLOCK: node unavailable; no installation performed." >&2; exit 2; }
exec node "tools/S09_TEST_PROJECT_v1_2_0.mjs" --run-checks p02
