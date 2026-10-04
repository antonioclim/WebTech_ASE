# S12 Individual Evidence Form — v1.2.1 FINAL_LOCAL

FINAL_LOCAL — content and packaging only. Native browser/PDF, exact-runtime and live service qualifications remain open. Use `FORM_S12_EN_GB.html` offline. `S12_EVIDENCE_FORM.html` and `form.html` are byte-identical compatibility entry points. The 49 semantic IDs and seven sections are retained: 13 core fields and 36 later fields.

## Evidence and completion contract

Write the core draft during minutes 00–12. Finish required P03 implementation and actual fake-unit observations, an individually annotated P01 source/model trace and one actual bounded Gemini critique by the actual teacher-set deadline. STOP content at minute 60; the 18-minute implementation segment does not promise completion. A blocked required item remains a printable honest draft. The form grants no institutional alternative.

Student-declared evidence metadata is separate from field text. For each field named in `schema.evidencePolicy.fields`, record `evidenceStatus[field_id] = {class, outcome}`. Only exact whitelisted classes and outcomes are admitted. Required P03 metadata must describe actual PURE_JS/CANONICAL_TESTS observations and passing test results. Required P01 metadata may describe SOURCE_ANALYSIS/MODEL when individually annotated honestly. Gemini prompt, response and claim require ACTUAL_GEMINI. Independent checks have their own bounded class and outcome.

The real WebSocket integration field is a separately named qualification. NOT_EXECUTED/BLOCKED with the actual reason does not bar the required fake-unit assessment lane. A prefixed NOT_EXECUTED in prose does not satisfy evidence metadata and cannot make a required blocked observation complete. Structural validation does not verify execution, truth, correctness or approval.

## Draft, migration and privacy

Use Save local draft and Export JSON. JSON imports and compact saved/exported backups are limited to 2,000,000 UTF-8 bytes, text fields to 16,000 JavaScript UTF-16 code units and plain objects to exact field/property whitelists. When indentation would exceed the import bound, export uses compact JSON while retaining all fields. An oversized aggregate draft cannot be saved/exported as a non-importable backup: the current text is retained and the failure explains manual-copy recovery. Reduce unnecessary repetition without discarding required evidence if a portable JSON backup is needed. JSON schema v1.1.0 and v1.2.0 text can be imported. Release v1.2.1 retains the compatible JSON schema v1.2.0 and local storage key `TW2026_S12_FORM_1_v1.2.0`; declarations, PDF review, submission, final state and all evidence metadata reset. Imported provenance remains unverified. Re-select metadata only after reviewing each actual observation.

Autosave begins OFF. Switching OFF cancels the pending save. Import, reset and erasure cancel queued saves. Reset form requires its own confirmation and clears only current text. Erase stored draft requires its own confirmation and erases only this version's application key; it retains current text, other storage and the historical v1.1.0 key. Storage failure is displayed; export JSON or copy text manually.

Remove passwords, tokens, API keys, session cookies, real personal data, private screenshots, private code and Moodle data. Use only the approved student_code/alias. The teacher keeps the private identity mapping. No surname/group fields or S11 policy are introduced.

## PDF and upload route

Print honest draft is always available. Print assessed candidate requires structural assessment completeness and the declaration that the actual PDF has been reviewed. First print a truthful draft, save it, open and inspect all pages, then update the review declaration and print/review the final candidate. Never infer saving from the print dialogue. The proposed name is `TW2026_S12_CODE.pdf`, with CODE generated from the approved student code or alias.

Edits invalidate stale print content. Browser beforeprint rebuilds current text safely, including literal hostile text. Import and substantive edits reset declarations/PDF/submission/final state. Before upload open the saved PDF again and review filename, all text, metadata and redaction. One private S12 Assignment receives one reviewed PDF. Save changes may leave Draft; final submission requires actual observed status, filename and timestamp. See `MOODLE_UPLOAD_GUIDE_S12_EN_GB.md`.

## Identity and execution

Core draft, minutes 00–05. Record actual identity and execution lane before making predictions. Imported text and metadata remain unverified.

### Student code or approved alias [student_code]

Use only the student code or alias approved by the teacher. The teacher keeps the private identity mapping. CODE proposes TW2026_S12_CODE.pdf; do not add surname or group fields.

Response: ______________________________________________

### Public package ID [package_id]

Copy the exact 64-character ID from PACKAGE_ID.txt at the extracted student root. Run VERIFY_PACKAGE before editing; after editing use the separate one-file work boundary.

Response: ______________________________________________

