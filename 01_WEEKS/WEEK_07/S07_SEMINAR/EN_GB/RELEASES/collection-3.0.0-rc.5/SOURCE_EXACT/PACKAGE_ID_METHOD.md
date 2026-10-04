# Exact package identity

This flat-root package covers every regular payload file in SHA256SUMS.txt, excluding only SHA256SUMS.txt itself and PACKAGE_ID.txt. Entries are sorted by the exact case-sensitive POSIX relative path, UTF-8 encoded, with a lowercase SHA-256 digest, two spaces, the relative path and a single LF. The package identifier is the SHA-256 of those exact manifest bytes, followed by LF in PACKAGE_ID.txt. The ZIP sidecar contains the hash of the entire ZIP, two spaces and its exact basename followed by LF. The manifest detects byte changes; it does not authenticate authorship or prove that an observation occurred.

The student project is intentionally editable only at its declared target. Any edit changes the distribution identity; the separate project-boundary tool checks that all other source files remain intact. Do not regenerate the distributed manifest and pretend it is the original version.
