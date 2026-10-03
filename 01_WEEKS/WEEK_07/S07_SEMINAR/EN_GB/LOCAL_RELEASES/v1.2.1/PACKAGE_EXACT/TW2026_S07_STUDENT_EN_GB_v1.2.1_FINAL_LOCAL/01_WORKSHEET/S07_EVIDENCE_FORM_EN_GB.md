# TW2026 S07 — Evidence worksheet

FINAL_LOCAL kit v1.2.1 · local Phase4 closure · EN-GB · Seven sections · 65 fields

Keep this completed worksheet private. Record source expectations separately from observations. A completed field and a structural check do not authenticate an experiment, Gemini response or teacher decision.

At minute 60 save a truthful draft and stop. Finish the required P02 implementation, the P03-informed ADR and the actual bounded Gemini audit before the separately configured deadline. Full P01/P03 implementation is optional.

Save an editable JSON backup or this document before printing. JSON and DOCX are working backups. The final submission is one readable PDF named `TW2026_S07_GROUP_Surname_Firstname.pdf` in the single S07 Assignment.

Imported drafts are unverified. v1.2.0 drafts retain all 65 fields for review. The old v1.1.0 55 field IDs remain, with 53 legacy values preserved. Import resets the individual declaration and Gemini activity state. New observations stay blank except the fixed S07 seminar identity. Review every imported claim and the ambiguous old kit string.

Use these evidence classes: SOURCE_REASONING, SOURCE_EXPECTATION, MODULE_MODEL, SYNTHETIC_PRACTICE, GENUINE_ORM_SQLITE, LOCAL_HTTP, ACTUAL_GEMINI, NATIVE_BROWSER, NATIVE_WINDOWS, NATIVE_MACOS, NATIVE_WORD, NOT_EXECUTED. Legacy aliases identify a class only; they do not authenticate execution.

For each witness record ID, class, fixture/request, command or source path, runtime, expected/observed state and any pending reason. Standard final evidence requires genuine ORM/SQLite and local HTTP observations plus an actual Gemini interaction independently checked. A separate alternative needs an existing teacher decision with exact scope; this worksheet cannot grant it.

The browser form uses the same 2,000,000 UTF-8 byte ceiling for JSON export and import. If export is too large it retains all field text and reports failure. Copy text into this fallback, save locally and reduce only redundant text after preserving a backup.

## Identity and observed environment

Record measured versions and the actual dependency state. Missing prerequisites are not failed objectives.

### Surname

`surname` · CORE · Maximum 128 characters

Your surname for the private assessment submission. Do not publish this completed form.

[Write your own record here.]

### First name

`given` · CORE · Maximum 128 characters

Your first name for the private assessment. Check the filename before saving.

[Write your own record here.]

### Group

`group` · CORE · Maximum 128 characters

Your actual seminar group.

[Write your own record here.]

### Kit version

`kits` · CORE · Maximum 128 characters

Record the S07 kit version actually used. Review imported C07/S07 strings; do not infer a package ID from them.

[Write your own record here.]

### Operating system

`os` · CORE · Maximum 128 characters

Name the operating system and version actually used.

[Write your own record here.]

### Terminal and client used

`terminal` · CORE · Maximum 128 characters

Name the terminal and HTTP client. Browser screenshots are optional; it is not a substitute for a reproducible command.

[Write your own record here.]

### Observed Node version

`node` · CORE · Maximum 128 characters

Copy node --version or UNKNOWN: reason. The reference v24.21.0 is not a measurement.

[Write your own record here.]

### Observed npm version

`npm` · CORE · Maximum 128 characters

Copy npm --version or UNKNOWN: reason. The reference 11.19.0 is not a measurement.

[Write your own record here.]

### Actual project dependency and native-driver state

`dependencies` · CORE · Maximum 12000 characters

Record preflight output and distinguish version resolution from loading sqlite3 and actually running Sequelize. Cite the original log.

[Write your own record here.]

### Date of individual work

`date` · CORE · Maximum 128 characters

Enter the actual date and time zone of your work. Record the separate Gemini interaction date in its context field.

[Write your own record here.]

### Seminar identity: S07

`seminar_id` · CORE · Maximum 128 characters

S07 is the fixed identity of this worksheet. It is not a measured environment observation.

S07

### Actual S07 PACKAGE_ID

`package_id` · CORE · Maximum 128 characters

Copy the 64-character S07 PACKAGE_ID.txt value from the unedited kit. Do not guess it or substitute a C07 ID. If unavailable record UNKNOWN: reason.

[Write your own record here.]

### Observed browser and version

`browser` · CORE · Maximum 128 characters

Record the browser and version actually used or UNKNOWN: reason. Do not copy a reference version as a measurement.

