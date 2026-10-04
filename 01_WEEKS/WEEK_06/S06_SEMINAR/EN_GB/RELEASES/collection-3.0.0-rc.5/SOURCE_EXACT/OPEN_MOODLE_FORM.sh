#!/bin/sh
SCRIPT_DIR=$(CDPATH= cd -P "$(dirname "$0")" && pwd -P) || exit 2
if [ "$#" -ne 0 ]; then printf '%s\n' 'BLOCKED: This launcher takes no arguments.'; exit 2; fi
HTML_FILE="$SCRIPT_DIR/05_MOODLE_SUBMISSION/S06_MOODLE_SUBMISSION_FORM_EN_GB_v1.2.0.html"
if [ ! -f "$HTML_FILE" ]; then printf '%s\n' 'BLOCKED: Expected HTML file is missing. Extract the complete student ZIP first.'; exit 2; fi
if [ "$(uname -s)" = Darwin ]; then exec /usr/bin/open "$HTML_FILE"; fi
if command -v xdg-open >/dev/null 2>&1; then exec xdg-open "$HTML_FILE"; fi
printf '%s\n' 'BLOCKED: No desktop file opener is available. Open this local HTML file manually:' "$HTML_FILE"
exit 2
