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
