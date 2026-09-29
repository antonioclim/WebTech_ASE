# Separate file-lifecycle observation

P02's database is `:memory:` and deliberately reset for deterministic queries. It cannot establish file persistence. This small C06-derived observation is required, but full P01 store implementation is not. Work only with the helper's newly created temporary directory; it accepts no personal database path.

Read the source example at `canonical/02-initialization-policy/example.js` and predict what happens to a newly created marker after normal reopening and after an explicit reset. The copied example and lockfile are exact C06 sources. The observation helper is also the C06 helper, with the adapter restricted to Example 02. It uses a minimal course model, not the assessed P01 store.

From the extracted S06 student root:

```text
node tools/lifecycle.mjs preflight
```

If the source, reference runtime or dependency checks are blocked, preserve the real message and save a draft. Do not infer a native-driver load from a package version. The route needs the separate course-example dependencies, not merely packages placed in P02. No installation is performed by this command.

On the separately prepared environment:

```text
node tools/lifecycle.mjs run --allow-temporary-database
```

The helper prints the temporary directory it owns. It creates a marker, closes the connection, reopens the same file, observes the marker, explicitly resets that temporary schema and checks marker removal. It records process IDs, storage, stages and cleanup. Read `success`, `error`, `cleanup` and the individual stage observations; do not substitute the presence of JSON for success.

This route crosses a **same-process connection boundary**. It does not restart Node, simulate a crash or test power-loss durability. In the form write `SAME_PROCESS_CONNECTION_REOPEN: E5-output-reference` and provide the actual marker/rows. A supplied transcript is a record from its producer, not your own execution. The observation is bounded by a watchdog. A closure failure may retain the owned directory; a timeout is not successful cleanup.

A teacher-approved non-reference compatibility run uses `--compatibility`, not the project helper's `--allow-nonreference`. It still requires the temporary-data flag and prepared dependencies. Do not reset or delete a different database. Record a missing prerequisite honestly; any substitution for the standard final requirement needs a separate teacher decision with a reference.
