# Package identity method

SHA256SUMS.txt lists every regular file except itself and PACKAGE_ID.txt in sorted relative POSIX-path order. Each line is lowercase SHA-256, two spaces, the relative path and LF. PACKAGE_ID.txt is the SHA-256 of the exact UTF-8 manifest bytes followed by LF. This is a package identity, not a final repository identity or runtime qualification. The external ZIP sidecar hashes the complete ZIP bytes; no archive hashes itself. ZIP members have fixed timestamps and regular-file permissions for reproducibility.
