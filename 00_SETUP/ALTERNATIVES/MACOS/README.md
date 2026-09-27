# macOS one-file candidate

> **Optional release candidate — not the default Day 0 route.**

Use the standard setup package unless the lecturer explicitly asks you to test this
one-file candidate. Packaging completion is not the same as native platform
acceptance.

## Download

- [Download `TW2026_MACOS_ONEFILE_v1.0_RC1_WITH_GUIDE.zip`](DOWNLOAD/TW2026_MACOS_ONEFILE_v1.0_RC1_WITH_GUIDE.zip)
- [SHA-256 sidecar](DOWNLOAD/TW2026_MACOS_ONEFILE_v1.0_RC1_WITH_GUIDE.zip.sha256)

```text
SHA-256: 0d3a805955d77fc2f4fdcf76851bfe98be56962fdce554fbc4c6b4cc1d685627
Bytes: 207932
Status: RELEASE_CANDIDATE_NATIVE_ACCEPTANCE_PARTIAL
```

## Read before running

- [Complete Markdown guide](GUIDE/README.md)
- [Offline HTML guide](GUIDE/README.html)
- [Packaging audit](GUIDE/PACKAGING_AUDIT.json)
- [Internal package checksum list](GUIDE/SHA256SUMS.txt)
- [Platform acceptance boundaries](GUIDE/PLATFORM_ACCEPTANCE.md)
- [Release notes](GUIDE/RELEASE_NOTES.md)

## Acceptance boundary

Linux normal-user audit and pseudo-terminal workflows. Mac platform operations use fixtures. No fresh application installation.

Status RELEASE_CANDIDATE_NATIVE_ACCEPTANCE_PARTIAL; production phase 5 of 5; productionComplete=true.

The executable launcher is deliberately available only inside the ZIP. The files
under `GUIDE` are exact byte mirrors of the documentation and audit members inside
the ZIP. `GUIDE/MIRROR_MANIFEST.json` records the mapping and hashes.

Do not publish passwords, tokens, cookies, private Moodle data or student work when
requesting support.
