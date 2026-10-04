# Exercise Specification — Redux Toolkit Notification Center

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

## Intended student work

After reference validation, copy the reference and replace only `src/store/notifications-slice.js` with an unavailable slice module retaining required imports/exports and focused action/thunk/selector TODO boundaries. Store construction, routing, local filter, fixtures, API, build, and baseline checks remain healthy; notification-domain objectives fail at the unavailable reducer contract.

No completed slice/thunk/selectors remain in tests, store factory, comments, generated bundles, or alternate files.

## Gemini task

> Inspect `spec.md`, store factory extra-argument setup, injected API, route consumers, fixtures, and categorized checks. Implement only `src/store/notifications-slice.js` with entity adapter, guarded async thunks, explicit request metadata, authoritative success reducers, stable rejections, and derived selectors. Keep route/filter/panel state local; do not edit supplied files, add direct fetch/RTK Query/legacy Redux, publish raw errors, optimistically mark read, or duplicate derived arrays/counts. Done when checks/build/browser pass and the diff is one file. Justify why this domain crosses the Redux threshold.

## Debugging / extension task

- Remove the refresh request-ID guard, resolve a newer refresh before an older one, observe the badge/list revert, and restore latest-only publication. Compare this protection with Unit 09 component-owned refresh identity.

## Out of scope

- Authentication, WebSockets, persistence, RTK Query, optimistic rollback, pagination, service workers, or production notification delivery.
