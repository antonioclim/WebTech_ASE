# Web Technologies — English student collection

The current complete course candidate is **3.0.0-rc.5**, an explicit selection of 14 courses, 14 seminars and two Day 0 setup kits. It is reconstructed from the preserved RC4 student collection with a new S02 Windows correction and newly checked maintenance controls. Native and institutional acceptance remain separate.

- [Start and browse the English materials](index.html).
- [Environment and setup](ENTRY/ENVIRONMENT.html).
- [Course plan](ENTRY/COURSE_PLAN.html).
- [Authoritative 30-object selection](metadata/student-selection.json).
- [Reconstruction and limitations](00_TOOLS/maintainer/RECONSTRUCTED_RC5.md).

Use the filtered student ZIP once supplied as a release asset. GitHub's **Source code** ZIP is the maintenance repository and includes historical editions, Romanian materials and publishing controls. They are retained for provenance; they are not the intended student download. The previous Weeks 01–02 RC2 distribution and native integrity evidence remain preserved under 90_RELEASES with their original scope.

## Maintainers

Reference: Python 3.12, Node **24.21.0** and `PyYAML==6.0.3`. After installing the pinned parser, run:

```sh
python 00_TOOLS/qa/validate_public_repo.py --strict
python 00_TOOLS/qa/student_release.py --mode integrity
python 00_TOOLS/publishing/build_week_bundle.py --verify-all --plan 90_RELEASES/FULL_COLLECTION_PLAN.json
```

Build the student ZIP or static site only into a new directory outside this checkout:

```sh
python 00_TOOLS/publishing/build_student_collection.py --zip ../WEBTECH_ASE_EN_GB_v3.0.0-rc.5.zip
python 00_TOOLS/publishing/build_pages_site.py --output ../webtech-student-site
python 00_TOOLS/qa/validate_pages_payload.py --site ../webtech-student-site
```

All three GitHub workflows are manual only. This reconstruction does not dispatch them. Final mode refuses absent or incomplete real observations for all ten fixed gates. A preview resolution retains draft and prerelease flags and does not grant qualification.
