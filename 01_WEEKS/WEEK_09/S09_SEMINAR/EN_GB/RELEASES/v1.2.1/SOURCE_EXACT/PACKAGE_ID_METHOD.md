# Package identity method

SHA256SUMS.txt lists every regular payload file below the archive root, sorted by its POSIX relative path. Each row is a lowercase SHA-256 digest, two ASCII spaces, the path and LF. The root SHA256SUMS.txt and PACKAGE_ID.txt are the only exclusions. PACKAGE_ID is SHA-256 of the exact UTF-8 manifest bytes. It identifies the payload and is not the ZIP checksum. The external ZIP .sha256 sidecar identifies the actual archived bytes. Any payload modification creates a different manifest and package identity.
