#!/usr/bin/env bash
set -u
HERE="$(cd "$(dirname "$0")" && pwd -P)"
exec bash "$HERE/01_VERIFY_KIT/VERIFY_SETUP_KIT.sh" "$@"
