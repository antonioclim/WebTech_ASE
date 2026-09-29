# S05 student guide

In-memory Task API

S05 student guide • One required implementation • 60-minute core

1. The response is the observable contract

A request crosses several boundaries before a task changes. App assembly chooses the parser and router order. The router decides whether the method, path and fields satisfy the public contract. The repository owns the current collection. The response then makes the decision observable through status, headers and content. A correct repository alone cannot establish a correct HTTP contract.

Implement P01 only in projects/p01/src/task-router.js. Read contracts/P01.html before editing. Preserve the supplied app, repository, middleware, tests, package metadata and lockfile. The package names inside the unchanged source can retain the historical word reference; those names do not turn an incomplete starter into the solution.

2. Prepare outside the timed meeting

Extract the ZIP into a new short folder and open index.html. Keep the evidence form in a separate tab. The presentation, form and guided records open without Express or a server. API execution instead requires the separately prepared project-local Express 5.1.0 dependency tree and the reference Node v24.21.0/npm 11.19.0 environment. No command in this kit installs that environment automatically.

node --version
npm --version
node tools/project.mjs preflight p01
node tools/project.mjs boundary p01

Run commands from the folder containing index.html, projects and tools. Record the observed versions; do not copy the reference version into a measurement field. A prerequisite block means that the API tests did not run. Do not install globally, copy node_modules from another lock graph or change the lockfile to hide the block. Full operating-system steps are in WINDOWS.md, MACOS_LINUX.md and guide.html.

3. Predict before execution

Choose a request and record method, path, predicted status, relevant headers and expected content. Identify the default two-task seed or your actual initial state. Expand the chosen request into a concise contract matrix. Keep the original prediction when it proves wrong: put the correction beside the observation.

A collection response contains a data array; a member response contains a data object. Creation returns 201 and Location. PATCH preserves fields omitted from the request. DELETE returns 204 without response content under this exercise. A missing task and an unknown API route are different decisions. The full public contract supplies the remaining validation details.

4. Implement and classify the result

node tools/check.mjs p01 initial

Before editing, the initial gate requires the exact starter identity and the three named objective assertion failures, with baseline and regression passing. This is an intentionally incomplete implementation, not a successful API. Missing dependencies, JavaScript parsing errors, process signals, timeouts and unexpected test exceptions are never accepted as the intended failure.

Allocate the main implementation block to collection/member reads, validated creation, partial update, deletion and unexpected-error forwarding. Validate before mutation and return after an early response. Keep asynchronous work attached to the returned promise. Do not add authentication, persistence or new filtering features to the one-file assignment.

node tools/check.mjs p01 complete
node tools/project.mjs boundary p01

After editing, use complete rather than initial. The gate retains raw test output and distinguishes focused checks from the full suite. Those runs repeat cases; their counts do not represent independent extra coverage. The boundary check permits the target to differ, ignores an existing local node_modules prerequisite tree and does not qualify that tree.

5. Observe a dedicated loopback instance

In terminal A, from the student root, run the command below. Use the actual READY address and leave the terminal open. An error or prerequisite block is not a ready server. The launcher neither opens a browser nor contacts an external service.

node tools/project.mjs serve p01

Open terminal B in the same folder. Replace PORT below with the numeric port printed by terminal A; do not type PORT literally. Read the results before authorising the synthetic lifecycle writes. Use only your dedicated in-memory Task API.

node tools/probe.mjs PORT read
node tools/probe.mjs PORT lifecycle --allow-local-writes

The client creates its own synthetic task and follows the returned local Location. It does not guess task-3 or delete seeded tasks. Compare the fetched resource, the completed-only PATCH, the empty DELETE response and the later missing-task response. If a step fails, preserve the partial trace; an uncertain created resource is not automatically deleted. Stop the server with Ctrl+C in terminal A and check STOPPED.

Read-only probes record observations without evaluating correctness. A bounded lifecycle comparison is not the full test suite. The probe cannot authenticate which program owns a port: the READY terminal and your dedicated instance provide that context.

6. Find the boundary that rejected the request

node tools/probe.mjs PORT failures --allow-local-writes

Compare unsupported media, field validation, malformed JSON, a parser-rejected primitive, a missing task and an unknown route. The default strict JSON parser is installed before the router. The expected null-to-invalid_json classification is an explicit source-derived clarification until you observe it in an actual request; it is not a router fix.

Compare complete task lists before and after failed writes in the same instance. Equal lengths alone can hide a changed record. A fresh instance or a restart is a separate observation and cannot prove non-mutation of the original instance. The dependency-free repository observer is labelled MODULE_MODEL, not a server-restart or HTTP measurement.

node tools/repository-observe.mjs

For an unexpected repository error, use the supplied objective test or the separately labelled injected-list mode documented in guide.html. Do not edit app assembly or repository source. Health responding afterwards does not repair the deliberately failing list operation.

7. Keep the evidence class visible

SOURCE_REASONING is an inference from source. MODULE_MODEL is a dependency-free call or injected response/event model. LOCAL_HTTP is a real loopback exchange. REAL_BROWSER adds an actual browser observation. A valid CLI HTTP trace is sufficient; browser screenshots are not mandatory. No model or prerecorded trace becomes a fresh API execution merely by being pasted into a form.

Open guided.html and review one carried C05 record G1–G4. Identify request identity, the timing-capture boundary and the exactly-once limit. Reading a recorded model output is not rerunning it. Full P02 Middleware Pipeline and P03 API Contract Repair implementations remain optional.

8. Review one Gemini claim and stop honestly

Use GEMINI_PROMPT.txt to request review of one sanitised claim. Preserve the relevant prompt, claim, independent check, verdict, correction and limit. ACCEPTED, REJECTED, PARTIALLY ACCEPTED and UNKNOWN are all legitimate evidence-led verdicts. The synthetic offline claim is not a real Gemini exchange. Keep external access pending in a draft when unavailable.

At minute 60 save the draft and identify the next smallest unresolved check. The source estimates 55–65 minutes for P01 alone, so completion plus evidence within the seminar is not guaranteed. Finish remaining P01 work before the later deadline. Submit one TW2026_S05_GROUP_Surname_GivenName.pdf covering P01 and the guided observation. See continuation.html and moodle.html; no separate C05 Assignment is required.
