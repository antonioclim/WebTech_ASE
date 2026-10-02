#!/usr/bin/env sh
set -eu
cd "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
t="05_MOODLE_SUBMISSION/FORM_S05_EN_GB.html"
[ -f "$t" ] || { echo "STOP. Target missing." >&2; exit 2; }
if command -v xdg-open >/dev/null 2>&1; then xdg-open "$t"; elif command -v open >/dev/null 2>&1; then open "$t"; else echo "Open: $PWD/$t"; fi