[Write your own record here.]

## Prediction and starting state

Keep the original prediction. Use a fresh named fixture and separate the unsafe comparison from your implementation.

### Exact fixture and booking input

`input_fixture` · CORE · Maximum 12000 characters

Identify the fresh P02 seed, event, attendee and seats. Use returned IDs rather than guessing later generated IDs.

[Write your own record here.]

### Prediction recorded before execution

`prediction` · CORE · Maximum 12000 characters

Before execution predict availability, booking count and audit count for success and for a controlled failure. Never replace this prediction retrospectively.

[Write your own record here.]

### Booking invariant and its scope

`invariant` · CORE · Maximum 12000 characters

Name the facts which must agree and scope the invariant to the supplied fixture and operations. State what concurrency or crash behaviour is not covered.

[Write your own record here.]

### Allowed edit and diff summary

`edit_path` · CORE · Maximum 12000 characters

Change only 02_PROJECTS/p02/src/book-seats.js. Record the diff. Models, tests, dependencies and locks are protected.

[Write your own record here.]

### Initial baseline/objective/regression status

`initial_checks` · CORE · Maximum 12000 characters

Copy the baseline/objective/regression results or the exact prerequisite block. A TypeError, timeout or native-load error is not an intended assertion failure.

[Write your own record here.]

### Initial inventory, bookings and audits

`before_state` · CORE · Maximum 12000 characters

Record the state before the call and name the command or witness. Source expectations must not be labelled as measured rows.

[Write your own record here.]

### Supplied unsafe comparison: actual result or pending

`unsafe_observation` · CORE · Maximum 12000 characters

Use the supplied unsafe comparator in a fresh fixture when possible. Record its actual partial state or PENDING with the reason.

[Write your own record here.]

### What the comparison does not establish

`unsafe_limit` · CORE · Maximum 12000 characters

Explain why this sequential counterexample is not a concurrency test or a qualified production design.

[Write your own record here.]

### Second prediction before the failure experiment

`prediction_two` · CORE · Maximum 12000 characters

Before observing the separate controlled failure, record your second prediction with time/order and named fixture. Keep the first prediction unchanged. If you already observed the outcome say LATE: reason; do not invent prior timing.

[Write your own record here.]

### Expected result before execution

`expected_result` · CORE · Maximum 12000 characters

Label this SOURCE_EXPECTATION. Record expected availability, Booking count and BookingAudit count before execution. Keep this separate from measured rows.

[Write your own record here.]

## Implementation and failure evidence

Record the command, evidence class and actual result. A module model is not SQL rollback.

### Observed sequence and awaited operations

`operation_sequence` · FINAL · Maximum 12000 characters

Record event lookup, duplicate lookup, event save, booking creation, callback and audit creation in their observed order. Name the trace and its class.

[Write your own record here.]

### Same transaction identity at all five database operations

`transaction_witness` · FINAL · Maximum 12000 characters

Name all five database operations: Event.findByPk, Booking.findOne, event.save, Booking.create and BookingAudit.create. Record one shared non-null transaction identity plus the awaited callback. A source or module model trace does not prove native SQL rollback.

[Write your own record here.]

### Committed success state and returned values

`success_state` · FINAL · Maximum 12000 characters

Give availability and actual booking/audit rows after success, plus the detached result. Distinguish the model from genuine ORM execution.

[Write your own record here.]

### HTTP status, Location and body or pending

`success_http` · FINAL · Maximum 12000 characters

Record the actual POST status, Location and response body with its client command. The supplied application has no GET /api/bookings/:id route; do not invent one.

[Write your own record here.]

### Controlled callback failure: input and actual error

`callback_failure` · FINAL · Maximum 12000 characters

Identify the controlled afterBookingCreated rejection, its origin and observed error. Label any injection.

[Write your own record here.]

### Controlled audit-create rejection: input and actual error

`audit_failure` · FINAL · Maximum 12000 characters

Identify the separately injected BookingAudit.create rejection. This differs from throwing before the call.

[Write your own record here.]

### State before and after each failed attempt

`rollback_state` · FINAL · Maximum 12000 characters

For each failed attempt record before and after availability, bookings and audits. A passing substitute is not physical rollback.

[Write your own record here.]

### Known outcomes and unexpected error identity

`error_identity` · FINAL · Maximum 12000 characters

Record preserved unexpected-error identity and known error codes. UniqueConstraintError alone does not identify the failing operation.

[Write your own record here.]

### Callback completion versus outer transaction settlement

`commit_boundary` · FINAL · Maximum 12000 characters

Separate callback completion from the returned transaction promise settling and the caller receiving a result. Label any delayed model gate as a model.

[Write your own record here.]

### Successful independent booking after a failed attempt

