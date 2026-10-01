# Exercise Specification — Composable Shell

## Unit

Unit 13 — Browser and Application Composition Architectures

## Learning objective

Coordinate two isolated iframe fragments through a parent shell using explicit origin/source-checked `postMessage` contracts, readiness, routing, and teardown.

## Why this exercise exists

Composition boundaries can isolate deployment or legacy ownership, but they add protocol, lifecycle, accessibility, security, and operational cost. Students need a small visible shell—not a framework—to judge that trade-off.

## Prerequisites

- Browser origins, iframe sandboxing, `postMessage`, routing/URL state, authentication versus message trust, and event cleanup.

## Starting context

Students receive a dependency-free shell with two same-site but deliberately distinct-origin iframe apps (`catalog` and `details`):

- supplied static multi-origin server, accessible shell layout, iframe sandbox/allow attributes, fragment pages, and versioned message schemas;
- supplied fragment behavior that announces readiness, renders shell-provided state, and emits user intent without directly addressing the sibling;
- incomplete shell `src/composition-coordinator.js` plus deterministic fake-window tests and a real headless-browser two-origin interaction check.

## Required behavior

- Register named fragment descriptors with exact expected `origin`, current `contentWindow`, protocol version, and allowed inbound/outbound message types. Reject duplicate/unknown descriptors.
- Listen once on the shell window. Accept a message only when both `event.origin` and `event.source` match the registered fragment and the version/type/payload schema is valid.
- Track readiness per current iframe generation. Queue only the latest safe shell state before readiness, then send it with exact `targetOrigin`; never use `*`.
- Route catalog `item.selected` intent through the shell: validate the item ID, update the shell URL/history, load authoritative shell state, then send a `details.show` command to the details fragment. Fragments never message each other directly.
- On iframe reload/replacement, increment generation, discard stale readiness/messages/queued state, and require the new `contentWindow` to become ready.
- Unknown, malformed, forged-origin, forged-source, stale-version/generation, and duplicate messages produce no URL/state/fragment change and leak no internals.
- Shell preserves keyboard/focus labeling and exposes a visible fragment-unavailable state on readiness timeout; isolation is not presented as authentication.
- `dispose` removes the one global listener, timers, descriptors, and queued state; it is idempotent and isolates coordinator instances.

## Constraints

- JavaScript ESM, native iframe/History/`postMessage`, no runtime dependency or microfrontend framework.
- Implement only `src/composition-coordinator.js`; preserve shell/fragments/server/schemas/UI/browser harness/tests.
- No wildcard `targetOrigin`, substring origin trust, direct sibling messaging, shared DOM access, fake auth claim, localStorage event bus, module-global coordinator, React, module federation, or production microfrontend claim.

## Observable completion criteria

- Real browser loads two origins, both announce readiness, catalog selection updates shell URL and only the details fragment, and reload replays current state only after new readiness.
- Forged origin/source/version/generation messages cannot change state; timeout shows an accessible unavailable status.
- Listener/timer/queue counts return to zero on disposal and later independent shell startup works.
- An architecture note compares this boundary with one ordinary single-app alternative using requirement-linked costs rather than framework preference.
- Categorized unit/browser checks pass and only `src/composition-coordinator.js` changes.

## Validation plan

### Baseline checks

- Multi-origin server, shell/fragment pages, schemas, accessible layout, history/state adapters, and browser harness work with a passthrough coordinator.

### Objective checks

- Exact descriptor/origin/source/version/type/schema validation and single listener.
- Readiness, latest-state queue, exact target origin, and timeout status.
- Selection intent → shell URL/authoritative state → details command flow.
- Reload generation boundary and stale message/source suppression.
- Disposal/instance isolation plus explicit architecture cost comparison.
- Real two-origin browser interaction, forged-message, reload, and keyboard/status checks.

### Regression checks

- Fragments never access/message each other or mutate shell history directly.
- Shell and both fragments remain independently renderable; malformed/unknown paths and later interaction remain healthy.
- No wildcard origin, dependency, fake authentication, shared mutable global, or production completeness claim appears.

## Intended student work

After reference/browser validation, copy the reference and replace only `src/composition-coordinator.js` with an API-compatible fail-closed coordinator that installs/removes one listener, reports fragments unavailable, and sends nothing. Supplied shell/fragments/server remain renderable; secure readiness/routing/composition objectives fail.

## Gemini task

> Implement only `src/composition-coordinator.js`. Register exact fragment origin/window/version contracts, validate both message origin and source plus schema, queue latest state until current-generation readiness, route catalog intent through shell URL/authoritative state to details with exact targetOrigin, reject stale reload messages, expose readiness timeout, and clean one listener/timers/state on disposal. Preserve supplied files; no wildcard origins/framework/fake auth claim. Done when categorized checks, real two-origin forged/reload interaction, architecture comparison, and one-file diff pass. Explain why this complexity is justified or not.

## Debugging / extension task

- Change `postMessage` target to `*` and remove source matching, send a forged valid-shaped selection from an unregistered frame, observe the shell change, then restore both boundary checks and regression.

## Out of scope

- Production microfrontends, independent deployments, shared dependency negotiation, module federation, SSO, cross-site cookie design, CSP deployment, distributed tracing, or server-side composition.
