# S06 Query API individual evidence

Form schema v1.2.0. Phase 3 locally audited teaching edition. This blank editable form records private individual evidence. P02 is the only mandatory full implementation; the separate short file observation is required. Full P01/P03 are optional and are not needed for the maximum mark.

The form has 63 identifiers across seven sections: the historical 52 fields (18 core and 34 final) plus eight core and three final additions. Completeness is not correctness, authenticated evidence, teacher approval or a Moodle receipt.

At minute 60 export an honest draft. Actual measurements are never prefilled. Preserve original predictions and identify imports, source-derived expectations and synthetic practice. Complete remaining requirements before a separately announced deadline.

Suggested final filename: TW2026_S06_GROUP_Surname_Firstname.pdf. The historical GivenName token maps to Firstname through field ID given; old evidence remains labelled with its original version. One S06 Assignment, one PDF and no duplicate C06 upload.

For any transferred v1.1.0 draft retain its 52 values verbatim, label the original version, leave the eleven new fields blank until honestly completed and reset the declaration. An imported prediction cannot become proof that it preceded execution.

For the first PDF, export a draft, inspect all pages and enter the inspection record. Complete the final fields, renew the declaration, export again and inspect that saved final PDF. Text excerpts are supported; screenshots are not mandatory. Do not include secrets or private third-party records.

## Identity and measured environment

Record the environment you actually used. A missing native package is a prerequisite block, not a failed student objective.

### Surname [surname]

Core draft field.
Your surname as used in the private assessment submission; do not put this completed form in a public repository.

Response: ____________________________________________________________

### First name (historical field ID: given) [given]

Core draft field.
Your first name. The v1.1.0 GivenName filename token maps to Firstname in v1.2.0; old records remain labelled with their original version.

Response: ____________________________________________________________

### Group [group]

Core draft field.
Your seminar group. No invented demonstration identifier belongs in a real submission.

Response: ____________________________________________________________

### Historical combined C06/S06 identity or NONE [kits]

Core draft field.
Preserved legacy field: retain an imported v1.1.0 identity verbatim. For a new draft write NONE unless a separate historical package is relevant. Current seminar, kit version and PACKAGE_ID are separate fields below.

Response: ____________________________________________________________

### Operating system [os]

Core draft field.
Record the operating system and relevant version actually used.

Response: ____________________________________________________________

### Terminal and client used [terminal]

Core draft field.
Record the terminal and HTTP client; CLI observations are sufficient for the client evidence.

Response: ____________________________________________________________

### Observed Node version [node]

Core draft field.
Record the value actually observed or UNKNOWN with reason. Never prefill the project reference as a measurement.

Response: ____________________________________________________________

### Observed npm version [npm]

Core draft field.
Record the value actually observed or UNKNOWN with reason. Never prefill the project reference as a measurement.

Response: ____________________________________________________________

### Observed Sequelize, sqlite3 and Express resolution/load status [dependencies]

Core draft field.
Give resolution/native-load state or a short block message. Link longer preflight output in traceability. A version lookup is not a native-driver test.

Response: ____________________________________________________________

### Date of this evidence record (YYYY-MM-DD) [evidence_date]

Core draft field.
Enter the actual local date of your record. This is separate from the seminar ID, kit version and package identity.

Response: ____________________________________________________________

### Seminar ID [seminar_id]

Core draft field.
Enter S06 after checking the package label. This is not the course C06 identifier.

Response: ____________________________________________________________

### Observed S06 kit version [kit_version]

Core draft field.
Read the actual VERSION.txt or start-page label. Never copy a required version as a measurement.

Response: ____________________________________________________________

### Observed S06 PACKAGE_ID [package_id]

Core draft field.
Copy the 64 hexadecimal characters from this extracted student package PACKAGE_ID.txt. This identifies content, not the running Node process PID.

Response: ____________________________________________________________

### Observed HTTP client/browser version or UNKNOWN with reason [client_version]

Core draft field.
Record the actual client and version. CLI HTTP evidence is sufficient; a browser screenshot is not required. UNKNOWN with a reason is allowed in a core draft.

Response: ____________________________________________________________

## Prediction and central P02 result

