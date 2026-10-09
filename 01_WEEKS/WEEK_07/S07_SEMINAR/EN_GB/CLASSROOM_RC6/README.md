# S07: current individual route

This teaching revision belongs to the v4.0.0 candidate. Published main remains v3.0.0 until the complete edition is released; CLASSROOM_RC6 labels retain source provenance.

Open S07 EN_GB in VS Code and run commands from that folder. [Tutorial](../../TUTORIAL.html) has all thirteen semantic stages, external private probes and novice recovery steps. All three targets remain required individually.

| Target | Current complete scope | Stages |
| --- | --- | --- |
| CLASSROOM_RC6/targets/p01.mjs | Use one parameterised eager JOIN over sessions/registrations/attendees, one all(sessionId), four declared aliases and attendee ID ascending order; project fresh ordinary rows detached from selected SQL rows. | 4 |
| CLASSROOM_RC6/targets/p02.mjs | Preserve positive-integer prevalidation and event/sold-out precedence; use one owned managed SQLite transaction for event, duplicate, seats, create and audit, await afterCreated and audit, preserve rejection and return detached booking/available through managed settlement. Inspect rollback at both sites and serial recovery. | 5 |
| CLASSROOM_RC6/targets/p03.mjs | Map PUT created/existing to 201 with pair-derived Location/200, DELETE removed/absent to 204 with null mapper body and unsupported method/outcome to 405. Preserve full headers/body dimensions; compare independent resource pairs and empty 204 bodies over actual HTTP. | 4 |

```text
node CLASSROOM_RC6/preflight.mjs
node CLASSROOM_RC6/verify.mjs initial
node CLASSROOM_RC6/kit.mjs initial
node CLASSROOM_RC6/kit.mjs check P01
node CLASSROOM_RC6/kit.mjs observe P01
node CLASSROOM_RC6/kit.mjs check P02
node CLASSROOM_RC6/kit.mjs observe P02
node CLASSROOM_RC6/kit.mjs check P03
node CLASSROOM_RC6/kit.mjs observe P03
node CLASSROOM_RC6/kit.mjs check all
node CLASSROOM_RC6/verify.mjs work
```

Run initial modes before edits, then project/work modes after edits. Six named unfinished assertions are expected initially, not process faults. Follow [ENV capability policy](../../../../../00_START_HERE/ENVIRONMENT.html): P01/P02 need built-in SQLite, P03 check/observe need owned loopback HTTP and timeout, P03-boundary needs only core. No npm/Sequelize installation is needed. ENV_WARN permits the checked activity; ENV_BLOCKED identifies its prerequisite.

Prepare extraction/editor/capabilities before class. Plan 30–45 minutes per project and 120–165 for the full route, including shared AI/check/PDF/recap. This is unpiloted, not a completion guarantee. Original 10/18/8 source budgets remain provenance. For 100 minutes propose 20–65 additional lecturer-led minutes; for 90 propose 30–75. Teach P01/P02 and begin P03, save exact stage/remaining assertions/private draft and resume with the lecturer’s scheduling decision. Keep all projects individual and required.

[Current formative assessment](../FORMATIVE_ASSESSMENT.html) records all 13 stage records, each project reflection, one genuine AI critique with independent check and one private reviewed PDF. Verify fields/controls load; native local-page delivery/printing remains unexecuted. If it fails keep private notes/BLOCKED. Store every draft/probe/log/PDF outside the entire extracted collection. A reviewed declaration remains HUMAN REVIEW PENDING, not checker PASS or institutional acceptance. Reopen every saved page before the lecturer’s actual Moodle submission route.

Real SQLite state, same-connection staged state, held dependency observations, mapper values and actual HTTP bytes have different scopes. Serial rollback/recovery does not qualify races, external-effect cancellation, persistent reopen or the historical Sequelize application. C07 adds no additional Assignment/ADR. Follow the guide/tutorial for the per-project recap and nominal C08/S08 transfer.
