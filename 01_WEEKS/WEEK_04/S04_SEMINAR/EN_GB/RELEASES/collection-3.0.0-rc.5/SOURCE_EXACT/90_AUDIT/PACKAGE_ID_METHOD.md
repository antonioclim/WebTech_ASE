# PACKAGE_ID method

`IMMUTABLE_MANIFEST.sha256` contains one line per immutable file in lexical path order:

`SHA256  relative/path`

The `PACKAGE_ID` is the lowercase SHA-256 digest of the exact manifest bytes. The manifest excludes itself, `PACKAGE_ID.txt` and the declared mutable paths. The exact-set verifier separately requires those special files and mutable paths to exist and rejects every other extra path.
