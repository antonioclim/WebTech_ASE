#!/usr/bin/env sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$ROOT"
command -v node >/dev/null 2>&1 || { echo STOP_NODE_NOT_FOUND >&2; exit 2; }
exec node 90_AUDIT/tw-s10-kit.mjs verify-work
