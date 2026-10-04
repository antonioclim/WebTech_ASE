#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd -- "$(dirname -- "$0")" && pwd -P)"
TARGET="$ROOT/05_MOODLE_SUBMISSION/FORM_S01_EN_GB.html"
if [[ ! -f "$TARGET" ]]; then printf 'STOP_TARGET_MISSING: %s\n' "$TARGET" >&2; exit 2; fi
if command -v open >/dev/null 2>&1; then open "$TARGET"
elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$TARGET"
else printf 'NO_DESKTOP_OPENER: open this file manually: %s\n' "$TARGET"; exit 2; fi
