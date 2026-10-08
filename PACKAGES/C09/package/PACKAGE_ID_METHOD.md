# Package identity method

SHA256SUMS.txt lists every regular package file in lexicographic relative-path order, except SHA256SUMS.txt and PACKAGE_ID.txt. Each record is the lowercase SHA-256, two spaces, the UTF-8 relative path and LF. PACKAGE_ID.txt contains the SHA-256 of those exact manifest bytes followed by LF. This identifies one package, not a repository FINAL identity or an execution qualification. External ZIP size/hash sidecars are emitted after archive creation; there is no circular self-hash.
