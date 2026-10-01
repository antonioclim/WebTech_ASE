# PACKAGE_ID method

`SHA256SUMS.txt` lists every regular package file except itself and `PACKAGE_ID.txt`, sorted by POSIX path. `PACKAGE_ID.txt` is the SHA-256 of the exact UTF-8 bytes of that manifest. ZIP members are sorted, timestamped 2026-09-30 00:00:00 and stored as regular mode-0644 files with deflate level 9. Package identity is not runtime, browser, platform or protocol qualification.
