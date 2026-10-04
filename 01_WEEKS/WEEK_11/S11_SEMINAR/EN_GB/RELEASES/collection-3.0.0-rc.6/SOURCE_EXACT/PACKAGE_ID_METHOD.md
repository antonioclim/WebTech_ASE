# Candidate package identity method

`SHA256SUMS.txt` is UTF-8 with LF endings, sorted by relative POSIX path. Each record is `<lowercase SHA-256><two spaces><relative path><LF>`. It covers every regular file except root `SHA256SUMS.txt` and root `PACKAGE_ID.txt`. No generated directory is excluded from the pristine exact-set package scope. `PACKAGE_ID.txt` contains the lowercase SHA-256 of the exact manifest bytes followed by LF. It is not the historical v1.1.0 sorted path-NUL-digest-NUL method.

The exact-set package check is for a pristine extracted delivery. Student edits and separately provisioned dependencies change that set. Use the separately anchored project boundary and work-result checks for assessed working copies. The project boundary deliberately excludes only real generated directories authorised by its contract after refusing symlinks; it does not enlarge the one-file assessed edit.

The external ZIP SHA-256 sidecar identifies archive bytes and is outside the archive. Neither checksum method is a publisher signature or security certification. Root metadata describes v1.2.1 as CANDIDATE / WIP/PREVIEW_NOT_FINAL.
