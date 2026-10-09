# Web Technologies — English student materials 3.0.0

This repository contains the current materials for 14 course and seminar pairs, with two operating-system setup guides, 14 detailed seminar tutorials and 40 required individual microprojects. The 38 learner target files are intentionally unfinished. HTML presentations and guides are the main teaching route; Word references are optional.

Start with [00_START_HERE](00_START_HERE/README.md) or open [index.html](index.html) locally. The original repository organisation is retained: setup in `00_SETUP`, current guidance in `00_START_HERE`, maintenance utilities in `00_TOOLS` and teaching materials in `01_WEEKS`. Shared files remain in `assets` and current records in `metadata`.

## Obtain and open the materials

1. On GitHub choose **Code → Download ZIP**, then extract the complete archive into a new folder. A Git clone is also suitable.
2. Open `00_START_HERE/START_HERE.html` locally and follow the setup guide for your operating system. GitHub’s file view displays HTML source; the local HTML pages provide the interactive teaching route.
3. Open a terminal in the repository root and run `node 00_TOOLS/qa/VERIFY_COLLECTION.mjs` before editing.
4. Find your week in [01_WEEKS](01_WEEKS/README.md). Read the course, seminar start page and tutorial. Open that seminar’s `EN_GB` folder in VS Code before running its commands.
5. Complete every required project individually, run the checks in its guide and retain their actual outputs. After changing only declared learner targets or creating declared dependency/output folders, run `node 00_TOOLS/qa/VERIFY_COLLECTION.mjs --allow-student-edits` from the repository root.
6. Review your evidence PDF and submit it through the lecturer’s actual authorised Assignment.

Keep private drafts, JSON evidence, screenshots, logs, PDFs and your own synthetic probes outside the entire repository folder. The reference runtime is Node.js 24.21.0; each unit explains its dependencies and local environment.

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

The [download guide](00_START_HERE/DOWNLOAD.html) distinguishes this current repository layout from the frozen [published 3.0.0 classroom assets](https://github.com/antonioclim/WebTech_ASE/releases/tag/classroom-en-gb-v3.0.0). The [current repository identity](metadata/current-integrity/REPOSITORY_PACKAGE_ID.txt) describes this checkout. Earlier editions are listed in [PREVIOUS_RELEASES.md](PREVIOUS_RELEASES.md), with changes in [CHANGELOG.md](CHANGELOG.md).

## Qualification

General qualification remains **NOT_FINAL**. The ten broad qualification gates remain pending; native, manual and human acceptance was deferred by the owner. Read [the qualification scope](00_START_HERE/QUALIFICATION.html). Integrity and task results support the checks they actually perform.
