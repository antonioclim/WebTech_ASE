# Exact package identity — C03 v1.1.0

SHA256SUMS.txt is UTF-8 with LF line endings. Each line is a lowercase SHA-256, two spaces, the relative POSIX path and LF. Paths are sorted as complete strings. It covers every regular payload file except the root SHA256SUMS.txt and PACKAGE_ID.txt. Nested copies of those names are ordinary payload and remain covered.

PACKAGE_ID.txt contains the lowercase SHA-256 of the exact SHA256SUMS.txt bytes, followed by LF. The ZIP SHA-256 is separate and is stored in the external .zip.sha256 sidecar with the exact ZIP basename. ZIP entries have fixed timestamps and regular-file metadata; byte-identical reconstruction is tested from the same payload. This does not claim that a different DOCX rendering environment generates identical DOCX bytes.

Identity proves equality with the declared payload, not scientific correctness, native platform acceptance or permission to publish.
