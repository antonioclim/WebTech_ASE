# Exercise Specification — Shared Workshop State

## Unit

Unit 10 — Client State and Frontend Architecture

## Learning objective

Place genuinely shared workshop-selection state in one Context + reducer boundary while keeping component-private input state local and exposing safe state/dispatch hooks.

## Why this exercise exists

Prop drilling is not inherently wrong, and Context is not a replacement for all component state. Students need a small tree where a track filter and saved-session IDs are read or changed by distant siblings, while a search draft and disclosure controls remain private. The exercise makes state placement—not Context syntax—the decision under review.

## Prerequisites

- Unit 08 state ownership, immutable updates, controlled inputs, and component decomposition.
- Unit 09 URL/server/UI state boundaries.

## Starting context

Students receive a React 19 + Vite workshop planner with:

- immutable session fixtures and characterized UI for a toolbar, session list/cards, saved summary, and local search/disclosure controls;
- a supplied component tree already using `WorkshopProvider`, `useWorkshopState`, and `useWorkshopDispatch` from one incomplete `src/state/workshop-state.jsx` boundary;
- preserved `evidence/prop-drilled-app.jsx` showing the working pre-refactor data/callback path;
- tests, styles, entry, and pinned lock file.

Only shared state belongs in the provider: `{ track, savedIds }`. Search text remains local to the toolbar and each card's details-open state remains local to that card.

## Required behavior

- Export `WorkshopProvider`, `useWorkshopState`, and `useWorkshopDispatch` with separate state and dispatch contexts.
- Initialize one independent state value per provider from optional `initialState`, cloning/deduplicating `savedIds` and defaulting to `track: "all"` and an empty saved list.
- Implement a pure reducer for `track/selected`, `session/toggled`, and `saved/cleared`; ignore duplicate toggle artifacts and preserve all unaffected state.
- Reject unsupported actions with a stable developer-facing error rather than silently hiding a generated typo.
- Provider state must not be module-global or shared between provider instances.
- Hooks must fail with a focused message when used outside the provider.
- Distant toolbar/cards/summary consumers update from one dispatch without forwarding shared values or callbacks through intermediate layout components.
- Keep search drafts, derived visible sessions/counts, and card disclosure outside provider state.
- Preserve stable session IDs, semantic controls, empty states, and immutable fixtures.

## Constraints

- JavaScript JSX, React 19 + Vite, ESM, pinned lock file.
- Implement only `src/state/workshop-state.jsx`; preserve components, local-state ownership, fixtures, evidence, tests, CSS, entry, and dependencies.
- Use React Context plus `useReducer`; no Redux, external state/data library, mutable singleton, browser storage, effect synchronization, or context containing rendered JSX.
- Do not centralize local search, card disclosure, or render-derived values merely to satisfy the exercise.

## Observable completion criteria

- Toolbar track changes, card saves, and summary clear actions update every relevant distant consumer.
- Local search/disclosure survive unrelated shared actions and remain isolated between component/provider instances.
- Reducer transitions, unsupported actions, missing-provider hooks, initialization, and two-provider isolation are deterministic.
- The prop-drilled evidence and completed Context version remain behaviorally equivalent for shared actions.
- Build, categorized checks, audit, and browser smoke pass; only `src/state/workshop-state.jsx` changes.

## Validation plan

### Baseline checks

- Fixtures, derived selectors, component-local search/disclosure, semantic shell, Vite setup, and prop-drilled characterization work independently of the objective provider.

### Objective checks

- Provider defaults and supplied initial-state normalization.
- Track select, save toggle, clear, immutability, and unsupported-action behavior.
- State/dispatch hooks and missing-provider diagnostics.
- Distant consumer synchronization without intermediate shared-state props.
- Provider-instance isolation and no module-global state.
- Source checks for Context/reducer boundary and bans on local/derived-state centralization.

### Regression checks

- Production build and browser entry remain healthy.
- Search draft and card disclosure remain local across shared actions.
- Fixtures, prop-drilled evidence, and unrelated component files remain unchanged.
- No Redux/global singleton/effect/storage dependency is introduced.

## Intended student work

After reference validation, copy the reference and replace only `src/state/workshop-state.jsx` with an unavailable provider/hooks boundary retaining exports, React imports, action vocabulary, and focused TODOs. The shell, fixtures, evidence, local controls, build, and baseline checks remain healthy; shared-state objectives fail at the missing provider contract.

No completed reducer/provider is duplicated in evidence, tests, comments, generated output, or alternate modules.

## Gemini task

> Inspect `spec.md`, the supplied component consumers, local-state controls, prop-drilled evidence, and categorized checks. Implement only `src/state/workshop-state.jsx`: separate state/dispatch contexts, independent normalized initialization, pure guarded reducer, provider, and focused outside-provider hooks. Centralize only track and saved IDs; do not move search, disclosure, or derived data, edit consumers/tests/evidence, add dependencies, effects, storage, Redux, or globals. Done when checks/build/browser pass and the diff is one file. Explain why each state value is local, shared, or derived.

## Debugging / extension task

- Move the toolbar search draft into Context, type while toggling saved sessions, and compare provider-wide update scope and API surface. Return it to the nearest owner and explain why prop distance alone did not justify centralization.

## Out of scope

- Server persistence, routing, authentication, Redux, performance micro-benchmarking, context selectors, or cross-tab synchronization.
