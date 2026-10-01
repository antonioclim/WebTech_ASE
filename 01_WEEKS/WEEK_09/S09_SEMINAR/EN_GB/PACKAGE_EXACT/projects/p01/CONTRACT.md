# Routed Notes — active teaching contract

Role: **central full implementation**. Work only in `student/src/NotesApp.jsx`. The complete source requirements are preserved in [spec.md](spec.md). Read the [current source notes](../../SOURCE_NOTES.md) and [student guide](../../S09_STUDENT_GUIDE.html) first. Historical README/validation claims are not new execution results.

Keep supplied dependencies, tests, evidence, stores and fixtures unchanged. The declared supplementary `s09_checks` files are new assessment witnesses, not canonical test modifications. They are authored but unexecuted in their real application environments.

The root `tools/verify-boundary.mjs p01` command checks paths/hashes only; run it using Node from the public package root. Correct allowed-path edits can still be incomplete or wrong. No dependency install or network action is hidden in the checker.

The canonical seed is IDs 1/2 and the store is synchronous/volatile. New-store lifetime is not durable reload. There is no deletion requirement. Validate history replacement with a stack-sensitive witness; do not introduce manual routing or storage logic.
