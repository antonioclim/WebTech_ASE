# Web Technologies corrected classroom prerelease 3.0.0-rc.8

This successor retains the fourteen-week individual classroom route and corrects a source-registry defect affecting the five optional canonical C07 examples. It is a draft prerelease with the general verdict `NOT_FINAL`.

Download `WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.8.zip` and its `.sha256` sidecar after the owner publishes this prerelease. GitHub's automatic Source code archives contain the development repository and are not the classroom distribution. Extract the entire asset, open `WEBTECH_ASE_EN_GB_CLASSROOM_RC8/index.html` then follow `START_HERE.html`. Before editing, run `node VERIFY_COLLECTION.mjs`; after permitted learner edits or dependency installation, use `node VERIFY_COLLECTION.mjs --allow-student-edits`.

## Corrected C07 carrier

The immediate C07 predecessor had ten stale current hashes: `package.json` and `package-lock.json` for each of five canonical examples. The delivered dependency changes were documented in its `DERIVED_CARRIER.json` but the execution guard still read the previous hashes. RC8 reconciles only these ten current registry hashes, retains the prior values and strengthens the guard to require the exact four expected source files for every example. Malformed, duplicate or unsafe registry paths and symlink targets are refused.

The new derived C07 carrier is `WEBTECH_ASE_C07_EN_GB_v1.1.3_RC8`. Its canonical `example.js`, README, current dependency pins and lockfile bytes are unchanged. `C07_REGISTRY_DERIVATION_RC8.json` records the source archive, source identity and exact derivation. `PREDECESSOR_RC6` preserves the displaced original registry, runner, manifest and package ID as historical controls. Use the active C07 identity, not the historical ID.

A diagnostic `preflight` command can exit zero while `ready:false`. Inspect `source.errors`, dependency checks and readiness separately. Successful source authentication does not establish SQLite driver execution or a complete dependency graph.

## Retained teaching scope

- All fourteen seminar `CLASSROOM_RC6` folders remain byte-identical: 266 files, 40 required individual microprojects and 38 distinct editable files.
- Thirteen course units and both setup units retain their whole original payloads and identities. C07 is the explicit derivative described above.
- All 1,156 authenticated source-file byte sequences remain available. Four displaced C07 controls are preserved under `PREDECESSOR_RC6`; their original paths and current locations are recorded in `PRESERVED_SOURCE_FILES.json`.
- Thirty optional course/setup Word references remain. The 39 original seminar Word references and original full seminar applications remain outside the filtered classroom distribution.
- Twenty-eight reference notices preserve optional pinned links to the retained original source and return links to the current classroom route.

The new outer collection and C07 identities cover the actual derived payload. Filtered seminars retain their RC7 filtered identities because their payload bytes are unchanged. Their inner classroom contract remains `1.0.0-rc.6`.

## Evidence and limits

Additional local execution checks ran all five original canonical C07 examples on Linux with Node.js 24.21.0, npm 11.19.0 and the exact locked project-local Sequelize 6.37.8 and sqlite3 6.0.1 dependencies. The original relationship, query-count, HTTP resource, pagination and transaction checks passed. The lockfiles and canonical sources remained byte-identical. Native SQLite driver constraint/rollback/integrity probes and installed graph checks also passed in this finite environment. This does not establish native Windows/macOS behaviour or every possible input.

All ten broad qualification gates remain pending. Bounded automated source, integrity and runtime results have their own stated scope; they do not establish native Windows or macOS support, interactive accessibility, Microsoft Word rendering, live Moodle submission, student workload or final owner acceptance. Owner manual review has been deferred and is not required to prepare or publish this prerelease. Deferral is not a PASS observation.

Prior finite synthetic evidence for unchanged RC6 forms concerns those form bytes only. It is not student work, acceptance of RC8 identities or proof that the wrapper and C07 derivative were tested on the owner's computer. Planned seminar schedules remain unpiloted.

The inherited unused optional `serve` branches in S03/S06 remain outside the prescribed classroom route. Existing minor form PDF presentation limitations have not been represented as corrected.

## Publication

The owner alone starts `release-classroom-successor.yml`, with explicit preview and the exact reviewed Git commit SHA. The workflow validates the source, runs the existing RC7 checks and RC8 regressions, constructs and verifies the exact three release assets, then creates only a new tag and a draft prerelease. It refuses existing tags/releases and never overwrites published RC7. A failure after tag creation can leave that tag in place; inspect the run before recovery.

The three assets are generated outside the checkout. Private evidence, student records, downloaded runtimes, dependency trees and local logs are not added to the classroom ZIP or repository. See [the owner instructions](../00_TOOLS/maintainer/CLASSROOM_RC8_PUBLISHING.md) and [the exact successor plan](CLASSROOM_SUCCESSOR_RELEASE_PLAN.json).
