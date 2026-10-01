# S09 P02 — Semester integration transfer

P02 is CAPSTONE_INTEGRATION, not a second full implementation gate in the 60-minute S09 meeting. Its source estimate is 70–90 minutes. Implement only capstone/p02/student/client/src/NotesWorkspace.jsx when working on that milestone. Do not import a router, database, global cache or optimistic updates into this scope.

Record three owners: confirmed notes from successful API results, the current form selection/draft and the submission/loading/error state. Predict one normalised create/update and the later list result. Distinguish an old refresh versus a newer refresh, an old refresh versus a confirmed mutation and cleanup versus a non-cooperative promise. A local model of these intercalations is not a distributed consistency solution.

The exact adapter exposes list/create/update/remove. It does not offer get and the exact server does not provide individual GET simply because POST returns Location. The supplied server stores notes in memory. Preserve this scope and the one-file assessed boundary. The named preview provides a separate support adapter and launcher; its component remains incomplete and its original lockfile is not replaced.

After separate qualification, from the assessed project directory use the supplied `npm run test:baseline`, `npm run test:objective`, `npm run test:regression` and `npm run build`. The supplemental command is `node node_modules/vitest/vitest.mjs run --config client/s09_checks/config.js`. These commands were not executed during package production. The original standalone server entry has a documented URL/native-path comparison limitation; the separate preview uses `node server/preview-server.mjs --start-local` instead of silently changing that entry.

For S09, record a conceptual transfer and the true capstone status. NOT_STARTED is allowed. A missing full P02 implementation is not an extra deduction in the P01/P03 rubric. There is no new separate P02 Moodle Assignment or deadline in this package.
