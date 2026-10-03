# Package identity method

SHA256SUMS.txt lists every regular content file in sorted relative POSIX-path order: SHA-256 in hexadecimal, two spaces, path and LF. Exclude only SHA256SUMS.txt and PACKAGE_ID.txt. PACKAGE_ID.txt contains SHA-256 of the exact SHA256SUMS.txt bytes, then LF. The manifest and ID are not self-referential. Unexpected paths are not ignored. The external ZIP hash belongs to its sidecar/receipt and is not embedded inside itself. This identity does not replace a repository FINAL identity or qualify an application.
