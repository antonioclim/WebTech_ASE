# Package identity method

SHA256SUMS.txt lists each regular content file in sorted relative POSIX-path order as hexadecimal SHA-256, two spaces, path and LF. Exclude only SHA256SUMS.txt and PACKAGE_ID.txt. PACKAGE_ID.txt is SHA-256 of the exact SHA256SUMS.txt bytes followed by LF. No source repository FINAL identity is replaced. The external ZIP hash is kept in a sidecar/receipt, not inside its own archive. All content paths and payloads must match; an extra file is not ignored.
