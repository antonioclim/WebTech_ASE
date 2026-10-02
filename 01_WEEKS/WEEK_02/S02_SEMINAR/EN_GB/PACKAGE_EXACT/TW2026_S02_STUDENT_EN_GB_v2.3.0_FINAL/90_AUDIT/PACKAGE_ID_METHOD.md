# PACKAGE_ID method

`PACKAGE_ID.txt` is the lowercase SHA-256 digest of the exact bytes of `IMMUTABLE_MANIFEST.sha256`.

The immutable manifest includes every package file except:

- the single editable file listed in `MUTABLE_PATHS.txt`;
- `90_AUDIT/IMMUTABLE_MANIFEST.sha256`;
- `90_AUDIT/PACKAGE_ID.txt`.

The verifier checks every immutable hash, the exact file set, the mutable-path allowance, symlink/reparse-point absence and the PACKAGE_ID relation.
