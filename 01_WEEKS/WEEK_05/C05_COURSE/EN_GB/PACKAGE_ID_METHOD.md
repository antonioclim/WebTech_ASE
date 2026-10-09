# Exact package identity

SHA256SUMS.txt contains every payload file, except itself and PACKAGE_ID.txt, sorted by relative POSIX path. Each line is lowercase SHA-256, two ASCII spaces, the path and LF. PACKAGE_ID.txt is the lowercase SHA-256 of those exact manifest bytes followed by LF. The external .zip.sha256 hashes the complete archive and names that exact ZIP. It is not part of its own archive. ZIP reconstruction means the same payload and settings, not identical regeneration of Word documents on another system.
