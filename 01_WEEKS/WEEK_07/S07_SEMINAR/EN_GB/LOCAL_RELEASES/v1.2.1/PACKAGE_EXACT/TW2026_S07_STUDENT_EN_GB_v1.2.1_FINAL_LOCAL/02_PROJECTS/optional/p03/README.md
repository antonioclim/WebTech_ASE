# P03 — API redesign optional student source

Full P03 implementation is optional. The P03-informed ADR is required and belongs in the same S07 PDF. The supplied registration router is an incomplete student target; it does not implement the complete reference API.

Read the resource identity, alternatives, transaction boundary and eight repeated-action rows in the ADR brief. P03 uses a Map-backed volatile service and target-state PUT/DELETE semantics. Its resource differs from the P02 booking resource. Identical effects do not require identical response status codes. Do not transfer P03 idempotency to P02 POST.

The S07 submitted kit's protected boundary permits only the mandatory P02 target edit. Optional experimentation can use a separate working copy and must be labelled with its own changed-source identity and reviewed separately; it is not a required second submission. Keep the delivered protected source copy as the comparison baseline. Native SQLite loading is not applicable to P03; its own Express dependency and strict runtime guard still apply.

Run all commands below from the kit root, where the `tools` folder is visible. They do not install dependencies. The declared runtime is Node v24.21.0 and npm 11.19.0. Read the measured preflight values; a mismatch is a blocked genuine route.

```text
node tools/cli.mjs preflight p03
node tools/cli.mjs boundary p03
```

Preflight reads source hashes and local direct-dependency metadata. It measures npm by running the locally found npm-cli.js with the current Node executable and `--version`, with a five-second direct-child bound. The report preserves the exact command, stderr and any measurement fault. It does not import the service, tests, helpers or native driver. It does not authenticate the complete dependency graph or publisher provenance. A byte check is not a semantic review or an observation of rollback.

The genuine commands require an independently prepared project-local dependency tree and the exact runtime. No global dependency fallback is accepted. They are supplied for later classroom use; production of this candidate has not run them.

```text
node tools/cli.mjs native p03 --allow-native-load
node tools/cli.mjs serve p03 --allow-memory-database
node tools/cli.mjs test p03 --allow-memory-database
```

The wrapper creates an owned loopback listener on port0 and prints its actual URL. It does not depend on the protected server's direct URL.pathname entry guard. Do not assume port3000 or stop another process. Use Ctrl+C and wait for STOPPED. CLOSE_TIMEOUT or forced termination means cleanup is unknown. Each start creates a fresh volatile fixture; restarting loses its state.

The supplied package.json name contains a historical “reference” token. That protected token is not a statement that this student starter is complete. Direct npm start and native Windows/macOS acceptance remain unqualified.
