# TW2026 macOS and Linux — release notes

**Version:** 1.0 RC1 · **Production delivery:** Phase 5 of 5 · **Date:** 27 September 2026

The agreed production sequence is complete. This is a consolidated release candidate, not a universal native installation certificate. Use the platform-specific README next to your entry script.

## Changes since v0.4

The runtime policy and declared software scope are unchanged. The four policy files remain byte-identical to the Phase 4 baseline. Source and payload hashes were regenerated for the explicit code and documentation changes.

The CLI check now detects the documented VS Code portable data overrides before requesting a course profile. A conflicting candidate is preserved and excluded from course-profile commands. Another eligible installed candidate may be selected. `VSCODE_CLI.json` records the attempts. This avoids treating command-line profile arguments as effective when the provider's portable mode takes precedence.

The Linux runtime audit no longer accepts a fallback npm file from an unrelated distribution-wide directory. It requires the same bundled npm layout used by bootstrap and daily-use runtime qualification. This prevents an audit-only exception from disagreeing with the daily-use actions. The exact version requirement is still Node 24.21.0 and npm 11.19.0.

Release banners, reports and README paths now identify 1.0 RC1. Final acceptance boundaries, migration instructions and source-build commands are included. Test-harness assertions about downloads now inspect the actual `runtime` directory and cache rather than an unused plural path.

## Preserved behaviour

There is one self-contained entry script per platform. The script never renames the extracted source directory into place. It verifies the payload and exact extracted source set. The actions remain `auto`, `resume`, `update`, `audit`, `accounts`, `git`, `vscode`, `terminal`, `help`, `extract` and `inspect`.

Accounts and course Git changes require explicit SAVE. The account wizard does not verify online accounts. Audit does not provision applications. Course Node selection does not remove system Node or rewrite shell startup files. Package managers are restricted to the declared operations. Installations are not force-killed merely because the parent's waiting period expires. Completion and report consistency are checked separately from readiness.

## Migration

Keep the existing course state. Extract the new user ZIP into its own folder. For a working environment use `audit`, not an unnecessary reinstall. Earlier source caches and reports remain evidence. Do not copy source files between versions or edit a manifest to accept a failed copy.

## Validation status

Read `PACKAGING_AUDIT.json` for the new package hashes and test summary. Read `PLATFORM_ACCEPTANCE.md` for native evidence limits. Tests, platform fixtures and file checks overlap and must not be added as independent native installations. No download hash is a publisher signature. Neither entry script is a signed or notarised publisher application.
