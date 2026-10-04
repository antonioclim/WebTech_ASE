# Package identity

PACKAGE_ID is SHA-256 of the exact UTF-8 SHA256SUMS.txt bytes. The manifest lists every regular member except itself and PACKAGE_ID.txt, sorted by relative path, with SHA-256, two spaces and the relative path. This identifies this local package only, not final repository or security acceptance. ZIP hashes are external sidecars.
