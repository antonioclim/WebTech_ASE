#!/bin/sh
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd) || exit 2
TARGET="$SCRIPT_DIR/form/FORM_S09_EN_GB.html"
[ -f "$TARGET" ] || { echo "STOP: Target file is missing. Extract the complete package again."; exit 2; }
case "$(uname -s)" in
 Darwin) exec open "$TARGET" ;;
 Linux) command -v xdg-open >/dev/null 2>&1 || { echo "STOP: Open the target HTML manually in your browser."; exit 3; }; exec xdg-open "$TARGET" ;;
 *) echo "STOP: Open the target HTML manually in your browser."; exit 3 ;;
esac
