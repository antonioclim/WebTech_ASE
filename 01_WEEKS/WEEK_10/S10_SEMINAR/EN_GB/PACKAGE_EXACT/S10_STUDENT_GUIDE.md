# S10 — Shared State and a Required State ADR

## 1. What you must complete

**WIP/PREVIEW · individual work · 60 content minutes.** P01 Shared Workshop State is the full central implementation. Complete its single-file provider/reducer contract and record your own observations. P03 contributes a required state architecture decision record (ADR) for your semester project. P02 Redux Toolkit Notification Center is optional advanced work. Implementing the complete P03 comparator is optional follow-up, not a hidden condition for completing the ADR.

The source estimate for P01 alone is 50–60 minutes. The class gives you an 18-minute implementation segment, not a guarantee that the entire project, observations, Gemini review and PDF will fit inside the meeting. At minute 60, STOP and retain a truthful draft. Finish the required P01 and ADR before the actual deadline set by the teacher. The other 30 reserved minutes are not overflow. No date is created by this package.

One private S10 Moodle Assignment receives one final PDF combining P01 evidence, the ADR, bounded Gemini critique and reflection. There is no C10 Assignment or separate P03 upload.

## 2. Open the correct material and record identity

Extract the student ZIP once into a new short local directory. Open index.html for the lesson navigation, seminar.html for the screen sequence and form.html for the individual text-only evidence record. Keep the ZIP, SHA256SUMS.txt and PACKAGE_ID.txt. Do not extract over an old edited project.

P01 is under projects/p01/student. The only assessed edit is src/state/workshop-state.jsx. P02 is under optional/p02/student; its permitted edit is src/store/notifications-slice.js. The comparison workbench is under adr/p03/student; its optional implementation edit is src/decision/compare-architectures.js. Preserve tests, fixtures, consumers, styles, entries, evidence and package/lock files in all routes.

Historical README and spec copies remain exact, including timing, validation and broad AI prompts. Read SOURCE_NOTES.md for current teaching distinctions. A README called “Reference” inside the student tree does not turn an inert starter into the completed answer. Historical build/browser statements are not new evidence.

## 3. Environment and named checks

Actual application work assumes an already provisioned environment approved for the course. This package contains no node_modules and does not authorise an installation. The prescribed pair is Node 24.21.0/npm 11.19.0; local authoring probes used Node 22.16.0/npm 10.9.2. Record your real versions and the gap, rather than renaming your environment to match the contract. An absent command or dependency is an environment block, not the intended objective failure.

In a terminal opened inside projects/p01/student, after separate provisioning is complete, the existing local scripts are:

```text
node --version
npm --version
npm run test:baseline
npm run test:objective
npm run test:regression
npm run build
```

Baseline characterises fixtures and the reduced save/count witness. Objective checks exercise the shared-state boundary. Regression checks cover the separate local controls and source limits. The inert starter is expected by source analysis to fail provider objectives; a parser error, missing command, missing dependency, timeout, crash or reporter failure is a different incident. Identify the actual failing check and message; do not describe every red output as “expected”. The canonical P01 suite contains nine cases: two baseline, five objective and two regression. No outcome for your machine is pre-recorded here.

For the new supplementary checks, the local executable is explicit; this does not download a runner:

```text
node node_modules/vitest/vitest.mjs run --config s10_checks/config.js
```

These supplementary checks are separate from the canonical suite. Their React/Redux Toolkit execution was not performed during package production. Keep original test output and supplemental output distinct. To inspect the live P01 UI under the separately provisioned conditions, run npm run dev in the same directory and open the local URL actually printed. Stop that development process when finished. A build passing does not establish native browser behaviour.

From the public package root, this read-only command checks the project boundary without running its implementation:

```text
node tools/verify-boundary.mjs p01
```

