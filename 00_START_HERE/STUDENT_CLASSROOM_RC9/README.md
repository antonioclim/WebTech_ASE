# RC9 classroom preview — prepared, not published

The current source prepares `classroom-en-gb-v3.0.0-rc.9`. No RC9 GitHub release is claimed here. The [last published RC8 prerelease](https://github.com/antonioclim/WebTech_ASE/releases/tag/classroom-en-gb-v3.0.0-rc.8) remains available with its documented limitations.

The RC9 ZIP contains fourteen course entries, fourteen individual seminar routes, two setup objects, forty bounded required microprojects, fourteen detailed HTML tutorials and improved evidence forms. Nine courses and both setup objects retain their original bytes. C07, C08, C09, C10, C14 and all seminar companions are explicit derivatives. Thirty optional Word handouts are retained as references; HTML is the primary route.

In a fully extracted RC9 ZIP, open `index.html`, read `START_HERE.html` and run `node VERIFY_COLLECTION.mjs` from the collection root before editing. After changing only declared learner files, use `node VERIFY_COLLECTION.mjs --allow-student-edits`. Task tests remain separate. The folder name `CLASSROOM_RC6` records the retained task layout, not an unchanged-file claim.

This repository directory is a builder template, not a complete extracted student package. Its generated package links resolve in the built ZIP. The maintainer command from the repository root is:

```sh
python 00_TOOLS/publishing/resolve_classroom_rc9.py --plan 90_RELEASES/CLASSROOM_RC9_RELEASE_PLAN.json --asset-dir ../rc9-preview --allow-preview --build --github-output ../rc9-preview-output.txt
```

It prepares only three release assets and does not publish them or start GitHub Actions. The owner alone may run the manual workflow after reviewing the exact commit. All broad qualification gates remain pending and the 60-minute plan remains unpiloted. No genuine student, Moodle or native-platform acceptance is inferred.

Optional full applications are a separate historical advanced scope. Reviewed RC9 native-path and S13 containment corrections are implemented by the advanced derivative recipe; the original sealed RC6 carriers stay unchanged. Old C07 full source has known stale registry hashes and must not be confused with the corrected classroom derivative.
