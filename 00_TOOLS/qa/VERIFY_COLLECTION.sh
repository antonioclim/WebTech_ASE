#!/usr/bin/env bash
set -euo pipefail
tool_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
exec node "$tool_dir/VERIFY_COLLECTION.mjs" "$@"
