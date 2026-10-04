# Week 01–02 English distribution provenance

The four corrected RC1 object archives are present in the reviewed source
snapshot **`6e5cc0a917429d7120f71fd153e8853f05729c9d`**, tree
`5e5075f924f1b15b9d6c18b095be9d9a721f0455`. PR #16 integrated this snapshot.
This describes the reviewed English Week 01–02 payload. It does not qualify
the rest of the fourteen-week repository.

## Two source identities with different roles

| Identity | Role |
| --- | --- |
| `1850118b3f619b233f89941802212fe59d8d5dfe` | Pre-remediation baseline. It does not contain the four corrected RC1 archives. |
| `6e5cc0a917429d7120f71fd153e8853f05729c9d` | Reviewed source snapshot containing the corrected RC1 payload. |

The retained `source_commit` field in `CURRENT_OBJECTS.json`,
`RELEASE_PLAN.json`, `LOCAL_QA_WEEK01_02.json` and the existing RC1 bundle
metadata means **pre-remediation baseline**, not the commit from which the
corrected RC1 archives can be downloaded. This legacy field is ambiguous when
read alone. The explicit provenance in `SCOPED_DISTRIBUTION.json` resolves its
meaning for the combined download.

The older field is preserved to avoid changing frozen bundle bytes under an
existing RC1 identity. A future candidate should use explicit baseline and
reviewed-payload fields from the outset. It must receive a new identity if its
downloadable content changes.

## What the checksums establish

`SCOPED_DISTRIBUTION.json` identifies the combined archive, its exact hash,
the four selected object inputs and the provenance roles. Its object inputs
must agree with the frozen current registry. The accompanying verifier checks
the outer ZIP and all four nested packages without executing student code.

The combined `PACKAGE_ID.txt` hashes the exact bytes of its
`SHA256SUMS.txt`. That inner manifest binds the four object ZIPs. It does not
cover the wrapper README or `RELEASE.json`; the **outer archive SHA-256** binds
those files too. Use both identities according to their stated scope.

The repository-level `REPOSITORY_SHA256SUMS.txt` and
`REPOSITORY_PACKAGE_ID.txt` remain receipts for the frozen **2.0.1** baseline
while the repository is work in progress. They are not checksums for the current
work-in-progress tree or for the proposed whole-source study beta.

Integrity and provenance do not establish native platform, Word, Moodle,
browser-interaction or teaching-pilot acceptance. The seven pending gates
remain pending. No GitHub Release, tag or deployment is created by these files.
