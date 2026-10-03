#!/bin/sh
set -eu
if [ -n "${NODE_OPTIONS-}" ] || [ -n "${NODE_PATH-}" ] || [ -n "${NODE_TEST_CONTEXT-}" ] || [ -n "${NODE_TEST_REPORTER-}" ] || [ -n "${NODE_TEST_REPORTER_DESTINATION-}" ] || [ -n "${NODE_V8_COVERAGE-}" ]; then
  printf "%s\n" "STOP: inherited runtime injection is refused before Node starts. Clear NODE_OPTIONS, NODE_PATH, NODE_TEST_CONTEXT, NODE_TEST_REPORTER, NODE_TEST_REPORTER_DESTINATION and NODE_V8_COVERAGE." >&2
  exit 2
fi
SCRIPT_ROOT=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd -- "$SCRIPT_ROOT"
command -v node >/dev/null 2>&1 || { printf "%s\n" "STOP: Node is unavailable. No installation was performed." >&2; exit 2; }
exec node "$SCRIPT_ROOT/tools/verify-work-result.mjs" "$@"
