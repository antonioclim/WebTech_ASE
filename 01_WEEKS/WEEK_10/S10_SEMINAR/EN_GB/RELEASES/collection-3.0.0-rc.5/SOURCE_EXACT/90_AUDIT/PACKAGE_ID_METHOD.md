# Package identity and verification scope

PACKAGE_ID is SHA-256 over compact UTF-8 JSON containing the exact manifest schema and path-sorted entries. Each entry records path, SHA-256, bytes and mutability. MANIFEST.json and PACKAGE_ID.txt are excluded. FILE_INDEX.csv excludes itself and these two identity files to avoid self-reference.

The pristine release audit hashes every file, including the three assessed mutable sources. The student work verifier permits only those three assessed source edits. Regenerating a manifest to bless other edits is not allowed.

Generated directories are excluded only at the declared project roots: node_modules, dist, coverage and .vite. Their root entries must be real directories rather than symlinks. Dependency contents inside them are outside package-integrity coverage; standard npm executable links may exist there. The released ZIP contains none of these generated directories.

These unsigned hashes detect inconsistency against the supplied manifest. They do not authenticate an unknown publisher or defeat an attacker who replaces the whole payload and all identity files. Compare the outer ZIP SHA-256 with the separately supplied trusted receipt. Installed dependency metadata is checked by the environment gate; dependency bytes and acquisition provenance are not authenticated by this package.