### Assessed source SHA-256 [source_sha256]

Before implementation, copy source_sha256 from a successful VERIFY_INITIAL_STATE receipt and its output locator. If that gate is blocked, record NOT_RECORDED or BLOCKED with the actual reason; do not invent a hash. After required work passes, replace this entry with source_sha256 from VERIFY_WORK_RESULT and its final receipt locator before the assessed PDF. A hash identifies bytes, not correct behaviour.

Response: ______________________________________________

### Actual Node.js version [actual_node]

Copy the actually displayed Node version from CHECK_ENVIRONMENT. Prescribed v24.21.0; a mismatch is a block for strict runtime qualification, not permission to relabel your version.

Response: ______________________________________________

### Actual npm version [actual_npm]

Copy the actually displayed npm version from CHECK_ENVIRONMENT. Prescribed 11.19.0. Do not install or update tools through this form.

Response: ______________________________________________

### Evidence execution class [execution_class]

Choose the strongest class actually used. PURE_JS means executable JavaScript with the supplied fake transport, MODEL means a constructed trace, REAL_PROTOCOL requires an actual protocol run. Per-field metadata below narrows individual claims.

Response: ______________________________________________

Options: NOT_EXECUTED / SOURCE_ANALYSIS / PURE_JS / MODEL / CANONICAL_TESTS / REAL_PROTOCOL

### Environment limitation or block [environment_limit]

Record the exact available lane, block and action requested from the teacher. The real WebSocket lane is separate; no dependency installation is a hidden requirement of the fake-unit lane.

Response: ______________________________________________

## Protocol and prediction

Core draft, minutes 05–12. Write predictions before implementation and observation; distinguish request state from lifetime subscriptions.

### Acceptance, execution and delivery owner map [accepted_owner_map]

At 05–12 minutes predict E07: HTTP accepts, calculation executes and the registered connection receives delivery. An HTTP 202 response does not say that calculation is complete.

Response: ______________________________________________

### Chosen transport and justification [transport_choice]

Explain why a shared WebSocket channel needs correlation while the HTTP request has its own response. State whether your evidence is a fake-unit run, source analysis, model or real protocol.

Response: ______________________________________________

### Principal, connection and request identity map [connection_identity]

E07: distinguish principal identity, connectionId and requestId. Locate guided/p01 source or S12_P01_GUIDED_TRACE.md. Query identity in the teaching fixture is not production authentication.

Response: ______________________________________________

### Prediction: pending-before-send ordering [pending_before_send_prediction]

E02: predict what happens if transport.send immediately calls the message listener. State why the pending entry must already exist before send.

Response: ______________________________________________

### Predicted terminal paths [terminal_paths_prediction]

E03–E06: predict completion, remote failure, send failure, timeout, abort, close and disposal. Name the owner that removes state before settling once.

Response: ______________________________________________

### Scoped cleanup invariant [cleanup_invariant]

E04–E05: predict per-request pending/timer/abort cleanup. One dispatcher subscription pair remains until dispose; the adapter and socket have separate owners. Zero pending is a narrow claim.

Response: ______________________________________________

## P03 implementation and evidence

Later fields, minutes 12–39 and work after STOP 60. One implementation path is assessed. Required fake-unit observations and separate real-protocol qualification have different gates.

### Assessed P03 path changed [p03_changed_path]

Enter exactly projects/p03/student/src/request-dispatcher.mjs, relative to the extracted student root. This is the only assessed implementation file you edit.

Response: ______________________________________________

### Narrow diff or hash locator [p03_diff_locator]

Locate your narrow diff and completed source hash. Explain changes relevant to E01–E06 without pasting a full answer into Gemini.

Response: ______________________________________________

### P03 baseline results [p03_baseline_results]

Record actual baseline count, result and output locator. Select class PURE_JS or CANONICAL_TESTS and outcome PASS only after observing the completed-work verifier.

Response: ______________________________________________

Evidence metadata (unverified student declaration): class __________; outcome __________.
Required assessment evidence.
Allowed assessment class: PURE_JS / CANONICAL_TESTS. Allowed outcome: PASS.

### P03 objective results [p03_objective_results]

Record original canonical objective checks and derived successor checks from VERIFY_WORK_RESULT. The starter direct rejection is not an intended assertion. Normal assessed completeness requires actual PASS.

Response: ______________________________________________

Evidence metadata (unverified student declaration): class __________; outcome __________.
Required assessment evidence.
Allowed assessment class: PURE_JS / CANONICAL_TESTS. Allowed outcome: PASS.

