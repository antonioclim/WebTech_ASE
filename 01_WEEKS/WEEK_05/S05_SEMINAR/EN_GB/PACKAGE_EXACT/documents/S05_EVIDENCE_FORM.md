# S05 individual evidence form

Individual evidence form

S05 • In-memory Task API • Schema TW2026_S05_EVIDENCE 1.1.0

Use the form as a record, not a certificate

Complete the seven sections in order. Labels include the same field identifiers as evidence.html: 48 fields in total. Replace each response placeholder and expand the paragraphs as needed. There is no fixed page limit. Add labelled screenshots only when useful; a screenshot alone does not describe a reproducible input or command.

Enter a prediction before your chosen request. Save the original text, then add the actual observation and comparison. Do not fill a missing result with a reference value, model result or invented PASS. A known failure may be reported honestly and graded as incomplete.

Draft at minute 60; final submission later

A draft may record pending HTTP evidence, Gemini access or unfinished P01 work. Final submission requires the complete required sections, or a separately documented teacher decision where permitted. A selectable alternative is not authorisation. Full P02 and P03 implementations are optional; only the guided P02 observation is required.

The DOCX is editable but has no automatic validation or JavaScript save behaviour. The HTML form supplies structural validation, JSON drafts and a generated filename. There is no automatic DOCX-to-HTML import. Choose one working format; do not assume edits transfer between formats.

Evidence classes and privacy

Use SOURCE_REASONING, MODULE_MODEL, LOCAL_HTTP or REAL_BROWSER and identify the source. Actual CLI HTTP evidence is valid without a browser screenshot. The final evidence normally includes a real local HTTP lifecycle. Record only the bounded Gemini extract, not the whole conversation. Do not include tokens, passwords, cookies, institutional credentials or private datasets. Identification belongs in the private assessment submission, never a public repository.

Export and check

Save the editable original privately. In Word, use Save As or Export and select PDF. On macOS, the application’s PDF export or print-to-PDF route may be used. Open the resulting PDF and inspect every page, especially long evidence. The interface labels can vary by application; this document does not certify a file was saved.

TW2026_S05_GROUP_Surname_GivenName.pdf

Replace GROUP and name fields with your real values. Upload one PDF to the opened S05 Assignment. A draft save is not final submission: check the submitted status and the uploaded file. The teacher sets the deadline and site-specific size limit later.

1. Identity and observed environment

Record measurements, not the reference values copied from a guide. UNKNOWN needs a reason. Keep identity only in private assessment storage.

Surname  [surname]

Use the surname required by your course record.

[Enter your response here. Expand this paragraph as needed.]

Given name  [given]

Use your given name. Review the generated filename.

[Enter your response here. Expand this paragraph as needed.]

Group  [group]

Enter your actual teaching group, not an example value.

[Enter your response here. Expand this paragraph as needed.]

Operating system  [os]

Record the operating system actually used.

[Enter your response here. Expand this paragraph as needed.]

Terminal or HTTP client  [terminal]

Name the terminal or HTTP client used for the submitted evidence.

[Enter your response here. Expand this paragraph as needed.]

Observed Node version or UNKNOWN with reason  [node]

Copy node --version, or UNKNOWN: reason. Reference v24.21.0 is not a measurement.

[Enter your response here. Expand this paragraph as needed.]

Observed npm version or UNKNOWN with reason  [npm]

Copy npm --version, or UNKNOWN: reason. Reference 11.19.0 is not a measurement.

[Enter your response here. Expand this paragraph as needed.]

S05 package version and ID  [kit]

Enter S05 v1.1.0 and the content of PACKAGE_ID.txt. An identifier is not acceptance.

[Enter your response here. Expand this paragraph as needed.]

2. Prediction and public contract

Enter the original prediction before the chosen request. A later correction belongs beside the observation, not over the prediction.

Prior predicted response  [prediction]

Predict method, path, status, relevant headers and response shape for one chosen case before running it.

[Enter your response here. Expand this paragraph as needed.]

Initial repository state and fixture  [fixture]

Identify the two-task default seed or your explicit state, server port and whether this is the same instance.

[Enter your response here. Expand this paragraph as needed.]

Allowed edit file  [allowed_file]

The required edit is projects/p01/src/task-router.js. State any deviation honestly.

[Enter your response here. Expand this paragraph as needed.]

