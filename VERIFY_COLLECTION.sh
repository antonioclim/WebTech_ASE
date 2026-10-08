#!/usr/bin/env bash
set -euo pipefail
KIT_DIR="$(cd -- "$(dirname -- "$0")" && pwd)"
exec node "$KIT_DIR/VERIFY_COLLECTION.mjs" "$@"
