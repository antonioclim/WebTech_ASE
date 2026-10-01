# Deep-Link Failure Repair — active teaching contract

Role: **required individual portfolio**. Work only in `student/server/create-production-app.js`. The complete source requirements are preserved in [spec.md](spec.md). Read the [current source notes](../../SOURCE_NOTES.md) and [student guide](../../S09_STUDENT_GUIDE.html) first. Historical README/validation claims are not new execution results.

Keep supplied dependencies, tests, evidence, stores and fixtures unchanged. The declared supplementary `s09_checks` files are new assessment witnesses, not canonical test modifications. They are authored but unexecuted in their real application environments.

The root `tools/verify-boundary.mjs p03` command checks paths/hashes only; run it using Node from the public package root. Correct allowed-path edits can still be incomplete or wrong. No dependency install or network action is hidden in the checker.

Do not rebuild client-dist. The fixed asset filename is not evidence of a content hash. The universal source preserves its completing API boundary: keep API miss as a control and observe the missing asset as a failure. Supplemental matrix includes exact /api versus /apiary.
