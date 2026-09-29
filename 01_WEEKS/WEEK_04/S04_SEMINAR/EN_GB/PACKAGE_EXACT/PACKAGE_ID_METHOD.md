# Exact package identity

All payload files are listed in SHA256SUMS.txt, sorted by their exact relative POSIX path. Each UTF-8 line is the lower-case SHA-256, two spaces, the path and LF. The manifest excludes only itself and PACKAGE_ID.txt. PACKAGE_ID.txt is the lower-case SHA-256 of the exact manifest bytes plus LF.

The ZIP sidecar hashes the entire ZIP and names that exact filename. ZIP membership must match the manifest plus the two identity files. A valid hash establishes byte identity, not correctness, qualification, grading or publication approval. New student working copies will change the assessed target and therefore cease matching the distribution manifest; the project's separate edit-boundary check governs that work.

Archives use sorted regular members, no explicit directory entries, deterministic timestamps and compression settings. Rebuilding the same payload reproduces ZIP bytes. This does not claim that another Word installation regenerates an identical DOCX. No whole-repository identity is recalculated here.
