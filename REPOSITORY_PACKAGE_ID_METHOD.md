# Repository package identity

`REPOSITORY_SHA256SUMS.txt` lists every public repository file except the three
repository-identity files:

```text
REPOSITORY_SHA256SUMS.txt
REPOSITORY_PACKAGE_ID.txt
REPOSITORY_PACKAGE_ID_METHOD.md
```

Paths are sorted by their Unicode-normalised, case-folded representation. Each
manifest row uses:

```text
<sha256><two spaces><relative/path>\n
```

`REPOSITORY_PACKAGE_ID.txt` is the SHA-256 of the exact UTF-8 bytes of
`REPOSITORY_SHA256SUMS.txt`.
