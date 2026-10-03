# Separate teaching previews — not assessed replacements

Both previews start with incomplete assessed components copied from the exact student trees. They contain **no repaired assessed implementation**. Use them only in a separately provisioned local environment; this delivery does not install dependencies or qualify their real React/browser behaviour.

## P01 common fixture and bounded identity

1. Preserve your assessed App.jsx in projects/p01/student/src. Copy that one file into teaching/p01-preview/src/App.jsx.
2. From teaching/p01-preview, start the already provisioned Vite development session with npm run dev and use its reported loopback address.
3. The default route is React. Append /vanilla.html at the same reported origin for the separate original vanilla comparator. Opening either project HTML by file:// is not a Vite execution.
4. Use the shared fixture: HTTP unread with id a and SQLite read with id b. React and vanilla have separate teaching-only storage namespaces. Compare the same initial data and record which tab/application is being observed.
5. The page exposes window.S08Preview for bounded inspection: writes, stored data and the labelled reset control. The React preview resets its fixture; inspect the exact control and confirm before deleting its teaching data. Preserve evidence first. Reset does not erase unrelated applications' storage.
6. Record an actual add–persist–reload–add sequence only after carrying it out. Check the complete array for duplicate IDs. The allocator reads current persisted IDs and reserves its own IDs; it rejects existing duplicates and does not offer cross-tab atomicity or permanent historical uniqueness.

The canonical entry's reset counter remains untouched. App.jsx is the assessed boundary; the preview main, identity helper, common fixture and storage wrappers are not student implementation obligations. The vanilla comparator's markup-handling behaviour is not a safety property or a behaviour to replicate. Use ordinary teaching titles; no exploitation exercise is included.

## P03 compatible adapter, unrepaired lifecycle

Copy only your current projects/p03/student/src/SearchPanel.jsx into teaching/p03-preview/src/SearchPanel.jsx. The preview's entry imports demo-compatible.mjs. That adapter accepts an absent signal, honours a provided signal cooperatively and presents local deterministic teaching results. It removes an incidental contract mismatch without fixing the weak panel's debounce, state ownership or cleanup.

A weak panel may still repeat requests or show incorrect states. Stop that local session when unintended repeated work appears; do not label it a successfully repaired application. The canonical deterministic non-cooperative fake, not the cooperative preview adapter, is needed to test resolve-after-abort publication rights.

Do not copy preview files back into assessed trees. Do not change the package/lockfile or install dependencies as an unrecorded preflight. Any later real-stack acceptance must identify the assessed file revision, preview derivative and actual environment.
