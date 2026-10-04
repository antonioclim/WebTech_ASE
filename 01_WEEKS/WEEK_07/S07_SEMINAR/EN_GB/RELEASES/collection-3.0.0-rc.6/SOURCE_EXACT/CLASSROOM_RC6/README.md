# S07: complete bounded classroom microprojects (RC6)

Each student completes all 3 projects individually in the classroom session. These are newly bounded projects, separate from the full historical application contracts. Setup is completed before the session; the allocation is a design estimate requiring a novice pilot, not measured completion evidence. Read the preserved original guide only for the separate advanced route.

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

Initial checks require the untouched targets and exact declared assertion-failure names. A process timeout, exception, damaged source boundary or missing native module is a genuine fault. Keep private JSON/PDF evidence outside CLASSROOM_RC6. Checkers create only owned ephemeral resources. Reference Node is v24.21.0; npm installs are unnecessary for this route. Built-in SQLite experiments emit a Node experimental-feature warning where applicable; that is neither a measurement result nor proof of another platform.

For genuine browser/HTTP work, run `node CLASSROOM_RC6/kit.mjs serve` in a separate terminal, use only its printed READY origin and keep it running. Stop it with Ctrl+C once in that terminal and read STOPPED_OWNED_LISTENER. A stale origin or unknown cleanup remains a blocker.

## 60-minute allocation

- 00–04: Record all project predictions and environment; original package and runtime prepared before class.
- 04–14: P01 complete bounded scope; save evidence immediately.
- 14–32: P02 complete bounded scope; save evidence immediately.
- 32–40: P03 complete bounded scope; save evidence immediately.
- 40–46: One genuine bounded Gemini/LLM claim and independent witness; unavailable interactions remain NOT_EXECUTED.
- 46–60: Complete one private current-form PDF, inspect every page, stop owned listener and submit one file to the separate assignment if available.

## One actual AI claim

S07 classroom claim audit. Review only one claim about the bounded project; do not provide a completed assessed implementation or modify tests.
My preserved prediction: [one specific claim]
Synthetic fixture and relevant contract: [small input plus rule]
My actual observation: [output/error or NOT EXECUTED]
State whether the claim is observed, inferred or unknown. Propose one minimum independent counterexample. Explain one limitation. I will run the witness myself and record ACCEPTED, REJECTED, PARTIALLY ACCEPTED or UNKNOWN. Model text is not test evidence. Do not invent execution.

Keep a compact experiment record for each project: prediction (before running), action/input/target, actual result with evidence excerpt, comparison/mechanism and limitation. Add one specific final reflection and one independently verified AI claim. No credentials, real personal data, private Moodle records or whole AI conversations. Use the CURRENT RC6 evidence form and save one `TW2026_S07_GROUP_Surname_Firstname.pdf`. Missing personal execution or AI access remains explicitly unresolved. The form checks completeness, not truth, grades or Moodle receipt.

## Scope limit

The supplied managed adapter owns real SQLite BEGIN/COMMIT/ROLLBACK; learners complete five operation calls. This is not the original Sequelize transaction exercise, production locking or an authentication implementation.
