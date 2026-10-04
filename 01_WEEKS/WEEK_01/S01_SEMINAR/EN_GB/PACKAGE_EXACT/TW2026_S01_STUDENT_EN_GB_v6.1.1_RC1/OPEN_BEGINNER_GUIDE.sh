#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd -- "$(dirname -- "$0")" && pwd -P)"
TARGET="$ROOT/00_START_HERE/S01_INTERACTIVE_ULTRA_BEGINNER_GUIDE_EN_GB_v6.1.html"
if [[ ! -f "$TARGET" ]]; then printf 'STOP_TARGET_MISSING: %s\n' "$TARGET" >&2; exit 2; fi
if command -v open >/dev/null 2>&1; then open "$TARGET"
elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$TARGET"
else printf 'NO_DESKTOP_OPENER: open this file manually: %s\n' "$TARGET"; exit 2; fi
