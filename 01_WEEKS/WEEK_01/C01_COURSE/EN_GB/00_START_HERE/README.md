# C01 — Start with a message, then test a claim

This English teaching revision belongs to the v4.0.0 candidate. The original course handouts, source-package IDs and RC labels are retained as provenance; they do not state the outer candidate version or publication status.

## Browser and reading route

Extract the complete collection. Open `01_PRESENTATION/C01_PRESENTATION_EN_GB.html` from the C01 `EN_GB` folder, or use the presentation launcher. The presentation and supplied `03_ACTIVITIES/OFFLINE_TRACE.html` work without Node. Use the section selector to resume, **Read all** for expanded explanations and **Print** for the study guide. Arrow/Page keys change slides; Home/End jump. T starts or pauses the timer, R resets it and F requests full screen. Focused controls retain normal keyboard activation.

The historical `02_HANDOUT/STUDENT_HANDOUT_C01_v2.0.2_EN_GB.docx` and `READINESS_AND_TRANSFER_C01_v2.0.2_EN_GB.docx` remain useful source reading. Current commands, environment policy and S01 contracts are described here and in the detailed tutorial. The original 60-minute sequence is an unpiloted teaching plan; supplementary study screens and demonstrations may need additional reading or continuation time.

## Working directory and environment

For every command below, open `01_WEEKS/WEEK_01/C01_COURSE/EN_GB` in VS Code, then choose **Terminal → New Terminal**. Verify the selected executable and directory:

```sh
node --version
node -p "process.execPath"
node -p "process.cwd()"
```

Follow the [shared environment policy](../../../../../00_START_HERE/ENVIRONMENT.html). The launcher records capabilities and actual versions. `ENV_OK` and `ENV_WARN` permit the checked operation; `ENV_BLOCKED` identifies the affected capability and recovery. The examples use built-in Node APIs and require no npm installation. A different minor version is not, by itself, a reason to block them. A missing HTTP/fetch capability, module import error or failed listener remains an actual blocker.

`VERIFY_PACKAGE`, `CHECK_ENVIRONMENT` and `RUN_ALL_EXAMPLES` have Windows `.cmd` and macOS/Linux `.sh` launchers. Package integrity checks answer whether the selected package bytes match the declared inventory. Environment checks answer whether a selected operation can run. Example assertions answer the specific claim in the example. None establishes individual authorship, a native browser or Moodle acceptance.

## Demonstrations from this package root

Predict before each run, then record the actual output and any warning. These are course demonstrations, not additional assessed projects.

```sh
node 04_CANONICAL_EXAMPLES/01-url-boundaries/example.js
node 04_CANONICAL_EXAMPLES/02-request-response-anatomy/verify.mjs
node 04_CANONICAL_EXAMPLES/03-response-contract-check/check.js
node 04_CANONICAL_EXAMPLES/04-representation-contract/example.js
node 04_CANONICAL_EXAMPLES/05-bounded-change-review/verify-http.mjs
node 04_CANONICAL_EXAMPLES/06-javascript-bridge/example.mjs
node 04_CANONICAL_EXAMPLES/02-request-response-anatomy/evidence-boundary.mjs
```

The URL example only parses text; it does not contact `course.example`. The neutral bridge shows two fresh summaries and unchanged source cards before C03. The evidence-boundary demonstration sends fresh POST text, then retrieves the fixed note: it challenges a persistence claim with separate HTTP observations and source inspection.

For a native browser demonstration, start only your own listener:

```sh
node 04_CANONICAL_EXAMPLES/02-request-response-anatomy/start-demo.mjs
```

Copy the actual `READY` origin into your browser. Open DevTools **Network**, remove restrictive filters, clear entries and activate **Run exchanges**. Inspect request and response of the same POST row. Stop the owned terminal with Ctrl+C and confirm `STOPPED_OWNED_LISTENER`. A startup message is not an observed exchange. If the browser or native print route cannot run, keep that step `BLOCKED` or `NOT_EXECUTED` while independent local reading continues.

## Transfer to S01

C01 prepares two different results: [P01](../../../S01_SEMINAR/TUTORIAL.html#P01) projects message facts without mutating evidence; [P02](../../../S01_SEMINAR/TUTORIAL.html#P02) recognises a raw path before method, decoding and value decisions. Both are mandatory and individual. Return to the **S01 EN_GB package root** before running its commands. One seminar PDF and one genuine AI critique belong to S01, not an additional C01 submission.

Read [SOURCES.md](SOURCES.md) for targeted primary references and [MOODLE_POLICY.md](MOODLE_POLICY.md) for the course/seminar distinction.
