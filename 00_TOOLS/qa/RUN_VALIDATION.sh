#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PYTHON="${PYTHON:-python3}"
"$PYTHON" "$ROOT/00_TOOLS/qa/validate_public_repo.py" --strict
