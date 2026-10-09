# C13 · macOS/Linux terminal reading and bounded Node demonstrations

Extract the complete collection and open the C13 EN_GB directory in VS Code: `01_WEEKS/WEEK_13/C13_COURSE/EN_GB`. Confirm CWD with `pwd`. Open `index.html` for reading, then use the exact complete commands in [RUN_EXAMPLES.md](RUN_EXAMPLES.md).

```text
node tools/tw-kit.mjs env core
node tools/tw-kit.mjs example 01
node tools/tw-kit.mjs example 02
node tools/tw-kit.mjs example 03
```

Core needs capable Node without npm. Each selected operation applies its own required probes, including actual clone/transfer for example 02. ENV_OK/ENV_WARN permits continuation; ENV_BLOCKED2 names the absent operation. Reference-version differences are recorded, not arbitrary equality gates. A file-not-found diagnostic asks for the stated CWD before editing code. An import/assertion/timeout/output fault remains an execution failure.

The child default is 10 seconds and 1 MB output, with documented bounded diagnostic overrides. Cleanup is limited to the invocation’s owned resource; native platform process-tree handling has its own qualification boundary. No installation, global upgrade or user security-policy change is performed.

Five canonical browser applications remain exact source examples. Owned HTTP file delivery is not a native Worker, Service Worker, frame, keyboard, layout, print or saved-PDF observation. Read [INSPECT_EXAMPLES.md](INSPECT_EXAMPLES.md) before any separately authorised native route. Preserve browser restrictions and pending platform qualification.
