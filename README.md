# Web Technologies — English student materials, v4.0.0 candidate

All 14 course and seminar pairs have completed the T01–T07 teaching revision with explicit limits. This complete source candidate prepares the final v4.0.0 edition. The [v4.0.0-rc.1 teaching review edition](https://github.com/antonioclim/WebTech_ASE/releases/tag/v4.0.0-rc.1) is published as a prerelease; the Latest stable classroom edition remains 3.0.0. Read the [candidate progress](metadata/CANDIDATE_PROGRESS.json) before interpreting this checkout as a complete release.

This repository contains the current materials for 14 course and seminar pairs, with two operating-system setup guides, 14 detailed seminar tutorials and 40 required individual microprojects. The 38 learner target files are intentionally unfinished. HTML presentations and guides are the main teaching route; Word references are optional.

For the complete published teaching review, open [v4.0.0-rc.1](https://github.com/antonioclim/WebTech_ASE/releases/tag/v4.0.0-rc.1) and download its attached **WEBTECH_ASE_EN_GB_CLASSROOM_v4.0.0-rc.1.zip**. Extract it into a new folder and open `00_START_HERE/START_HERE.html`. The [previous stable 3.0.0 release](https://github.com/antonioclim/WebTech_ASE/releases/tag/classroom-en-gb-v3.0.0) remains GitHub Latest. The final **v4.0.0** tag is reserved until the required technical qualification is complete.

Start this candidate review with [00_START_HERE](00_START_HERE/README.md) or open [index.html](index.html) locally. The original repository organisation is retained: setup in `00_SETUP`, current guidance in `00_START_HERE`, maintenance utilities in `00_TOOLS` and teaching materials in `01_WEEKS`. Shared files remain in `assets` and current records in `metadata`.

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

General qualification remains **NOT_FINAL**. The ten broad qualification gates remain pending for the complete edition. T01–T07 have scoped Node, SQLite, local HTTP, source and form-model checks; native browser rendering, print, Windows, macOS and human acceptance have not passed. Read [the qualification scope](00_START_HERE/QUALIFICATION.html). Integrity and task results support the checks they actually perform.
