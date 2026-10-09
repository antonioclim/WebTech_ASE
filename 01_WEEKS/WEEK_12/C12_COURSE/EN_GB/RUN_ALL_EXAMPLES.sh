#!/usr/bin/env bash
set -u
ROOT="$(cd "$(dirname "$0")" && pwd -P)"
command -v node >/dev/null 2>&1 || { echo "ENV_BLOCKED: C12 examples requires Node on PATH; rerun from this EN_GB package directory." >&2; exit 2; }
exec node "$ROOT/tools/tw-kit.mjs" examples "$@"