### P03 regression results [p03_regression_results]

Record actual regression counts and output locator from VERIFY_WORK_RESULT. A parser failure, skip, cancellation, timeout or guard block is not PASS.

Response: ______________________________________________

Evidence metadata (unverified student declaration): class __________; outcome __________.
Required assessment evidence.
Allowed assessment class: PURE_JS / CANONICAL_TESTS. Allowed outcome: PASS.

### P03 integration result or honest block [p03_integration_results]

Separate qualification: name the real ws run and limits if actually performed. Otherwise write the actual NOT_EXECUTED/BLOCKED reason and choose that metadata. This field does not require a real protocol run for the fake-unit assessment lane.

Response: ______________________________________________

Evidence metadata (unverified student declaration): class __________; outcome __________.
Separate real integration qualification; honest NOT_EXECUTED/BLOCKED is allowed.
Allowed assessment class: REAL_PROTOCOL / NOT_EXECUTED / BLOCKED. Allowed outcome: PASS / FAIL / NOT_EXECUTED / BLOCKED / OBSERVED.

### Reversed-order trace [p03_reversed_order_trace]

E01: start r1, r2 and r3; deliver r3, r1 then r2. Record which caller receives each result, the output locator and any difference from prediction.

Response: ______________________________________________

Evidence metadata (unverified student declaration): class __________; outcome __________.
Required assessment evidence.
Allowed assessment class: PURE_JS / CANONICAL_TESTS. Allowed outcome: OBSERVED / PASS.

### Synchronous reply trace [p03_sync_reply_trace]

E02: record the immediate-reply fake transport case, the state-before-send ordering and the observed result. Do not describe a queued asynchronous reply as a synchronous test.

Response: ______________________________________________

Evidence metadata (unverified student declaration): class __________; outcome __________.
Required assessment evidence.
Allowed assessment class: PURE_JS / CANONICAL_TESTS. Allowed outcome: OBSERVED / PASS.

### Timeout trace [p03_timeout_trace]

E04: record timeout outcome, one settlement and late completion behaviour. Name the pending/timer/abort counters and their observation point.

Response: ______________________________________________

Evidence metadata (unverified student declaration): class __________; outcome __________.
Required assessment evidence.
Allowed assessment class: PURE_JS / CANONICAL_TESTS. Allowed outcome: OBSERVED / PASS.

### Abort trace [p03_abort_trace]

E03–E04: record pre-abort send count 0 and active abort cleanup. Local promise rejection does not prove cancellation of server work.

Response: ______________________________________________

Evidence metadata (unverified student declaration): class __________; outcome __________.
Required assessment evidence.
Allowed assessment class: PURE_JS / CANONICAL_TESTS. Allowed outcome: OBSERVED / PASS.

### Transport close trace [p03_close_trace]

E05: record rejection of pending requests and refusal of dispatch after permanent close. Include output or test locator.

Response: ______________________________________________

Evidence metadata (unverified student declaration): class __________; outcome __________.
Required assessment evidence.
Allowed assessment class: PURE_JS / CANONICAL_TESTS. Allowed outcome: OBSERVED / PASS.

### Dispose trace [p03_dispose_trace]

E05: record idempotent dispose, removal of dispatcher subscriptions and refusal of future dispatch. Adapter disposal and closing the socket are separate obligations.

Response: ______________________________________________

Evidence metadata (unverified student declaration): class __________; outcome __________.
Required assessment evidence.
Allowed assessment class: PURE_JS / CANONICAL_TESTS. Allowed outcome: OBSERVED / PASS.

### Evidence that pending count returns to zero [p03_zero_pending]

E04–E05: report the actual pending count after each terminal path with a locator. Explain that zero pending alone says nothing about adapter/socket resources.

Response: ______________________________________________

Evidence metadata (unverified student declaration): class __________; outcome __________.
Required assessment evidence.
Allowed assessment class: PURE_JS / CANONICAL_TESTS. Allowed outcome: OBSERVED / PASS.

### Scoped listener and timer cleanup evidence [p03_zero_listeners_timers]

E04–E05: separate per-request timer/abort listeners (zero after settlement), dispatcher subscription pair (retained until dispose) and adapter/socket ownership. Record each scope rather than invent one global zero.

Response: ______________________________________________

Evidence metadata (unverified student declaration): class __________; outcome __________.
Required assessment evidence.
Allowed assessment class: PURE_JS / CANONICAL_TESTS. Allowed outcome: OBSERVED / PASS.

