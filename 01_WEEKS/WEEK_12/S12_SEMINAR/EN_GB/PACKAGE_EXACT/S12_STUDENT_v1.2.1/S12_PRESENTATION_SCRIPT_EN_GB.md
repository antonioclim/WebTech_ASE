# S12 — Classroom script EN-GB

v1.2.1 FINAL_LOCAL — content and packaging only. Eight content blocks, maximum 60 minutes. Reserve 30 minutes for administration. The public presentation is distinct from the operational guide. Do not project private keys or console.

## 00–05 — Choose an honest execution lane

SAY TO STUDENTS

Open the extracted S12_STUDENT_v1.2.1 folder, check its package identity then run the strict environment check. Record the actual result.

Question: What observation would make you stop before calling this a qualified run?

Wait 30 seconds for individual writing before the conceptual reveal.

Conceptual reveal: An identity failure, an unsafe root, a missing runtime or a version mismatch blocks the strict run. A source/model activity stays labelled as such.

Evidence fields: student_code, package_id, actual_node, actual_npm, execution_class, environment_limit.

## 05–12 — Predict before running

SAY TO STUDENTS

Write two falsifiable predictions about registration before send and the resources remaining after one request settles. Keep the original prediction.

Question: Can a fake transport deliver a reply before send returns?

Wait 45 seconds for individual writing before the conceptual reveal.

Conceptual reveal: Yes. The pending entry must already exist when send invokes a synchronous callback. Settling a request removes its entry, timer and abort handler; dispatcher subscriptions remain until disposal.

Evidence fields: pending_before_send_prediction, terminal_paths_prediction, cleanup_invariant.

## 12–30 — Implement one assessed file

SAY TO STUDENTS

Edit only projects/p03/student/src/request-dispatcher.mjs. Use the active contract and supplied fake transport. Save before checking. List unfinished obligations.

Question: Who owns the decision to settle this promise, and where will a second terminal event be ignored?

Wait 45 seconds for individual writing before the conceptual reveal.

Conceptual reveal: One terminal operation takes the pending entry once, removes its per-request resources then resolves or rejects. Later paths find no owned entry. This is a mechanism to implement, not a complete solution.

Evidence fields: p03_changed_path, p03_diff_locator, p03_unresolved_work.

## 30–39 — Observe the seven named cases

SAY TO STUDENTS

Use the bounded dependency-free unit lane. Record E01–E06 with exact test/log locators and resource owners. Prepare the E07 source/model trace.

Question: Three callers finish in r3, r1, r2 order. Does the first arrival belong to caller one?

Wait 30 seconds for individual writing before the conceptual reveal.

Conceptual reveal: The request ID chooses the caller. Arrival position does not. State the observed ID-to-caller mapping rather than just listing three results.

Evidence fields: p03_baseline_results, p03_objective_results, p03_regression_results, p03_reversed_order_trace, p03_sync_reply_trace, p03_timeout_trace, p03_abort_trace, p03_close_trace, p03_dispose_trace, p03_zero_pending, p03_zero_listeners_timers.

## 39–45 — Ask for one bounded critique

SAY TO STUDENTS

Use the supplied Gemini prompt and a minimal sanitised excerpt. Send once, wait for the complete response then preserve one relevant actual claim. If blocked, save a truthful draft.

Question: Which part of the claim pendingCount equals zero proves all work is cleaned up could you test independently?

Wait 30 seconds for individual writing before the conceptual reveal.

Conceptual reveal: Choose a named resource owner. Zero pending alone cannot establish the state of adapter listeners, the socket, retained IDs or remote execution.

Evidence fields: gemini_prompt, gemini_response_excerpt, gemini_claim.

## 45–50 — Check the claim yourself

SAY TO STUDENTS

Use a test, source locator or labelled model independent of the generated response. Give a verdict, corrected claim and explicit limit.

Question: What would change your verdict rather than merely confirm what you hoped to find?

Wait 30 seconds for individual writing before the conceptual reveal.

Conceptual reveal: Specify a falsifying observation and a check that can produce it. Unknown is appropriate when the relevant boundary has not been observed.

Evidence fields: gemini_independent_check, gemini_verdict_correction, evidence_class_limits.

## 50–55 — Trace acceptance to the right recipient

SAY TO STUDENTS

Individually annotate the required P01 source/model trace: HTTP 202, registration, principal/connection/request identity, targeted result and cleanup limits. P02 remains optional.

Question: An export request is accepted. Can the accountant book its final total from the 202 response?

Wait 30 seconds for individual writing before the conceptual reveal.

Conceptual reveal: Acceptance is not completed calculation. Later completion must be matched to the requesting principal and connection. A wrong recipient creates both a decision error and a disclosure risk.

Evidence fields: accepted_owner_map, transport_choice, connection_identity, p01_demo_scope, p01_http_acceptance, p01_ws_registration, p01_targeted_result, p01_identity_binding, p01_cleanup_observation, p01_demo_limit, p02_optional_status.

## 55–60 — Save a truthful draft and stop

SAY TO STUDENTS

Save the draft and an exit ticket with outstanding required work. Review the PDF route without inventing completion. Stop all content at minute 60.

Question: Name the state that must exist before send and one thing a local abort does not prove.

Wait 30 seconds for individual writing before the conceptual reveal.

Conceptual reveal: Pending ownership must exist before send. Local promise rejection does not prove that remote work was cancelled. Mark unresolved required work and keep draft status.

Evidence fields: cross_protocol_reflection, next_work, privacy_redaction, declaration_truthful, pdf_review_status, submission_status, final_status.

## Qualification boundary

The source estimates 55–65 minutes for full P03 work; the 18-minute coding segment starts that task. Real JavaScript with a fake transport is not real WebSocket evidence. Runtime, native platform, real ws, live Gemini/Moodle and novice timing remain separately qualified. An actual block stays an honest draft under the teacher’s existing policy. One reviewed PDF uses TW2026_S12_CODE.pdf. No deadline, penalty or pass threshold is invented.
