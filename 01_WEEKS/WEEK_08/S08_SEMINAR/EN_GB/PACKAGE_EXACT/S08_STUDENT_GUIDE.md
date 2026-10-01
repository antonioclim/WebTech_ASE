# S08 — React State and Effect Evidence

**Individual seminar guide · Student edition · v1.1.0 · WIP/PREVIEW**

The question for this seminar is not “Does the page look similar?” It is: **Who owns each value, which event changes it and which asynchronous result is still allowed to publish?** You will implement a reading queue and diagnose a search panel using explicit inputs and observed outcomes.

## 1. Your obligations and the minute-60 boundary

P01, Vanilla-to-React Reading Queue, is the full central implementation. P03, State and Effect Debugging, is required individual portfolio work. P02, Component Decomposition, is optional reinforcement. Its completion is not needed for the compulsory marks. The conceptual knowledge needed for P03 comes from C08; implementing the entire optional dashboard is not a prerequisite.

The meeting contains **60 minutes of content**. Stop at minute 60. The other 30 minutes in the timetable are not overflow. The canonical estimate for P01 alone is 55–65 minutes and for P03 it is 45–60 minutes. These are source estimates, not measured completion times for your class. The 18-minute P01 segment below is a start, not a promise to finish every requirement, test and form in class.

| Time | Individual work and evidence |
| --- | --- |
| 00–05 | Record the package, actual environment and initial prediction. No installation is hidden in this slot. |
| 05–12 | Map vanilla data, event, rendering and persistence responsibilities to React. Fix one common fixture. |
| 12–30 | Implement part of P01 in the permitted file. Preserve a brief event/state trace as you work. |
| 30–39 | Check a transition and a persistence/filter claim. Record actual output or a precise block. |
| 39–45 | Obtain one bounded, sanitised Gemini claim about your work. No generated complete solution. |
| 45–50 | Check the claim independently, give a verdict, correct it and name a remaining limit. |
| 50–55 | Read the required P03 portfolio route and predict one lifecycle timeline. |
| 55–60 | Save an honest draft, list pending work and stop. A draft is not a final submission. |

Complete unfinished P01 and the required P03 portfolio after the meeting before **[TO BE SET BY TEACHER]**. Do not invent a deadline or conceal unfinished checks behind the label UNKNOWN. An actual unknown claim may be honestly reported while required work still remains incomplete.

<!--pagebreak-->

## 2. Start safely: files, environment and edit boundaries

Extract the public ZIP into a new short local directory, for example `D:\WT08S`. Open `index.html` for the offline guide and `form.html` for the evidence form. These pages do not install or execute the React projects. A Vite project's `index.html` is not an equivalent offline application when opened as a file.

| Strand | Project directory | Assessed edits |
| --- | --- | --- |
| P01 — required | `projects/p01/student` | `src/App.jsx` only |
| P03 — required | `projects/p03/student` | `src/SearchPanel.jsx` only |
| P02 — optional | `optional/p02/student` | `src/WorkshopDashboard.jsx` and the five named child components |

Keep entry points, CSS, fixtures, package files, lockfiles, canonical tests and preserved evidence unchanged. There are separately labelled teaching previews and supplementary checks. Their presence is not permission to move a preview entry point into an assessed tree. The public package contains no completed assessed React implementation.

Record the actual `node --version` and `npm --version` where execution is available. The project's reference pair is Node.js v24.21.0/npm 11.19.0. These pins have not been installed or qualified by this delivery. Dependency versions and lockfiles are preserved, not silently upgraded. A missing dependency, parser failure, crash or runtime mismatch is a separate environment problem, not an expected pedagogical failure.

The following commands assume the teacher has already provided the project-local dependencies. They are learning commands, not an authorisation to install anything. Run them in the indicated student project, one at a time, and keep their actual output:

```text
npm run test:baseline
npm run test:objective
npm run test:regression
npm run build
```

For a development session on a provisioned machine, run `npm run dev`, open the local address actually printed by Vite and stop that process with Ctrl+C when finished. Do not guess the port, bind a public interface or use `npx` as an implicit download route. A browser window is a new evidence class, not a consequence of a successful build.

The optional additional suite has a distinct command and report. It does not replace the canonical checks:

```text
node node_modules/vitest/vitest.mjs run --config s08_checks/config.js
```

From the **package root**, `node tools/verify-boundary.mjs p01` (or p03/p02) checks paths and preserved bytes only. It does not assess the correctness of your implementation. See `RUN_AND_EVIDENCE.md` for result classification and `TEACHING_PREVIEWS.md` for the separate launchers.

<!--pagebreak-->

## 3. P01: implement the whole contract

Read `projects/p01/CONTRACT.md` before editing. The assessed component receives `storage`, `initialItems` and `createItemId`. Trace one prop down and one intended action up. Distinguish authoritative item state from a filter and from render-derived counts.

