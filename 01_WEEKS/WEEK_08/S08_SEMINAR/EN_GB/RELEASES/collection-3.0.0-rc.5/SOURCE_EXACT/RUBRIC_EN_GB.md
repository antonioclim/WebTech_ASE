# S08 evidence rubric — v1.2.0

Maximum: **10 points** across six groups and 15 unique atoms. This local teaching rubric is not an institutionally approved marking decision. Award each atom once. The same witness can support different claims when the claims are distinct.

Full P01, the required eight-part P03 portfolio and one actual bounded sanitised Gemini claim with an independent check are required. **P02 is optional. Its absence imposes no mark cap and is not a condition for 10/10.**

The v1.1.0 seven-criterion source rubric also summed to 10; this version migrates to the six groups required by the master contract. It does not silently alter the archived source.

| Group | Maximum |
| --- | ---: |
| G1 — Experiment and technical result | 3.0 |
| G2 — Reproducible evidence | 2.0 |
| G3 — Explanation of mechanism | 2.0 |
| G4 — Critical Gemini audit | 1.5 |
| G5 — Limitations and reflection | 1.0 |
| G6 — Completeness and format | 0.5 |
| Total | 10.0 |

## Atom evidence matrix

| Atom | Points | Observable evidence and descriptor | Aligned field IDs |
| --- | ---: | --- | --- |
| A01 — P01 bounded implementation and observed transitions | 1.5 | Trim/blank, add/toggle/remove/filter, counts/empty states, immutable state and semantic controls with actual outputs. | `p01_diff`, `edit_boundary`, `transition_trace`, `p01_completion`, `p01_action`, `p01_expected`, `p01_observed`, `p01_difference` |
| A02 — P03 source-linked diagnosis and bounded lifecycle patch | 1.5 | SearchPanel.jsx-only implementation addresses debounce, stable ownership, cleanup, short query, stale publication and sanitised errors. | `p03_diagnostic`, `p03_patch`, `p03_checks`, `p03_action`, `p03_expected`, `p03_observed`, `p03_difference` |
| A03 — P01 exact fixture and actual named check results | 0.75 | Source/environment, exact data, command/action, named output and embedded evidence locator. | `fixture`, `package_identity`, `actual_runtime`, `execution_class`, `baseline_result`, `objective_result`, `regression_result`, `build_result`, `browser_result`, `evidence_index`, `operating_system`, `browser_tool_versions` |
| A04 — P01 persistence and identity witness | 0.5 | Mount versus filter-only write observation; full stored array; actual add/persist/reload/add IDs. Record a missing witness as a precise qualified gap; the gap does not earn the absent actual-witness points. | `persistence_trace`, `identity_trace` |
| A05 — P03 scheduling and error witnesses | 0.75 | Named fake, timer/call/abort/settlement order; B then A; short-query/unmount; unexpected object identity and sanitised visible output. | `p03_prediction`, `p03_timeline`, `p03_guards`, `p03_errors`, `p03_checks`, `evidence_index` |
| A06 — P01 ownership and rendering/persistence mechanism | 1.0 | Map vanilla responsibilities to React owner, props and callbacks; derive counts/filter view; explain why filter-only action must not persist. | `ownership_map`, `p01_prediction`, `persistence_trace`, `learning_transfer`, `p01_mechanism` |
| A07 — P03 lifecycle permission to publish | 1.0 | Separate timer cancellation, signal abortion and publication guard; explain why removal of numeric guard alone need not race if active guard remains. | `p03_diagnostic`, `p03_patch`, `p03_guards`, `p03_timeline`, `p03_mechanism` |
| A08 — Actual bounded sanitised exchange | 0.5 | Relevant actual prompt, returned claim and tool/date record; never entire implementation/chat or seeded/synthetic exchange. | `gemini_mode`, `gemini_prompt`, `gemini_claim` |
| A09 — Independent verification | 0.75 | Independent source/contract/witness method, actual finding and locator; agreement of two AI answers does not qualify. | `independent_check`, `evidence_index` |
| A10 — Evidence-based verdict and correction | 0.25 | Accepted/rejected/partly accepted/unknown justified by the check; correction and scoped uncertainty. | `verdict`, `correction`, `claim_limit` |
| A11 — Explicit limits of P01/P03 and Gemini claim | 0.5 | Name unchecked reload/accessibility/callback/concurrency/runtime and distinguish source/model from actual. | `environment_limit`, `identity_trace`, `p03_limits`, `claim_limit` |
| A12 — Learning transfer and smallest next check | 0.5 | Specific business-informatics ownership/identity/lifecycle connection and realistic next check; honest uncertainty is not misconduct. | `learning_transfer`, `pending_work` |
| A13 — Identity and privacy completeness | 0.2 | Name/group/date/package and no secrets, account captures, institutional data or private reference solution. | `student_identity`, `package_identity`, `actual_runtime`, `seminar_date`, `privacy_check` |
| A14 — Readable single PDF with embedded locators | 0.2 | One TW2026_S08_GROUP_Surname_Firstname.pdf, all sections, actual images embedded via DOCX where used and local review distinguished from Moodle receipt. Preflight checklist precedes PDF upload; real submitted state, filename and timestamp are checked afterwards in the separate Moodle guide, never a circular PDF-completion gate. | `evidence_index`, `pdf_status`, `upload_checklist` |
| A15 — Current truthful individual declaration | 0.1 | Actual versus inferred/model/synthetic/genuine distinguished; renewed declaration and documented prior authorisation if applicable. | `declaration`, `teacher_exception` |

## Full, partial and missing evidence

Full credit for an atom requires all its named observable evidence, bounded source/fixture identities and a conclusion supported by that evidence. A correct-looking page alone cannot receive mechanism points.

Partial credit is the supported fraction of that atom, recorded by the teacher with the present and absent witnesses. Do not convert an absent execution into an observation. Zero for an atom means its named requirement is absent or cannot support the conclusion; name the precise gap.

A build, hash, model result or test title does not substitute for actual React behaviour. Source reasoning, expected output, synthetic practice, controlled model traces, React tests, browser observations, a genuine Gemini exchange and institutional submission are separate evidence classes.

An honest UNKNOWN Gemini verdict can receive relevant evidence points when an independent check and scoped limitation support it. A missing actual exchange is not automatically replaced by a synthetic illustration. Any separately authorised alternative needs prior explicit teacher reference and replacement evidence; a form selector cannot grant or authenticate permission.

## Feedback on required gaps

Use: “Atom [ID]: [valid bounded evidence]. Still missing: [specific witness]. Smallest next check: [action]. Evidence class: [actual/source/model/not executed].” Keep required P01/P03/Gemini gaps named and preserve honest pending labels. No automatic misconduct finding or universal optional-P02 cap is imposed.

One individual S08 Assignment receives one readable PDF named `TW2026_S08_GROUP_Surname_Firstname.pdf`. Embed every cited log/snippet/image in the PDF and index its page/section/label. The upload checklist precedes upload; actual submitted state, filename and timestamp are checked afterwards in the separate Moodle guide. A saved PDF is not a Moodle receipt. Deadline: teacher configures later.
