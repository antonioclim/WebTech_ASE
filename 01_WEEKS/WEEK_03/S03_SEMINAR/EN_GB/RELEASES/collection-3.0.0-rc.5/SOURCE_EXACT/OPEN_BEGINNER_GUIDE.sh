#!/usr/bin/env sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
TARGET="$ROOT/00_START_HERE/S03_INTERACTIVE_ULTRA_BEGINNER_GUIDE_EN_GB_v1.2.html"
[ -f "$TARGET" ] || { printf '%s
' 'STOP: target is missing.' >&2; exit 2; }
if command -v open >/dev/null 2>&1; then open "$TARGET"; elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$TARGET"; else printf '%s
' "Open this file manually: $TARGET"; fi
