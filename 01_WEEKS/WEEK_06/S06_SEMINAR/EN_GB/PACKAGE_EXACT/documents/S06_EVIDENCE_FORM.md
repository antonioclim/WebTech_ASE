# S06 — Individual evidence form


## Identity and measured environment

Record the environment you actually used. A missing native package is a prerequisite block, not a failed student objective.


### Surname [surname]

Your surname as used in the private assessment submission; do not put this completed form in a public repository.

[Enter your response or evidence reference.]


### Given name [given]

Your given name. Keep the resulting filename readable and check it before saving.

[Enter your response or evidence reference.]


### Group [group]

Your seminar group. No invented demonstration identifier belongs in a real submission.

[Enter your response or evidence reference.]


### Actual C06/S06 version or package identity [kits]

Record C06 and S06 v1.1.0 or their package identifiers from PACKAGE_ID.txt.

[Enter your response or evidence reference.]


### Operating system [os]

Record the operating system and relevant version actually used.

[Enter your response or evidence reference.]


### Terminal and client used [terminal]

Record the terminal and HTTP client; CLI observations are sufficient for the client evidence.

[Enter your response or evidence reference.]


### Observed Node version [node]

Record the value actually observed or UNKNOWN with reason. Never prefill the project reference as a measurement.

[Enter your response or evidence reference.]


### Observed npm version [npm]

Record the value actually observed or UNKNOWN with reason. Never prefill the project reference as a measurement.

[Enter your response or evidence reference.]


### Observed Sequelize, sqlite3 and Express resolution/load status [dependencies]

Give resolution/native-load state or a short block message. Link longer preflight output in traceability. A version lookup is not a native-driver test.

[Enter your response or evidence reference.]


## Prediction and central P02 result

Preserve the prediction before execution. P02 is the only required complete implementation.


### Exact method, path and query [query_input]

Copy the exact GET /api/notes query, including repeated keys, encoding and selected fields. Keep the URL before execution.

[Enter your response or evidence reference.]


### Original predicted IDs, order and fields [prediction]

Before running, predict the IDs, ordering and field set from the four supplied rows. Do not replace a wrong prediction retrospectively.

[Enter your response or evidence reference.]


### Seed and database instance used [fixture]

Identify projects/p02/src/database.js, the fresh in-memory instance and any deliberately different fixture. Do not claim that :memory: is a disk file.

[Enter your response or evidence reference.]


### Allowed edit path [allowed_edit]

Only projects/p02/src/note-query.js is required. State that path; measured differences belong in the diff field.

[Enter your response or evidence reference.]


### Actual command or check identifier [command]

Copy the actual command/check identifier and label its original output. A command written but not run is PENDING.

[Enter your response or evidence reference.]


## Prediction and central P02 result — continued

Preserve the prediction before execution. P02 is the only required complete implementation.


### Observed output or explicit prerequisite block [observed]

Paste a bounded actual status/header/body excerpt, result IDs and evidence reference, or BLOCKED with the real reason.

[Enter your response or evidence reference.]


### Prediction versus observation [comparison]

Explain agreement or discrepancy with the original prediction and the next discriminating change.

[Enter your response or evidence reference.]


### Class of the central evidence [evidence_class]

For the standard final route link ACTUAL_ORM_SQLITE: evidence-id and LOCAL_HTTP: evidence-id from the real supplied application. Source/model evidence remains labelled separately.

[Enter your response or evidence reference.]


### Current implementation state [implementation]

State untouched, partial or completed implementation and what the last actual check establishes. Do not equate a complete form with a correct translator.

[Enter your response or evidence reference.]


## Filtering, ordering and rejection evidence

Identify each witness and its limit. A single response or a plausible options object is not a universal database guarantee.


### Combined owner and archived comparison [combined]

Record a query combining trimmed owner and the exact archived token, its predicted set, actual rows and a limitation.

[Enter your response or evidence reference.]


### Literal-percent and ASCII-case witness [search_literal]

Record search=%25 and an ASCII-case query. Preserve literal-percent results; do not infer general Unicode folding.

[Enter your response or evidence reference.]


### Evidence for all three sort modes [sorts]

Give evidence for updated_desc, updated_asc and title_asc on the identified seed. Include exact query and ordered IDs.

[Enter your response or evidence reference.]


### Equal-key case and ID tie-breaker [tie]

Use the two equal updatedAt values. Record ascending ID and the specified order; removing a tie-breaker need not visibly shuffle one small run.

[Enter your response or evidence reference.]


### Bounded selected fields including ID [projection]

Record fields=title,owner and the actual returned keys including id. Distinguish requested order from JSON object key-order guarantees.

[Enter your response or evidence reference.]


## Filtering, ordering and rejection evidence — continued

Identify each witness and its limit. A single response or a plausible options object is not a universal database guarantee.


### Invalid token and public error evidence [invalid]

Record one invalid token, its 400 invalid_query envelope and the input. A missing dependency is not a student assertion failure.

[Enter your response or evidence reference.]


### Repeated or unknown parameter witness [repeated]

Record a repeated key and an unknown key separately, with actual public responses and evidence IDs.

[Enter your response or evidence reference.]


### Evidence about rejection before findAll [no_query]

Use the supplied objective spy or query observer: count findAll calls for a specific rejected query. State whether this was source/model, real route or actual ORM evidence; 400 alone proves no call count.

[Enter your response or evidence reference.]


### Valid query after rejection [recovery]

Record a valid query immediately after rejection against the same server/fixture. Give status and actual row evidence.

[Enter your response or evidence reference.]


## Separate course lifecycle observation

