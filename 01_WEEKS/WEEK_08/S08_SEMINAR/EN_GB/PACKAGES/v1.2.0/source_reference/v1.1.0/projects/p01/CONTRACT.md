# P01 — full assessed contract

**Required central implementation. Derived S08 contract; canonical source files remain unchanged.**

Edit only `student/src/App.jsx`. The full original project obligation is retained; the class implementation segment is not a reduced substitute. Inputs are `storage`, `initialItems` and `createItemId`. Preserve the supplied names and prop contract.

Implement ReadingQueue using QueueForm, QueueFilter, QueueList and QueueItem with explicit props and callbacks. Initialise from storage key `reading-queue`; valid stored arrays win, while absent/invalid JSON or any invalid item shape falls back as a whole. Valid items have non-empty string id/title and boolean read. Shape validity does not prove ID uniqueness.

Use controlled title state, trim on submit, ignore blank input, add an unread item through the injected ID factory and clear the input. Keep transition functions pure. Toggle and remove immutably, use ID keys, derive all/remaining/read filters and visible counts, expose the active filter and provide meaningful empty states. Synchronise complete items in the owned effect; filter-only changes must not write storage.

Preserve semantic controls, labels, button/status text and keyboard operation. Do not add manual DOM queries, innerHTML, manual listeners, mutable updates, a router/server, a global state or reducer framework or any dependency. Keep entry/CSS/fixtures/vanilla/tests/package files and lockfile unchanged.

Record the common fixture and add/toggle/remove/filter/count/empty-state traces, valid/invalid initial storage and storage-write observations. Report actual baseline, objective, regression, build, boundary and browser checks separately. The standard final route requires recorded success in the canonical categories, with any additional checks identified separately. Missing tools are not expected pedagogical assertion failures.

The original main counter can collide after module reset; do not fix it in the assessed main file. Use the separately labelled teaching/p01-preview for the additional identity witness, copying only your App.jsx into it. Its helper allocates against current persisted and session-reserved IDs, rejects pre-existing duplicates and does not claim concurrent-tab atomicity or historical global uniqueness. Real browser reload qualification is deferred in this delivery.

Optional diagnostic: deliberately include filter in the persistence effect dependencies, predict and observe the unnecessary write using a named mount condition, then restore the valid version. The PDF must identify the temporary edit, restoration and evidence class. Do not describe a source expectation as an observed write.

Source: U08 project-01/spec.md, required behaviour, constraints and validation plan; W08 F04–F06 and F10. S08 changes the complete-code Gemini prompt to bounded critical review without changing the implementation contract. It does not adopt universal vanilla parity or unsafe title-markup interpretation.
