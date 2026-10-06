# Maintainer documentation — prepared RC9

The current classroom successor is **3.0.0-rc.9 — PREPARED_NOT_PUBLISHED** and **NOT_FINAL**. RC8 is the last published classroom prerelease. The retained RC6 whole-source selection and frozen baseline are provenance, not the active classroom download.

Start with these current documents:

1. [Current English student portal](../../00_START_HERE/STUDENT_CLASSROOM_RC9/README.md), which distinguishes the prepared RC9 asset from the last published RC8 download.
2. [RC9 source review, local construction and owner-only draft preparation](CLASSROOM_RC9_PUBLISHING.md).
3. [RC9 release notes and scope limits](../../90_RELEASES/NOTES_CLASSROOM_RC9.md).
4. [Current repository status](../../REPOSITORY_STATUS.md), [support](../../SUPPORT.md) and [security/privacy](../../SECURITY.md).
5. [Historical RC6 weekly publisher](WEEKLY_RELEASE_PUBLISHING.md), only when a separate retained whole-source week is deliberately required.

Only the owner starts Actions after the final review phase. Every workflow remains `workflow_dispatch` only. Preparing files, running local QA or creating an integration commit does not dispatch Actions, deploy Pages or publish a release. The RC9 workflow prepares a new draft prerelease at the exact reviewed source SHA; publishing the draft remains a separate owner decision. No absent native, browser accessibility, Word, Moodle, workload or owner evidence is recorded as PASS.

The RC9 guide also describes a distinct advanced-source derivation. Its recorded path and containment fixes do not qualify all full applications or make historical whole-package verification commands compatible with changed bytes. Follow the new outer integrity control and the actual report's scope. Keep the optional advanced ZIP outside the three core classroom release assets.

Private instructor archives, student submissions, browser profiles, installed dependencies, audit fixtures and owner evidence are not GitHub upload sources. Keep them outside the public checkout and release assets.

<details>
<summary>Historical construction and first-upload documentation</summary>

The following record describes the earlier construction stage. Its “current”, “browser only” and final-freeze wording is historical. Use the RC9 instructions above for the prepared successor; do not interpret old initial-upload recipes as a requirement to repeat repository setup or alter permissions.

# Maintainer documentation

The current repository state is **work in progress** and the publication profile is
**browser only**.

Start with:

1. `DEVELOPMENT_WORKFLOW.md`;
2. `FIRST_UPLOAD_GUIDE.md`;
3. `FINAL_UPLOAD_CHECKLIST.md`;
4. `GITHUB_REPOSITORY_SETTINGS.md`;
5. `GITHUB_PAGES_SETUP.md`;
6. `WEEKLY_RELEASE_PUBLISHING.md`;
7. `STUDY_SNAPSHOT_PUBLISHING.md` for the separate whole-source beta and `next-release` branch.

The private instructor staging archive is not a GitHub upload source. GitHub
Actions workflows are manual-only and must not be run until the final corpus
freeze. The final owner-triggered Pages workflow performs repository validation,
site construction, payload validation and deployment in one run.

</details>