`recovery` · FINAL · Maximum 12000 characters

After a controlled failed booking, record an independent successful booking on the same database instance and check all three state components.

[Write your own record here.]

## Evidence classes and interpretation

Name the scope of each observation and the checks that remain outstanding.

### Invalid, missing, sold-out and duplicate cases

`invalid_outcomes` · FINAL · Maximum 12000 characters

Record invalid seats, missing event, sold-out and duplicate outcomes with unchanged state. Source order checks sold-out before duplicate; do not reverse it.

[Write your own record here.]

### Environment and fixture identity of each witness

`fixture_identity` · FINAL · Maximum 12000 characters

Map each witness to its fixture, command and measured runtime. Use GENUINE_ORM_SQLITE for genuine ORM/SQLite, LOCAL_HTTP for the actual local HTTP client, MODULE_MODEL for substitutes and SOURCE_REASONING for source reading. Imported labels remain unverified.

[Write your own record here.]

### Actual ORM/HTTP evidence state

`actual_stack_state` · FINAL · Maximum 12000 characters

ACTUAL_RECORDED declares genuine ORM/SQLite and local HTTP observations. The checker cannot authenticate them. A separate alternative requires the exact teacher decision and scope.

Allowed choices: PENDING / ACTUAL_RECORDED / SEPARATELY_APPROVED_ALTERNATIVE.

[Write your own record here.]

### Limits of the atomicity observation

`atomicity_limits` · FINAL · Maximum 12000 characters

State exactly which sequential failure points were exercised. Do not claim crash durability, reversible external side effects or general transaction coverage.

[Write your own record here.]

### What was and was not tested about concurrent requests

`concurrency_scope` · FINAL · Maximum 12000 characters

Name untested schedules and isolation assumptions. No new production mutex, lock policy or load experiment is required for P02.

[Write your own record here.]

### Checks not yet executed and reasons

`remaining_checks` · CORE · Maximum 12000 characters

List unexecuted checks or NONE with a reason. Do not convert missing dependencies into a PASS.

[Write your own record here.]

### Difference between prediction and observation

`observed_difference` · FINAL · Maximum 12000 characters

Compare each preserved prediction with the actual witness. If no genuine run occurred record PENDING: reason and avoid calling source expectations observations.

[Write your own record here.]

### Reproducible evidence index

`evidence_index` · FINAL · Maximum 12000 characters

Use one row per witness: ID | evidence class | fixture/request | command/source path | runtime | expected/observed state | pending reason. Distinguish source, model, genuine ORM/SQLite, local HTTP and actual Gemini.

[Write your own record here.]

## Bounded Gemini review

Use one sanitised claim and an independent witness. Agreement with Gemini is not the target.

### Actual Gemini activity state

`gemini_state` · FINAL · Maximum 12000 characters

ACTUAL_RECORDED declares an actual bounded Gemini interaction with an independent check. Synthetic practice remains pending. A selector cannot grant an alternative.

Allowed choices: PENDING / ACTUAL_RECORDED / SEPARATELY_APPROVED_ALTERNATIVE.

[Write your own record here.]

### Sanitised context and date

`gemini_context` · FINAL · Maximum 12000 characters

State the small sanitised code or contract context. No passwords, tokens, cookies or private datasets.

[Write your own record here.]

### Relevant prompt only

`gemini_prompt` · FINAL · Maximum 12000 characters

Copy only the relevant prompt, not the full conversation.

[Write your own record here.]

### One claim selected for verification

`gemini_claim` · FINAL · Maximum 12000 characters

Quote or accurately restate one claim selected for audit.

[Write your own record here.]

### Independent witness and evidence class

`gemini_check` · FINAL · Maximum 12000 characters

Give an independent command, test, diff or exact contract passage and the observed result. Name its evidence class.

[Write your own record here.]

### ACCEPTED / REJECTED / PARTIALLY ACCEPTED / UNKNOWN

`gemini_verdict` · FINAL · Maximum 12000 characters

Choose ACCEPTED, REJECTED, PARTIALLY ACCEPTED or UNKNOWN on the evidence, not on confidence of wording.

Allowed choices: ACCEPTED / REJECTED / PARTIALLY ACCEPTED / UNKNOWN.

[Write your own record here.]

### Correction or justified NONE

`gemini_correction` · FINAL · Maximum 12000 characters

Give the minimal correction or NONE with a justification.

[Write your own record here.]

### Limit of the verification

`gemini_limit` · FINAL · Maximum 12000 characters

State what your independent check does not establish.

[Write your own record here.]

## Required architecture decision record

Required analysis, not a second full programming project. About 300–500 words plus a small client-effect table is a suggested scope.

### Decision context and invariant

`adr_context` · FINAL · Maximum 12000 characters

