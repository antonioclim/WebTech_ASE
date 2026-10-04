#!/bin/sh
# New local wrapper. No installation or network request.
set -eu
script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$script_dir"
if [ ! -f "tools/environment_check.py" ]; then printf "%s\n" "STOP: required local tool is missing." >&2; exit 1; fi
if command -v python3 >/dev/null 2>&1; then
  exec python3 "tools/environment_check.py"  "$@"
elif command -v python >/dev/null 2>&1; then
  exec python "tools/environment_check.py"  "$@"
fi
printf "%s\n" "STOP: no installed Python was found. Do not install automatically." >&2
exit 1
