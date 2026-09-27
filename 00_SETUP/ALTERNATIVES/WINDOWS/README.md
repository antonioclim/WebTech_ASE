# Windows one-file candidate

> **Optional release candidate — not the default Day 0 route.**

Use the standard setup package unless the lecturer explicitly asks you to test this
one-file candidate. Packaging completion is not the same as native platform
acceptance.

## Download

- [Download `TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1_WITH_GUIDE.zip`](DOWNLOAD/TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1_WITH_GUIDE.zip)
- [SHA-256 sidecar](DOWNLOAD/TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1_WITH_GUIDE.zip.sha256)

```text
SHA-256: 2f85109bcfdbd331722dc95a2dbc2cdfa906675c70f9edcfd75e34375f69a77d
Bytes: 142921
Status: RELEASE_CANDIDATE_NATIVE_ACCEPTANCE_NOT_EXECUTED
```

## Read before running

- [Complete Markdown guide](GUIDE/README.md)
- [Offline HTML guide](GUIDE/README.html)
- [Packaging audit](GUIDE/PACKAGING_AUDIT.json)
- [Internal package checksum list](GUIDE/SHA256SUMS.txt)

## Acceptance boundary

No native Windows PowerShell execution, installer execution or new runtime acceptance is claimed by the attached packaging audit.

Documentation revision 1.0; launcher 1.1_EN_RC1; native_windows_powershell_executed=false.

The executable launcher is deliberately available only inside the ZIP. The files
under `GUIDE` are exact byte mirrors of the documentation and audit members inside
the ZIP. `GUIDE/MIRROR_MANIFEST.json` records the mapping and hashes.

Do not publish passwords, tokens, cookies, private Moodle data or student work when
requesting support.
