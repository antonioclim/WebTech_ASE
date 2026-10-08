# Web Technologies — current classroom collection 3.0.0

The `main` branch contains one complete current classroom collection: 14 courses, 14 seminars, two setup units, 14 detailed seminar tutorials and 40 required individual microprojects. The 38 learner target files remain intentionally unfinished. HTML is the primary teaching route; the 30 Word references are optional.

Start with [the short guide](00_START_HERE/README.md), [the collection home](index.html) or [setup instructions](START_HERE.html). Use [the course plan](COURSE_PLAN.html) to find your week and [the evidence guidance](ASSESSMENT.html) before preparing your PDF.

## Use the collection

1. Choose **Code → Download ZIP** on GitHub, then extract the whole archive into a new folder. A Git clone is also suitable.
2. Open `START_HERE.html` locally and follow your operating-system setup. GitHub’s HTML file view displays source rather than the interactive page.
3. Open a terminal in the collection root and run `node VERIFY_COLLECTION.mjs` before editing.
4. Follow the course, seminar guide and detailed tutorial. Complete every required project individually and run its described task checks.
5. After editing only the declared targets or creating declared dependency/output folders, run `node VERIFY_COLLECTION.mjs --allow-student-edits`.
6. Review your evidence PDF and submit it to the lecturer’s actual authorised Assignment.

Keep private drafts, JSON evidence, screenshots, logs, PDFs and own-case probes outside the entire collection. Do not commit them to this public repository. The reference runtime is Node.js 24.21.0; each unit documents its actual dependencies and local environment.

## Current main and the frozen release

This branch is a cleaned repository derivative of the [published classroom edition 3.0.0](https://github.com/antonioclim/WebTech_ASE/releases/tag/classroom-en-gb-v3.0.0). Teaching code and learner contracts are retained; navigation, historical-copy removal and integrity records describe the current repository copy. Its [PACKAGE_ID](PACKAGE_ID.txt) is distinct from the frozen release ZIP identity. Use [the download guide](DOWNLOAD.html) to choose the current copy, frozen classroom ZIP or static reading profile.

Previous editions remain available through [GitHub releases and tags](PREVIOUS_RELEASES.md) and Git history. They are not duplicated as separate collections in this branch. [CHANGELOG.md](CHANGELOG.md) records the current layout change.

## Qualification

General qualification remains **NOT_FINAL**. All ten broad qualification gates remain pending; native, manual and human acceptance was deferred by the owner, not passed. Stable publication is not complete functional or teaching acceptance. Read [the qualification scope](QUALIFICATION.html). Integrity and task results support only the checks they actually perform.