### Unresolved P03 work [p03_unresolved_work]

List genuinely unresolved required obligations or explicitly state that none remain and give the completed-work result locator. The 18-minute seminar implementation segment is not guaranteed full completion.

Response: ______________________________________________

## P01 guided trace

Later fields, minutes 50–55. Each student individually annotates the required P01 source/model trace. The labels do not turn a constructed trace into a live HTTP/WebSocket run.

### P01 guided demonstration scope [p01_demo_scope]

E07 required individual guided trace: identify the supplied source/model trace or actual run. Name the source file or model locator and your individual annotations.

Response: ______________________________________________

Evidence metadata (unverified student declaration): class __________; outcome __________.
Required assessment evidence.
Allowed assessment class: SOURCE_ANALYSIS / MODEL / PURE_JS / REAL_PROTOCOL. Allowed outcome: OBSERVED / PASS.

### HTTP acceptance observation [p01_http_acceptance]

E07: annotate the HTTP 202/requestId acceptance point and the later completion point. If source/model only, say so and select matching metadata.

Response: ______________________________________________

Evidence metadata (unverified student declaration): class __________; outcome __________.
Required assessment evidence.
Allowed assessment class: SOURCE_ANALYSIS / MODEL / PURE_JS / REAL_PROTOCOL. Allowed outcome: OBSERVED / PASS.

### WebSocket registration observation [p01_ws_registration]

E07: annotate connection registration, acknowledgement and matching target. Identify observed versus inferred behaviour.

Response: ______________________________________________

Evidence metadata (unverified student declaration): class __________; outcome __________.
Required assessment evidence.
Allowed assessment class: SOURCE_ANALYSIS / MODEL / PURE_JS / REAL_PROTOCOL. Allowed outcome: OBSERVED / PASS.

### Targeted result observation [p01_targeted_result]

E07: trace the principal/connection/request tuple to its target. Explain why an out-of-order result must reach its own caller.

Response: ______________________________________________

Evidence metadata (unverified student declaration): class __________; outcome __________.
Required assessment evidence.
Allowed assessment class: SOURCE_ANALYSIS / MODEL / PURE_JS / REAL_PROTOCOL. Allowed outcome: OBSERVED / PASS.

### Identity binding observation [p01_identity_binding]

E07: record the binding and the limit of the query-identity teaching fixture. Do not call it production authentication.

Response: ______________________________________________

Evidence metadata (unverified student declaration): class __________; outcome __________.
Required assessment evidence.
Allowed assessment class: SOURCE_ANALYSIS / MODEL / PURE_JS / REAL_PROTOCOL. Allowed outcome: OBSERVED / PASS.

### Cleanup observation [p01_cleanup_observation]

E07: annotate pending removal at delivery and source limitations: original duplicate IDs can overwrite ownership and disconnect does not remove pending work. Source analysis is not a repaired live system.

Response: ______________________________________________

Evidence metadata (unverified student declaration): class __________; outcome __________.
Required assessment evidence.
Allowed assessment class: SOURCE_ANALYSIS / MODEL / PURE_JS / REAL_PROTOCOL. Allowed outcome: OBSERVED / PASS.

### Guided-demo limitation [p01_demo_limit]

State the evidence class, source limitations and untested real HTTP/WebSocket behaviour. A source/model trace is acceptable for the required guided trace when labelled accurately.

Response: ______________________________________________

Evidence metadata (unverified student declaration): class __________; outcome __________.
Required assessment evidence.
Allowed assessment class: SOURCE_ANALYSIS / MODEL / PURE_JS / REAL_PROTOCOL. Allowed outcome: OBSERVED / PASS.

## Bounded Gemini critique

Later fields, minutes 39–50. Preserve one actual bounded critique and your independent check. Unavailable access stays a truthful draft; this form grants no alternative.

### Actual bounded Gemini prompt [gemini_prompt]

Paste the one actual sanitised prompt you sent using GEMINI_PROMPT_EN_GB.txt. Include only a minimal public excerpt; no full dispatcher, credentials, private code or Moodle data.

Response: ______________________________________________

Evidence metadata (unverified student declaration): class __________; outcome __________.
Required assessment evidence.
Allowed assessment class: ACTUAL_GEMINI. Allowed outcome: OBSERVED.

### Relevant Gemini response excerpt [gemini_response_excerpt]

Preserve the relevant actual response excerpt, model label if visible and a local locator. No invented dialogue. If access is blocked choose BLOCKED and retain a truthful draft.

Response: ______________________________________________

