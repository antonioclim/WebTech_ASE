#!/usr/bin/env bash
set -u
HERE="$(cd "$(dirname "$0")" && pwd -P)"
exec bash "$HERE/07_EVIDENCE/COLLECT_ENVIRONMENT_EVIDENCE.sh" "$@"
