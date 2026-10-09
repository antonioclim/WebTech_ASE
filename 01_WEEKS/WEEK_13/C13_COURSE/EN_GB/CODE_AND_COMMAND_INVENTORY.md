# C13 · Full code, command and context inventory

The course package root is `01_WEEKS/WEEK_13/C13_COURSE/EN_GB`. Confirm CWD with Get-Location or pwd. Refer to RUN_EXAMPLES.md for exact commands, diagnostics and bounded overrides. The current tool accepts **example 01**, **example 02** and **example 03** as two CLI arguments; there is no example01 command or canonical browser-launch selector.

## Five classifications used below

1. **Complete executable**: a full supplied program or an exact command with its required CWD, runtime and entry context. A browser application is complete only as its supplied document/module/worker assembly; opening a JavaScript file in Node is not equivalent.
2. **Import-dependent fragment**: an export/module, API call or resource reference requiring the stated caller, document, fixture or browser API. It has no invented standalone launch command.
3. **TODO**: the three preserved student targets deliberately return null before individual implementation. Initial named assertion failures are expected; crashes, syntax/import faults and time/output failures are not TODO evidence.
4. **Intentional error**: a declared negative/fault fixture, such as fake storage SecurityError. The declaration names where it is caught and what observation distinguishes it. A fabricated result or unexpected execution fault never becomes this classification retrospectively.
5. **Pseudocode**: an output shape, path label, control-flow description, expected trace or UI placeholder. It explains a rule; it is not presented as a runnable program.

Predictions below remain expected until an actual action is executed and recorded. The inventory identifies executable contexts; it does not certify a learner run, platform, AI exchange, print, PDF or Moodle action. Protected historical files are classified without rewriting their bytes.

## Current complete programs and tools

| Item | Classification and complete file | Exact CWD and command | Required dependencies / child ownership | Predicted witness and claim limit |
| --- | --- | --- | --- | --- |
| C13-D01 | Complete executable: demonstrations/01-storage-phases.mjs; declared intentional SecurityError fixture is caught at access phase | Course EN_GB; node tools/tw-kit.mjs example 01 | Node core, assert; tool owns child default 10s/1MB | Actual phase rows separate missing/access/malformed/schema/admitted; declared fake, no native Storage |
| C13-D02 | Complete executable: demonstrations/02-clone-transfer.mjs | Course EN_GB; node tools/tw-kit.mjs example 02 | Actual structuredClone copy and ArrayBuffer transfer capability, assert; owned child 10s/1MB | Distinct graph plus retained receiver bytes and sender byteLength0; Node operation, no native Worker or benchmark |
| C13-D03 | Complete executable: demonstrations/03-property-shapes.mjs | Course EN_GB; node tools/tw-kit.mjs example 03 | Object.hasOwn, JSON and assert; owned child 10s/1MB | Own versus inherited, presence versus falsey and undefined JSON omission; neutral measurement field, not acceptWorkerResult answer |
| C13-TOOL01 | Complete executable: tools/tw-kit.mjs; imports supplied activity-environment/environment/owned-process modules | Course EN_GB; node tools/tw-kit.mjs help<br>node tools/tw-kit.mjs env core<br>node tools/tw-kit.mjs env http<br>node tools/tw-kit.mjs example 01<br>node tools/tw-kit.mjs example 02<br>node tools/tw-kit.mjs example 03<br>node tools/tw-kit.mjs examples | Node core. env http adds actual owned Node HTTP capability probes | ENV_OK/WARN0 or BLOCKED2 per selected operation; example result actual argv/CWD/bounds, no browser or package install |
| C13-TOOL02 | Import-dependent fragments: tools/activity-environment.mjs and its supplied environment helpers | Caller tw-kit; no separate student implementation | Declared operation-specific probes. HTTP child 5s/65536 bytes, request deadline4s | A real HTTP capability observation is not Worker/controller/cache qualification |
| C13-TOOL03 | Complete command wrappers CHECK_ENVIRONMENT.sh/.cmd | Course EN_GB; bash CHECK_ENVIRONMENT.sh or .\CHECK_ENVIRONMENT.cmd; alternatively node tools/tw-kit.mjs env core | Node core; wrapper forwards genuine nonzero status | Shell source exists; native Windows/macOS qualification remains separate |