Use a sanitised semester-project context. Where undecided, label a provisional course-domain decision and when it will be revisited.

[Write your own record here.]

### Resource identity and intended public representation

`adr_resources` · FINAL · Maximum 12000 characters

Identify the resource and its stable identity. Distinguish registration membership from a booking POST operation.

[Write your own record here.]

### At least two realistic alternatives

`adr_alternatives` · FINAL · Maximum 12000 characters

Compare at least two realistic alternatives, including action-shaped endpoints and a membership resource where relevant. Do not merely list names.

[Write your own record here.]

### Chosen design and reason

`adr_decision` · FINAL · Maximum 12000 characters

Choose and justify an option against stated criteria. A rejected Gemini proposal can be a sound decision.

[Write your own record here.]

### Transaction boundary, reads, writes and failure policy

`adr_transaction` · FINAL · Maximum 12000 characters

Identify state that must change together, its owner, transaction membership and excluded side effects. Separate atomicity from concurrency and durability.

[Write your own record here.]

### Repeat-request effect and response table

`adr_retry_table` · FINAL · Maximum 12000 characters

Use the P03 contract rows: collection GET; first member PUT; identical PUT; changed ticketType PUT; first DELETE; repeated DELETE; invalid query/body; missing parent. Add method/path, intended effect, expected response category, evidence class and remaining uncertainty. Discuss an uncertain response separately as a thought experiment unless actually observed.

[Write your own record here.]

### Source or experiment evidence supporting the decision

`adr_evidence` · FINAL · Maximum 12000 characters

Cite contract paths, observed witnesses or a declared source-based comparison. Full P03 implementation is not required for this analysis.

[Write your own record here.]

### Trade-offs and a condition for revisiting the decision

`adr_consequences` · FINAL · Maximum 12000 characters

Explain costs, operational limits and a condition for revisiting the decision. Do not assume Location is a retrievable endpoint in P02.

[Write your own record here.]

## Completion and individual declaration

Save a truthful draft at minute 60. Finish P02 and the ADR before the separately configured deadline.

### Actual state at minute60 and at final export

`exit_state` · CORE · Maximum 12000 characters

At minute 60 record IMPLEMENTATION_PENDING, EVIDENCE_PENDING, ADR_PENDING or your actual state. The time limit does not produce a PASS.

[Write your own record here.]

### Next smallest unresolved check

`next_check` · CORE · Maximum 12000 characters

Name the smallest useful next check or NONE with a reason.

[Write your own record here.]

### Mechanism-based reflection

`reflection` · FINAL · Maximum 12000 characters

Explain one mechanism and which observation changed or confirmed your view.

[Write your own record here.]

### Remaining uncertainty

`uncertainty` · FINAL · Maximum 12000 characters

State one specific untested assumption or boundary; it is not a generic confidence claim.

[Write your own record here.]

### Separately obtained teacher decision, when applicable

`authority_reference` · FINAL · Maximum 12000 characters

Write NONE for the standard route. For a separate alternative start AUTHORISATION: and give teacher, date, decision reference, exact affected requirement and replacement evidence. The selector and checker cannot grant or authenticate that decision.

[Write your own record here.]

### Truthful individual-work and evidence declaration

`declaration` · FINAL · Explicit review checkbox

I performed or accurately attributed this work, kept prior predictions and distinguished source, measured, imported and synthetic evidence. I reviewed the imported draft where applicable. I included no secrets or private third-party data.

[ ] Reviewed

### Privacy review

`privacy_check` · FINAL · Explicit review checkbox

I reviewed the final PDF and relevant Gemini context for secrets, credentials, cookies, private third-party data and unrelated conversation content.

[ ] Reviewed

### Final PDF and submission checklist

`upload_checklist` · FINAL · Maximum 12000 characters

Record that the PDF opens, includes all seven sections, uses TW2026_S07_GROUP_Surname_Firstname.pdf and contains readable evidence. Upload exactly one PDF to the single S07 Assignment. Record the actual submission state separately; a generated file is not a confirmed submission.

[Write your own record here.]

## Save and print route

1. Save the editable worksheet and JSON backup. Check that each saved file opens.
2. Inspect all seven sections and every long evidence entry. Browser printing expands entries into plain text, while Word printing depends on the local application.
3. Choose the local PDF output option. Use the generated filename and open the saved PDF to inspect every page.
4. Upload exactly one PDF to the single S07 Assignment and confirm the actual submission state in the live interface. No second C07 Assignment is required.

Native browser storage, file-origin behaviour, keyboard interactions, printing and Word acceptance remain separate checks. FINAL_LOCAL closes the local material only. Live Moodle, actual Gemini, native ORM and native Word/browser acceptance remain pending.
