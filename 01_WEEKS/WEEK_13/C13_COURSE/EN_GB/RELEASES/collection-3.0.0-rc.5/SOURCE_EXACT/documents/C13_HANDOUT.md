# C13 — Synthesis handout: Browser and Application Composition Architectures

This retained synthesis summarises the source topics. The offline worked companion at `../worked-mechanisms.html` explains inputs, state transitions, results and limits; the Word handout remains a synthesis summary.

## Purpose and evidence boundary

C13 asks when a browser boundary is justified, who owns its protocol and lifecycle and what evidence distinguishes a model from execution in the target context. Storage, Workers, Service Workers and iframe composition solve different ownership and isolation problems. None is justified by novelty alone.

The source lecture plans 96 minutes. This delivery contains exactly 60 minutes and an explicit STOP. Source identity, pure JavaScript, fake browser objects, native Worker or Service Worker behaviour, real multi-origin composition and platform acceptance remain separate evidence classes.

## Exact 60-minute route

| Minutes | Focus | Evidence boundary |
| --- | --- | --- |
| 00–05 | Boundary cost before browser APIs | One requirement, one owner, one lifecycle and one simpler alternative. |
| 05–14 | Storage, clone and transfer | Exact examples, no browser run claim. |
| 14–25 | Worker protocol and P01 lifecycle | Correlation, cancellation, failures and cleanup; P01 source-bound models only. |
| 25–34 | Service Worker registered, ready and controlled | Correct example discrepancy; P02 remains guided. |
| 34–43 | Caching, replacement and offline claims | Policy and product claims are distinct from one cached shell. |
| 43–51 | Message trust and exact target origin | Origin, source, version and payload are separate checks. |
| 51–57 | Frame generation, composition cost and project roles | P03 optional; launch Regression Harness transfer. |
| 57–60 | Retrieval and STOP | Owner, invariant, witness and limitation; no overflow. |

## Source topics

## 1. Browser storage has scope and lifetime

Browser storage belongs to an origin and has a product lifetime. It is not shared authority and it can disappear or become unavailable.

**Evidence boundary.** Source identity and fixed model only; no storage API is invoked.

## 2. Stored data is untrusted input

Every stored string crosses a trust boundary when it is read. Parse, version-check and validate before admitting it into application state.

**Evidence boundary.** No claim that every browser storage failure is handled by the canonical example.

## 3. Records need contracts

A record contract names the namespace, version, schema, fallback and migration or removal rule. Sensitive credentials do not belong in it.

**Evidence boundary.** Contract review, not a security certificate.

## 4. Worked example — versioned storage record

The exact example round-trips a supported record and removes malformed or stale data. Storage access errors remain outside its protected region.

**Evidence boundary.** Exact source retained; historical browser validation is not rerun.

## 5. Workers move computation contexts

A Worker moves computation into a separate execution context. It does not move DOM ownership and it adds a protocol and lifecycle.

**Evidence boundary.** No Worker is created in this package.

## 6. `postMessage` normally clones

Ordinary postMessage uses structured clone. The receiver gets a distinct graph and unsupported values can fail cloning.

**Evidence boundary.** JavaScript explanation, not native postMessage evidence.

## 7. Transfer moves ownership

Transferables move ownership of selected resources such as ArrayBuffer backing stores. The sender may lose access after transfer.

**Evidence boundary.** No buffer is transferred by a browser here.

## 8. Main thread owns UI

The main thread retains DOM ownership. A Worker returns data or typed events and the page decides how the UI changes.

**Evidence boundary.** No responsiveness measurement or rendering benchmark.

## 9. Worked example — worker clone boundary

The exact clone-boundary example demonstrates one request, one cloned object and one result. It does not cover concurrent correlation, error or cleanup.

**Evidence boundary.** Exact source anchor only.

## 10. Real worker protocols need lifecycle

A real Worker client needs identifiers, pending state, progress, terminal paths, cancellation, worker-failure policy and disposal.

**Evidence boundary.** P01 is the later central implementation; C13 provides models, not the assessed answer.

## 11. Timers do not offload CPU

setTimeout defers work on the same event loop. It does not move CPU-heavy work to another execution context.

**Evidence boundary.** Conceptual comparison only.

## 12. Service Workers are browser-managed intermediaries

A Service Worker is a browser-managed intermediary with install, activate, control and replacement lifecycle. It is not merely another Worker.

**Evidence boundary.** No Service Worker registration is performed.

## 13. Registered, ready, and controlled differ

Registered, active, ready and controlling are different states. Evidence must identify which state was actually observed.

**Evidence boundary.** The canonical example currently sends to active even without a controller.

## 14. First load may be uncontrolled

The first page load may be uncontrolled. A direct path is therefore a separate contract, not an assumption about active workers.

**Evidence boundary.** No first-load browser experiment.

## 15. Scope limits clients

Scope limits which clients can be controlled. Scope is not a general authorisation rule for application data.

**Evidence boundary.** No scope registration observed.

## 16. Interception should be narrow

Interception should be narrow: method, origin, path and message schema each need explicit policy.

**Evidence boundary.** No fetch interception or cache event executed.

## 17. Worked example — Service Worker scope decision

The exact example demonstrates registration and messaging, but its controller-or-active selection does not prove the stated direct first-load branch.

**Evidence boundary.** Source/code discrepancy retained and explained.

## 18. Caching is a separate design

