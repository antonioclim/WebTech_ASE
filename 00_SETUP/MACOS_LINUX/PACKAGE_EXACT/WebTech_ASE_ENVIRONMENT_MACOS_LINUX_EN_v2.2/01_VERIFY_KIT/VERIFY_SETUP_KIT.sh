#!/usr/bin/env bash
set -u
HERE="$(cd "$(dirname "$0")" && pwd -P)"; ROOT="$(cd "$HERE/.." && pwd -P)"
MANIFEST="$ROOT/SHA256SUMS.txt"; PID="$ROOT/PACKAGE_ID.txt"; FAIL=0
[[ -f "$MANIFEST" ]] || { echo 'VERDICT: FAIL - SHA256SUMS.txt missing'; exit 2; }
[[ -f "$PID" ]] || { echo 'VERDICT: FAIL - PACKAGE_ID.txt missing'; exit 2; }
hash_file() { if command -v sha256sum >/dev/null 2>&1; then sha256sum "$1" | awk '{print $1}'; else shasum -a 256 "$1" | awk '{print $1}'; fi; }
TMP_EXPECTED="${TMPDIR:-/tmp}/tw2026_expected_$$"; TMP_ACTUAL="${TMPDIR:-/tmp}/tw2026_actual_$$"
trap 'rm -f "$TMP_EXPECTED" "$TMP_ACTUAL"' EXIT
awk 'NF{print substr($0,67)}' "$MANIFEST" | sort >"$TMP_EXPECTED"
(cd "$ROOT" && find . -type f ! -path './SHA256SUMS.txt' ! -path './PACKAGE_ID.txt' -print | sed 's#^./##' | sort) >"$TMP_ACTUAL"
if ! cmp -s "$TMP_EXPECTED" "$TMP_ACTUAL"; then echo 'FAIL: exact file set differs'; diff -u "$TMP_EXPECTED" "$TMP_ACTUAL" || true; FAIL=1; fi
while IFS= read -r line; do [[ -z "$line" ]] && continue; digest=${line%%  *}; rel=${line#*  }; [[ -f "$ROOT/$rel" ]] || { echo "FAIL missing: $rel"; FAIL=1; continue; }; actual=$(hash_file "$ROOT/$rel"); [[ "$actual" == "$digest" ]] || { echo "FAIL hash: $rel"; FAIL=1; }; done <"$MANIFEST"
manifest_hash=$(hash_file "$MANIFEST"); stored=$(tr -d '\r\n' <"$PID")
[[ "$manifest_hash" == "$stored" ]] || { echo 'FAIL: PACKAGE_ID mismatch'; FAIL=1; }
if ((FAIL)); then echo 'VERDICT: FAIL_PACKAGE_INTEGRITY'; exit 2; fi
count=$(wc -l <"$MANIFEST" | tr -d ' '); echo "FILES_VERIFIED: $count"; echo "PACKAGE_ID: $stored"; echo 'VERDICT: PASS_PACKAGE_INTEGRITY_EXACT_SET'; exit 0
