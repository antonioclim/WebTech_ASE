# Exercise Specification — Frontend Architecture Comparison

## Unit

Unit 10 — Client State and Frontend Architecture

## Learning objective

Produce and render an evidence-based architecture decision by comparing two behaviorally equivalent working state implementations against explicit application constraints.

## Why this exercise exists

State libraries are often selected by familiarity or code volume alone. The same interface can work with lifted state, Context + reducer, or Redux Toolkit, but the simplest acceptable choice changes with ownership distance, cross-route lifetime, asynchronous coordination, debugging needs, and dependency policy. Students need a repeatable decision method rather than a universal favorite.

## Prerequisites

- Projects 1–2 and their local/shared/global ownership boundaries.
- Component characterization, pure data transformations, and accessible tables.

## Starting context

Students receive a small React 19 + Vite comparison workbench containing:

- two complete, characterized implementations of the same reading-preferences behavior: `lifted/` and `context-reducer/`;
- a supplied scenario catalog ranging from one-screen state to distant consumers and cross-route async requirements;
- supplied instrumentation that reports observable parity, state owners, prop coordination distance, provider/store boundaries, dependencies, and supported capabilities without evaluating which is universally better;
- a supplied comparison table/view and incomplete `src/decision/compare-architectures.js`;
- tests, styles, entry, and lock file.

The target exports `compareArchitectures({ candidates, requirements })`, returning ranked evidence and a recommendation with explicit reasons. The candidates remain working and unchanged.

## Required behavior

- Reject comparison when candidates do not have matching characterized behavior; never recommend an implementation that fails observable parity.
- Treat required capabilities as gates, including cross-route lifetime, asynchronous request coordination, inspectable event history, and no-new-dependency policy.
- Among eligible candidates, rank lower conceptual/dependency/coordination cost first using the supplied metrics; do not encode a fixed library preference.
- Return a stable result containing candidate eligibility, cost evidence, selected candidate ID, and at least one requirement-linked reason plus one rejected-alternative reason.
- Recommend lifted state for the supplied small one-screen scenario, Context + reducer for supplied distant stable consumers without cross-route async requirements, and no eligible candidate when neither working candidate satisfies required centralized async/event-history capabilities.
- Preserve ties explicitly and require a stated tie-break criterion rather than relying on input order.
- Keep comparison pure, deterministic, and immutable; rendering merely presents its returned evidence.
- Do not measure raw line count as a proxy for maintainability or claim performance from render counts without an actual benchmark.

## Constraints

- JavaScript, React 19 + Vite, ESM, pinned lock file; no added runtime dependency.
- Implement only `src/decision/compare-architectures.js`; preserve both working variants, instrumentation, scenarios, view, tests, fixtures, and dependencies.
- Use supplied evidence fields and documented rules; no component source scraping, library-name preference, hard-coded scenario IDs, benchmark claims, global state, or mutation.
- This exercise compares current candidates; it does not require adding Redux to the workbench.

## Observable completion criteria

- Both candidate implementations pass the same behavior characterization before comparison.
- The rendered table exposes capability gates, costs, recommendation, and reasons for each supplied scenario.
- Unit tests cover parity failure, gates, each canonical recommendation, ties, input-order independence, and immutability.
- A student can change one requirement and explain why the recommendation changes or becomes unresolved.
- Build, categorized checks, audit, and browser smoke pass; only `src/decision/compare-architectures.js` changes.

## Validation plan

### Baseline checks

- Lifted and Context + reducer variants are independently runnable and behaviorally equivalent.
- Scenario fixtures, metric instrumentation, table rendering, Vite entry, and a known comparison result fixture work without the objective comparator.

### Objective checks

- Behavior-parity exclusion and required-capability gates.
- Evidence cost ranking without fixed implementation preference.
- Small-screen lifted, distant-consumer Context, and no-eligible centralized-async outcomes.
- Stable reasons, rejected alternatives, ties, and explicit tie-break behavior.
- Input-order independence, purity, immutability, and source bans.

### Regression checks

- Both candidate applications retain exact characterized interactions/accessibility.
- Production build and comparison view shell remain healthy.
- Instrumentation/scenarios remain data-only and contain no hidden recommendation.
- No Redux/library dependency or fake performance claim is introduced.

## Intended student work

After reference validation, copy the reference and replace only `src/decision/compare-architectures.js` with an unavailable comparator retaining its export signature, supplied evidence vocabulary, and focused TODOs. Both candidate variants, instrumentation, scenarios, view shell, build, and baseline parity remain healthy; decision objectives fail at the unavailable result.

No completed ranking/recommendation algorithm exists in scenario IDs, fixtures, tests, prose, generated output, or alternate modules.

## Gemini task

> Inspect `spec.md`, both characterized candidates, instrumentation field definitions, scenario requirements, and categorized checks. Implement only `src/decision/compare-architectures.js`: parity exclusion, capability gates, evidence-based cost ranking, explicit ties, stable requirement-linked reasons, and immutable deterministic results. Do not edit candidates/evidence/tests, add dependencies, prefer a library name, scrape source, use line count, hard-code scenarios, or claim unmeasured performance. Done when checks/build/browser pass and the diff is one file. Defend each recommendation from evidence and identify when neither candidate is adequate.

## Debugging / extension task

- Change the distant-consumer scenario to require cross-route async coordination and event-history inspection. Explain why a previously suitable Context candidate becomes ineligible and why “pick Redux” is a future design proposal rather than evidence that either supplied candidate now passes.

## Out of scope

- Implementing a Redux candidate, production performance benchmarking, server state caches, authentication, persistence, microfrontends, or universal architecture scoring.