Direct demonstration fallback commands from the same CWD are node demonstrations/01-storage-phases.mjs, node demonstrations/02-clone-transfer.mjs and node demonstrations/03-property-shapes.mjs. They are complete finite programs but do not add the tool’s separate preflight/owned-child diagnostic. If invoked directly, the student owns that foreground invocation. Use the guarded tool for the documented bounded route. Expected assertion success is exit0; actual output/exit must be retained. Import/assertion/signal/timeout/output-limit faults remain failures. Changing a child bound is a temporary diagnostic, never a hidden install or qualification upgrade.

## Five unchanged canonical assemblies and their source differences

| Exact source directory | Classification / historical source command and CWD | Supplied browser assembly and expected observation | Qualification boundary |
| --- | --- | --- | --- |
| canonical/01-versioned-storage-record | Complete Node server.mjs plus import-dependent document/main.js; historical node server.mjs from this directory, port4213 | index.html/main.js, native localStorage version1/theme roundtrip; access outside parse catch, owned-key mutation | Original unbounded foreground command is a historical reference, NOT_EXECUTED here as a browser run; no native storage/print claim |
| canonical/02-worker-clone-boundary | Complete Node server.mjs plus document/main.js/worker.js context; historical node server.mjs from directory, port4215 | Native Worker clone, total12 versus sender99, success terminate | Browser scheduling/error/cleanup qualification absent; neutral Node clone is another scope |
| canonical/03-service-worker-scope-decision | Complete Node server.mjs plus browser main.js/sw.js; historical node server.mjs from directory, port4214 | register/ready, controller ?? active, MessageChannel reply labels | No fetch/cache; active messaging not controller ownership; native registration/controller NOT_EXECUTED |
| canonical/04-message-contract-gate | Complete Node server.mjs plus index/main and child/decoy documents; historical node server.mjs from directory, parent port4216 and trusted frame origin4217 | catalog/select numeric1, exact origin/source; same-origin-to-each-other catalogue/decoy challenges source | No foreign-origin branch execution or current fragment.ready implementation. Confirm actual server source before any future authorised run |
| canonical/05-frame-generation-gate | Complete Node server.mjs plus index/main/child contexts; historical node server.mjs from directory, port4218 | Current source/generation ready and queued render | event.origin absent. Native replacement/rendering NOT_EXECUTED |

The original source README commands are retained byte for byte. They are not the current guarded student launch route and contain no new timeout/ownership guarantee. No native browser run is authorised by an inventory row. A future authorised teacher demonstration must define bound and owned teardown first and stop on restrictions. The current runtime QA can create an owned server to inspect HTTP delivery under a separate receipt; body/status delivery does not execute its scripts in a browser. No fictional tool selector is provided for that QA.

## Preserved exports, dynamic HTML and teaching notation