Caching is a separate design involving freshness, versioning, failure, storage and eviction. Registration alone does not provide an offline product.

**Evidence boundary.** No Cache API execution.

## 19. Delete only owned caches

Delete only caches owned by the current application namespace and version. Broad deletion is destructive across unrelated features.

**Evidence boundary.** Fixed policy model only.

## 20. Controller replacement affects pending work

Controller replacement can strand pending work. Retry, rejection or replay must be an explicit protocol choice.

**Evidence boundary.** No controllerchange event observed.

## 21. Offline is a product claim

Offline is a product claim with defined routes, assets and fallbacks. One cached shell cannot establish it.

**Evidence boundary.** No offline acceptance.

## 22. `postMessage` is transport, not trust

postMessage transports data. Trust still requires origin, exact source, protocol version, message type and payload schema.

**Evidence boundary.** Derived gate model, not browser messaging.

## 23. Window messages need exact origin and source

For Window messages, origin checks the document location and source checks the exact Window. The canonical decoy is same-origin, so it mainly proves wrong-source rejection.

**Evidence boundary.** No distinct cross-origin sender was run.

## 24. Send with exact target origin

Send with an exact target origin. A wildcard destination should not be a convenience default for privileged messages.

**Evidence boundary.** No native postMessage call.

## 25. Worked example — message contract gate

The exact gate accepts a minimal trusted intent and discards sender claims. Its itemId validation is type-only and has no explicit length or format bound.

**Evidence boundary.** Exact source anchor plus bounded comparator.

## 26. Origin is not user authorization

Origin is not user authorisation. It identifies a document origin, not an authenticated principal or permission decision.

**Evidence boundary.** No identity provider or session.

## 27. Iframes isolate document/global/navigation

An iframe isolates document, global object and navigation. Isolation also introduces coordination, readiness and recovery costs.

**Evidence boundary.** No iframe rendered.

## 28. The parent shell owns cross-fragment state

The parent shell owns state shared across fragments and should accept only typed intents rather than arbitrary child mutation.

**Evidence boundary.** Composition model only.

## 29. Readiness is protocol state

Readiness is protocol state. A frame document can exist before it is ready to receive a command.

**Evidence boundary.** No frame load or ready event observed.

## 30. Replacement creates a generation

Replacement creates a new generation. Late messages from an old document must not activate or consume current state.

**Evidence boundary.** Generation does not replace origin validation.

## 31. Worked example — frame generation gate

The exact example demonstrates current-generation readiness. It checks source and generation, but not event.origin.

**Evidence boundary.** Generation-only example, not a complete trust gate.

## 32. Composition has organizational cost

Composition increases operational, testing and ownership costs. It needs an organisational reason, not only a technical possibility.

**Evidence boundary.** No multi-origin system is deployed.

## 33. Use composition only for real ownership/isolation

Use composition when ownership or isolation requirements justify it. Prefer a simpler single application when they do not.

**Evidence boundary.** Decision framework, not a universal ban.

## 34. Lifecycle ownership is correctness

Lifecycle ownership is correctness: listeners, pending requests, frames, workers and generations need terminal cleanup.

**Evidence boundary.** No browser resource counts measured.

## Project roles for Week 13

| Object | Active role | Required contribution | Not silently required |
| --- | --- | --- | --- |
| P01 Worker Offload | Central implementation | Complete `student/src/worker-client.js` and lifecycle evidence | Browser responsiveness inferred from a fake worker |
| P02 Service Worker Request Dispatcher | Guided demonstration | Registered, ready, controlled and direct-path trace | Full Service Worker implementation in S13 |
| P03 Composable Shell | Optional advanced | Architecture discussion when relevant | Multi-origin deployment or hidden marking criterion |
| U14-P01 Regression Harness | Required portfolio launch | Package identity, target behaviour, initial matrix, one mutation candidate and outstanding work | Completion in the five-minute hand-off |

## Source-specific limits to retain

1. Storage API access errors are distinct from JSON parsing and record validation.
2. The clone example is a one-request clone boundary, not a complete Worker protocol.
3. The Service Worker example can message `registration.active` even when the page has no controller.
4. The message-gate decoy is same-origin and mainly demonstrates wrong-source rejection.
5. The generation example checks source and generation, not origin.
6. P01 has documented factory/ID failure, worker recovery, ID reuse, terminal schema and cancellation limits.
7. P02 has sticky registration failure, ID reuse, post-dispose fallback and payload-schema limits.
8. P03 does not enforce the declared outbound allowlist and lacks duplicate-intent, per-type schema and async generation guards.
9. Regression Harness is launched in S13 and completed before S14; its tests are not executed in C13.

## Evidence ladder

| Class | What it can support | What it cannot support |
| --- | --- | --- |
| Source identity | Exact bytes and contract wording | Runtime behaviour |
| Pure JavaScript/helper | Deterministic transformation and finite-state results | Worker, Service Worker or browser semantics |
| Fake endpoint or event | Protocol behaviour under the declared fake | Native scheduling, navigation or origin topology |
| Real browser run | Behaviour in one qualified environment | Universal compatibility or production reliability |
| Platform acceptance | Native interaction and document behaviour | Security or correctness beyond the tested scope |

## Final retrieval

Before leaving C13, record one owner, one lifecycle invariant, one actual or pending witness and one untested boundary. Stop at minute 60. The reserved 30 minutes are not overflow.
