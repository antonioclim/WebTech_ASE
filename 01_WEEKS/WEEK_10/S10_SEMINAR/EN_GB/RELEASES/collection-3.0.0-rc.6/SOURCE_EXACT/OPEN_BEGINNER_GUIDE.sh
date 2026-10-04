#!/usr/bin/env sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
TARGET="$ROOT/00_START_HERE/S10_INTERACTIVE_ULTRA_BEGINNER_GUIDE_EN_GB_v1.2.1.html"
[ -f "$TARGET" ] || { echo STOP_TARGET_NOT_FOUND >&2; exit 2; }
if command -v open >/dev/null 2>&1; then open "$TARGET"; elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$TARGET"; else echo "Open manually: $TARGET"; fi
