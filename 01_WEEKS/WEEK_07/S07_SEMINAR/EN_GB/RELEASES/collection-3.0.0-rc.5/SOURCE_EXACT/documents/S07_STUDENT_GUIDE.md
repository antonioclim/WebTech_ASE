# S07 student guide

## The booking claim

P02 Transactional Booking is your only required complete implementation. A booking must leave seat inventory, the Booking record and its BookingAudit consistent. Edit only `projects/p02/src/book-seats.js`. Keep the unsafe comparator, models, app, tests and locks unchanged. The complete contract and exact commands are in `guide.html` and `contracts/P02.html`.

Before executing, identify the fresh fixture and predict success and controlled-failure outcomes. The supplied Event starts with five available seats. Predict the three components for a request for two seats; do not overwrite a wrong prediction after seeing the result. An expected value read from a contract is SOURCE_REASONING, not an observed database result.

## The 60-minute route

Minutes 0–6: prediction and invariant. Minutes 6–12: actual prerequisites and unsafe comparison. Minutes 12–40: individual implementation. Minutes 40–49: success, failure and recovery. Minutes 49–55: bounded Gemini review. Minutes 55–60: save the draft and identify the ADR. The original project estimate is 55–65 minutes by itself; unfinished work continues before the later deadline, not in a hidden extension to the meeting.

## Prepare without inventing an environment

Extract the ZIP into a short new folder and open `index.html`. The teaching shell and form open directly. The actual application needs prepared local dependencies and a native SQLite driver. Record `node --version`, `npm --version` and `node tools/project.mjs preflight p02`. Missing dependencies or native loading problems are prerequisite blocks, not failed student objectives. Do not install globally or regenerate lockfiles to make a check appear green. The detailed Windows and macOS/Linux guide gives exact paths and stop conditions.

## Implementation and observations

Cheap seat validation precedes the managed transaction. Account for event lookup, duplicate lookup, event save, booking creation and audit creation. Await the supplied callback between the two creates. Preserve the specified domain errors, precedence and unexpected error identity. Do not add raw SQL, a compensating write or a process-local mutex.

Use the separate success, callback, audit and domains observers when the genuine stack is available. Each starts a fresh isolated fixture; failed attempts are followed by an independent successful booking on the same database. Record before/after state, the exact error and the five-operation transaction trace. The old four-method canonical spy can pass with undefined transaction identities, so its green result is not sufficient evidence. The full initial source-derived signature remains source-derived until genuinely executed.

The HTTP probe records status, Location and body. It does not prove internal row state. Do not follow Location as a supplied GET booking-member endpoint: this app has no such route. Source-linked VM or DOM models are not SQL, physical rollback or native browser evidence. Sequential recovery is not proof of every concurrent schedule or crash durability.

## One claim and one decision record

Use Gemini to review one sanitised claim, not to write the complete assessed function. Keep the relevant prompt, claim, independent check, verdict, correction and limitation. UNKNOWN can be an honest conclusion about a claim; it cannot turn an unexecuted required observation into an executed one. Synthetic offline practice is labelled and is not a real conversation.

Complete the required ADR after the meeting: context, resource identity, alternatives, decision, transaction boundary, repeated-client table, evidence and consequences. Around 300–500 words plus a compact table is a suggested scope. Use a provisional course context when necessary and state when the decision should be revisited. Full P01/P03 implementations are optional.

## Save and submit

The HTML and DOCX evidence forms share 55 fields in seven sections. Export JSON as the portable draft and inspect any browser storage warning. Import resets the declaration and does not rerun experiments. A complete form checks declared structure only. It cannot authenticate observations or teacher permission.

Save an honest draft at minute 60. Complete remaining P02, evidence and ADR work before the configured deadline. Export one `TW2026_S07_GROUP_Surname_GivenName.pdf`, inspect every page and submit only that PDF through the Moodle assignment. Check the final submission status; saving a draft upload is not final submission. Keep credentials, personal third-party data and full conversations out of the form. There is no second C07 Assignment.
