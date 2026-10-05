# Web Technologies filtered classroom prerelease 3.0.0-rc.7

This classroom distribution gives students one fourteen-week entry route while keeping the full source collection available separately. It is a draft prerelease with a general verdict of `NOT_FINAL`.

Download the release asset `WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.7.zip` and its `.sha256` sidecar after the owner has prepared and published this prerelease. GitHub's automatic **Source code** archives contain the development repository and are not this classroom distribution.

Extract the whole asset, then open `WEBTECH_ASE_EN_GB_CLASSROOM_RC7/index.html`. Follow `START_HERE.html` before editing. The initial integrity command is `node VERIFY_COLLECTION.mjs`; the protected-files command after permitted learner changes is `node VERIFY_COLLECTION.mjs --allow-student-edits`.

## Included teaching material

- All fourteen course units and both setup units are preserved complete, with their original package identities and bytes.
- All fourteen `CLASSROOM_RC6` seminar folders are preserved without changes: 266 files, 40 required individual microprojects and 38 distinct editable files.
- In total, 1,156 authenticated source files are preserved. The selection retains 30 optional course/setup Word references and omits the 39 seminar Word references and original full seminar applications.
- Twenty-eight explicit reference notices preserve the destinations of classroom links to legacy guides/forms. Each notice offers a manual link to the exact retained GitHub source and a return to the current classroom route. These notices do not supply the original application or act as evidence forms.

Each filtered seminar has a new `PACKAGE_ID.txt` and checksum manifest. Use that new identity in its current classroom form. `SOURCE_PACKAGE_ID.txt` identifies its original full source package. Complete course/setup units retain their original identities. The unchanged inner classroom contract remains `1.0.0-rc.6`; RC7 identifies the outer filtered distribution.

The builder authenticates its source against RC6 material SHA256 `5c9d9a2aa07fe0eccc03239940a1cfbd895d07b906c9b99cfcd5188e4d464ec4` and the selection registry. `PRESERVED_SOURCE_FILES.json` records every preserved file. The outer manifest and new identity cover the actual filtered payload.

## Evidence and limits

The unchanged form bytes have bounded prior synthetic evidence from Edge 154 on Windows: 392 finite case rows across fourteen forms, fourteen JSON downloads and twenty-eight PDF outputs. All 164 pages of those supplied PDFs were reviewed. This evidence is about unchanged code and synthetic fixtures; it is not completed student work or acceptance of the new wrapper, reference notices, collection verifier or records carrying the new package identities.

The distribution's local tests check deterministic construction, preserved bytes, required local link/module destinations, package identities, the twenty-eight prescribed boundary/initial commands and finite refusal cases. These tests do not establish native Windows execution of the new wrapper launchers, native macOS, Microsoft Word rendering, full keyboard/accessibility behaviour, live Moodle submission or a genuine cohort pilot. The planned 60-minute seminar schedules remain unpiloted. All ten broad qualification gates remain pending.

Two inherited optional `serve` branches in the S03/S06 classroom runner import an absent `server.mjs`. Their prescribed guides do not use that branch; the new seminar entries explicitly exclude it. Follow the prescribed commands. Preserving the original classroom bytes also preserves minor PDF label/pagination issues already recorded in the scoped RC6 review.

## Publication

The owner alone starts `release-classroom.yml`. It requires explicit preview and the exact reviewed Git commit SHA, refuses existing tags/releases and prepares only a new **draft prerelease**. It has no final-release mode and never overwrites an existing version. A failure after tag creation can leave that new tag in place; a rerun refuses it. Inspect the run before deciding on recovery.

The asset, its sidecar and `SHA256SUMS.txt` are generated outside the repository. No private owner evidence, student records, runtime downloads, dependency trees, CI logs or historical repository archives are added to the classroom asset. See [the maintainer instructions](../00_TOOLS/maintainer/CLASSROOM_RC7_PUBLISHING.md) and [the exact release plan](CLASSROOM_RELEASE_PLAN.json).
