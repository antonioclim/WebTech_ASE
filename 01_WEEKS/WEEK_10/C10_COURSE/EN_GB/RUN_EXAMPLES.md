# C10 — Example inspection and future execution plan

## No installation or live run in this phase

Open index.html for offline reading and model activities. Inspect the exact files under canonical/. These are React/Vite source projects, not standalone generated pages. Do not double-click their index.html and call the result a qualified build.

The historical READMEs show npm install and claim earlier build/browser validation. This delivery performs none of those actions. Preserve each package-lock.json; do not update pins or install globally. A future dependency acquisition requires separate authorisation and verification of the prescribed runtime. The prescribed Node 24.21.0/npm 11.19.0 has not been acquired or qualified here; local helper checks used Node 22.16.0/npm 10.9.2.

## Later, separately authorised application work

Only in an already provisioned, independently qualified environment: open the exact example directory, record package identity and actual runtime, then run the declared local command npm run dev. Use the actual local URL printed by Vite, not an invented fixed port. Stop that process with Ctrl+C. npm run build is a distinct build check. None of the five directories supplies a canonical test file or a test script. Do not report a test pass where no test was run.

### 01-state-ownership-map

Directory from public root: `canonical/01-state-ownership-map`. Declared scripts: `dev`: `vite`, `build`: `vite build`.

### 02-reducer-event-trace

Directory from public root: `canonical/02-reducer-event-trace`. Declared scripts: `dev`: `vite`, `build`: `vite build`.

### 03-provider-isolation

Directory from public root: `canonical/03-provider-isolation`. Declared scripts: `dev`: `vite`, `build`: `vite build`.

### 04-normalized-selectors

Directory from public root: `canonical/04-normalized-selectors`. Declared scripts: `dev`: `vite`, `build`: `vite build`.

### 05-latest-request-guard

Directory from public root: `canonical/05-latest-request-guard`. Declared scripts: `dev`: `vite`, `build`: `vite build`.

## Property-specific observation plan

EX-01: the actual shared filter affects list and derived count. EX-02: named events alter their fields without mutating the prior state. EX-03: two mounted providers remain independent. EX-04: ordered ids and derived unread reflect confirmed changes. EX-05: the success-only latest guard ignores old fulfillment; do not pretend its missing rejection handler exists.

Record exact source/input, command, assertion, observation, output locator and what is untested. A build does not prove interaction; a helper is not React; a plain adapter substitute is not Redux Toolkit/Immer. An unavailable command, missing dependency or parser failure is a separate block, not expected learner failure. No new runtime installation is authorised by this guide.
