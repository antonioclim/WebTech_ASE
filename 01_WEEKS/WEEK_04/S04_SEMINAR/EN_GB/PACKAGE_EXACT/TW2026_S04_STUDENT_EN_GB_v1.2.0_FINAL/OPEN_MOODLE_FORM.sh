#!/usr/bin/env sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
TARGET="$ROOT/05_MOODLE_SUBMISSION/FORM_S04_EN_GB.html"
[ -f "$TARGET" ] || { printf '%s\n' 'STOP: form target is missing.' >&2; exit 2; }
if command -v open >/dev/null 2>&1; then open "$TARGET"; elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$TARGET"; else printf '%s\n' "$TARGET"; fi
