#!/usr/bin/env bash
# Immutable course package: there are no mutable assessed files in C02.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd -P)"
MANIFEST_REL='06_AUDIT/SHA256SUMS.txt'
ID_REL='06_AUDIT/PACKAGE_ID.txt'
MANIFEST="$ROOT/$MANIFEST_REL"
fail(){ echo "VERDICT: FAIL_$1"; exit "${2:-1}"; }
[[ $# == 0 ]] || fail UNSUPPORTED_ARGUMENT 2
[[ -f "$MANIFEST" ]] || fail MANIFEST_MISSING 2
[[ -f "$ROOT/$ID_REL" ]] || fail PACKAGE_ID_MISSING 2
hash_file(){ if command -v sha256sum >/dev/null 2>&1; then sha256sum "$1" | awk '{print $1}'; else shasum -a 256 "$1" | awk '{print $1}'; fi; }
TMP="$(mktemp -d "${TMPDIR:-/tmp}/tw2026-c02.XXXXXXXX")"
trap 'rm -rf "$TMP"' EXIT
EXPECTED="$TMP/expected"; ACTUAL="$TMP/actual"; CANONICAL="$TMP/canonical"
: > "$EXPECTED"; : > "$CANONICAL"
while IFS= read -r line || [[ -n "$line" ]]; do
  [[ "$line" =~ ^([0-9a-f]{64})\ \ (.+)$ ]] || fail MANIFEST_FORMAT
  rel="${BASH_REMATCH[2]}"
  [[ "$rel" != /* && "$rel" != *\\* && "$rel" != *:* && "$rel" != */ ]] || fail UNSAFE_MANIFEST_PATH
  [[ ! "$rel" =~ (^|/)\.\.?(/|$) ]] || fail UNSAFE_MANIFEST_PATH
  [[ "$rel" != "$MANIFEST_REL" ]] || fail MANIFEST_SELF_ENTRY
  printf '%s\n' "$rel" >> "$EXPECTED"
  [[ "$rel" == "$ID_REL" ]] || printf '%s\n' "$line" >> "$CANONICAL"
done < "$MANIFEST"
[[ -z "$(tail -c 1 "$MANIFEST")" ]] || fail MANIFEST_FINAL_LF
[[ -s "$EXPECTED" ]] || fail MANIFEST_EMPTY
[[ -z "$(LC_ALL=C sort -f "$EXPECTED" | uniq -di)" ]] || fail DUPLICATE_OR_CASE_COLLISION
LC_ALL=C sort "$EXPECTED" > "$TMP/sorted"
cmp -s "$EXPECTED" "$TMP/sorted" || fail NONCANONICAL_MANIFEST_ORDER
grep -Fxq "$ID_REL" "$EXPECTED" || fail PACKAGE_ID_NOT_MANIFESTED
[[ $(wc -c < "$ROOT/$ID_REL" | tr -d ' ') == 65 ]] || fail PACKAGE_ID_FORMAT
[[ "$(cat "$ROOT/$ID_REL")" =~ ^[0-9a-f]{64}$ ]] || fail PACKAGE_ID_FORMAT
[[ "$(hash_file "$CANONICAL")" == "$(cat "$ROOT/$ID_REL")" ]] || fail PACKAGE_ID_DERIVATION
[[ -z "$(find "$ROOT" -type l -print -quit)" ]] || fail SYMLINK_ENTRY
[[ -z "$(find "$ROOT" ! -type f ! -type d -print -quit)" ]] || fail UNSUPPORTED_ENTRY
printf '%s\n' "$MANIFEST_REL" >> "$TMP/sorted"
LC_ALL=C sort "$TMP/sorted" > "$TMP/allowed"
(cd "$ROOT" && find . -type f -print | sed 's#^\./##' | LC_ALL=C sort) > "$ACTUAL"
cmp -s "$TMP/allowed" "$ACTUAL" || { diff -u "$TMP/allowed" "$ACTUAL" || true; fail EXACT_FILE_SET; }
while IFS= read -r line; do
  digest="${line%%  *}"; rel="${line#*  }"
  [[ "$(hash_file "$ROOT/$rel")" == "$digest" ]] || { echo "FAIL hash: $rel"; fail PACKAGE_HASH; }
done < "$MANIFEST"
echo 'VERDICT: PASS_PACKAGE_INTEGRITY_EXACT_SET_AND_ID'
