# Student WIP preview distribution — Weeks 03–14

## Distribution and qualification are different decisions

The student-content candidates are made browsable and downloadable with explicit warnings. This lane does not assert that qualified-release admission gates passed. Weeks 01–02, their paths, original archives and the live S01 addition remain unchanged.

Weeks 03–14 follow `week → course/seminar → language`. Original course and seminar ZIPs remain in `DOWNLOAD`; complete byte-identical extracted copies remain in `PACKAGE_EXACT` with flat package roots. GitHub displays HTML source rather than running the lesson and no Pages deployment is implied.

Weeks 03–07 retain the already published WIP preview objects and whole-week preview ZIPs. Weeks 08–14 add public-only course and seminar objects from the locally audited candidates. They do not add teacher packages, private references, consoles, marking material, Moodle administration or internal QA.

## Immutable object payloads

Course and seminar packages retain their original versions, manifests, `PACKAGE_ID` values and bytes. Wrapper metadata records WIP preview status. It does not promote runtime, browser, database, security, platform, Word or Moodle status to PASS.

## Repository identity during WIP

`REPOSITORY_SHA256SUMS.txt` and `REPOSITORY_PACKAGE_ID.txt` continue to describe the last frozen baseline, as required by `REPOSITORY_PACKAGE_ID_METHOD.md`. They are not regenerated for this WIP preview expansion. A final freeze would require its own complete validation and explicit authorisation.

## What remains blocked

Do not treat a preview as a qualified release, deploy Pages, run publication workflows, create Releases or apply historical cumulative patches. Full application execution, genuine database/driver observations, browser/platform checks and Moodle configuration remain separate gates.

A branch of a public repository is public. Never upload a teacher package, restricted solution, console, internal QA archive, student evidence or private handover.

## Owner operation

Use the browser-only upload kit on one short-lived review branch based on the pinned commit. Upload only the contents of each `UPLOAD_CONTENTS` directory at repository root. Review the exact changed paths and stop before merge for a read-only audit. This projection changes access to student material, not its qualification.