Preserve the prediction before execution. P02 is the only required complete implementation.

### Exact method, path and query [query_input]

Core draft field.
Copy the exact GET /api/notes query, including repeated keys, encoding and selected fields. Keep the URL before execution.

Response: ____________________________________________________________

### Prediction A: original combined-query IDs, order and fields [prediction]

Core draft field.
Before running, predict the IDs, ordering and field set from the four supplied rows. Do not replace a wrong prediction retrospectively.

Response: ____________________________________________________________

### Prediction B: original literal-percent result [prediction_b]

Core draft field.
Before running search=%25, record predicted IDs and why percent should be literal. Preserve a wrong prediction instead of replacing it with the observed result.

Response: ____________________________________________________________

### Original prediction time and reference [prediction_recorded_at]

Core draft field.
Record when and where Predictions A, B and the lifecycle prediction were recorded before execution. If imported or written after execution, say so explicitly; this field cannot authenticate timing.

Response: ____________________________________________________________

### Seed and database instance used [fixture]

Core draft field.
Identify 02_PROJECTS/p02/src/database.js, the fresh in-memory instance and any deliberately different fixture. P02 :memory: is not a disk file.

Response: ____________________________________________________________

### Allowed edit path [allowed_edit]

Core draft field.
Only 02_PROJECTS/p02/src/note-query.js is required. State that path; measured differences belong in the diff field.

Response: ____________________________________________________________

### Actual command or check identifier [command]

Core draft field.
Copy the actual command/check identifier and label its original output. A command written but not run is PENDING.

Response: ____________________________________________________________

### Observed output or explicit prerequisite block [observed]

Core draft field.
Paste a bounded actual status/header/body excerpt, result IDs and evidence reference, or BLOCKED with the real reason.

Response: ____________________________________________________________

### Prediction versus observation [comparison]

Core draft field.
Explain agreement or discrepancy with the original prediction and the next discriminating change.

Response: ____________________________________________________________

### Class of the central evidence [evidence_class]

Core draft field.
For the standard final route link ACTUAL_ORM_SQLITE: evidence-id and LOCAL_HTTP: evidence-id from the real supplied application. Source/model evidence remains labelled separately.

Response: ____________________________________________________________

### Current implementation state [implementation]

Core draft field.
State untouched, partial or completed implementation and what the last actual check establishes. Do not equate a complete form with a correct translator.

Response: ____________________________________________________________

## Filtering, ordering and rejection evidence

Identify each witness and its limit. A single response or a plausible options object is not a universal database guarantee.

### Combined owner and archived comparison [combined]

Final field.
Record a query combining trimmed owner and the exact archived token, its predicted set, actual rows and a limitation.

Response: ____________________________________________________________

### Literal-percent and ASCII-case witness [search_literal]

Final field.
Record search=%25 and an ASCII-case query. Preserve literal-percent results; do not infer general Unicode folding.

Response: ____________________________________________________________

### Evidence for all three sort modes [sorts]

Final field.
Give evidence for updated_desc, updated_asc and title_asc on the identified seed. Include exact query and ordered IDs.

Response: ____________________________________________________________

### Equal-key case and ID tie-breaker [tie]

Final field.
Use the two equal updatedAt values. Record ascending ID and the specified order; removing a tie-breaker need not visibly shuffle one small run.

Response: ____________________________________________________________

### Bounded selected fields including ID [projection]

Final field.
Record fields=title,owner and the actual returned keys including id. Distinguish requested order from JSON object key-order guarantees.

Response: ____________________________________________________________

### Invalid token and public error evidence [invalid]

Final field.
Record one invalid token, its 400 invalid_query envelope and the input. A missing dependency is not a student assertion failure.

Response: ____________________________________________________________

### Repeated or unknown parameter witness [repeated]

Final field.
Record a repeated key and an unknown key separately, with actual public responses and evidence IDs.

Response: ____________________________________________________________

### Evidence about rejection before findAll [no_query]

Final field.
Use the supplied objective spy or query observer: count findAll calls for a specific rejected query. State whether this was source/model, real route or actual ORM evidence; 400 alone proves no call count.

Response: ____________________________________________________________

