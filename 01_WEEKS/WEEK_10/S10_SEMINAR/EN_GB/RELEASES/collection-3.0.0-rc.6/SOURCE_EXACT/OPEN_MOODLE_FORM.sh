#!/usr/bin/env sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
TARGET="$ROOT/05_MOODLE_SUBMISSION/FORM_S10_EN_GB.html"
[ -f "$TARGET" ] || { echo STOP_TARGET_NOT_FOUND >&2; exit 2; }
if command -v open >/dev/null 2>&1; then open "$TARGET"; elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$TARGET"; else echo "Open manually: $TARGET"; fi
