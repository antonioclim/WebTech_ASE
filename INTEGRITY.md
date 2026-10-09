# Current repository integrity

From the repository root run `node 00_TOOLS/qa/VERIFY_COLLECTION.mjs` before editing. After changing only declared learner targets or creating declared generated directories, run `node 00_TOOLS/qa/VERIFY_COLLECTION.mjs --allow-student-edits`. These commands verify supplied files; they do not grade projects.

`metadata/current-integrity/REPOSITORY_SHA256SUMS.txt` has sorted SHA-256 rows for every repository file except itself and `REPOSITORY_PACKAGE_ID.txt`. The package ID is SHA-256 of the exact UTF-8 manifest bytes, followed by a newline. `.gitattributes` preserves committed bytes during checkout. These controls detect changes and are not digital signatures.

Each of the 30 units also retains its own integrity scheme. C01 derives its ID from `90_AUDIT/PAYLOAD_SHA256SUMS.txt`. C02 derives its ID from canonical audit rows excluding its own package-ID row. The other units derive their IDs from their outer manifests. Seminar boundary controls bind protected teaching files and declared mutable targets; S01–S07 also retain a source manifest. Moving markup links requires regenerating the affected controls together. Students keep the supplied controls unchanged.

The [strict maintenance check](00_TOOLS/qa/validate_public_repo.py) validates the current inventory, unit controls, project declarations and local links. Build archives through [the current publishing utility](00_TOOLS/publishing/README.md), using an output directory outside this repository.

The current repository identity differs from the frozen RC1 filtered distribution and the previous stable 3.0.0 archive identities. [The RC1 publication record](metadata/REVIEW_PRERELEASE.json) identifies its exact source commit and four assets; later portal edits do not change that source binding. General qualification remains **NOT_FINAL**; read [the qualification scope](00_START_HERE/QUALIFICATION.html).