### Valid query after rejection [recovery]

Final field.
Record a valid query immediately after rejection against the same server/fixture. Give status and actual row evidence.

Response: ____________________________________________________________

## Separate course lifecycle observation

This small course observation uses a temporary file separately from P02. Full Persistent Notes API implementation is not required.

### Predict the minimal file-example outcome [lifecycle_prediction]

Final field.
Before the separate temporary-file observation, predict the row marker after ordinary close/reopen and after explicit reset. Preserve the original prediction; this is not a full P01 implementation.

Response: ____________________________________________________________

### Memory or exact owned temporary file; no personal path dump [storage]

Final field.
Record the owned temporary file path from the observation, not a personal database path. Distinguish this file from P02 :memory:.

Response: ____________________________________________________________

### Example or observation helper actually used [lifecycle_command]

Final field.
Copy the supplied separate lifecycle helper command and raw output reference, or PENDING. This is the minimal course observation, not full P01.

Response: ____________________________________________________________

### Row before close and after reopening [close_reopen]

Final field.
Record the marker and rows before and after the connection closes and reopens the same file. Never copy a supplied transcript as your own execution.

Response: ____________________________________________________________

### Same process or genuinely separate processes [process_boundary]

Final field.
Start with SAME_PROCESS_CONNECTION_REOPEN: evidence-id or SEPARATE_PROCESS_RESTART: evidence-id only if genuinely observed. Record the actual process PID separately in the excerpt; it is not PACKAGE_ID. The supplied observation reopens connections in one child process.

Response: ____________________________________________________________

### Normal initialisation versus explicit reset [reset]

Final field.
Record the explicit reset flag, observed removal of the marker and temporary-directory cleanup state. Do not reset a personal database.

Response: ____________________________________________________________

### Persistence claim and remaining limitation [lifecycle_limit]

Final field.
State what the observation does not prove, such as crash recovery or power-loss durability.

Response: ____________________________________________________________

## Bounded Gemini review

Verify one bounded claim independently. A synthetic practice claim is not an actual Gemini interaction.

### Actual interaction, pending or separate approved alternative [gemini_state]

Final field.
Choose ACTUAL_INTERACTION only after performing it. SYNTHETIC_PRACTICE and PENDING do not satisfy the standard final requirement.

Allowed values: PENDING, SYNTHETIC_PRACTICE, ACTUAL_INTERACTION, TEACHER_APPROVED_ALTERNATIVE.

Response: ____________________________________________________________

### Sanitised relevant prompt [gemini_prompt]

Final field.
Paste only the relevant sanitised prompt. No full conversation, credentials or private records.

Response: ____________________________________________________________

### One selected claim [gemini_claim]

Final field.
Quote or faithfully paraphrase the single claim selected for review. Do not attribute the supplied synthetic text to an actual session.

Response: ____________________________________________________________

### Selected claim: Observed / Inferred / Unknown [gemini_classification]

Final field.
Classify what supports the selected claim at the time you inspect it. This is separate from your final ACCEPTED/REJECTED/PARTIALLY ACCEPTED/UNKNOWN verdict. An AI assertion is not automatically observed evidence.

Allowed values: OBSERVED, INFERRED, UNKNOWN.

Response: ____________________________________________________________

### Independent verification [gemini_check]

Final field.
Record the independent input, command, output and evidence class. A second AI opinion is not the independent check.

Response: ____________________________________________________________

### ACCEPTED / REJECTED / PARTIALLY ACCEPTED / UNKNOWN [gemini_verdict]

Final field.
Choose the conclusion justified by evidence. REJECTED or UNKNOWN is allowed; agreement earns no special credit.

Allowed values: ACCEPTED, REJECTED, PARTIALLY ACCEPTED, UNKNOWN.

Response: ____________________________________________________________

### Correction or justified NONE [gemini_correction]

Final field.
Give the smallest correction or NONE with a reason. Do not add an untested feature.

Response: ____________________________________________________________

### What the check cannot establish [gemini_limit]

Final field.
State the bounded scope and remaining uncertainty of the independent check.

Response: ____________________________________________________________

## Checks, edit boundary and traceability

