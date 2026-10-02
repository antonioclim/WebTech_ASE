# S06 — separate temporary-file lifecycle observation

**Derived teaching README, student edition v1.2.0.** The original Example02 JavaScript, package file and lockfile remain exact protected source copies. This README replaces the historical installation block and clarifies the observation boundary; it is not claimed byte-identical to the canonical documentation. The original README and original/derived hashes are retained privately.

This short observation is required separately from P02. It does not require the full optional P01 store. Read `example.js` and preserve a prediction for the marker after normal reopen and after explicit reset before executing the observation.

From the **kit root**, use the beginner guide and the prepared environment:

```powershell
.\CHECK_ENVIRONMENT.cmd lifecycle
.\OBSERVE_FILE_LIFECYCLE.cmd
```

```bash
bash CHECK_ENVIRONMENT.sh lifecycle
bash OBSERVE_FILE_LIFECYCLE.sh
```

No launcher installs dependencies or chooses a personal database. The helper owns a newly created temporary directory, uses a minimal course model, creates a marker, closes the connection, opens the same file again, explicitly resets the owned temporary schema and checks cleanup. Read actual `success`, `error`, stage and cleanup fields; the presence of output JSON does not establish success. Preserve the real block if its source/runtime/dependency guard fails.

The accurate boundary is **SAME_PROCESS_CONNECTION_REOPEN**. The canonical source uses a variable named `restart` and prints historical restart wording, but the JavaScript programme does not launch a second Node process. Record the marker, stage PIDs, path, reopen/reset observations and cleanup status without inflating that wording into a process-restart claim.

Normal reopen preserves existing rows and seeds an empty table only. The reset path deliberately uses `sync({force:true})` for the helper's owned temporary schema. Do not apply it to a personal or production database. This observation does not establish crash recovery, power-loss durability or persistence of the separate P02 `:memory:` database. Production schema changes are outside this exercise.

A timeout or closure failure does not establish successful cleanup; retain any reported owned path and error. Do not manually delete or reset a different database. Complete E5 in the one S06 evidence form and retain the original prediction separately from the measurement.
