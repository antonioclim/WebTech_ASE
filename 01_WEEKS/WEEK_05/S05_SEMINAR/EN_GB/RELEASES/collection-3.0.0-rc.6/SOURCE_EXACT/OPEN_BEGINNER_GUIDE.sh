#!/usr/bin/env sh
set -eu
cd "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
t="00_START_HERE/S05_INTERACTIVE_ULTRA_BEGINNER_GUIDE_EN_GB_v1.2.html"
[ -f "$t" ] || { echo "STOP. Target missing." >&2; exit 2; }
if command -v xdg-open >/dev/null 2>&1; then xdg-open "$t"; elif command -v open >/dev/null 2>&1; then open "$t"; else echo "Open: $PWD/$t"; fi
