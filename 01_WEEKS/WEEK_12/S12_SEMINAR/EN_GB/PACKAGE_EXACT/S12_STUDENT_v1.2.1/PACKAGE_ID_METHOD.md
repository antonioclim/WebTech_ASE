# Package identity method

All regular paths use portable NFC names, deterministic order and LF metadata. FILE_INDEX.csv records relative_path, bytes, sha256 and classification for all files except the index itself, SHA256SUMS.txt and PACKAGE_ID.txt. SHA256SUMS.txt contains SHA-256 plus two spaces plus relative path for every file except itself and PACKAGE_ID.txt, including FILE_INDEX.csv. PACKAGE_ID is SHA-256 of the exact UTF-8 manifest bytes, which already end in LF. PACKAGE_ID.txt stores that lowercase digest followed by LF. The ZIP sidecar identifies ZIP bytes independently.

These hashes establish content identity, not a signed trust claim or execution truth. No extra LF is added when calculating PACKAGE_ID. Package identity is distinct from the one-file work boundary. Each nested/archive root has its own identity.
