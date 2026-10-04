#!/usr/bin/env sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
if ! command -v node >/dev/null 2>&1; then
  printf '%s\n' 'STOP: Node.js was not found. No software will be downloaded automatically.' >&2
  exit 2
fi
exec node "$ROOT/90_AUDIT/tools/check-environment.mjs"
