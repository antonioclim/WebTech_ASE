#!/bin/sh
set -eu
SCRIPT_ROOT=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
TARGET="$SCRIPT_ROOT/S12_EVIDENCE_FORM.html"
[ -f "$TARGET" ] || { printf "%s\n" "STOP: required local HTML file is missing." >&2; exit 2; }
if command -v open >/dev/null 2>&1; then exec open "$TARGET"; elif command -v xdg-open >/dev/null 2>&1; then exec xdg-open "$TARGET"; else printf "%s\n" "STOP: no local HTML opener is available. Open the file in your installed browser." >&2; exit 2; fi
