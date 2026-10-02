# S06 — optional Persistence Bug Hunt

**Derived operational README, student edition v1.2.0.** The historical installation/start block is superseded for this layout. Original README bytes and original/derived hashes are retained privately. Original technical source, public page, tests, package and lockfile bytes remain protected.

The complete bug-hunt implementation is optional. It is not required for the maximum standard S06 mark, does not replace P02 and is distinct from the required short lifecycle observation. Finish the standard evidence route first.

Change only `02_PROJECTS/optional/p03/src/persistence-repair.js`. Read the supplied [target source](src/persistence-repair.js), [route boundary](src/app.js) and [objective tests](tests/objective.test.js) for this optional project. Use the [beginner guide](../../../00_START_HERE/S06_INTERACTIVE_ULTRA_BEGINNER_GUIDE_EN_GB_v1.2.0.html) for the standard P02 route. The preserved `src/unsafe-generated-persistence.js` is deliberately unsafe teaching evidence; leave it unchanged so the comparison remains meaningful. Do not promote the unsafe module to the intended repaired path.

Inspect model constraints, normalisation, awaited persistence, detached success data, public validation/conflict errors and preservation of unexpected-failure identity. The repaired boundary must wait for database creation and map only the contract's specified validation/unique failures. Do not silence unexpected errors, weaken tests or change the Reservation fixture to force success.

From the **kit root**, use prepared dependencies and the root launchers:

```powershell
.\CHECK_ENVIRONMENT.cmd p03
.\TEST.cmd p03 baseline
.\TEST.cmd p03 objective
.\TEST.cmd p03 complete
.\VERIFY_WORK_RESULT.cmd p03
```

```bash
bash CHECK_ENVIRONMENT.sh p03
bash TEST.sh p03 baseline
bash TEST.sh p03 objective
bash TEST.sh p03 complete
bash VERIFY_WORK_RESULT.sh p03
```

These commands install nothing. A missing native driver, runtime mismatch or crash is a real block, not an expected objective assertion. Preserve actual outputs and the optional one-file boundary. The root START adapter is for P02; optional live P03 serving requires its own documented prepared route.

Describe the defect, the contract-level repair, the distinguishing test and the remaining limitation. Keep synthetic reasoning separate from genuine supplied-stack observations. Optional work creates no second Moodle Assignment, mandatory extra ZIP or hidden grade penalty.
