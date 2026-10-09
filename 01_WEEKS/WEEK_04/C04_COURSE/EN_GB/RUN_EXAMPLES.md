# Optional canonical examples — evidence and launch scope

Twelve files under `canonical/` are byte-identical source copies. The surrounding package.json is derived and sets type=module so the first four examples can run with an existing Node installation. They use built-in modules only; no npm install is needed.

Run each in a fresh process from the public package root, using the exact commands in WINDOWS.md or MACOS_LINUX.md. The example 03 timer delays are a small fixture, not a guarantee about real network timing. If an assertion fails, retain the real failure instead of substituting a printed reference trace.

Canonical example 05 is a browser page with an inline module and an initial scripted click. The included `tools/serve_event.mjs` supplies a read-only loopback route for this exact page. It serves only its landing page and that example, not an arbitrary directory or private files. It makes no outbound requests and installs no background service. Real-browser observation remains separate from local HTTP readiness.

The historical README contains a headless command. Do not use that route for this package or treat its old validation statement as today’s evidence. The current guides use a normal browser and the optional local helper only.

Node v24.21.0 / npm 11.19.0 is the project reference. A successful execution on another measured runtime is compatibility evidence, not reference qualification. See the delivered private QA report for the actual production environment; no student result is pre-filled from it.
