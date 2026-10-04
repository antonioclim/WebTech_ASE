# Exercise Specification — Shared Workshop State

> **Active S10 teaching specification — derived successor.** P01 is required. Implement only `student/src/state/workshop-state.jsx`. The byte-exact original is `SPEC_SOURCE_EXACT.md` and is retained only as historical provenance. The current bounded Gemini critique and evidence rules below govern this seminar. No dependencies are installed by this package.

## Unit

Unit 10 — Client State and Frontend Architecture

## Learning objective

Place genuinely shared workshop-selection state in one Context + reducer boundary while keeping component-private input state local and exposing safe state/dispatch hooks.

## Why this exercise exists

Prop drilling is not inherently wrong, and Context is not a replacement for all component state. Students need a small tree where a track filter and saved-session IDs are read or changed by distant siblings, while a search draft owned by WorkshopWorkspace and disclosure controls owned by each mounted card remain private. The exercise makes state placement—not Context syntax—the decision under review.

## Prerequisites

- Unit 08 state ownership, immutable updates, controlled inputs, and component decomposition.
- Unit 09 URL/server/UI state boundaries.

## Starting context

Students receive a React 19 + Vite workshop planner with:

- immutable session fixtures and characterized UI for a toolbar, session list/cards, saved summary, and local search/disclosure controls;
- a supplied component tree already using `WorkshopProvider`, `useWorkshopState`, and `useWorkshopDispatch` from one incomplete `src/state/workshop-state.jsx` boundary;
- preserved `evidence/prop-drilled-app.jsx` showing the working pre-refactor data/callback path;
- tests, styles, entry, and pinned lock file.

Only shared state belongs in the provider: `{ track, savedIds }`. Search text remains local to WorkshopWorkspace and is passed to the toolbar; each card's details-open state remains local to that mounted card.

## Required behavior

- Export `WorkshopProvider`, `useWorkshopState`, and `useWorkshopDispatch` with separate state and dispatch contexts.
- Initialize one independent state value per provider from optional `initialState`, cloning/deduplicating `savedIds` and defaulting to `track: "all"` and an empty saved list.
- Implement a pure reducer for `track/selected`, `session/toggled`, and `saved/cleared`; deduplicate initial seed IDs and preserve all unaffected state. Two deliberate toggles are two transitions and reverse the selection; no duplicate-event suppression is promised.
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
- The reduced prop-drilled evidence characterises save/remove and saved count only. It does not provide full track/search/clear/disclosure parity, a measured deep prop chain or a performance benchmark.
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

## Current student starter and work

The supplied student starter already has the incomplete `student/src/state/workshop-state.jsx` boundary. Implement that file only; no private reference copy is needed or permitted in the public route. The unchanged shell/fixtures/local controls and baseline tests define the preserved behaviour. Current baseline/objective/regression results must come from named actual execution after legitimate provisioning; missing tools or parser/crash failures are not expected objective failures.

No completed evaluated reducer/provider is duplicated in public evidence, tests, comments, generated output or alternate modules.

## Required bounded Gemini critique

Use `../../03_AI_AUDIT/GEMINI_PROMPT_EN_GB.txt` for one actual bounded exchange about one falsifiable claim. Do not request the complete assessed file or outsource the implementation. Extract one answer claim, classify it as Observed / Inferred / Unknown and independently check it against source, a named actual test or an actual browser observation. Record ACCEPTED / REJECTED / PARTIALLY ACCEPTED / UNKNOWN, a correction and a limitation. Never convert a supplied model result into your own React execution. A synthetic offline response is practice only and must be labelled `SYNTHETIC PRACTICE — NOT GEMINI`; actual exchange remains pending unless the teacher separately authorises replacement evidence in advance.

## Optional analysis extension

Predict how provider-wide update scope and API surface would change if search were centralised. Inspect `App.jsx` to justify the actual WorkshopWorkspace owner. Do not modify App.jsx, the assessed boundary or other supplied files to run this thought experiment. Any executable variant requires separate teacher instructions and a separately identified copy; it cannot be submitted as the bounded P01 result.

## Out of scope

- Server persistence, routing, authentication, Redux, performance micro-benchmarking, context selectors, or cross-tab synchronization.