Preserve named checks, exact edit boundaries and evidence links. Labels do not authenticate observations.

### Actual baseline status and excerpt [baseline]

Final field.
Preserve raw baseline status and evidence identifier. BLOCKED is an environment state, not an expected assertion.

Response: ____________________________________________________________

### Actual objective status and excerpt [objective]

Final field.
Preserve the actual named objective tests and counts. Initial expected failures require the exact untouched target; complete work requires real passing checks.

Response: ____________________________________________________________

### Actual regression status and excerpt [regression]

Final field.
Record the real regression outcome and recovery evidence without duplicating it as independent coverage.

Response: ____________________________________________________________

### One-file diff summary and protected-file status [diff]

Final field.
Copy the protected-boundary result and summarise the one allowed change; tests, seed, models and lockfiles must remain unchanged.

Response: ____________________________________________________________

### Evidence identifiers and reproducible sequence [traceability]

Final field.
Map E1-E6 to filenames or evidence excerpts and commands. Include the fresh-options/input-preservation witness here (E4). Keep local JSON drafts out of the final Moodle upload.

Response: ____________________________________________________________

### Next minimum unresolved check or justified NONE [next_check]

Final field.
State the smallest remaining discriminating check or NONE with a reason.

Response: ____________________________________________________________

## Final status and declaration

Save an honest draft at minute 60. Standard final submission includes remaining P02 work and the separate lifecycle observation.

### Standard completed evidence or separately authorised alternative [final_mode]

Final field.
STANDARD requires actual application and lifecycle evidence. An alternative must already have been granted separately, with reference and scope recorded below.

Allowed values: STANDARD, TEACHER_APPROVED_ALTERNATIVE.

Response: ____________________________________________________________

### Separate teacher decision reference, when applicable [alternative_ref]

Final field.
For STANDARD write NONE. Otherwise start AUTHORISATION: and record teacher, date, decision reference, affected requirements and replacement evidence. The form cannot authenticate this.

Response: ____________________________________________________________

### One counterexample and its measured or proposed limit [counterexample]

Final field.
State one input that exposes an over-broad claim, the expected mechanism, what you actually checked and what remains unmeasured. For example distinguish the string false from Boolean false; do not copy a teacher solution.

Response: ____________________________________________________________

### Minute-60 exit ticket [exit_ticket]

Core draft field.
Explain why an ordered HTTP response alone cannot establish translator options, zero database calls on rejection or durability across power loss. Add the smallest next check. Preserve your own explanation.

Response: ____________________________________________________________

### Mechanism-based reflection [reflection]

Final field.
Explain one mechanism you now understand and which observation changed or confirmed your initial view.

Response: ____________________________________________________________

### Specific remaining uncertainty [uncertainty]

Final field.
State a specific untested case or limitation. Do not claim universal correctness from the supplied tests.

Response: ____________________________________________________________

### PDF/export inspection record or PENDING before saving [export_inspection]

Final field.
After a first PDF export, open it and inspect every page, long values, code, names and declaration. Record the filename, inspection result and any repaired clipping. Re-export after repairs. This field records a student check, not a Moodle receipt.

Response: ____________________________________________________________

### Truthful individual-work and evidence declaration [declaration]

Final field.
I performed or accurately identified the work, preserved original predictions and distinguished measured, imported and synthetic evidence. No secrets or private third-party data are included.

Response: [ ] I renew the declaration for this record.

## Final structural check

STANDARD requires complete P02, actual ORM/SQLite and local HTTP evidence identifiers, the short file observation and one actual independently checked Gemini claim. Use separate lines ACTUAL_ORM_SQLITE: evidence-id and LOCAL_HTTP: evidence-id. Record the real boundary as SAME_PROCESS_CONNECTION_REOPEN: evidence-id or SEPARATE_PROCESS_RESTART: evidence-id only when observed. 400 alone is not a database-call counter.

For STANDARD write NONE in alternative_ref. A teacher-approved alternative requires a separately obtained AUTHORISATION: record naming teacher, date, decision reference, affected requirements and replacement evidence. Selecting an alternative does not grant or authenticate one. Pending, blocked, source-derived or synthetic evidence cannot silently satisfy the standard final route.
