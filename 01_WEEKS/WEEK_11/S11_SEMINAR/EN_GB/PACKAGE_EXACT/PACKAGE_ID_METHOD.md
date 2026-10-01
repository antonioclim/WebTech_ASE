# Package identity method

PACKAGE_ID is SHA-256 over all regular package files except the root PACKAGE_ID.txt and SHA256SUMS.txt. Sort by the relative POSIX path. For each path append its UTF-8 bytes, NUL, the lowercase ASCII SHA-256 of its file bytes and NUL. PACKAGE_ID.txt contains that digest and a newline. SHA256SUMS.txt then covers every file except itself, including PACKAGE_ID.txt. Nested canonical identity files are ordinary preserved members. A package identity is not a runtime, browser, platform or security qualification.

The ZIP lists sorted paths with timestamp 2026-09-30 00:00:00, regular-file mode 0644, deflate compression level 9 and no directory entries. No archive hash is stored inside that same archive.
