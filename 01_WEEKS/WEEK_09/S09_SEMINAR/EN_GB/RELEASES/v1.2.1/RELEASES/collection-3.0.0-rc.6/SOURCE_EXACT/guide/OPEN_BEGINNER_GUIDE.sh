#!/bin/sh
set -eu
S09_GUIDE_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
S09_GUIDE_FILE="$S09_GUIDE_DIR/S09_INTERACTIVE_ULTRA_BEGINNER_GUIDE_EN_GB_v1.2.1.html"
if [ ! -f "$S09_GUIDE_FILE" ]; then
  printf "%s\n" "STOP: The extracted S09 guide file is missing." >&2
  exit 2
fi
if command -v open >/dev/null 2>&1; then
  open "$S09_GUIDE_FILE"
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$S09_GUIDE_FILE"
else
  printf "%s\n" "No existing opener was found. Open the HTML manually in your authorised browser." >&2
  exit 3
fi
