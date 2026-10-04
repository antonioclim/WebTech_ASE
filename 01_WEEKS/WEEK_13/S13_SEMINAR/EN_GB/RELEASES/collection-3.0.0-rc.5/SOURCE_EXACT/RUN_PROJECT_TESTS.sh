#!/bin/sh
set -eu
for task_env in "${NODE_OPTIONS-}" "${NODE_PATH-}" "${LD_PRELOAD-}" "${DYLD_INSERT_LIBRARIES-}"; do
  if [ -n "$task_env" ]; then echo "BLOCKED_ENVIRONMENT_CONFLICT" >&2; exit 2; fi
done
task_root=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd -L)
exec node "$task_root/TOOLS/entry.mjs" tests "$@"
