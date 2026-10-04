# S07 evidence form

## Identity and observed environment

### Surname [surname]
Your surname for the private assessment submission. Do not publish this completed form.
Response: 

### Given name [given]
Your given name. Check the generated filename before saving.
Response: 

### Group [group]
Your actual seminar group.
Response: 

### Kit version or package ID [kits]
Record C07 and S07 v1.1.0 or their PACKAGE_ID.txt values.
Response: 

### Operating system [os]
Name the operating system and version actually used.
Response: 

### Terminal and client used [terminal]
Name the terminal and HTTP client. Browser screenshots are optional, not a substitute for a reproducible command.
Response: 

### Observed Node version [node]
Copy node --version or UNKNOWN: reason. The reference v24.21.0 is not a measurement.
Response: 

### Observed npm version [npm]
Copy npm --version or UNKNOWN: reason. The reference 11.19.0 is not a measurement.
Response: 

### Actual project dependency and native-driver state [dependencies]
Record preflight output and distinguish version resolution from loading sqlite3 and actually running Sequelize. Cite the original log.
Response: 

## Prediction and starting state

### Exact fixture and booking input [input_fixture]
Identify the fresh P02 seed, event, attendee and seats. Use returned IDs rather than guessing later generated IDs.
Response: 

### Prediction recorded before execution [prediction]
Before execution predict availability, booking count and audit count for success and for a controlled failure. Never replace this prediction retrospectively.
Response: 

### Booking invariant and its scope [invariant]
Name the facts which must agree and scope the invariant to the supplied fixture and operations. State what concurrency or crash behaviour is not covered.
Response: 

### Allowed edit and diff summary [edit_path]
Only projects/p02/src/book-seats.js. Record your diff summary; models, tests and locks are protected.
Response: 

### Initial baseline/objective/regression status [initial_checks]
Copy the baseline/objective/regression results or the exact prerequisite block. A TypeError, timeout or native-load error is not an intended assertion failure.
Response: 

### Initial inventory, bookings and audits [before_state]
Record the state before the call and name the command or witness. Source expectations must not be labelled as measured rows.
Response: 

### Supplied unsafe comparison: actual result or pending [unsafe_observation]
Use the supplied unsafe comparator in a fresh fixture when possible. Record its actual partial state or PENDING with the reason.
Response: 

### What the comparison does not establish [unsafe_limit]
Explain why this sequential counterexample is not a concurrency test or a qualified production design.
Response: 

## Implementation and failure evidence

### Observed sequence and awaited operations [operation_sequence]
Identify the order of event lookup, duplicate lookup, event save, booking creation, callback and audit creation. Link the observer trace.
Response: 

### Same transaction identity at all five database operations [transaction_witness]
Account for all five database operations, including event.save, plus the callback. State whether one non-null transaction identity was observed and name the evidence class.
Response: 

### Committed success state and returned values [success_state]
Give availability and actual booking/audit rows after success, plus the detached result. Distinguish the model from genuine ORM execution.
Response: 

### HTTP status, Location and body or pending [success_http]
Record the actual POST status, Location and response body with its client command. The supplied application has no GET /api/bookings/:id route; do not invent one.
Response: 

### Controlled callback failure: input and actual error [callback_failure]
Identify the controlled afterBookingCreated rejection, its origin and observed error. Label any injection.
Response: 

### Controlled audit-create rejection: input and actual error [audit_failure]
Identify the separately injected BookingAudit.create rejection. This differs from throwing before the call.
Response: 

### State before and after each failed attempt [rollback_state]
For each failed attempt record before and after availability, bookings and audits. A passing substitute is not physical rollback.
Response: 

### Known outcomes and unexpected error identity [error_identity]
Record preserved unexpected-error identity and known error codes. UniqueConstraintError alone does not identify the failing operation.
Response: 

### Callback completion versus outer transaction settlement [commit_boundary]
Separate callback completion from the returned transaction promise settling and the caller receiving a result. Label any delayed model gate as a model.
Response: 

### Successful independent booking after a failed attempt [recovery]
After a controlled failed booking, record an independent successful booking on the same database instance and check all three state components.
Response: 

## Evidence classes and interpretation

### Invalid, missing, sold-out and duplicate cases [invalid_outcomes]
Record invalid seats, missing event, sold-out and duplicate outcomes with unchanged state. Source order checks sold-out before duplicate; do not reverse it.
Response: 

### Environment and fixture identity of each witness [fixture_identity]
Map evidence IDs to source fixture, runtime and commands. Label ACTUAL_ORM_SQLITE and LOCAL_HTTP only for genuine execution, MODULE_MODEL for substitutes and SOURCE_REASONING for reading.
Response: 

