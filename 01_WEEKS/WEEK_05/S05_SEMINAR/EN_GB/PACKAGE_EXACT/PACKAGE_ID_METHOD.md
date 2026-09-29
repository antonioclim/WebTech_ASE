# Package identity

SHA256SUMS.txt lists every payload file in lexicographic relative-path order, using lowercase SHA-256, two spaces, path and LF. It excludes only itself and PACKAGE_ID.txt. PACKAGE_ID.txt is the SHA-256 of the exact manifest bytes followed by LF. The external ZIP sidecar identifies the complete ZIP, not merely its manifest. This is integrity, not native acceptance, authorship authentication or publication permission.
