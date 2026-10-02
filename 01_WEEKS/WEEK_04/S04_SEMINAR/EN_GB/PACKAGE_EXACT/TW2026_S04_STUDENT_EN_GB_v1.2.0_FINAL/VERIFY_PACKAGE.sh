#!/usr/bin/env sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
MANIFEST="$ROOT/90_AUDIT/IMMUTABLE_MANIFEST.sha256"
IDFILE="$ROOT/90_AUDIT/PACKAGE_ID.txt"
MUTABLE="$ROOT/90_AUDIT/MUTABLE_PATHS.txt"

command -v find >/dev/null 2>&1 || { printf '%s\n' 'STOP: find is unavailable.' >&2; exit 2; }
if command -v sha256sum >/dev/null 2>&1; then
  hash_file() { sha256sum "$1" | awk '{print $1}'; }
elif command -v shasum >/dev/null 2>&1; then
  hash_file() { shasum -a 256 "$1" | awk '{print $1}'; }
else
  printf '%s\n' 'STOP: no SHA-256 command is available.' >&2
  exit 2
fi

[ -f "$MANIFEST" ] && [ -f "$IDFILE" ] && [ -f "$MUTABLE" ] || {
  printf '%s\n' 'STOP: package identity files are missing.' >&2
  exit 2
}

calculated_id=$(hash_file "$MANIFEST")
expected_id=$(tr -d '\r\n ' < "$IDFILE")
[ "$calculated_id" = "$expected_id" ] || {
  printf '%s\n' 'STOP: PACKAGE_ID mismatch.' >&2
  exit 2
}

failed=0
while IFS= read -r line; do
  [ -n "$line" ] || continue
  expected=${line%%  *}
  rel=${line#*  }
  if [ "$rel" = "$line" ] || [ ${#expected} -ne 64 ]; then
    printf 'MALFORMED %s\n' "$line"
    failed=1
    continue
  fi
  if [ ! -f "$ROOT/$rel" ]; then
    printf 'MISSING  %s\n' "$rel"
    failed=1
    continue
  fi
  actual=$(hash_file "$ROOT/$rel")
  if [ "$actual" != "$expected" ]; then
    printf 'MODIFIED %s\n' "$rel"
    failed=1
  fi
done < "$MANIFEST"

expected_list=$(mktemp)
actual_list=$(mktemp)
trap 'rm -f "$expected_list" "$actual_list"' EXIT HUP INT TERM
sed -n 's/^[0-9a-f]\{64\}  //p' "$MANIFEST" > "$expected_list"
sed '/^[[:space:]]*$/d' "$MUTABLE" >> "$expected_list"
printf '%s\n' '90_AUDIT/IMMUTABLE_MANIFEST.sha256' '90_AUDIT/PACKAGE_ID.txt' >> "$expected_list"
LC_ALL=C sort -u "$expected_list" -o "$expected_list"

if (cd "$ROOT" && find . -type l -print | grep -q .); then
  (cd "$ROOT" && find . -type l -print | sed 's#^./#SYMLINK #')
  failed=1
fi
(cd "$ROOT" && find . -type f -print | sed 's#^./##' | LC_ALL=C sort) > "$actual_list"
if ! cmp -s "$expected_list" "$actual_list"; then
  printf '%s\n' 'FILE-SET MISMATCH:'
  diff -u "$expected_list" "$actual_list" || true
  failed=1
fi

[ "$failed" -eq 0 ] || {
  printf '%s\n' 'VERDICT: STOP_PACKAGE_INTEGRITY'
  exit 2
}
printf 'PACKAGE_ID: %s\n' "$expected_id"
printf '%s\n' 'VERDICT: PASS_PACKAGE_INTEGRITY_EXACT_SET'
