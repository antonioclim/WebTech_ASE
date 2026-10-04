# Package identity method

SHA256SUMS.txt is the sorted exact set of all regular package files except the root SHA256SUMS.txt and PACKAGE_ID.txt. Each LF-terminated row is the lowercase SHA-256, two spaces and the relative POSIX path. PACKAGE_ID.txt is the SHA-256 of the exact UTF-8 manifest bytes followed by LF. ZIP SHA-256 is a separate identity recorded in its sidecar.

Run VERIFY_PACKAGE on a clean extracted package before edits or dependency preparation. The work verifier separately checks protected project bytes while allowing the declared learner target to change and project-local node_modules. Integrity is not a digital signature, an application result or evidence authentication.
