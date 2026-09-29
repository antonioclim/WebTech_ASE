# S03 — start here

Version 1.1.0. Status: PRODUCED_PENDING_DEFERRED_ACCEPTANCE.

Open index.html after extracting the whole ZIP. The root guide.html is the operational authority for this derived kit. Canonical files are preserved, including historical README instructions. Do not run installations for these dependency-free exercises.

Public: student material only. This package is not a published Week 03 release.

## Work on a copy, not inside the ZIP

Extract the student ZIP to a short writable folder. Keep an untouched ZIP as the baseline. Open index.html in a browser. Open the extracted folder in your editor so that projects, tools and evidence.html are visible together. Do not execute code while viewing files inside an archive.

On Windows, a suggested folder is D:\WTW03\S03_PUBLIC. On macOS/Linux, use a short folder such as ~/WTW03/S03_PUBLIC. These are examples: use your actual extraction path. No administrator privileges, server, Gemini CLI or API key are required.

## Prepare the terminal once

In VS Code use Terminal > New Terminal. Check that the terminal is at the extracted student root, where tools and projects are visible. The same node commands below work in Windows PowerShell, macOS Terminal and a Linux terminal. Terminal commands here concern coursework, not GitHub publication.

Run node --version and npm --version. On Windows use npm.cmd --version when PowerShell selects a blocked npm.ps1 file; do not change execution policy. Record the actual output. The project reference is Node v24.21.0 and npm 11.19.0, not a value that this form may fill in as measured. A mismatch is not an expected student failure. Record it and ask the teacher for the approved environment route later; do not install software during the seminar.

## No dependency installation in the supplied route

The three canonical projects have no external dependencies. The supplied commands invoke Node directly and do not run npm install or npm ci. Original project README files are preserved byte-for-byte and mention npm install; for this offline teaching route, follow this guide instead. No lockfile, package file or test needs editing.

The package verifier checks an untouched distribution. Once you change the permitted source file, the distribution manifest no longer describes your edited copy. The project gate separately checks that every other project file is unchanged.

## Read the P01 contract and record a prediction

Read projects/P01/spec.md or projects/P01/spec.html. Read the four-record fixture. Before running the CLI, predict the Ada/minimum-estimate-3 result in E1. Do not overwrite the original prediction after seeing a result.

The pipeline boundary requires own fields and exact types. Validate the submitted records before deciding whether to select them. Selection, projection, ordering and summarisation have different purposes. An empty JSON summary from the starter is executable output, not a completed transformation.

## Check the initial state before editing

Run the initial gate below. It verifies the exact untouched starter tree, forces TAP and checks the identities of the expected failed assertions. PASS_INITIAL_STARTER_SIGNATURE means the pedagogical starting state is intact; it does not mean the exercise is solved. P01 baseline is 2/2, objective has exactly three assertion failures and regression is 2/2.

A runtime guard, missing command, parse error, timeout, signal, unexpected stderr or altered test is never accepted as an intended failure. The gate returns exit code 2 for a block or unexpected result. It prints the exact commands, results and reasons. Keep logs outside projects/P01/student so they do not appear as unapproved project files.

## Implement within the one-file boundary

Edit only projects/P01/student/src/transform-tasks.js. Preserve exports, tests, fixture, CLI and package metadata. Implement a small, explainable change. Work stage by stage: specify which values are admitted, which records remain, what shape they become, how order is defined and which population contributes to the summary.

Do not paste a teacher solution or ask Gemini for the completed module. Ask for a bounded explanation or review of one claim and independently check it. The preserved canonical AI prompts describe a broader historical workflow; the bounded seminar activity in this kit governs the assessment evidence.

## Observe independently before declaring success

Run the P01 CLI and compare actual output with the written prediction. Before running observe.mjs, predict the inherited-owner, string-estimate and two-record identity witnesses. The helper calls your actual transformation and reports observations; it is not an alternative implementation.

A regression PASS on a singleton frozen array does not establish every non-mutation property. Empty output makes a record-identity witness inconclusive. Record the field being tested, the command, the result and a limitation rather than copying a green label.

## Close the core at minute 60

Run the complete gate after your changes. It checks baseline, objective, regression and the aggregate suite with explicit filenames. P01 has seven unique canonical tests; repeated focused/full runs are not fourteen independent test cases. An unfinished implementation stays IN PROGRESS or BLOCKED.

Complete the core form fields progressively. Gemini may be PENDING when offline; label any synthetic practice honestly. Check the core draft, export its JSON and verify that the file is present. Stop the meeting at minute 60 with the actual state and next action. P03 is required after the meeting, not hidden overflow.

## Required portfolio and bounded optional work

Complete the P03 portfolio brief after the meeting. Its historical estimate is 35–50 minutes of additional work, not a guaranteed completion time. The teacher sets a due date that leaves this window. Keep P01 and P03 in one final PDF.

Optional short transfer: repeat P01 with a different owner or threshold and explain the changed summary; no new edit target is required. P02 Rule Engine is a separate advanced 45–60-minute route. It is not needed for the standard maximum mark and does not displace the required P03 portfolio.

## Commands

```text
node --version
npm --version
node tools/gate.mjs P01 initial
node tools/run-cli.mjs P01 --owner Ada --minimum-estimate 3
node tools/observe.mjs P01
node tools/gate.mjs P01 complete
```
