# Package identity

SHA256SUMS.txt lists every member other than SHA256SUMS.txt and PACKAGE_ID.txt in ascending relative-path order. Each line is SHA-256, two spaces, UTF-8 relative path and LF. PACKAGE_ID.txt contains SHA-256 of those exact manifest bytes and LF. The ZIP SHA-256 belongs in a separate sidecar, never inside the ZIP it hashes. Package identity is not runtime or browser qualification.