Build `ReadingQueue` from `QueueForm`, `QueueFilter`, `QueueList` and `QueueItem`, with explicit data and callback props. The initial item state must use valid stored items when present. Absent, invalid JSON or an invalid item shape must fall back to the supplied initial items as a whole. A valid item has non-empty string `id` and `title` plus boolean `read`; do not infer uniqueness from shape validation alone.

Use a controlled title input. Trim on submission, ignore blank titles, generate an ID through the supplied factory, add a new unread item and clear the input on success. Keep the updater pure: reserve an event-owned ID before evaluating the state transition. Toggle and remove immutably. Render stable keys from item IDs, not positions. Preserve the supplied labels, button names, status messages, keyboard operation and meaningful empty states.

All, remaining and read filters show the correct visible counts. Compute visible items and counts from the authoritative data; do not create a second state/effect copy of values you can derive during rendering. Synchronise the **complete item array**, not only the visible subset, to the logical `reading-queue` storage key in the owned effect. A filter-only action must not write storage.

Do not use manual DOM queries, `innerHTML`, manual listener installation or mutation of state arrays. Do not add a router, server, global state package, reducer framework or other dependency.

### An individual observation sequence

Before running anything, record your fixture, expected state and expected visible result. Use the same two items on both sides: `{id:'a', title:'HTTP', read:false}` and `{id:'b', title:'SQLite', read:true}`. Record storage initial contents separately. Do not equate different initial pages merely because each is a reading queue.

Perform add, toggle, remove and filter changes one by one. For each action, record the input, the next complete item state, visible labels/counts and a short evidence locator. Include a trimmed title, a blank title, one empty filter and valid/invalid storage. Compare the same bounded inputs rather than claiming universal vanilla–React equivalence. Interpreting a title as markup is not an objective to reproduce.

To examine persistence, distinguish mount-time writes from later writes. Record the count before and after a **filter-only** action. Do not claim “one expression, therefore one global call”: development checks and mounting conditions matter. When changing an effect dependency for an experiment, record the exact temporary edit, compare the write count and restore your valid assessed version.

<!--pagebreak-->

## 4. Identity and parity: a separate preview, not a hidden repair

The preserved P01 entry point resets its counter on module initialisation. After a stored item uses the same ID, a later add can collide. This is a supplied-entry limitation, not permission to edit `student/src/main.jsx`. The canonical tree and tests remain unchanged.

`teaching/p01-preview` is a separate launcher. Its assessed `App.jsx` starts incomplete. Copy only **your** current `App.jsx` into its matching `src` directory for an observation, using File Explorer or the editor. Do not copy the preview entry, adapters or storage helpers back into the assessed project. Dependencies must have been provided separately for the preview too.

The preview gives React and vanilla separate storage namespaces and the same fixture. It reserves IDs against the current stored array and the IDs allocated by that factory instance. It rejects existing duplicate IDs rather than silently repairing them. This is not a cross-tab transaction, a globally unique distributed ID service or a promise never to reuse a deleted historical ID. Storage errors remain visible.

For an actual add-after-reload witness, record: namespace and starting array; the added item and ID; the saved array; a real reload; the next added ID; and the final array with uniqueness checked. This delivery tested the helper functions, not a real browser reload. Use the preview's own `window.S08Preview` inspection controls only for the named teaching namespace. Resetting a preview removes its teaching data, so export evidence first. It does not clear other applications' storage.

### What a parity claim may say

A defensible statement names the fixture, the sequence and the compared observations: “On this valid two-item fixture, both implementations produced these states and counts.” It does not claim identical invalid-data policy, identical mount-time persistence or accessibility certification. A model trace or source reading must be labelled as such; it is not a screenshot or a React execution log.

## 5. Required P03 portfolio

Use `P03_PORTFOLIO.md` and `projects/p03/CONTRACT.md`. Predict the result of an old request resolving after a newer one, then diagnose the supplied weak panel. Implement only `src/SearchPanel.jsx`. Keep weak evidence and every canonical test unchanged.

The target must own query and request state, derive displayed results, debounce eligible input, clear the previous timer, pass an AbortController signal and stop stale settlement from publishing. It must handle short queries and unmount, show the exact accessible states and log unexpected error objects without displaying their internal messages. Omitting an error callback must not introduce a fresh dependency on every render.

The original weak starter omits `signal`, while its original demonstration adapter requires it. That TypeError is a distinct supplied-adapter discrepancy. `teaching/p03-preview` provides a compatible, explicitly separate adapter but **does not repair the panel's lifecycle**. Repeated requests or wrong outputs in that weak preview are possible; stop the local session if it repeats work. The canonical deterministic fake remains the basis of baseline reasoning. See the portfolio guide for three named guard conditions.

<!--pagebreak-->