BOUNDARY_ONLY_PASS means that only permitted paths differ. The solution can still be wrong or incomplete. Only root node_modules and dist are excluded as generated content; their contents are not qualified. The checker refuses symbolic links and unsafe or unexpected files. Do not change its manifest to make an invalid diff pass.

## 4. The 60-minute individual route

| Interval | Your work | Record |
| --- | --- | --- |
| 00–05 | Identity and prediction | Package, source, actual environment and evidence class |
| 05–12 | State inventory | Owners, consumers, lifetimes and derivation |
| 12–30 | P01 implementation segment | One-file progress and unresolved work |
| 30–39 | Independent observations | Named transition and UI/isolation witnesses |
| 39–45 | Bounded actual Gemini critique | Relevant prompt and response excerpt |
| 45–50 | Independent check | One of the four defined verdicts, correction and limit |
| 50–55 | Required ADR hand-off | Constraints, alternatives, assumptions and sensitivity |
| 55–60 | Draft and STOP | Save current evidence and unfinished obligations |

The four verdicts are ACCEPTED, REJECTED, PARTIALLY ACCEPTED and UNKNOWN. They concern the selected claim. UNKNOWN is not a passing grade for an unfinished program.

## 5. P01 — implement the full narrow boundary

First inspect the supplied consumers. WorkshopWorkspace owns search and passes it to Toolbar. SessionCard owns its own open/closed disclosure. The shared boundary is only track and savedIds. Visible sessions and counts are derived. Complete the ownership inventory before changing code; do not move local values into the only editable file simply to make access convenient.

Implement the exports expected by the existing consumers: WorkshopProvider, useWorkshopState, useWorkshopDispatch and workshopReducer. Use separate contexts for state and dispatch and provider-owned useReducer state. Initialise a fresh state value from the optional seed, with the documented defaults and a cloned, deduplicated saved-ID array. Retain the limited canonical seed domain; this task does not ask for universal input sanitisation, event identifiers or persistence.

The reducer handles the named track/selected, session/toggled and saved/cleared actions. Preserve input objects and unrelated values. Re-selecting the same track and clearing an already empty saved list are no-ops whose object identity should be recorded. Two toggles for one session are two deliberate events that undo each other, not evidence of duplicate-event suppression. Unsupported actions should produce the focused developer-facing error prescribed by the source contract.

Both hooks need their own missing-provider diagnostic. Test them separately; the canonical “hooks” check directly calls only the state hook. A pure function clone check is not a mounted-provider isolation check. Avoid effects for synchronising derived data, browser storage, mutable singletons, Redux or new dependencies in P01. Keep the exact fixture, input domain and allowed file unchanged.

The supplied prop-drilled evidence is a reduced save/count witness. Compare only that shared behaviour with it; obtain the rest of the target requirements from the specification and consumers. It is not an instrumented deep prop chain or a complete performance/parity benchmark.

## 6. Experiments: prediction, action, observation and limit

**Transition witness.** Before executing, write the precise seed and action. Record previous state, action, next state, input immutability and the named invariant. Include repeated-track and empty-clear reference checks. Label a source function/model as such; do not claim that it mounted React. Do not report output you have not actually obtained.

**Shared consumers.** In an actual mounted application, select a track, save one visible session and clear the summary. Record which toolbar/card/summary views changed and the exact source. Keep the corresponding screenshot or trace in the same final document. The fixture has stable IDs; a changed label alone does not establish correct shared ownership.

**Independent providers.** Use the supplied two-provider check in the qualified test environment or a separately identified actual UI witness. Record one action in one instance and the independent other instance. Two fresh arrays produced by a normaliser cannot replace this evidence.

**Private lifetime.** Type search text, open a card and dispatch an unrelated shared action while that card remains mounted. Record whether local values remain. Separately identify what would happen when filtering removes and remounts the card; do not extrapolate the first check into persistence through unmount. The separate contexts distinguish subscription boundaries, not a guaranteed total render-count improvement.

Record exact checks and evidence locators in seed_observation, transition_observation, noop_observation, shared_observation, isolation_observation, private_state_observation and named_checks. Keep failure classes and pending observations visible.

