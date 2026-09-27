#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd -P)"
PROJECT="$ROOT/01_PROIECT/RESPONSIVE_CARD_GRID_CANONIC"
NODE_VERSION="$(node --version 2>/dev/null || true)"
NPM_VERSION="$(npm --version 2>/dev/null || true)"
[[ "$NODE_VERSION" == "v24.21.0" ]] || { echo "STOP: Node v24.21.0 required; found ${NODE_VERSION:-unavailable}"; exit 2; }
[[ "$NPM_VERSION" == "11.19.0" ]] || { echo "STOP: npm 11.19.0 required; found ${NPM_VERSION:-unavailable}"; exit 2; }
cd "$PROJECT"
node --test --test-reporter=tap tests/baseline.test.js
set +e
out="$(node --test --test-reporter=tap tests/objective.test.js 2>&1)"; rc=$?
set -e
printf '%s\n' "$out"
count="$(printf '%s\n' "$out" | grep -Ec '^not ok[[:space:]]+[0-9]+' || true)"
[[ $rc -ne 0 && "$count" == 3 ]] || { echo "VERDICT: FAIL_OBJECTIVE_SIGNATURE exit=$rc failures=$count expected=3"; exit 1; }
node --test --test-reporter=tap tests/regression.test.js
echo "VERDICT: PASS_INITIAL_STATE"
