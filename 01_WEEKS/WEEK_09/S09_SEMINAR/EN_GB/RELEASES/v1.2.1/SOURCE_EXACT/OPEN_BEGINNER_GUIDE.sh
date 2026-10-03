#!/bin/sh
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd) || exit 2
TARGET="$SCRIPT_DIR/guide/S09_INTERACTIVE_ULTRA_BEGINNER_GUIDE_EN_GB_v1.2.1.html"
[ -f "$TARGET" ] || { echo "STOP: Target file is missing. Extract the complete package again."; exit 2; }
case "$(uname -s)" in
 Darwin) exec open "$TARGET" ;;
 Linux) command -v xdg-open >/dev/null 2>&1 || { echo "STOP: Open the target HTML manually in your browser."; exit 3; }; exec xdg-open "$TARGET" ;;
 *) echo "STOP: Open the target HTML manually in your browser."; exit 3 ;;
esac
