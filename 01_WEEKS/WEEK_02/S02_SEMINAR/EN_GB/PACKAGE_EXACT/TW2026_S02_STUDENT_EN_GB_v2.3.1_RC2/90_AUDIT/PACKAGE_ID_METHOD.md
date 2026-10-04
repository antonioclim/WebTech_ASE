# PACKAGE_ID method

`PACKAGE_ID.txt` is the lowercase SHA-256 digest of the exact bytes of `IMMUTABLE_MANIFEST.sha256`.

The immutable manifest includes every package file except:

- the single editable file listed in `MUTABLE_PATHS.txt`;
- `90_AUDIT/IMMUTABLE_MANIFEST.sha256`;
- `90_AUDIT/PACKAGE_ID.txt`.

The verifier checks every immutable hash, the exact file set, the mutable-path allowance, rejection of filesystem entries reported as symbolic links by Node.js and the PACKAGE_ID relation. Native Windows reparse-point qualification remains open. `FILE_INDEX.csv` is a convenience inventory of ordinary immutable files; it omits the hash controls, itself and the editable scaffold to avoid circular identities.
