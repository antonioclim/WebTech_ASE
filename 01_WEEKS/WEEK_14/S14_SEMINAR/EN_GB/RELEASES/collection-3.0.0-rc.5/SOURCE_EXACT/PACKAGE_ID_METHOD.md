# Package identity method

SHA256SUMS.txt contains all regular files except itself and PACKAGE_ID.txt, sorted by POSIX path. PACKAGE_ID is SHA-256 of exact manifest bytes. FILE_INDEX.csv indexes every file except itself and the two identity files. This is consistency checking, not a signature, sandbox or native/live acceptance.
