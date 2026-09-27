# Repository package identity

`REPOSITORY_SHA256SUMS.txt` lists every public repository file except the three
repository-identity files:

```text
REPOSITORY_SHA256SUMS.txt
REPOSITORY_PACKAGE_ID.txt
REPOSITORY_PACKAGE_ID_METHOD.md
```

Local `.git` metadata is never part of the public repository identity. Paths are
sorted by their Unicode-normalised, case-folded representation. Each manifest row
uses:

```text
<sha256><two spaces><relative/path>

```

In an ordinary extracted archive, final validation hashes filesystem bytes. In a
Git checkout, final validation hashes committed Git blobs so `.gitattributes`
line-ending conversion cannot create false mismatches.

## Work-in-progress rule

While `metadata/development-state.json` declares `work-in-progress`, the manifest
and package ID remain the last frozen baseline. The validator checks that the two
baseline identity files agree with each other but does not compare that baseline
manifest with the changing repository tree.

At the final freeze, the state must change to `final`, temporary alternative ZIP
aliases must be removed, the manifest must be regenerated once and
`REPOSITORY_PACKAGE_ID.txt` must become the SHA-256 of the exact UTF-8 bytes of the
new `REPOSITORY_SHA256SUMS.txt`.