This small course observation uses a temporary file separately from P02. Full Persistent Notes API implementation is not required.


### Predict the minimal file-example outcome [lifecycle_prediction]

Before the C06 Example 02 observation, predict the row marker after ordinary reopen and after explicit reset.

[Enter your response or evidence reference.]


### Memory or exact owned temporary file; no personal path dump [storage]

Record the owned temporary file path from the observation, not a personal database path. Distinguish this file from P02 :memory:.

[Enter your response or evidence reference.]


### Example or observation helper actually used [lifecycle_command]

Copy the course lifecycle command and raw output reference, or PENDING. This reuses the minimal C06 helper, not a complete P01 implementation.

[Enter your response or evidence reference.]


### Row before close and after reopening [close_reopen]

Record the marker and rows before and after the connection closes and reopens the same file. Never copy a supplied transcript as your own execution.

[Enter your response or evidence reference.]


### Same process or genuinely separate processes [process_boundary]

Start with SAME_PROCESS_CONNECTION_REOPEN: evidence-id or SEPARATE_PROCESS_RESTART: evidence-id, whichever actually occurred. The supplied helper uses one process.

[Enter your response or evidence reference.]


### Normal initialisation versus explicit reset [reset]

Record the explicit reset flag, observed removal of the marker and temporary-directory cleanup state. Do not reset a personal database.

[Enter your response or evidence reference.]


### Persistence claim and remaining limitation [lifecycle_limit]

State what the observation does not prove, such as crash recovery or power-loss durability.

[Enter your response or evidence reference.]


## Bounded Gemini review

Verify one bounded claim independently. A synthetic practice claim is not an actual Gemini interaction.


### Actual interaction, pending or separate approved alternative [gemini_state]

Choose ACTUAL_INTERACTION only after performing it. SYNTHETIC_PRACTICE and PENDING do not satisfy the standard final requirement.

Choice: PENDING / SYNTHETIC_PRACTICE / ACTUAL_INTERACTION / TEACHER_APPROVED_ALTERNATIVE


### Sanitised relevant prompt [gemini_prompt]

Paste only the relevant sanitised prompt. No full conversation, credentials or private records.

[Enter your response or evidence reference.]


### One selected claim [gemini_claim]

Quote or faithfully paraphrase the single claim selected for review. Do not attribute the supplied synthetic text to an actual session.

[Enter your response or evidence reference.]


### Independent verification [gemini_check]

Record the independent input, command, output and evidence class. A second AI opinion is not the independent check.

[Enter your response or evidence reference.]


### ACCEPTED / REJECTED / PARTIALLY ACCEPTED / UNKNOWN [gemini_verdict]

Choose the conclusion justified by evidence. REJECTED or UNKNOWN is allowed; agreement earns no special credit.

Choice: ACCEPTED / REJECTED / PARTIALLY ACCEPTED / UNKNOWN


### Correction or justified NONE [gemini_correction]

Give the smallest correction or NONE with a reason. Do not add an untested feature.

[Enter your response or evidence reference.]


### What the check cannot establish [gemini_limit]

State the bounded scope and remaining uncertainty of the independent check.

[Enter your response or evidence reference.]


## Checks, edit boundary and traceability

Preserve named checks, exact edit boundaries and evidence links. Labels do not authenticate observations.


### Actual baseline status and excerpt [baseline]

Preserve raw baseline status and evidence identifier. BLOCKED is an environment state, not an expected assertion.

[Enter your response or evidence reference.]


### Actual objective status and excerpt [objective]

Preserve the actual named objective tests and counts. Initial expected failures require the exact untouched target; complete work requires real passing checks.

[Enter your response or evidence reference.]


### Actual regression status and excerpt [regression]

Record the real regression outcome and recovery evidence without duplicating it as independent coverage.

[Enter your response or evidence reference.]


### One-file diff summary and protected-file status [diff]

Copy the protected-boundary result and summarise the one allowed change; tests, seed, models and lockfiles must remain unchanged.

[Enter your response or evidence reference.]


### Evidence identifiers and reproducible sequence [traceability]

Map E1-E6 to filenames or evidence excerpts and commands. Include the fresh-options/input-preservation witness here (E4). Keep local JSON drafts out of the final Moodle upload.

[Enter your response or evidence reference.]


### Next minimum unresolved check or justified NONE [next_check]

State the smallest remaining discriminating check or NONE with a reason.

[Enter your response or evidence reference.]


## Final status and declaration

Save an honest draft at minute 60. Standard final submission includes remaining P02 work and the separate lifecycle observation.


### Standard completed evidence or separately authorised alternative [final_mode]

STANDARD requires actual application and lifecycle evidence. An alternative must already have been granted separately, with reference and scope recorded below.

Choice: STANDARD / TEACHER_APPROVED_ALTERNATIVE


### Separate teacher decision reference, when applicable [alternative_ref]

For STANDARD write NONE. Otherwise start AUTHORISATION: and record teacher, date, decision reference, affected requirements and replacement evidence. The form cannot authenticate this.

[Enter your response or evidence reference.]


### Mechanism-based reflection [reflection]

Explain one mechanism you now understand and which observation changed or confirmed your initial view.

[Enter your response or evidence reference.]


### Specific remaining uncertainty [uncertainty]

State a specific untested case or limitation. Do not claim universal correctness from the supplied tests.

[Enter your response or evidence reference.]


### Truthful individual-work and evidence declaration [declaration]

I performed or accurately identified the work, preserved original predictions and distinguished measured, imported and synthetic evidence. No secrets or private third-party data are included.

Declaration: YES / NO (choose after reviewing the final evidence)