Chosen method and path  [method_path]

Give the exact method and path; use a returned ID for a created resource.

[Enter your response here. Expand this paragraph as needed.]

Status/header/body contract matrix  [matrix]

Include GET collection/member, POST, PATCH, DELETE and representative errors. Use concise rows.

[Enter your response here. Expand this paragraph as needed.]

Evidence class and source identifier  [source_class]

Start with LOCAL_HTTP, REAL_BROWSER, MODULE_MODEL or SOURCE_REASONING, then identify trace files/commands. Final evidence normally needs actual local HTTP. A separate alternative must start TEACHER_APPROVED_ALTERNATIVE and include AUTHORISATION: teacher/date/scope/reference.

[Enter your response here. Expand this paragraph as needed.]

3. Resource lifecycle and state

Use one dedicated server instance. Record its port and use the returned Location or ID. A reset is a separate experiment, not evidence that a failed write preserved state.

Actual create request and command  [create_request]

Give the command and JSON for your synthetic creation. No real personal task data.

[Enter your response here. Expand this paragraph as needed.]

Create status, headers and response excerpt  [create_response]

Record actual status, Location, Content-Type and the relevant body. State the observation class.

[Enter your response here. Expand this paragraph as needed.]

Returned Location/ID and follow-up GET  [follow_location]

Copy the returned Location and follow it. Do not assume the live ID is task-3.

[Enter your response here. Expand this paragraph as needed.]

PATCH observation and unspecified-field preservation  [patch_trace]

Update only completed, then compare title and ID with the created record. Note any discrepancy.

[Enter your response here. Expand this paragraph as needed.]

DELETE result and later missing-resource observation  [delete_trace]

Record DELETE and a later GET of the same ID. A failed DELETE is not an empty successful response.

[Enter your response here. Expand this paragraph as needed.]

204 content observation and measurement  [no_content]

Record status, body byte count/text and Content-Type. Do not call response.json() on an empty 204.

[Enter your response here. Expand this paragraph as needed.]

Fresh-instance/reset observation and its evidence class  [restart_evidence]

Contrast fresh repository instances or a separately identified server restart. MODULE_MODEL is valid for the supplied repository observation, not an HTTP claim.

[Enter your response here. Expand this paragraph as needed.]

State before and after a failed write  [state_comparison]

Compare complete before/after lists around a failed write in the same instance, not only their length.

[Enter your response here. Expand this paragraph as needed.]

4. Failure ownership and recovery

Separate media policy, router validation, JSON parsing, a missing task and an unknown route. Mark injected dependencies as such.

Unsupported media observation  [media_case]

Record an explicit text/plain request and its actual error. Do not silently rely on a client default.

[Enter your response here. Expand this paragraph as needed.]

Field/type validation observation  [body_case]

Use [] or an invalid field/type; give the actual code and the relevant pre/post state.

[Enter your response here. Expand this paragraph as needed.]

Parser-category observation and boundary  [parse_case]

Use malformed JSON and distinguish it from a valid primitive rejected by strict parsing. The primitive classification is a derived clarification until observed.

[Enter your response here. Expand this paragraph as needed.]

Missing task versus unknown route  [missing_case]

Compare /api/tasks/<absent-id> with /api/unknown and identify task_not_found versus not_found.

[Enter your response here. Expand this paragraph as needed.]

Unexpected-repository failure evidence and class  [repository_failure]

Use the supplied objective test or a dedicated injected-list failure server. State INJECTED_DEPENDENCY + LOCAL_HTTP, or pending; do not edit the repository.

[Enter your response here. Expand this paragraph as needed.]

Successful request after failure  [recovery]

Observe /health and, after a non-injected failure, the list on the same server. An intentionally broken list cannot prove list recovery.

[Enter your response here. Expand this paragraph as needed.]

Baseline/objective/regression/full-suite status  [check_summary]

Record baseline/objective/regression/full results, exact failing names and environment blocks. Never replace a dependency error with expected FAIL.

[Enter your response here. Expand this paragraph as needed.]

5. One independently checked Gemini claim

Do not paste complete conversations or credentials. A justified rejection has the same evidential value as a justified acceptance.

Actual Gemini interaction state  [gemini_state]

Choose ACTUAL_INTERACTION, PENDING or a separately authorised alternative. Selection cannot grant or authenticate approval.

