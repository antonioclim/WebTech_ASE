# Exact package identity

SHA256SUMS.txt contains one sorted, LF-terminated `sha256  relative/path` line per payload file. It excludes only itself and PACKAGE_ID.txt. PACKAGE_ID.txt is the SHA-256 of the exact manifest bytes followed by LF. The ZIP sidecar hashes the complete final ZIP and includes that exact filename. Identity establishes byte consistency, not correctness or native acceptance. Rebuilding the same payload with the same ZIP settings is distinct from regenerating documents on another system.
