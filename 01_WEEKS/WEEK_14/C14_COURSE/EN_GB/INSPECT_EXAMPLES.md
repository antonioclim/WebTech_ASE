# C14 · Inspect source or select a guarded optional test

The five folders under `canonical/` are unchanged source anchors. Reading their code executes nothing. Their original README installation/test commands and validation paragraphs are historical instructions and claims, not current qualification. Current explicit commands, fragments and models are classified in [CODE_AND_COMMAND_INVENTORY.md](CODE_AND_COMMAND_INVENTORY.md).

To select a current optional lane, open a terminal in C14 `EN_GB` and run the actual environment selector before its test:

```text
node tools/tw-kit.mjs canonical 01 env
node tools/tw-kit.mjs canonical 01 test
node tools/tw-kit.mjs canonical 02 env
node tools/tw-kit.mjs canonical 02 test
node tools/tw-kit.mjs canonical 03 env
node tools/tw-kit.mjs canonical 03 test
node tools/tw-kit.mjs canonical 04 env
node tools/tw-kit.mjs canonical 04 test
node tools/tw-kit.mjs canonical 05 env
node tools/tw-kit.mjs canonical 05 test
```

These selectors install nothing and preserve source/lockfiles. Examples 01–04 need their prepared project-local Express dependency; missing Express gives `ENV_BLOCKED`, exit 2, for the selected lane. The independent neutral examples and S14's core remain available. Example 05 is pure Node. Its test expects syntax pass, required dependency-audit **unknown** and deployment TLS **unknown**, with a blocked review. A passing test detects that honest classification; it does not turn an unrun audit into zero findings or certify readiness. The source's truthy TLS option does not authenticate a report.

Pre-seal control observations on Node v24.19.0 executed the current selectors: 01–04 stayed blocked without installation; 05's environment/test completed with the expected unknown states. This is `EXECUTED_PRESEAL_SCOPE`, not final-package, browser, platform, audit or deployment qualification. Final distribution identity and fresh extraction checks are separate.

See [RUN_EXAMPLES.md](RUN_EXAMPLES.md) for actual child CWDs, bounds and recovery. An internal source helper is not automatically a standalone command. Native browser, print, saved PDF, Word and Moodle remain distinct unexecuted acceptance lanes.
