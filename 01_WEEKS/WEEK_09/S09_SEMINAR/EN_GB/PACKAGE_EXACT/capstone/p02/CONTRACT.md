# Full-Stack Notes CRUD — active teaching contract

Role: **semester capstone integration, not a second S09 full implementation gate**. Work only in `student/client/src/NotesWorkspace.jsx`. The complete source requirements are preserved in [spec.md](spec.md). Read the [current source notes](../../SOURCE_NOTES.md) and [student guide](../../S09_STUDENT_GUIDE.html) first. Historical README/validation claims are not new execution results.

Keep supplied dependencies, tests, evidence, stores and fixtures unchanged. The declared supplementary `s09_checks` files are new assessment witnesses, not canonical test modifications. They are authored but unexecuted in their real application environments.

The root `tools/verify-boundary.mjs p02` command checks paths/hashes only; run it using Node from the public package root. Correct allowed-path edits can still be incomplete or wrong. No dependency install or network action is hidden in the checker.

The actual adapter/server provides list/create/update/remove and no individual get. A Location header does not create a GET route. The in-memory server has no database persistence. The separate preview retains the incomplete component and gives a declared support adapter/launcher; it is not the assessed tree.