Evidence metadata (unverified student declaration): class __________; outcome __________.
Required assessment evidence.
Allowed assessment class: ACTUAL_GEMINI. Allowed outcome: OBSERVED.

### Falsifiable claim evaluated [gemini_claim]

Quote or paraphrase one falsifiable response claim and distinguish Observed, Inferred or Unknown. The supplied flawed claim says pendingCount 0 proves all lifecycle cleanup.

Response: ______________________________________________

Evidence metadata (unverified student declaration): class __________; outcome __________.
Required assessment evidence.
Allowed assessment class: ACTUAL_GEMINI. Allowed outcome: OBSERVED.

### Independent check [gemini_independent_check]

E04–E05 or a narrow source counterexample: record your own check, result, locator and limit. A Gemini answer cannot serve as its own independent check.

Response: ______________________________________________

Evidence metadata (unverified student declaration): class __________; outcome __________.
Required assessment evidence.
Allowed assessment class: SOURCE_ANALYSIS / MODEL / PURE_JS / CANONICAL_TESTS / REAL_PROTOCOL. Allowed outcome: OBSERVED / PASS / FAIL.

### Verdict, correction and limitation [gemini_verdict_correction]

State ACCEPTED, REJECTED, PARTIALLY ACCEPTED or UNKNOWN, then correction and limit. The verdict must follow your independent check, not the model confidence.

Response: ______________________________________________

Evidence metadata (unverified student declaration): class __________; outcome __________.
Required assessment evidence.
Allowed assessment class: SOURCE_ANALYSIS / MODEL / PURE_JS / CANONICAL_TESTS / REAL_PROTOCOL. Allowed outcome: OBSERVED / PASS / FAIL.

## Reflection and transfer

Later fields and exit ticket, minutes 55–60. P02 is optional. Record limits and next work at STOP 60 without promising completion in the seminar.

### Optional P02 status [p02_optional_status]

Choose NOT_STARTED if you did not attempt optional Redis/BullMQ work. P02 adds no assessed implementation gate and no hidden provisioning requirement.

Response: ______________________________________________

Options: NOT_STARTED / PLANNED / PARTIAL / COMPLETE_UNVERIFIED / COMPLETE_WITH_EVIDENCE

### Cross-protocol reflection [cross_protocol_reflection]

Explain how acceptance, execution and targeted delivery differ, using your own P03 and P01 locators. Include one risk such as an accepted report export being mistaken for a completed total.

Response: ______________________________________________

### Evidence-class limitations [evidence_class_limits]

List which claims are actual fake-unit observations, source/model annotations or real protocol observations, and which remain untested.

Response: ______________________________________________

### Required next work [next_work]

At minute 60 record the next required action, teacher-set deadline when actually known and outstanding qualification. No deadline or penalty is invented by this form.

Response: ______________________________________________

## Declaration and PDF route

After required work and final review. Declarations renew after edits or import. Printing, PDF saving and Moodle final submission are separate observed actions.

### I removed credentials, tokens, cookies and unnecessary personal data [privacy_redaction]

After the latest edit, inspect all fields and remove passwords, tokens, API keys, session cookies, real personal data, private account screenshots, private code and Moodle data. Then renew this declaration.

Response: ______________________________________________

### I declare that the evidence and limitations are truthful [declaration_truthful]

Declare only your own truthful evidence and limits. Structural completeness is not teacher approval or evidence verification. Import and substantive edits reset this declaration.

Response: ______________________________________________

### PDF review status [pdf_review_status]

Choose FINAL_REVIEWED only after opening the actual saved PDF and checking every page, filename, text, evidence status and redaction. Browser print alone cannot verify saving.

Response: ______________________________________________

Options: NOT_REVIEWED / DRAFT_REVIEWED / FINAL_REVIEWED

### Submission status [submission_status]

READY_NOT_SUBMITTED describes local readiness. SUBMITTED_UNVERIFIED records a claim you must support by observing the actual Moodle final status/name/timestamp. Draft is not final submission.

Response: ______________________________________________

Options: NOT_SUBMITTED / READY_NOT_SUBMITTED / SUBMITTED_UNVERIFIED

### Form status [final_status]

FINAL_FIELDS_COMPLETE_NOT_VERIFIED is a structural candidate, not correctness, teacher approval or a Moodle receipt. Keep DRAFT whenever required implementation, actual Gemini exchange or evidence remains blocked.

Response: ______________________________________________

Options: DRAFT / FINAL_FIELDS_COMPLETE_NOT_VERIFIED
