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
<sha256><two spaces><relative/path>\n
```

In an ordinary extracted archive, validation hashes the filesystem bytes. In a
Git checkout, validation hashes the committed bytes exposed by `git archive HEAD`;
this prevents `.gitattributes` line-ending conversion from producing a false
manifest mismatch.

`REPOSITORY_PACKAGE_ID.txt` is the SHA-256 of the exact UTF-8 bytes of
`REPOSITORY_SHA256SUMS.txt`.
