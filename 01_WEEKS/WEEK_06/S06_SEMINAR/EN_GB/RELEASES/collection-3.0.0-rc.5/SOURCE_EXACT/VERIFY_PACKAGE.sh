#!/bin/sh
# Prevent ambient Node preloads before the first guarded CLI invocation.
unset NODE_OPTIONS NODE_PATH NODE_TEST_CONTEXT
SCRIPT_DIR=$(CDPATH= cd -P "$(dirname "$0")" && pwd -P) || exit 2
if ! command -v node >/dev/null 2>&1; then
  printf '%s\n' 'BLOCKED: Node.js is not available on PATH. Use the separately prepared teaching environment; no installation is performed.'
  exit 2
fi
exec node "$SCRIPT_DIR/tools/cli.mjs" package "$@"
