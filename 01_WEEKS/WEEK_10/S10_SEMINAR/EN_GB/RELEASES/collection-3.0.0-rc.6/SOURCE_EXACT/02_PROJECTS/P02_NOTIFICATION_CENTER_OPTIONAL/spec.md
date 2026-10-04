# Exercise Specification — Redux Toolkit Notification Center

> **Active S10 teaching specification — derived successor.** P02 is an optional advanced implementation. NOT_STARTED is permitted and does not reduce the standard maximum mark. Implement only `student/src/store/notifications-slice.js` if you choose this extension. The byte-exact original is `SPEC_SOURCE_EXACT.md` and is retained only as historical provenance. The current bounded Gemini critique and evidence rules below govern this seminar. No dependencies are installed by this package.

## Unit

Unit 10 — Client State and Frontend Architecture

## Learning objective

Implement one Redux Toolkit slice for normalized, cross-route asynchronous notification state while leaving route, filter, and presentation state outside the store.

## Why this exercise exists

Redux becomes useful when several distant routes and persistent shell elements coordinate the same entities and request lifecycle—not because an application uses React. A notification count in the header, list route, and detail route must agree after refresh and mark-read operations. Students need to see what Redux Toolkit removes, what decisions remain, and what should still stay local.

## Prerequisites

- Project 1 Context/reducer ownership and Unit 09 routing/API boundaries.
- Reducer immutability, async failure states, injected adapters, and stable IDs.

## Starting context

Students receive a React 19 + Vite + React Router + Redux Toolkit application with:

- supplied routes, header unread badge, notification list/detail views, local list filter, CSS, fixtures, and accessible states;
- a supplied async `notificationsApi` injected through thunk `extraArgument`, with deterministic deferred/failure behavior and no direct HTTP in the slice;
- supplied store factory and typed-by-convention selector/dispatch usage;
- incomplete `src/store/notifications-slice.js`, which must export the adapter/slice reducer, actions, thunks, and selectors named by the consumers;
- categorized tests and pinned lock file.

The centralized domain is normalized notifications plus list-load and mark-read request state. Current route, selected route ID, local `all/unread` filter, and transient panel disclosure do not belong in Redux.

## Required behavior

- Use `createEntityAdapter` with stable string IDs and newest-first ordering by `createdAt`, without mutating supplied payloads.
- Use `createAsyncThunk` for list refresh and mark-read, obtaining `notificationsApi` from thunk `extraArgument` and returning stable rejection values rather than raw internal errors.
- Track explicit initial/loading/succeeded/failed refresh status and a per-ID mark-read pending/error boundary.
- On successful refresh, replace normalized server data authoritatively; a stale older refresh must not overwrite a newer request result.
- On successful mark-read, upsert the authoritative returned notification; do not optimistically flip `read` before confirmation.
- A failed refresh retains existing entities and exposes a stable retryable message; a failed mark-read retains entity state and records only that ID's stable failure.
- Export selectors for ordered notifications, notification by ID, unread count, refresh status/error, and per-ID mark status without duplicating derived arrays/counts in state.
- Keep all exported selectors safe for the configured root key and unknown IDs.
- Preserve independent store instances and reset all request metadata through the supplied reset action used by tests.

## Constraints

- JavaScript, React 19, React Router, Vite, Redux Toolkit current pinned line, ESM, lock file.
- Implement only `src/store/notifications-slice.js`; preserve store factory, adapter contract, components/routes, tests, fixtures, CSS, and dependencies.
- Redux Toolkit APIs only; no legacy `createStore`, hand-written immutable helpers, redux middleware package, React Context replacement, RTK Query, direct `fetch`, optimistic update, route state, or local filter in the slice.
- Async request identity must be explicit and deterministic under deferred settlement.

## Observable completion criteria

- Header unread count, list ordering/filter, and detail read state agree across navigation and after confirmed server operations.
- Loading, retained refresh failure, per-ID submission state, and retry are accessible and exact.
- Deferred checks prove latest-refresh-wins and no optimistic mark-read publication.
- Two configured stores with different injected APIs remain isolated.
- Build, categorized checks, audit, and browser smoke pass; only `src/store/notifications-slice.js` changes.

## Validation plan

### Baseline checks

- Store factory injection, API fixture, routes/components, local list filter, router initialization, and a plain supplied probe slice work independently of the objective slice.

### Objective checks

- Adapter normalization/sort and immutable authoritative refresh replacement.
- Refresh pending/success/retained failure/retry and latest-request identity.
- Mark-read pending/confirmed/failure per ID with no optimistic change.
- Unread/order/by-ID/status/error selectors and unknown-ID behavior.
- Header/list/detail synchronization across navigation.
- Independent store/API instances, reset, and source bans.

### Regression checks

- Production build and browser entry remain healthy.
- Route identity and local `all/unread` filter remain outside Redux.
- Supplied API/store factory/components contain no duplicated reducer implementation.
- No legacy Redux API, direct HTTP knowledge, raw error publication, or fixture mutation is introduced.

## Current optional student starter and work

If this extension is chosen, implement only the supplied incomplete `student/src/store/notifications-slice.js`; no private reference copy is needed or permitted. Store construction, routing, local filter, fixtures and API are preserved inputs. Current baseline/objective/regression/build results require legitimate provisioned execution. P02 NOT_STARTED is allowed for the standard required route.

No completed evaluated slice/thunks/selectors remain in public tests, store factory, comments, generated bundles or alternate files.

## Optional bounded Gemini critique

If P02 is chosen, critique one narrow claim about request identity or authoritative publication. Do not request a completed slice, thunk or selectors. Cite the exact current source or a named actual test for the independent check and distinguish supplied/pure-model evidence from real Redux Toolkit and Immer execution. The required seminar critique may use the bounded P01 prompt instead; P02 is not an additional AI obligation.

## Debugging / extension task

- In a separately identified optional experiment, remove the refresh request-ID guard only inside the assessed slice, resolve a newer refresh before an older one and record whether older data replaces newer data. Restore the guard before final verification. This witness covers refresh ordering only; it does not prove every mark-read/reset interleaving or a real network operation.

## Out of scope

- Authentication, WebSockets, persistence, RTK Query, optimistic rollback, pagination, service workers, or production notification delivery.