Choose: PENDING / ACTUAL_INTERACTION / TEACHER_APPROVED_ALTERNATIVE

[Enter your response here. Expand this paragraph as needed.]

Relevant sanitised prompt  [gemini_prompt]

Record the relevant sanitised prompt. For an alternative include AUTHORISATION: teacher, date, scope and reference.

[Enter your response here. Expand this paragraph as needed.]

One claim reviewed  [gemini_claim]

One claim only. A synthetic practice text is not an actual Gemini answer.

[Enter your response here. Expand this paragraph as needed.]

Independent verification  [gemini_check]

Identify the independent command, test or source reasoning and the observed result.

[Enter your response here. Expand this paragraph as needed.]

ACCEPTED / REJECTED / PARTIALLY ACCEPTED / UNKNOWN  [gemini_verdict]

UNKNOWN is valid when the evidence does not settle the claim.

Choose: ACCEPTED / REJECTED / PARTIALLY ACCEPTED / UNKNOWN

[Enter your response here. Expand this paragraph as needed.]

Correction or justified none  [gemini_correction]

Give the minimal correction, or NONE with justification.

[Enter your response here. Expand this paragraph as needed.]

Limitation of the verification  [gemini_limit]

What does the check not establish? Separate model, HTTP and browser behaviour.

[Enter your response here. Expand this paragraph as needed.]

6. Ownership, guided observation and tests

P02 contributes a guided observation from C05. Its complete implementation is optional. Keep raw test results and the one-file diff.

Observation from the guided P02 slice  [guided_trace]

Name C05 G1–G4 or your recorded guided demonstration. Reading a supplied record is not a new execution.

[Enter your response here. Expand this paragraph as needed.]

When the displayed duration was measured  [timing_boundary]

Identify start, header commitment and completion. Explain why the logged duration is reused.

[Enter your response here. Expand this paragraph as needed.]

Ownership of one returned asynchronous result  [returned_promise]

Identify an async handler/returned promise and how its failure reaches the supplied boundary. No full router listing is required.

[Enter your response here. Expand this paragraph as needed.]

One-file diff summary  [edit_diff]

Summarise the sole required changed file. The helper checks protected files; it does not assess semantic correctness.

[Enter your response here. Expand this paragraph as needed.]

Named command/test excerpt and classification  [test_evidence]

Supply named excerpts and classify PASS, ASSERTION_FAIL, EXPECTED_INITIAL_ASSERTIONS or BLOCKED. Keep environment faults distinct.

[Enter your response here. Expand this paragraph as needed.]

What the checks do not establish  [overall_limit]

State untested cases and limits of your actual evidence, not a generic claim of confidence.

[Enter your response here. Expand this paragraph as needed.]

7. Stop state and declaration

At minute 60 save the true state. Final field completeness is not correctness, an authenticated approval or a Moodle receipt.

Browser used, not used (CLI evidence) or pending  [browser_state]

A real CLI HTTP trace is sufficient; choose NOT_USED_CLI_EVIDENCE when appropriate.

Choose: NOT_USED_CLI_EVIDENCE / OBSERVED / PENDING / TEACHER_APPROVED_ALTERNATIVE

[Enter your response here. Expand this paragraph as needed.]

Current implementation/submission state  [exit_state]

FIELD_COMPLETE does not mean tests pass. Choose the truthful implementation state.

Choose: IMPLEMENTATION_IN_PROGRESS / IMPLEMENTED_CHECKS_PENDING / KNOWN_ASSERTIONS_REMAIN / REQUIRED_CHECKS_PASSED / ENVIRONMENT_BLOCKED

[Enter your response here. Expand this paragraph as needed.]

Next smallest unresolved check or justified none  [next_check]

State the next minimal discriminating check, or NONE with a reason.

[Enter your response here. Expand this paragraph as needed.]

Mechanism-based reflection  [reflection]

Explain one boundary ownership mistake you avoided or corrected.

[Enter your response here. Expand this paragraph as needed.]

Remaining uncertainty  [uncertainty]

Describe one remaining uncertainty and the evidence needed to resolve it.

[Enter your response here. Expand this paragraph as needed.]

Truthful individual work and evidence declaration  [declaration]

I confirm that the work and observations are individually attributed, evidence classes are truthful and any imported draft has been reviewed. This is not an authenticated signature.

[ ] I make the individual-work and evidence declaration above. Confirm only after review.
