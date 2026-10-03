# Package identity method

The SHA256SUMS manifest lists every payload member except itself and PACKAGE_ID.txt, in sorted relative-path order. Each line contains the file SHA256, two spaces and the relative path, followed by a newline. PACKAGE_ID.txt is the SHA256 of those exact UTF-8 manifest bytes followed by a newline.

The ZIP sidecar hashes the complete ZIP bytes. It is a different identity from PACKAGE_ID. A package hash establishes byte identity and does not authenticate observations or runtime behaviour.