### Actual ORM/HTTP evidence state [actual_stack_state]
ACTUAL_RECORDED means that you declare the actual required ORM and HTTP observations below. The form cannot authenticate them. An alternative needs separate teacher authority.
Response: 

### Limits of the atomicity observation [atomicity_limits]
State exactly which sequential failure points were exercised. Do not claim crash durability, reversible external side effects or general transaction coverage.
Response: 

### What was and was not tested about concurrent requests [concurrency_scope]
Name untested schedules and isolation assumptions. No new production mutex, lock policy or load experiment is required for P02.
Response: 

### Checks not yet executed and reasons [remaining_checks]
List unexecuted checks or NONE with a reason. Do not convert missing dependencies into a PASS.
Response: 

## Bounded Gemini review

### Actual Gemini activity state [gemini_state]
Use ACTUAL_RECORDED for an actual bounded interaction. Synthetic offline practice remains pending. Any alternative requires prior separate approval.
Response: 

### Sanitised context and date [gemini_context]
State the small sanitised code or contract context. No passwords, tokens, cookies or private datasets.
Response: 

### Relevant prompt only [gemini_prompt]
Copy only the relevant prompt, not the full conversation.
Response: 

### One claim selected for verification [gemini_claim]
Quote or accurately restate one claim selected for audit.
Response: 

### Independent witness and evidence class [gemini_check]
Give an independent command, test, diff or exact contract passage and the observed result. Name its evidence class.
Response: 

### ACCEPTED / REJECTED / PARTIALLY ACCEPTED / UNKNOWN [gemini_verdict]
Choose ACCEPTED, REJECTED, PARTIALLY ACCEPTED or UNKNOWN on the evidence, not on confidence of wording.
Response: 

### Correction or justified NONE [gemini_correction]
Give the minimal correction or NONE with a justification.
Response: 

### Limit of the verification [gemini_limit]
State what your independent check does not establish.
Response: 

## Required architecture decision record

### Decision context and invariant [adr_context]
Use a sanitised semester-project context. Where undecided, label a provisional course-domain decision and when it will be revisited.
Response: 

### Resource identity and intended public representation [adr_resources]
Identify the resource and its stable identity. Distinguish registration membership from a booking POST operation.
Response: 

### At least two realistic alternatives [adr_alternatives]
Compare at least two realistic alternatives, including action-shaped endpoints and a membership resource where relevant. Do not merely list names.
Response: 

### Chosen design and reason [adr_decision]
Choose and justify an option against stated criteria. A rejected Gemini proposal can be a sound decision.
Response: 

### Transaction boundary, reads, writes and failure policy [adr_transaction]
Identify state that must change together, its owner, transaction membership and excluded side effects. Separate atomicity from concurrency and durability.
Response: 

### Repeat-request effect and response table [adr_retry_table]
Use the P03 contract rows: collection GET; first member PUT; identical PUT; changed ticketType PUT; first DELETE; repeated DELETE; invalid query/body; missing parent. Add method/path, intended effect, expected response category, evidence class and remaining uncertainty. Discuss an uncertain response separately as a thought experiment unless actually observed.
Response: 

### Source or experiment evidence supporting the decision [adr_evidence]
Cite contract paths, observed witnesses or a declared source-based comparison. Full P03 implementation is not required for this analysis.
Response: 

### Trade-offs and a condition for revisiting the decision [adr_consequences]
Explain costs, operational limits and a condition for revisiting the decision. Do not assume Location is a retrievable endpoint in P02.
Response: 

## Completion and individual declaration

### Actual state at minute60 and at final export [exit_state]
At minute 60 record IMPLEMENTATION_PENDING, EVIDENCE_PENDING, ADR_PENDING or your actual state. The time limit does not produce a PASS.
Response: 

### Next smallest unresolved check [next_check]
Name the smallest useful next check or NONE with a reason.
Response: 

### Mechanism-based reflection [reflection]
Explain one mechanism and which observation changed or confirmed your view.
Response: 

### Remaining uncertainty [uncertainty]
State one specific untested assumption or boundary, not a generic confidence claim.
Response: 

### Separately obtained teacher decision, when applicable [authority_reference]
Write NONE for the standard route. For any separately approved alternative start AUTHORISATION: and give teacher, date, decision reference, exact affected requirement and replacement evidence. This field cannot grant approval.
Response: 

### Truthful individual-work and evidence declaration [declaration]
I performed or accurately attributed the work, preserved predictions and distinguished measured, imported and synthetic evidence. No secrets or private third-party data are included.
Response: 