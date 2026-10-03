#!/bin/sh
# Opens one local file only. No installation, project command or network request.
set -eu
script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
file="$script_dir/guide.html"
if [ ! -f "$file" ]; then
  printf "%s\n" "STOP: guide.html is missing. Keep the whole extracted folder together." >&2
  exit 1
fi
case "$(uname -s)" in
  Darwin) exec open "$file" ;;
  Linux) if command -v xdg-open >/dev/null 2>&1; then exec xdg-open "$file"; fi ;;
esac
printf "%s\n" "STOP: no supported desktop opener is available. Open the local file directly: $file" >&2
exit 1
