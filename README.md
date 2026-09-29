# WebTech_ASE — Web Technologies at ASE

> **Repository work in progress. Automated validation, Pages deployment and weekly release publication are intentionally manual-only until the corpus is frozen.**

`WebTech_ASE` is the public, student-facing repository for the Web Technologies
module at the Bucharest University of Economic Studies.

## Available material

The current working repository contains:

- Day 0 setup for Windows and macOS/Linux;
- optional one-file setup release candidates with browsable guides;
- week 1: C01 and S01 in Romanian and British English;
- week 2: C02 and S02 in Romanian and British English;
- offline student packages and evidence-oriented seminar forms;
- Moodle submission guidance;
- public checksums, exact extracted packages and repository validation tools.

Future weeks are listed in the [course map](current-outline.md). Their publication
state remains provisional until the same public/private, language, Moodle and QA
gate has been completed.

## Start in three steps

1. Complete [Day 0 setup](00_SETUP/README.md).
2. Open [the student quick start](00_START_HERE/STUDENT_QUICK_START.md).
3. Choose a week, then course or seminar, then language.

```text
week → course/seminar → language
```

## Week 01–07 download index

[Choose a week, course or seminar](01_WEEKS/README.md).

Weeks 01–02 keep their existing files and navigation. Weeks 03–07 are now provided
as **student WIP preview downloads**, not qualified final releases. The complete
course and seminar sources are inside the ZIPs. Runtime, native-platform and
browser acceptance remain pending; Weeks 05–07 also have application/dependency
qualification gaps. See the [preview policy](00_TOOLS/maintainer/PREVIEW_DOWNLOAD_POLICY.md).

This download-only route does not deploy Pages, create a Release, run Actions or
change stable release admission. Do not upload private teacher packages.

## Published teaching objects

- [Week 1](01_WEEKS/WEEK_01/README.md)
- [Week 2](01_WEEKS/WEEK_02/README.md)
- [Download a whole week](00_START_HERE/DOWNLOAD_A_WEEK.md)

## Seminar evidence and Moodle

Seminar work follows this individual loop:

```text
prediction → experiment → evidence → Gemini audit → limitation → PDF → Moodle
```

Read the [Moodle submission guide](00_START_HERE/MOODLE_SUBMISSION.md) before
uploading work to `online.ase.ro`.

## Public/private boundary

This repository excludes teacher guides, answer keys, teacher consoles,
restricted reference solutions, internal grading material, student submissions
and internal QA archives. See [PRIVATE_CONTENT_POLICY.md](PRIVATE_CONTENT_POLICY.md).

## Citation and rights

Citation metadata is available in [CITATION.cff](CITATION.cff) and
[codemeta.json](codemeta.json). During the WIP period, these identify the last
stable repository baseline rather than a newly frozen release. Copyright © 2026
Antonio Clim. All rights reserved. Public access does not create an open licence.

## Support

Use the issue forms for reproducible technical problems or content corrections.
Do not post passwords, tokens, cookies, private Moodle data or student work.
See [SUPPORT.md](SUPPORT.md) and [SECURITY.md](SECURITY.md).

## Development status

```text
Stable baseline version: 2.0.1
Current state: work in progress
Automated Actions: disabled; all workflows are manual-only
Pages deployment: intentionally deferred
Repository identity: frozen baseline; regeneration deferred until final freeze
Established material: Day 0 and weeks 1–2
Additional downloads: weeks 3–7, unqualified WIP previews
Guidance language: English
Bilingual exceptions: C01, S01, C02 and S02
```
