#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd -P)"
TARGET="$ROOT/00_START_HERE/S01_INTERACTIVE_ULTRA_BEGINNER_GUIDE_EN_GB_v1.1.html"
if [[ ! -f "$TARGET" ]]; then echo "STOP: missing $TARGET" >&2; exit 2; fi
if command -v open >/dev/null 2>&1; then open "$TARGET"
elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$TARGET" >/dev/null 2>&1 &
else echo "Open manually: $TARGET"; fi
