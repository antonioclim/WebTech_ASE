#!/usr/bin/env sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
TARGET="$ROOT/05_MOODLE_SUBMISSION/FORM_S02_EN_GB.html"
if [ ! -f "$TARGET" ]; then printf 'STOP: target not found: %s\n' "$TARGET" >&2; exit 2; fi
if command -v open >/dev/null 2>&1; then open "$TARGET"; exit $?; fi
if command -v xdg-open >/dev/null 2>&1; then xdg-open "$TARGET"; exit $?; fi
printf 'STOP: no supported opener was found. Open this file manually: %s\n' "$TARGET" >&2
exit 2
