# Changelog

## Unreleased — repository construction continues

- Paused all automatic GitHub Actions triggers; validation, Pages and releases remain manual-only.
- Added structured Windows, macOS and Linux one-file setup candidates under `00_SETUP/ALTERNATIVES`.
- Exposed exact package guides and audit files for browser inspection while keeping launchers canonical inside ZIP archives.
- Added SHA-256 sidecars and guide-mirror manifests for all alternative packages.
- Marked repository identity as a frozen baseline until the final corpus freeze.
- Added WIP validation for manual-only workflows, alternative-package mirrors and temporary flat aliases.

## 2.0.1 — post-upload validation hotfix (2026-09-27)

- Corrected repository identity validation inside a GitHub Actions checkout.
- Excluded local `.git` metadata from public worktree scans.
- Hashes committed Git blobs so `.gitattributes` EOL conversion cannot create false mismatches.
- Changed validation and Pages deployment to manual owner-triggered workflows.
- Disabled Dependabot version-update pull requests while immutable action pins are maintained manually.
- Added a single-run browser-only recovery path after the initial upload.

## 2.0.0 — final upload-ready repository (2026-09-27)

- Added a browser-only first-upload route with eleven ordered batches.
- Completed an independent hostile audit and post-package re-audit.
- Rebuilt weekly assets as deterministic final bundles.
- Pinned every GitHub Action to a verified immutable commit SHA.
- Removed network-dependent validator setup; validation uses the Python standard library.
- Added final repository manifests, package identity and Pages-payload validation.
- Hardened release publication against an existing tag or release.
- Removed final wording from all public metadata and guidance.
- Preserved the student packages byte-for-byte and kept instructor material private.

## 2.0.0 — Phase 3 final release (2026-09-27)

- Added `CITATION.cff`, `codemeta.json` and final safe-default metadata.
- Added a 1280×640 social-preview asset and upload instructions.
- Added a reproducible GitHub Pages build and deployment workflow.
- Added a manual, fail-closed weekly GitHub Release workflow.
- Rebuilt week 1 and week 2 bundles as immutable RC assets.
- Added exact repository-settings, first-upload and release-publishing guides.
- Updated GitHub Actions to current Node 24-compatible major releases.
- Changed repository status from Phase 2 beta to Phase 3 final release.

## v2.0.0-beta — Phase 2

- Rebuilt navigation as week → object → language.
- Published audited Day 0 setup in English.
- Populated C01, S01, C02 and S02 in RO and EN-GB.
- Added exact extracted student packages and downloadable ZIPs.
- Added professional community files, issue templates and beta CI.
- Created a separate private instructor staging archive.
- Corrected the GitHub owner identifier to `antonioclim`.

## Earlier prototype

The language-first v1.0 prototype is superseded and must not be uploaded as the
current repository.
