# C04 executable examples and evidence limits

Open `01_WEEKS/WEEK_04/C04_COURSE/EN_GB` through VS Code File → Open Folder, then Terminal → New Terminal. Run each command separately from that folder:

```text
node --version
node -p "process.cwd()"
node tools/tw-kit.mjs env
node tools/tw-kit.mjs example 01
node tools/tw-kit.mjs example 02
node tools/tw-kit.mjs example 03
node tools/tw-kit.mjs example 04
```

`node tools/tw-kit.mjs examples` runs all six Node observations in fresh processes, including the two neutral demonstrations. ENV_WARN permits the selected operation if its actual capability probes pass. ENV_BLOCKED identifies an operation that cannot proceed. The teaching reference is Node v24.21.0/npm 11.19.0; pure Node examples need no npm packages. See [the common environment guide](../../../../00_START_HERE/ENVIRONMENT.html).

Direct source commands from the same folder are:

```text
node canonical/01-module-live-binding/example.js
node canonical/02-async-continuation-order/example.js
node canonical/03-parallel-request-shape/example.js
node canonical/04-fetch-http-boundary/example.js
node demonstrations/observe-timelines.mjs
node demonstrations/listener-lifecycle.mjs
```

01 accesses one private state module through exported functions. Its historical directory name does not turn it into a direct mutable imported-binding demonstration. 02 asserts exactly `script start → function start → script end → after await → promise fulfilled`. 03 asserts a small 30/10/20 timer fixture; it does not measure real network overlap or universal timer precision. 04 injects a fulfilled 404 and checks status policy before parsing. Neutral observations add controlled late completions, stale commit refusal and Node EventTarget listener counts without implementing S04 targets.

For the canonical browser page choose one owned server command from the same folder:

```text
node tools/tw-kit.mjs serve
```

The direct equivalent is `node tools/serve_event.mjs`. Copy the dynamic origin after READY, open it and follow `/event/`. Initial output is from a scripted click. Compare an actual nested-label click and button activation, recording browser/version and actual output separately. This page logs an action; it does not perform deletion. Stop with Ctrl+C in its own terminal and wait for `STOPPED: loopback listener closed.` HTTP routes do not certify native events, rendering or keyboard interaction. Record unavailable actions as unexecuted.

The course shell can be read as local files without Node. Use [guide.html](guide.html) for controls and launch recovery, [reading.html](reading.html) for the connected explanation and the [current S04 tutorial](../../S04_SEMINAR/TUTORIAL.html) for assessed work.
