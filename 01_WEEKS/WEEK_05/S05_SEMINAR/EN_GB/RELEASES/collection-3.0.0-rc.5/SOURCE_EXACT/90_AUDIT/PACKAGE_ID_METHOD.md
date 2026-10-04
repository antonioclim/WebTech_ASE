# PACKAGE_ID method — TW2026 v2

The package identity is deterministic and avoids circular self-hashing.

1. `IMMUTABLE_MANIFEST.sha256` lists every immutable regular file except `FILE_INDEX.csv`, `IMMUTABLE_MANIFEST.sha256` and `PACKAGE_ID.txt`. Declared mutable files are omitted from the immutable manifest.
2. `FILE_INDEX.csv` lists every regular file except `FILE_INDEX.csv` and `PACKAGE_ID.txt`. Mutable-file hashes record the packaged starter bytes but are informational after legitimate student editing.
3. Compute SHA-256 of the exact bytes of the immutable manifest and of the file index.
4. Build the following ASCII payload, including final line feeds:

```text
TW2026-PACKAGE-ID-v2
manifest-sha256 <MANIFEST_SHA256>
file-index-sha256 <FILE_INDEX_SHA256>
```

5. `PACKAGE_ID` is the lowercase SHA-256 of that payload.

The verifier checks the exact path set, immutable hashes, index structure, package identity, symlinks, unsafe names, case-insensitive collisions and Unicode-normalisation collisions. A declared mutable source file must exist but may differ after legitimate student work.