## 7. Required ADR, not mandatory comparator code

Open REQUIRED_STATE_ADR.html and complete the D-section fields of the evidence form. Use a concrete feature in your semester project. Name authoritative values, real consumers, lifetime and coordination requirements before selecting a library. Compare applicable alternatives; reject a candidate that cannot satisfy a required capability before calculating costs.

The supplied workbench has two complete preference implementations and an unavailable comparator starter. Its evidence.js values are fixed descriptors and assumed weights, not freshly measured instrumentation. An unavailable result is not an architectural conclusion. A missing capability in these two implementations is not proof that no Context or lifted-state design could ever supply it.

Your required ADR can use a manually reasoned table. The complete comparison algorithm and the optional notification slice are not additional S10 grading conditions. Include one sensitivity change and a legitimate tie or no-eligible-candidate case. Explain equal costs honestly; an explicit tie-break does not make the other candidate more expensive.

## 8. Bounded Gemini critique and independent verdict

Use a small sanitised excerpt from your own work and one checkable claim. Do not upload teacher solutions, credentials or a full account export. A suitable prompt is:

```text
I am evaluating one state-placement or transition claim for S10.
My claim: [one falsifiable statement].
Relevant excerpt and source identity: [minimum sanitised content].
Observed evidence and its class: [actual trace, source or model].
Identify one counterexample or missing assumption. Do not generate
my complete provider, slice or architecture comparator. Distinguish
what the evidence supports from what needs an independent test.
```

Keep the relevant actual prompt and answer excerpt only. Independently check the claim against a source contract, named test or real observation. Record the verdict, correction and remaining limit. Repeating the question to Gemini is not an independent check. No exchange supplied in this package impersonates a real Gemini conversation.

The standard final route requires the genuine bounded exchange. A separately authorised prior alternative needs the teacher, date, scope, reference and replacement evidence. The form can record that statement but cannot grant or authenticate the authorisation. Without it, keep the activity pending rather than fabricate dialogue.

## 9. Produce one readable PDF

Use form.html for text-only capture or S10_EVIDENCE_FORM.docx for an editable record with genuine screenshots. Both routes use the same 45 identifiers. In DOCX, insert the actual image or log excerpt, add a caption/locator and refer to it in evidence_index. Merely writing a filename is not inserting the evidence.

The HTML form checks schema and completeness, not truth. It supports JSON backup/import, optional browser storage and full-text printing. Import resets the declaration, PDF-review and submission state. An imported draft is not a re-executed observation. Review every field. If storage is unavailable, the error is visible; export JSON and confirm the saved file. Exporting requests a download, not a receipt.

A final structural check requires COMPLETE_RECORDED for P01 and the ADR, the standard actual evidence or separately authorised replacement, and REQUIRED: NONE with a truthful explanation of any separate optional work. FINAL_FIELDS_COMPLETE_NOT_VERIFIED does not certify the program, evidence, teacher approval or a saved PDF. Ordinary print remains draft unless final fields were checked. After printing, inspect every page of the actual local PDF, including long fields and screenshots.

The proposed name is TW2026_S10_GROUP_STUDENTREF.pdf. In the private S10 Moodle activity actually assigned by the teacher, attach that one reviewed PDF and check the real submission status/receipt. Deadline, availability, file-size limit and attempt policy are configured separately, not invented here. Never upload the teacher package or a JSON draft as the required final PDF.

## 10. Completion and open boundaries

Required completion is the full P01 implementation with identified checks/observations, the capstone state ADR, genuine bounded critique and independent verification, a readable evidence index and an honest declaration in one final PDF. Optional P02 and comparator progress may be NOT_STARTED. Read QUALIFICATION.md for the unclosed runtime, React/Redux Toolkit, build, browser, Word/platform and Moodle gates. STOP at minute 60 preserves a draft; it does not award completion.
