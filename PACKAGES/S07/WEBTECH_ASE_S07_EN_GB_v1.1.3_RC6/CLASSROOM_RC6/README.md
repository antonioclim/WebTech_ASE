# S07: complete bounded classroom microprojects (RC6)

Each student completes all 3 projects individually in the classroom session. These are newly bounded projects, separate from the full historical application contracts. Setup is completed before the session; the allocation is a design estimate requiring a novice pilot, not measured completion evidence. Read the original guide only as historical context for its separate full-application contract.

## P01 — Junction relationship query

Complete scope: Write one eager SQL JOIN over supplied sessions/registrations/attendees, bind session ID and order attendees by ID; return detached mapped rows.

Edit only `CLASSROOM_RC6/targets/p01.mjs` from the package root. Commands:

```text
node CLASSROOM_RC6/kit.mjs check P01
node CLASSROOM_RC6/kit.mjs observe P01
```

Record: Actual joined rows Ada/Grace; Query and bound parameter; No extra per-attendee queries limitation. Record actual results, including failures or blockers; no result is prefilled.

## P02 — One owned atomic booking

Complete scope: Use supplied managed SQLite transaction adapter, five shared-transaction operations, awaited callback/audit and rollback on callback/audit failures.

Edit only `CLASSROOM_RC6/targets/p02.mjs` from the package root. Commands:

```text
node CLASSROOM_RC6/kit.mjs check P02
node CLASSROOM_RC6/kit.mjs observe P02
```

Record: Five operation IDs; Success seat/booking/audit state; Two injectedfailure before/after snapshots and recovery. Record actual results, including failures or blockers; no result is prefilled.

## P03 — Idempotent resource response

Complete scope: Map supplied PUTcreated/repeat to201+Location/200 and DELETEremoved/absent to204no body using path pair identity.

Edit only `CLASSROOM_RC6/targets/p03.mjs` from the package root. Commands:

```text
node CLASSROOM_RC6/kit.mjs check P03
node CLASSROOM_RC6/kit.mjs observe P03
```

Record: Real HTTP create/repeat/delete/delete trace; Resource identity comparison; What idempotency does not guarantee. Record actual results, including failures or blockers; no result is prefilled.

## Initial and complete checks

```text
node CLASSROOM_RC6/kit.mjs initial
node CLASSROOM_RC6/kit.mjs check all
```

Initial checks require the untouched targets and exact declared assertion-failure names. A process timeout, exception, damaged source boundary or missing native module is a genuine fault. Keep every private fixture, JSON draft, log and PDF outside the entire extracted collection. Use your home-folder `WebTech_Evidence/S07`: `%USERPROFILE%\WebTech_Evidence\S07` on Windows or `$HOME/WebTech_Evidence/S07` on macOS/Linux. Keep the extracted collection in a different folder. The [detailed tutorial](../../../../TUTORIALS/S07.html) provides the quoted absolute paths and operating-system commands. Checkers create only owned ephemeral resources. Reference Node is v24.21.0; npm installs are unnecessary for this route. Built-in SQLite experiments emit a Node experimental-feature warning where applicable; that is neither a measurement result nor proof of another platform.

For genuine browser/HTTP work, run `node CLASSROOM_RC6/kit.mjs serve` in a separate terminal, use only its printed READY origin and keep it running. Stop it with Ctrl+C once in that terminal and read STOPPED_OWNED_LISTENER. A stale origin or unknown cleanup remains a blocker.

## Current unpiloted plan: 120–165 minutes

Complete all 3 microprojects individually. Plan 30–45 minutes for each required project. Prepare the prescribed runtime and expressly required dependencies before class. The following durations are planning estimates, not measured completion times, empirical minimums or completion guarantees.

| Planned duration | Individual activity |
| --- | --- |
| 5 minutes | Prepared environment and privacy check |
| 30–45 minutes | P01 — required bounded project with progress and evidence checkpoints |
| 30–45 minutes | P02 — required bounded project with progress and evidence checkpoints |
| 30–45 minutes | P03 — required bounded project with progress and evidence checkpoints |
| 15 minutes | One shared genuine bounded AI critique and independent check |
| 5 minutes | Review the evidence and save one individual PDF |
| 5 minutes | Final recap: achievement, learning, reason and next transfer |

For each project, use about 5 planned minutes to read the contract and record a prediction, 20–30 to implement, run checks and investigate results, then 5–10 to review a counterexample and record evidence. These checkpoints total 30–45 planned minutes.

If the actual institutional slot is shorter, agree a taught continuation with the lecturer before the session. All projects remain required individual classroom work; keep unfinished work marked unfinished. The end of a meeting does not establish completion.

The current `GUIDE.html` and the separate top-level `project_schedule` in `CLASSROOM_SCOPE.json` govern these planned blocks. The `projects` array retains the unchanged assessment contract.

## One actual AI claim

S07 classroom claim audit. Review only one claim about the bounded project; do not provide a completed assessed implementation or modify tests.
My preserved prediction: [one specific claim]
Synthetic fixture and relevant contract: [small input plus rule]
My actual observation: [output/error or NOT EXECUTED]
State whether the claim is observed, inferred or unknown. Propose one minimum independent counterexample. Explain one limitation. I will run the witness myself and record ACCEPTED, REJECTED, PARTLY ACCEPTED or UNKNOWN. Model text is not test evidence. Do not invent execution.

Keep a compact experiment record for each project: prediction (before running), action/input/target, actual result with evidence excerpt, comparison/mechanism and limitation. Add one specific final reflection and one independently verified AI claim. No credentials, real personal data, private Moodle records or whole AI conversations. Use the current classroom evidence form and save one `TW2026_S07_GROUP_Surname_Firstname.pdf`. Missing personal execution or AI access remains explicitly unresolved. The form checks completeness, not truth, grades or Moodle receipt.

## Scope limit

The supplied managed adapter owns real SQLite BEGIN/COMMIT/ROLLBACK; learners complete five operation calls. This is not the original Sequelize transaction exercise, production locking or an authentication implementation.

## Final recap before submission

Explain how your joined rows, shared managed transaction and resource-response mapping support the observed result. State why an awaited failure witness matters, distinguish rollback evidence from concurrent safety and name the next relationship or transaction boundary to investigate.

Finish the recap before actual submission. If it changes your form record, update the form, renew the affected declarations and export and review the latest single PDF before uploading it. Use the agreed continuation if review remains unfinished; do not submit an earlier PDF as the updated record.

## Current carrier and historical references

The `CLASSROOM_RC6` folder, retained edition labels and v1 record values identify the existing teaching carrier and record contract. Use the current candidate unit identity shown by the collection entry for a new record. Linked original guides and forms are read-only historical references; their omitted full-application starters and tests are not the current assignment.