## 6. Gemini is a claim source, not the marking authority

First work individually and record a prediction and an observation. Ask Gemini to review one small, sanitised ownership or lifecycle claim tied to your code or trace. Do not request the complete assessed implementation, upload institutional data, send API keys, cookies or credentials or attach a full private conversation.

A suitable prompt structure is:

> Review only this ownership or effect claim against the small code excerpt and trace below. Identify one condition under which the claim could fail. Do not implement the complete exercise or invent executed tests. Distinguish supplied evidence from inference and propose one independent check.

Replace the placeholders with your actual material and keep only the relevant prompt and response extract. Verify the returned claim using your source contract, an independently designed check or a recorded actual trace. State ACCEPTED, REJECTED, PARTIALLY_ACCEPTED or UNKNOWN, then give the correction and limit. UNKNOWN is an honest verdict about the claim, not automatic completion of pending practical work.

When Gemini is unavailable, record PENDING and retain a draft. A synthetic sample may be used for practice only under the label SYNTHETIC_ILLUSTRATION. It is not an actual exchange. A different final route requires prior explicit teacher authorisation, with its reference and replacement evidence; selecting a form option does not grant that authorisation.

## 7. One form, one readable PDF, one private Assignment

The HTML form and DOCX evidence form have the same **40 fields in seven sections**. Use one route as your working master. The form includes both full P01 and required P03; it is not a second assignment for C08. The standard final payload is one PDF, not a second project ZIP or a complete AI conversation.

In `form.html`, complete `GROUP | Surname | GivenName` to propose `TW2026_S08_GROUP_Surname_GivenName.pdf`. Save incomplete work with **Export JSON** or, optionally, a local browser draft. Autosave is off by default. Storage failure is displayed; JSON is the portable backup. Import accepts only the declared version and field types, resets the declaration and PDF review state and marks the draft IMPORTED_UNVERIFIED_DRAFT. Imported text is not a new observation.

At minute 60 use **Print core draft**, inspect the print preview and save a PDF only when the browser actually offers that route. For final preparation, complete both required strands and the actual bounded Gemini review, then use **Check final fields**. This checks structure and recorded consistency, not truth or test execution. Standard actual-result fields begin `ACTUAL_RECORDED: PASS` followed by the command, result and evidence locator; do not copy that prefix over an unexecuted or failing test.

For P03's check summary use the actual `BASELINE: PASS`, `OBJECTIVE: PASS`, `REGRESSION: PASS` and `BUILD: PASS` categories, prefixed `ACTUAL_RECORDED`. Record named failures honestly and keep a draft when required completion is not achieved. The additional suite is reported separately, not hidden in these categories.

<!--pagebreak-->

## 8. Export, check and submit without inventing a receipt

Use **Print final candidate** only after field validation. Long text is included as ordinary wrapped print text, not clipped to a textarea. After the print dialog, check that the file actually exists, opens, contains all sections and has readable code, locators and page breaks. A button press is not evidence that a PDF was saved.

The HTML route is text-only: it does not import or embed screenshot images. To include screenshots, use the DOCX route, insert the actual images near the relevant field, add captions/locators and export one readable PDF. Do not write “screenshot attached” when the image is absent. The DOCX is not an automatic validator. Apply the same final checklist manually.

Changing the evidence invalidates your earlier declaration and earlier PDF review. Recheck the new PDF, not a previously saved version. Exported files are not removed when the form is cleared; manage your own backups and personal data responsibly.

In the teacher-designated private S08 Assignment, upload the single PDF, save the upload if required by that site and complete its explicit submission step. Review the displayed submission state. The Assignment URL, availability and deadline remain **[TO BE SET BY TEACHER]**. Interface labels depend on the institutional configuration; this package has not accessed or configured your Moodle site. A local PDF and “draft saved” are not proof of final Moodle submission.

### Final evidence checklist

Both required strands have a stated edit boundary, completed implementation and named actual checks. The fixture, prediction, transition/persistence/identity evidence and P03 timing/error evidence have readable locators. The Gemini prompt/claim is an actual extract followed by your independent check, verdict, correction and limitation. Pending required work is not concealed. Your declaration is current. The PDF contains all seven sections and any images actually referenced. No P02 completion or second C08 submission is required.

## 9. Source and qualification note

This guide is a derived S08 route based on U08's three project specifications, the phase-1 architecture and its recorded corrections. Canonical student project files and lockfiles are preserved and inventoried in `CANONICAL_SOURCES.json`. `PROJECT_BASELINES.json` declares the distributed assessed-tree baseline, including separate additional checks. No canonical reference solution is public.

Local production checks are not React/Vite/browser qualification. Source models, supplementary test source, actual test output, browser observations, a saved PDF and a Moodle receipt remain distinct. Read `QUALIFICATION.md` and `SOURCES.md` for the current scope and primary documentation.