| File(s) | Classification, caller and context | Required input / predicted observation | Limit |
| --- | --- | --- | --- |
| derived/storage-boundary.mjs | Import-dependent exported helper; a declared fake caller can provide getItem/setItem/removeItem | density rather than canonical theme; valid/missing/invalid/access paths | No native Storage or current S13 assessed answer; shared access/parse diagnostic region retained |
| derived/message-contract.mjs | Import-dependent acceptIntent export under declared event/source/origin fixture | item.selected with bounded itemId, different from catalogue and fragment.ready | No Window identity or native messaging |
| derived/generation-gate.mjs | Import-dependent createGenerationGate export, local replace/queue/markReady calls | Local generation, queued command and snapshot | No actual source/origin, iframe, automatic frame cleanup or native lifecycle |
| assets/models.js/models-data.json/lab.js | Complete supplied browser lab assembly; imported source-dependent fixed models | Predict then reveal stipulated20records; lab pre1 initially says No model result | Synthetic output, no Worker/Service Worker/iframe. M11/M18/M20 historical full-contract roles explicitly labelled at lab entry |
| assets/deck.js/theme.css plus course.html | Complete supplied document-control assembly | 24 slides, reading mode, navigation, text size and print request | DOM/native keyboard/layout/print not executed; source syntax/static routes do not certify interaction |
| course/reading/index/preparation/worked-mechanisms.html | Pseudocode/path notation: all inline code1–3 lists current S13 target paths | Links identify required targets, not executable course implementation | Run actual student targets only under S13 commands |
| documents/C13_HANDOUT.md, preparation transfer and worked prose | Pseudocode/contract examples: accepted envelopes, controlled/direct labels, version/generation comparison, timers/pending ownership | Predictions and source-supported contrasts remain labelled | They are explanations, not complete browser applications or assessed solutions |
| documents/*.docx | Preserved reference documents, source text and historical snippets | Historical companion, current expanded HTML/Markdown governs teaching adaptation | No native Word render/print qualification claimed |

## Every displayed snippet block and inline code locator

Ordinal locators count pre blocks or inline code outside pre in each exact HTML file; Markdown locators count fences or inline code outside fences. An empty browser output pre or No model result is an output placeholder. Path labels and observed status strings are notation, not launch commands. This table is generated from every course HTML/Markdown source, including protected canonical READMEs, without shortening the teaching content.

| Exact relative source | Precise locator | Classification | Exact displayed content |
| --- | --- | --- | --- |
| CHANGELOG_RC4.md | inline code 1 outside fences | Pseudocode / contract or path notation; not standalone code | 01_WEEKS/WEEK_13/C13_COURSE/EN_GB/DOWNLOAD/WEBTECH_ASE_C13_STUDENT_EN_GB_v1.1.0_PUBLIC.zip |
| CHANGELOG_RC4.md | inline code 2 outside fences | Pseudocode / contract or path notation; not standalone code | DERIVED_CARRIER.json |
| INSPECT_EXAMPLES.md | inline code 1 outside fences | Pseudocode / contract or path notation; not standalone code | canonical |
| INSPECT_EXAMPLES.md | inline code 2 outside fences | Complete executable command sequence in its declared context | node tools/tw-kit.mjs env http |
| MACOS_LINUX.md | fenced block 1 | Complete executable command sequence in its declared context | node tools/tw-kit.mjs env core<br>node tools/tw-kit.mjs example 01<br>node tools/tw-kit.mjs example 02<br>node tools/tw-kit.mjs example 03 |
| MACOS_LINUX.md | inline code 1 outside fences | Pseudocode / contract or path notation; not standalone code | 01_WEEKS/WEEK_13/C13_COURSE/EN_GB |
| MACOS_LINUX.md | inline code 2 outside fences | Complete executable command sequence in its declared context | pwd |
| MACOS_LINUX.md | inline code 3 outside fences | Pseudocode / contract or path notation; not standalone code | index.html |
| PACKAGE_ID_METHOD.md | inline code 1 outside fences | Pseudocode / contract or path notation; not standalone code | SHA256SUMS.txt |
| PACKAGE_ID_METHOD.md | inline code 2 outside fences | Pseudocode / contract or path notation; not standalone code | SHA256SUMS.txt |
| PACKAGE_ID_METHOD.md | inline code 3 outside fences | Pseudocode / contract or path notation; not standalone code | PACKAGE_ID.txt |
| RUN_EXAMPLES.md | fenced block 1 | Complete executable command sequence in its declared context | node tools/tw-kit.mjs env core<br>node tools/tw-kit.mjs example 01<br>node tools/tw-kit.mjs example 02<br>node tools/tw-kit.mjs example 03 |
| RUN_EXAMPLES.md | fenced block 2 | Complete executable command sequence in its declared context | $hadC13ChildTimeout = Test-Path Env:WEBTECH_CHILD_TIMEOUT_MS<br>$previousC13ChildTimeout = $env:WEBTECH_CHILD_TIMEOUT_MS<br>try {<br>  $env:WEBTECH_CHILD_TIMEOUT_MS = '20000'<br>  node tools/tw-kit.mjs example 02<br>} finally {<br>  if ($hadC13ChildTimeout) { $env:WEBTECH_CHILD_TIMEOUT_MS = $previousC13ChildTimeout }<br>  else { Remove-Item Env:WEBTECH_CHILD_TIMEOUT_MS -ErrorAction SilentlyContinue }<br>} |
| RUN_EXAMPLES.md | inline code 1 outside fences | Pseudocode / contract or path notation; not standalone code | 01_WEEKS/WEEK_13/C13_COURSE/EN_GB |
| RUN_EXAMPLES.md | inline code 2 outside fences | Complete executable command sequence in its declared context | Get-Location |
| RUN_EXAMPLES.md | inline code 3 outside fences | Complete executable command sequence in its declared context | pwd |
| RUN_EXAMPLES.md | inline code 4 outside fences | Complete executable command sequence in its declared context | node demonstrations/01-storage-phases.mjs |
| RUN_EXAMPLES.md | inline code 5 outside fences | Complete executable command sequence in its declared context | node demonstrations/02-clone-transfer.mjs |
| RUN_EXAMPLES.md | inline code 6 outside fences | Complete executable command sequence in its declared context | node demonstrations/03-property-shapes.mjs |
| RUN_EXAMPLES.md | inline code 7 outside fences | Complete executable command sequence in its declared context | node tools/tw-kit.mjs env http |
| RUN_EXAMPLES.md | inline code 8 outside fences | Pseudocode / contract or path notation; not standalone code | INSPECT_EXAMPLES.md |
| RUN_EXAMPLES.md | inline code 9 outside fences | Complete executable command sequence in its declared context | WEBTECH_CHILD_TIMEOUT_MS=20000 node tools/tw-kit.mjs example 02 |
| SOURCES.md | inline code 1 outside fences | Pseudocode / contract or path notation; not standalone code | ../../S13_SEMINAR/EN_GB/CLASSROOM_RC6/CLASSROOM_SCOPE.json |
| SOURCES.md | inline code 2 outside fences | Pseudocode / contract or path notation; not standalone code | student/p01.mjs |
| SOURCES.md | inline code 3 outside fences | Pseudocode / contract or path notation; not standalone code | p03.mjs |
| SOURCES.md | inline code 4 outside fences | Pseudocode / contract or path notation; not standalone code | support/cases.json |
| SOURCES.md | inline code 5 outside fences | Pseudocode / contract or path notation; not standalone code | tests/objective.test.mjs |
| SOURCES.md | inline code 6 outside fences | Pseudocode / contract or path notation; not standalone code | course.html#s1 |
| SOURCES.md | inline code 7 outside fences | Pseudocode / contract or path notation; not standalone code | #s24 |
| SOURCES.md | inline code 8 outside fences | Pseudocode / contract or path notation; not standalone code | reading.html#topics |
| SOURCES.md | inline code 9 outside fences | Pseudocode / contract or path notation; not standalone code | worked-mechanisms.html |
| SOURCES.md | inline code 10 outside fences | Pseudocode / contract or path notation; not standalone code | documents/C13_HANDOUT.md |
| SOURCES.md | inline code 11 outside fences | Pseudocode / contract or path notation; not standalone code | ../../S13_SEMINAR/TUTORIAL.html |
| SOURCES.md | inline code 12 outside fences | Pseudocode / contract or path notation; not standalone code | ../../S13_SEMINAR/EN_GB/FORMATIVE_ASSESSMENT.html |
| SOURCES.md | inline code 13 outside fences | Pseudocode / contract or path notation; not standalone code | PACKAGE_ID.txt |
| SOURCES.md | inline code 14 outside fences | Pseudocode / contract or path notation; not standalone code | CANONICAL_SOURCES.json |
| SOURCES.md | inline code 15 outside fences | Pseudocode / contract or path notation; not standalone code | assets/models-data.json |
| SOURCE_NOTES.md | inline code 1 outside fences | Pseudocode / contract or path notation; not standalone code | ../../S13_SEMINAR/EN_GB/CLASSROOM_RC6/CLASSROOM_SCOPE.json |
| SOURCE_NOTES.md | inline code 2 outside fences | Pseudocode / contract or path notation; not standalone code | student/p01.mjs |
| SOURCE_NOTES.md | inline code 3 outside fences | Pseudocode / contract or path notation; not standalone code | p03.mjs |
| SOURCE_NOTES.md | inline code 4 outside fences | Pseudocode / contract or path notation; not standalone code | support/cases.json |
| SOURCE_NOTES.md | inline code 5 outside fences | Pseudocode / contract or path notation; not standalone code | tests/objective.test.mjs |
| SOURCE_NOTES.md | inline code 6 outside fences | Pseudocode / contract or path notation; not standalone code | course.html#s1 |
| SOURCE_NOTES.md | inline code 7 outside fences | Pseudocode / contract or path notation; not standalone code | #s24 |
| SOURCE_NOTES.md | inline code 8 outside fences | Pseudocode / contract or path notation; not standalone code | reading.html#topics |
| SOURCE_NOTES.md | inline code 9 outside fences | Pseudocode / contract or path notation; not standalone code | worked-mechanisms.html |
| SOURCE_NOTES.md | inline code 10 outside fences | Pseudocode / contract or path notation; not standalone code | documents/C13_HANDOUT.md |
| SOURCE_NOTES.md | inline code 11 outside fences | Pseudocode / contract or path notation; not standalone code | ../../S13_SEMINAR/TUTORIAL.html |
| SOURCE_NOTES.md | inline code 12 outside fences | Pseudocode / contract or path notation; not standalone code | ../../S13_SEMINAR/EN_GB/FORMATIVE_ASSESSMENT.html |
| SOURCE_NOTES.md | inline code 13 outside fences | Pseudocode / contract or path notation; not standalone code | PACKAGE_ID.txt |
| SOURCE_NOTES.md | inline code 14 outside fences | Pseudocode / contract or path notation; not standalone code | CANONICAL_SOURCES.json |
| SOURCE_NOTES.md | inline code 15 outside fences | Pseudocode / contract or path notation; not standalone code | assets/models-data.json |
| WINDOWS.md | fenced block 1 | Complete executable command sequence in its declared context | node tools/tw-kit.mjs env core<br>node tools/tw-kit.mjs example 01<br>node tools/tw-kit.mjs example 02<br>node tools/tw-kit.mjs example 03 |
| WINDOWS.md | inline code 1 outside fences | Pseudocode / contract or path notation; not standalone code | 01_WEEKS/WEEK_13/C13_COURSE/EN_GB |
| WINDOWS.md | inline code 2 outside fences | Complete executable command sequence in its declared context | Get-Location |
| WINDOWS.md | inline code 3 outside fences | Pseudocode / contract or path notation; not standalone code | index.html |
| canonical/01-versioned-storage-record/README.md | fenced block 1 | Complete executable command sequence in its declared context | node server.mjs<br># Open http://127.0.0.1:4213 |
| canonical/01-versioned-storage-record/README.md | inline code 1 outside fences | Pseudocode / contract or path notation; not standalone code | localStorage |
| canonical/01-versioned-storage-record/README.md | inline code 2 outside fences | Pseudocode / contract or path notation; not standalone code | savePreference |
| canonical/01-versioned-storage-record/README.md | inline code 3 outside fences | Pseudocode / contract or path notation; not standalone code | loadPreference |
| canonical/01-versioned-storage-record/README.md | inline code 4 outside fences | Pseudocode / contract or path notation; not standalone code | data-result="pass" |
| canonical/02-worker-clone-boundary/README.md | fenced block 1 | Complete executable command sequence in its declared context | node server.mjs<br># Open http://127.0.0.1:4215 |
| canonical/02-worker-clone-boundary/README.md | inline code 1 outside fences | Pseudocode / contract or path notation; not standalone code | postMessage |
| canonical/02-worker-clone-boundary/README.md | inline code 2 outside fences | Pseudocode / contract or path notation; not standalone code | [2, 4, 6] |
| canonical/02-worker-clone-boundary/README.md | inline code 3 outside fences | Pseudocode / contract or path notation; not standalone code | 12 |
| canonical/02-worker-clone-boundary/README.md | inline code 4 outside fences | Pseudocode / contract or path notation; not standalone code | 99 |
| canonical/02-worker-clone-boundary/README.md | inline code 5 outside fences | Pseudocode / contract or path notation; not standalone code | data-result="pass" |
| canonical/02-worker-clone-boundary/README.md | inline code 6 outside fences | Pseudocode / contract or path notation; not standalone code | DataCloneError |
| canonical/02-worker-clone-boundary/README.md | inline code 7 outside fences | Pseudocode / contract or path notation; not standalone code | ArrayBuffer |
| canonical/02-worker-clone-boundary/README.md | inline code 8 outside fences | Pseudocode / contract or path notation; not standalone code | data-result="pass" |
| canonical/02-worker-clone-boundary/README.md | inline code 9 outside fences | Pseudocode / contract or path notation; not standalone code | worker total=12; main first=99 |
| canonical/03-service-worker-scope-decision/README.md | fenced block 1 | Complete executable command sequence in its declared context | node server.mjs<br># Open http://127.0.0.1:4214 |
| canonical/03-service-worker-scope-decision/README.md | inline code 1 outside fences | Pseudocode / contract or path notation; not standalone code | MessageChannel |
| canonical/03-service-worker-scope-decision/README.md | inline code 2 outside fences | Pseudocode / contract or path notation; not standalone code | GET /api/tasks/:id |
| canonical/03-service-worker-scope-decision/README.md | inline code 3 outside fences | Pseudocode / contract or path notation; not standalone code | GET |
| canonical/03-service-worker-scope-decision/index.html | pre block 1 | Pseudocode / output placeholder |  |
| canonical/04-message-contract-gate/README.md | fenced block 1 | Complete executable command sequence in its declared context | node server.mjs<br># Open http://127.0.0.1:4216 |
| canonical/04-message-contract-gate/README.md | inline code 1 outside fences | Pseudocode / contract or path notation; not standalone code | Window |
| canonical/04-message-contract-gate/README.md | inline code 2 outside fences | Pseudocode / contract or path notation; not standalone code | Window |
| canonical/04-message-contract-gate/README.md | inline code 3 outside fences | Pseudocode / contract or path notation; not standalone code | trusted: true |
| canonical/05-frame-generation-gate/README.md | fenced block 1 | Complete executable command sequence in its declared context | node server.mjs<br># Open http://127.0.0.1:4218 |
| course.html | inline code 1 outside pre | Pseudocode / contract or path notation; not standalone code | CLASSROOM_RC6/student/p01.mjs |
| course.html | inline code 2 outside pre | Pseudocode / contract or path notation; not standalone code | CLASSROOM_RC6/student/p02.mjs |
| course.html | inline code 3 outside pre | Pseudocode / contract or path notation; not standalone code | CLASSROOM_RC6/student/p03.mjs |
| documents/C13_HANDOUT.md | inline code 1 outside fences | Pseudocode / contract or path notation; not standalone code | postMessage |
| documents/C13_HANDOUT.md | inline code 2 outside fences | Pseudocode / contract or path notation; not standalone code | postMessage |
| index.html | inline code 1 outside pre | Pseudocode / contract or path notation; not standalone code | CLASSROOM_RC6/student/p01.mjs |
| index.html | inline code 2 outside pre | Pseudocode / contract or path notation; not standalone code | CLASSROOM_RC6/student/p02.mjs |
| index.html | inline code 3 outside pre | Pseudocode / contract or path notation; not standalone code | CLASSROOM_RC6/student/p03.mjs |
| lab.html | pre block 1 | Pseudocode / output placeholder | No model result. |
| preparation.html | inline code 1 outside pre | Pseudocode / contract or path notation; not standalone code | CLASSROOM_RC6/student/p01.mjs |
| preparation.html | inline code 2 outside pre | Pseudocode / contract or path notation; not standalone code | CLASSROOM_RC6/student/p02.mjs |
| preparation.html | inline code 3 outside pre | Pseudocode / contract or path notation; not standalone code | CLASSROOM_RC6/student/p03.mjs |
| reading.html | inline code 1 outside pre | Pseudocode / contract or path notation; not standalone code | CLASSROOM_RC6/student/p01.mjs |
| reading.html | inline code 2 outside pre | Pseudocode / contract or path notation; not standalone code | CLASSROOM_RC6/student/p02.mjs |
| reading.html | inline code 3 outside pre | Pseudocode / contract or path notation; not standalone code | CLASSROOM_RC6/student/p03.mjs |
| worked-mechanisms.html | inline code 1 outside pre | Pseudocode / contract or path notation; not standalone code | CLASSROOM_RC6/student/p01.mjs |
| worked-mechanisms.html | inline code 2 outside pre | Pseudocode / contract or path notation; not standalone code | CLASSROOM_RC6/student/p02.mjs |
| worked-mechanisms.html | inline code 3 outside pre | Pseudocode / contract or path notation; not standalone code | CLASSROOM_RC6/student/p03.mjs |
| worked-mechanisms.html | inline code 4 outside pre | Pseudocode / contract or path notation; not standalone code | webtech:preferences |
| worked-mechanisms.html | inline code 5 outside pre | Pseudocode / contract or path notation; not standalone code | 1 |
| worked-mechanisms.html | inline code 6 outside pre | Pseudocode / contract or path notation; not standalone code | theme |
| worked-mechanisms.html | inline code 7 outside pre | Pseudocode / contract or path notation; not standalone code | comfortable |
| worked-mechanisms.html | inline code 8 outside pre | Pseudocode / contract or path notation; not standalone code | compact |
| worked-mechanisms.html | inline code 9 outside pre | Pseudocode / contract or path notation; not standalone code | {theme: "comfortable"} |
| worked-mechanisms.html | inline code 10 outside pre | Pseudocode / contract or path notation; not standalone code | density |
| worked-mechanisms.html | inline code 11 outside pre | Pseudocode / contract or path notation; not standalone code | theme |
| worked-mechanisms.html | inline code 12 outside pre | Pseudocode / contract or path notation; not standalone code | getItem(key) |
| worked-mechanisms.html | inline code 13 outside pre | Pseudocode / contract or path notation; not standalone code | null |
| worked-mechanisms.html | inline code 14 outside pre | Pseudocode / contract or path notation; not standalone code | {"version":1,"theme":"compact"} |
| worked-mechanisms.html | inline code 15 outside pre | Pseudocode / contract or path notation; not standalone code | theme |
| worked-mechanisms.html | inline code 16 outside pre | Pseudocode / contract or path notation; not standalone code | textContent |
| worked-mechanisms.html | inline code 17 outside pre | Pseudocode / contract or path notation; not standalone code | comfortable |
| worked-mechanisms.html | inline code 18 outside pre | Pseudocode / contract or path notation; not standalone code | {"version":1,"theme":"compact"} |
| worked-mechanisms.html | inline code 19 outside pre | Pseudocode / contract or path notation; not standalone code | compact |
| worked-mechanisms.html | inline code 20 outside pre | Pseudocode / contract or path notation; not standalone code | {broken |
| worked-mechanisms.html | inline code 21 outside pre | Pseudocode / contract or path notation; not standalone code | comfortable |
| worked-mechanisms.html | inline code 22 outside pre | Pseudocode / contract or path notation; not standalone code | {"version":0,"theme":"compact"} |
| worked-mechanisms.html | inline code 23 outside pre | Pseudocode / contract or path notation; not standalone code | comfortable |
| worked-mechanisms.html | inline code 24 outside pre | Pseudocode / contract or path notation; not standalone code | {"version":1,"theme":"huge"} |
| worked-mechanisms.html | inline code 25 outside pre | Pseudocode / contract or path notation; not standalone code | comfortable |
| worked-mechanisms.html | inline code 26 outside pre | Pseudocode / contract or path notation; not standalone code | theme |
| worked-mechanisms.html | inline code 27 outside pre | Pseudocode / contract or path notation; not standalone code | getItem |
| worked-mechanisms.html | inline code 28 outside pre | Pseudocode / contract or path notation; not standalone code | try |
| worked-mechanisms.html | inline code 29 outside pre | Pseudocode / contract or path notation; not standalone code | {values: [2, 4, 6]} |
| worked-mechanisms.html | inline code 30 outside pre | Pseudocode / contract or path notation; not standalone code | values = [2, 4, 6] |
| worked-mechanisms.html | inline code 31 outside pre | Pseudocode / contract or path notation; not standalone code | values = [99, 4, 6] |
| worked-mechanisms.html | inline code 32 outside pre | Pseudocode / contract or path notation; not standalone code | [2, 4, 6] |
| worked-mechanisms.html | inline code 33 outside pre | Pseudocode / contract or path notation; not standalone code | 12 |
| worked-mechanisms.html | inline code 34 outside pre | Pseudocode / contract or path notation; not standalone code | {total: 12} |
| worked-mechanisms.html | inline code 35 outside pre | Pseudocode / contract or path notation; not standalone code | worker total=12; main first=99 |
| worked-mechanisms.html | inline code 36 outside pre | Pseudocode / contract or path notation; not standalone code | ready |
| worked-mechanisms.html | inline code 37 outside pre | Pseudocode / contract or path notation; not standalone code | controller |
| worked-mechanisms.html | inline code 38 outside pre | Pseudocode / contract or path notation; not standalone code | null |
| worked-mechanisms.html | inline code 39 outside pre | Pseudocode / contract or path notation; not standalone code | register("./sw.js") |
| worked-mechanisms.html | inline code 40 outside pre | Pseudocode / contract or path notation; not standalone code | navigator.serviceWorker.ready |
| worked-mechanisms.html | inline code 41 outside pre | Pseudocode / contract or path notation; not standalone code | controller ?? registration.active |
| worked-mechanisms.html | inline code 42 outside pre | Pseudocode / contract or path notation; not standalone code | network |
| worked-mechanisms.html | inline code 43 outside pre | Pseudocode / contract or path notation; not standalone code | GET |
| worked-mechanisms.html | inline code 44 outside pre | Pseudocode / contract or path notation; not standalone code | GET /api/tasks/7 |
| worked-mechanisms.html | inline code 45 outside pre | Pseudocode / contract or path notation; not standalone code | message |
| worked-mechanisms.html | inline code 46 outside pre | Pseudocode / contract or path notation; not standalone code | POST /api/tasks/7 |
| worked-mechanisms.html | inline code 47 outside pre | Pseudocode / contract or path notation; not standalone code | network |
| worked-mechanisms.html | inline code 48 outside pre | Pseudocode / contract or path notation; not standalone code | GET /images/logo.svg |
| worked-mechanisms.html | inline code 49 outside pre | Pseudocode / contract or path notation; not standalone code | network |
| worked-mechanisms.html | inline code 50 outside pre | Pseudocode / contract or path notation; not standalone code | GET /api/tasks/7 |
| worked-mechanisms.html | inline code 51 outside pre | Pseudocode / contract or path notation; not standalone code | network |
| worked-mechanisms.html | inline code 52 outside pre | Pseudocode / contract or path notation; not standalone code | GET /api/tasks/7/history |
| worked-mechanisms.html | inline code 53 outside pre | Pseudocode / contract or path notation; not standalone code | network |
| worked-mechanisms.html | inline code 54 outside pre | Pseudocode / contract or path notation; not standalone code | skipWaiting |
| worked-mechanisms.html | inline code 55 outside pre | Pseudocode / contract or path notation; not standalone code | clients.claim |
| worked-mechanisms.html | inline code 56 outside pre | Pseudocode / contract or path notation; not standalone code | catalog-shell: |
| worked-mechanisms.html | inline code 57 outside pre | Pseudocode / contract or path notation; not standalone code | v3 |
| worked-mechanisms.html | inline code 58 outside pre | Pseudocode / contract or path notation; not standalone code | event.origin |
| worked-mechanisms.html | inline code 59 outside pre | Pseudocode / contract or path notation; not standalone code | http://127.0.0.1:4217 |
| worked-mechanisms.html | inline code 60 outside pre | Pseudocode / contract or path notation; not standalone code | event.source |
| worked-mechanisms.html | inline code 61 outside pre | Pseudocode / contract or path notation; not standalone code | contentWindow |
| worked-mechanisms.html | inline code 62 outside pre | Pseudocode / contract or path notation; not standalone code | 1 |
| worked-mechanisms.html | inline code 63 outside pre | Pseudocode / contract or path notation; not standalone code | catalog/select |
| worked-mechanisms.html | inline code 64 outside pre | Pseudocode / contract or path notation; not standalone code | payload.itemId |
| worked-mechanisms.html | inline code 65 outside pre | Pseudocode / contract or path notation; not standalone code | {type, itemId} |
| worked-mechanisms.html | inline code 66 outside pre | Pseudocode / contract or path notation; not standalone code | trusted: true |
| worked-mechanisms.html | inline code 67 outside pre | Pseudocode / contract or path notation; not standalone code | 2 |
| worked-mechanisms.html | inline code 68 outside pre | Pseudocode / contract or path notation; not standalone code | itemId |
| worked-mechanisms.html | inline code 69 outside pre | Pseudocode / contract or path notation; not standalone code | itemId |
| worked-mechanisms.html | inline code 70 outside pre | Pseudocode / contract or path notation; not standalone code | item.selected |
| worked-mechanisms.html | inline code 71 outside pre | Pseudocode / contract or path notation; not standalone code | location.origin |
| worked-mechanisms.html | inline code 72 outside pre | Pseudocode / contract or path notation; not standalone code | dark |
| worked-mechanisms.html | inline code 73 outside pre | Pseudocode / contract or path notation; not standalone code | event.origin |

Course files with no displayed code blocks still retain connected explanation: course.html, reading.html, preparation.html, sources.html, guide.html and worked-mechanisms.html. Their API mentions and contract notations refer to the exact contexts above. The original source’s success claims remain history; actual QA outcomes belong to their sealed receipts, not this predicted-context table.
