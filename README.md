# Web Technologies — English student materials, v4.0.0 source

All 14 courses, 14 seminars and two setup units are present. The complete v4.0.0 source is technically qualified for the declared observed Windows profile within the recorded checks. Final source integration, the v4.0.0 tag, release assets and publication remain to be completed. The [frozen v4.0.0-rc.1 teaching review](https://github.com/antonioclim/WebTech_ASE/releases/tag/v4.0.0-rc.1) remains a prerelease and the Latest stable classroom edition remains 3.0.0. Read the [declared publication profile](metadata/PUBLICATION_PROFILE.json) and [qualification scope](00_START_HERE/QUALIFICATION.html) for the evidence and limits.

This repository contains the current materials for 14 course and seminar pairs, with two operating-system setup guides, 14 detailed seminar tutorials and 40 required individual microprojects. The 38 learner target files are intentionally unfinished. HTML presentations and guides are the main teaching route; Word references are optional.

For the complete published teaching review, open [v4.0.0-rc.1](https://github.com/antonioclim/WebTech_ASE/releases/tag/v4.0.0-rc.1) and download its attached **WEBTECH_ASE_EN_GB_CLASSROOM_v4.0.0-rc.1.zip**. Extract it into a new folder and open `00_START_HERE/START_HERE.html`. The [previous stable 3.0.0 release](https://github.com/antonioclim/WebTech_ASE/releases/tag/classroom-en-gb-v3.0.0) remains GitHub Latest. The final **v4.0.0** tag and assets will identify a separately published edition; this source preparation does not publish them.

Start this source copy with [00_START_HERE](00_START_HERE/README.md) or open [index.html](index.html) locally. The original repository organisation is retained: setup in `00_SETUP`, current guidance in `00_START_HERE`, maintenance utilities in `00_TOOLS` and teaching materials in `01_WEEKS`. Shared files remain in `assets` and current records in `metadata`.

## Obtain and open the materials

1. Prefer the attached [RC1 teaching ZIP](https://github.com/antonioclim/WebTech_ASE/releases/download/v4.0.0-rc.1/WEBTECH_ASE_EN_GB_CLASSROOM_v4.0.0-rc.1.zip) for the frozen review edition. For a separate current source copy, choose **Code → Download ZIP** or use a Git clone. Extract each complete archive into its own new folder.
2. Open `00_START_HERE/START_HERE.html` locally and follow the setup guide for your operating system. GitHub’s file view displays HTML source; the local HTML pages provide the interactive teaching route.
3. Open a terminal in the repository root and run `node 00_TOOLS/qa/VERIFY_COLLECTION.mjs` before editing.
4. Find your week in [01_WEEKS](01_WEEKS/README.md). Read the course, seminar start page and tutorial. Open that seminar’s `EN_GB` folder in VS Code before running its commands.
5. Complete every required project individually, run the checks in its guide and retain their actual outputs. After changing only declared learner targets or creating declared dependency/output folders, run `node 00_TOOLS/qa/VERIFY_COLLECTION.mjs --allow-student-edits` from the repository root.
6. Review your evidence PDF and submit it through the lecturer’s actual authorised Assignment.

Keep private drafts, JSON evidence, screenshots, logs, PDFs and your own synthetic probes outside the entire repository folder. Read the [environment policy](00_START_HERE/ENVIRONMENT.html): the named reference is distinct from the runtime actually checked. An ENV_WARN permits the supported operation to continue; an ENV_BLOCKED identifies the affected operation. Follow each unit's dependency and capability requirements.

## Find the current files

| Folder | Contents |
| --- | --- |
| [00_SETUP](00_SETUP/README.md) | Windows and macOS/Linux setup |
| [00_START_HERE](00_START_HERE/README.md) | Start instructions, course plan, evidence guidance, download choices and qualification scope |
| [00_TOOLS](00_TOOLS/README.md) | Current validation and maintenance utilities |
| [01_WEEKS](01_WEEKS/README.md) | Weeks 01–14, with each course and seminar’s current `EN_GB` teaching files |
| [assets](assets/) | Shared repository assets |
| [metadata](metadata/README.md) | Current course map, collection inventory and integrity records |

Each seminar’s `CLASSROOM_RC6` directory is its current implementation and evidence-form protocol. Its name is retained because the teaching commands and saved forms depend on it. The course and seminar wrappers lead directly to the material selected for this edition.

The [download guide](00_START_HERE/DOWNLOAD.html) distinguishes the [frozen RC1 teaching assets](https://github.com/antonioclim/WebTech_ASE/releases/tag/v4.0.0-rc.1), this current source copy and the [previous stable 3.0.0 classroom assets](https://github.com/antonioclim/WebTech_ASE/releases/tag/classroom-en-gb-v3.0.0). The [current repository identity](metadata/current-integrity/REPOSITORY_PACKAGE_ID.txt) describes this checkout. Earlier editions are listed in [PREVIOUS_RELEASES.md](PREVIOUS_RELEASES.md), with changes in [CHANGELOG.md](CHANGELOG.md).

## Qualification

The declared Windows technical profile is **PASS_DECLARED_WINDOWS_PROFILE_WITH_LIMITS**. Observed evidence uses Windows x64, PowerShell 5.1.26100.9549, Node v24.21.0 and headless Edge 155.0.4283.45. It includes the corrected node, HTTP and SQLite preflight, all 334 declared browser checks, 14 downloaded JSON drafts and 15 synthetic headless draft PDFs comprising 201 pages. Owner-saved native S01, S03 and S14 draft PDFs retain their separate 36-page review. These observations bind the named tested copies and unchanged teaching code; later source documentation and maintenance changes have separate integrity checks.

General qualification remains **NOT_FINAL**, broad native acceptance remains false and the ten historic whole-edition gates remain pending. The declared source technical eligibility does not mean the final tag or assets have been published. Environment acceptance remains false: 127 narrowly classified blocked Kaspersky requests are retained in the browser evidence. macOS is **NOT_EXECUTED_NOT_QUALIFIED**, with all materials retained. Linux observations are scoped and do not qualify the whole platform. The optional Word references retain Linux rendering QA and explicit native Word limits. Live Moodle, human pilot and owner acceptance are separate pending observations. Read [the qualification scope](00_START_HERE/QUALIFICATION.html), [the publication profile](metadata/PUBLICATION_PROFILE.json) and [the current scoped evidence record](metadata/CURRENT_QUALIFICATION.json).
