# Exact package identity

SHA256SUMS.txt contains one UTF-8 line per payload file, sorted lexicographically by POSIX relative path: 64 lowercase hexadecimal digest characters, two spaces, path and LF. The manifest covers every file except SHA256SUMS.txt and PACKAGE_ID.txt. PACKAGE_ID.txt is the lowercase SHA-256 of the exact manifest bytes followed by LF.

The external ZIP sidecar contains the SHA-256 of the complete ZIP, two spaces and the exact ZIP filename followed by LF. The ZIP hash and package ID identify different objects. Every relative member is a regular file; no directory entries, symlinks, encryption or unsafe paths are allowed.

Nested public copies keep their own manifests; the outer private manifest independently covers those bytes. Deterministic ZIP construction fixes ordering, timestamps, compression and regular-file metadata. Rebuilding from the same payload is distinct from rerendering DOCX on a different machine. These hashes establish consistency, not authenticity or educational correctness.
