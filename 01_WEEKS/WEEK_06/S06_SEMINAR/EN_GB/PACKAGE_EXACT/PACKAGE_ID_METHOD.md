# Exact package identity

SHA256SUMS.txt contains a sorted UTF-8 list of SHA-256 hashes and relative file paths, separated by two spaces and terminated with LF. Every payload file is listed except SHA256SUMS.txt itself and PACKAGE_ID.txt. PACKAGE_ID.txt is the SHA-256 of the exact manifest bytes, followed by LF. The ZIP sidecar hashes the complete archive and names that exact archive.

An identifier establishes correspondence to these bytes, not correctness, authenticity of observations or platform qualification. Source subtrees retain their own historical text; the outer manifest covers their distributed bytes. Student edits intentionally change the distribution identity. Use the separate project-boundary tool to check the permitted work rather than rewriting this original manifest.
