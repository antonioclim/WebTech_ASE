# S06 — optional Persistent Notes API

**Derived operational README, student edition v1.2.0.** The canonical README's historical installation/start block is replaced for this teaching layout; original bytes and original/derived hashes are retained privately. Protected source, public page, tests, package and lockfile bytes remain unchanged.

This complete store implementation is optional. It is not needed for the maximum standard S06 mark and is not a substitute for the short required lifecycle observation. Complete required P02/E1–E6 work first. The standard submission remains one S06 evidence PDF.

Your optional one-file target is `02_PROJECTS/optional/p01/src/note-store.js`. Its supplied stub deliberately leaves the store unimplemented. Read the supplied [target source](src/note-store.js), [route boundary](src/app.js) and [objective tests](tests/objective.test.js) for this optional project. Use the [beginner guide](../../../00_START_HERE/S06_INTERACTIVE_ULTRA_BEGINNER_GUIDE_EN_GB_v1.2.0.html) for the standard P02 route. Preserve routes, seed, errors, public page, tests and package files. Do not infer completion merely from a healthy route using an injected fake store.

The store contract concerns the Sequelize connection/model, normal initialisation, normalised CRUD results, validation and resource closure. File-backed rows must survive an ordinary close and reopened connection; seeding must not duplicate existing records. An explicit reset has a different meaning from normal initialisation. The original server's default `notes.sqlite` path is historical source behaviour, not an instruction to overwrite or reset a personal database.

Use the prepared environment and root launchers from the **kit root**. They install nothing:

```powershell
.\CHECK_ENVIRONMENT.cmd p01
.\TEST.cmd p01 baseline
.\TEST.cmd p01 objective
.\TEST.cmd p01 complete
.\VERIFY_WORK_RESULT.cmd p01
```

```bash
bash CHECK_ENVIRONMENT.sh p01
bash TEST.sh p01 baseline
bash TEST.sh p01 objective
bash TEST.sh p01 complete
bash VERIFY_WORK_RESULT.sh p01
```

Retain real prerequisite blocks. Tests use their own isolated temporary or in-memory data; do not substitute a personal database path. The standard root START adapter serves P02. Optional live P01 serving needs its own documented prepared route; do not treat the historical source startup command as an automatically qualified delivery adapter.

If you choose this extension, record its separate source/test output and explain what it adds to P02's memory-query task. A same-process reopened connection is not a power-loss or crash-recovery demonstration. Optional work adds no hidden second assignment or required grade component.
