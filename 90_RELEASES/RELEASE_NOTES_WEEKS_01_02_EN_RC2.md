# WebTech_ASE — Weeks 01–02 EN — 2.1.0-rc.2 (study preview)

This is a **filtered English study preview** for the first two weeks. It contains the four student packages listed below and may be used for guided study while the remaining platform and classroom acceptance checks are completed. It is a release candidate, not a claim of exhaustive validation of the repository or every plausible environment.

## Download the student distribution

Use **`WEBTECH_ASE_WEEKS_01_02_EN_GB_v2.1.0-rc.2.zip`** and its **`.zip.sha256`** sidecar from the Release assets. The ZIP is **1,846,762 bytes** with SHA-256:

```text
e8021a6c03ee98f5f71ec8b5d398fa52b44da7ae10423bd547175037d9651693
```

GitHub's automatically generated **Source code** archives contain the entire tracked source at the Release tag, including material beyond this reviewed scope. Use the named student ZIP for the filtered route.

| Object | Student edition | Package root | First entry point on Windows |
| --- | --- | --- | --- |
| C01 | 2.0.2 RC1 | `TW2026_C01_STUDENT_EN_GB_v2.0.2_RC1` | `OPEN_PRESENTATION.cmd` |
| S01 | 6.1.1 RC1 | `TW2026_S01_STUDENT_EN_GB_v6.1.1_RC1` | `OPEN_BEGINNER_GUIDE.cmd` |
| C02 | 1.2.2 RC1 | `TW2026_C02_STUDENT_EN_GB_v1.2.2_RC1` | `START_COURSE_02.cmd` |
| S02 | 2.3.1 RC2 | `TW2026_S02_STUDENT_EN_GB_v2.3.1_RC2` | `OPEN_BEGINNER_GUIDE.cmd` |

Extract the outer student ZIP into a new directory, then extract each inner object ZIP. Follow the object's README, environment requirements and native launcher instructions. The reference runtime is Node `v24.21.0` and npm `11.19.0`. macOS shell launchers are included; their native acceptance remains pending. Seminar starters deliberately contain unfinished objectives: initial-state verification and completion of an exercise are separate steps.

## What changed in RC2

S02's Windows package verifier now passes a correctly terminated root argument, addressing the native RC1 failure. S02 version labels and package identity were updated for RC2. C01, S01 and C02 retain their exact RC1 object ZIP bytes; the collection and outer weekly distribution carry the RC2 identity. Previously supplied RC1 archives are retained as historical evidence.

The owner returned a successful native integrity run for **all four packages**, covering **256 pristine files**, on Windows 11 Pro x64 `10.0.26200`, Node `v24.21.0` and npm `11.19.0`. The [native integrity receipt](https://github.com/antonioclim/WebTech_ASE/blob/b608ce52087fb78091a19151795eabc01dff7d00/90_RELEASES/NATIVE_WINDOWS_INTEGRITY_RC2.md) states the exact scope. That run used each package root as its current directory and package paths containing `#` but no literal spaces. Different current directories, package roots with spaces and wider native functional checks remain unobserved in the returned evidence.

## Qualification and remaining checks

The global qualification remains **NOT_FINAL / release-candidate**. These seven acceptances remain **pending**: native Windows beyond the observed integrity run, native macOS, manual browser interaction and PDF review, Microsoft Word, live Moodle submission and review, a timed beginner classroom pilot and owner acceptance. Local integrity checks, reference-runtime results and headless browser evidence retain their declared scopes. Publishing a prerelease does not complete these acceptances.

The audit and remediation cover **Weeks 01–02 EN only**. Weeks 03–14 and Romanian packages receive no new qualification from this Release. Previously exposed S01 solution material remains in Git history; an automated result alone is insufficient evidence of individual understanding.

## Provenance

The [current object catalog](https://github.com/antonioclim/WebTech_ASE/blob/b608ce52087fb78091a19151795eabc01dff7d00/90_RELEASES/CURRENT_OBJECTS.json) binds the selected package identities to reviewed payload commit `b631bc9400012c59527a72f6676d94f307460780`. PR #18 integrated that payload and its distribution evidence at `b608ce52087fb78091a19151795eabc01dff7d00`; later release-note corrections preserve the same student bytes. The Release tag identifies the publication source, while the embedded payload SHA identifies the selected object snapshot.

Repository baseline metadata remains `2.0.1`. The historical whole-source study beta is a separate snapshot at `6e5cc0a917429d7120f71fd153e8853f05729c9d` and retains the superseded S02 launcher. Use this RC2 student ZIP for current first-two-week study. Published tags and assets should be preserved; a future correction receives a new release identity.
