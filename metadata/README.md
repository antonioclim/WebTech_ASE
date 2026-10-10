# Current repository metadata

`CLASSROOM_COLLECTION.json` declares the 28 course and seminar units, two setup guides, 40 required individual microprojects, 38 editable target files and generated output locations. `course-map.json` maps the 14 weeks to their tutorials and learning outcomes. `COLLECTION_SCOPE.json` explains the later portal copy’s relationship to fixed published editions and retains the historical 3.0.0 layout reference. `archive-snapshots.json` retains the exact Git identities of retrospective archives.

The authoritative current repository controls are `current-integrity/REPOSITORY_SHA256SUMS.txt` and `current-integrity/REPOSITORY_PACKAGE_ID.txt`. See [integrity instructions](../INTEGRITY.md). Each `EN_GB` unit retains its own original manifest and identity method.

`CANDIDATE_PROGRESS.json` identifies all seven prepared teaching tranches and separates their scoped evidence from the ten pending whole-edition gates. `next_phase` is explicitly `null` after T07: there is no T08. Whole-collection integration, filtered distribution verification, publication and portal promotion remain within T07 and need their own actual receipts. A complete teaching revision does not assert that those operations or native acceptance happened.

## Published v4.0.0 and this later portal copy

[PUBLISHED_RELEASE.json](PUBLISHED_RELEASE.json) records the actual stable v4.0.0 publication: the observed Latest release, fixed `f86668d6784e1b97b9057ae2e2080113efce45e3` source and tree, source and filtered distribution identities, and all four server-reported asset SHA-256 values, names, IDs and sizes. The local build and fresh-extraction receipts are distinct from the remote metadata audit; that audit did not independently download the remote binary assets. GitHub reported `immutable: false`. Preserving the tags and assets is the project policy, not a claim of platform-enforced immutability.

`latest_published_version: 4.0.0` and `published_release` identify that actual publication. `portal_state: POSTPUBLICATION_PORTAL_SOURCE` identifies this later main copy; its future owner commit is recorded externally after the commit. Its current manifest binds its own files. It cannot become the retrospective source of the fixed ZIP or build a replacement v4.0.0 archive.

The retained source preparation status, phase, `distribution_status: QUALIFIED_WINDOWS_SOURCE_NOT_PUBLISHED`, `published: false` and `publication_qualified: true` are explicitly scoped historical preparation fields. [PUBLICATION_PROFILE.json](PUBLICATION_PROFILE.json) and [CURRENT_QUALIFICATION.json](CURRENT_QUALIFICATION.json) remain byte-identical to the fixed release source, including their pending final-binding fields. The separate actual publication record supplies `published: true` and the observed release binding. Local QA validates both contracts offline; it does not query GitHub or create new browser, native, PDF or human observations. Broad **NOT_FINAL**, `native_acceptance: false` and all ten historical pending gates remain.

[REVIEW_PRERELEASE.json](REVIEW_PRERELEASE.json) remains the byte-identical actual RC1 publication record. `review_publication` retains its separate prerelease pointer. Both RC1 and the previous 3.0.0 edition keep their original tag and asset identities. Historical tranche observations retain their original scopes.

## Current scoped observations

[CURRENT_QUALIFICATION.json](CURRENT_QUALIFICATION.json) consolidates sanitised scoped evidence identities for the verified committed base, corrected Windows checks, the 334-check owner headless Edge regression, its 14 downloaded JSON drafts and 15 reviewed synthetic PDFs comprising 201 pages. It also retains the separate selected native draft PDF observations and Linux rendering QA for 30 optional Word references, including 38 presentation warnings and the native Word limitation. The browser and PDF observations remain bound to their actual tested copy; later documentation changes do not inherit a new browser execution.

The current evidence record supplements the original tranche history without changing the ten preparatory pending gates or general **NOT_FINAL**. Native macOS remains unexecuted. Live Moodle, the novice pilot and owner pedagogic acceptance remain separate pending observations. RC1 retains its exact tag and frozen assets.

## Declared Windows technical publication profile

[PUBLICATION_PROFILE.json](PUBLICATION_PROFILE.json) records the owner decision of 10 October 2026 and the narrow `windows-observed-v4.0.0` profile: Windows x64, Windows PowerShell 5.1.26100.9549, Node v24.21.0 and Edge 155.0.4283.45, limited to the actual recorded checks. Its `PASS_DECLARED_WINDOWS_PROFILE_WITH_LIMITS` is separate from the retained broad **NOT_FINAL** and ten historical pending gates. It identifies the exact committed base, earlier tested copy, unchanged unit identities and retained receipt digests. The later source controls and prose have their own validation; no additional browser execution is implied.

All materials remain included. macOS is unexecuted and unqualified; Linux has only its existing scoped observations. Native Microsoft Word, live Moodle and human observations retain their stated pending or unexecuted limits. The profile does not claim every framework, version, accessibility condition, complete environment or native print route. The pending final bindings in this retained profile belong to its frozen preparation state. The separate actual publication record supplies the later authenticated source, two matching builds, fresh extraction and observed tag/asset binding. The original profile is preserved rather than rewritten retrospectively.
