# Exercise Specification — Frontend Architecture Comparison

> **Active S10 teaching specification — derived successor.** The State ADR is required. Full P03 comparator implementation is optional and NOT_STARTED is permitted. Implement only `student/src/decision/compare-architectures.js` if you choose this extension. P02 implementation is not a prerequisite for the required ADR. The byte-exact original is `SPEC_SOURCE_EXACT.md` and is retained only as historical provenance. The current bounded Gemini critique and evidence rules below govern this seminar. No dependencies are installed by this package.

## Unit

Unit 10 — Client State and Frontend Architecture

## Learning objective

Produce the required State ADR with explicit constraints, capability gates, evidence classes, assumptions, a decision and sensitivity analysis. The optional full comparator renders a decision using two supplied reading-preference candidates and their declared characterisation data.

## Why this exercise exists

State libraries are often selected by familiarity or code volume alone. The same interface can work with lifted state, Context + reducer, or Redux Toolkit, but the simplest acceptable choice changes with ownership distance, cross-route lifetime, asynchronous coordination, debugging needs, and dependency policy. Students need a repeatable decision method rather than a universal favorite.

## Prerequisites

- P01 ownership analysis and the local/shared/server boundary concepts. P02 implementation is not required for the ADR.
- Component characterization, pure data transformations, and accessible tables.

## Starting context

Students receive a small React 19 + Vite comparison workbench containing:

- two complete reading-preference candidates at `student/src/candidates/LiftedPreferences.jsx` and `student/src/candidates/ContextPreferences.jsx`, with supplied characterisation checks whose current execution must be recorded separately;
- a supplied scenario catalog ranging from one-screen state to distant consumers and cross-route async requirements;
- supplied descriptor data at `student/src/decision/evidence.js` declaring behaviour flags/signatures, capabilities and pedagogical cost assumptions. These flags are not authenticated observations and the weights are not measured maintainability or performance;
- a supplied comparison table/view and incomplete `src/decision/compare-architectures.js`;
- tests, styles, entry, and lock file.

The target exports `compareArchitectures({ candidates, requirements })`, returning ranked evidence and a recommendation with explicit reasons. The candidates remain working and unchanged.

## Required behavior

- Reject comparison when candidates do not have matching characterized behavior; never recommend an implementation that fails observable parity.
- Treat required capabilities as gates, including cross-route lifetime, asynchronous request coordination, inspectable event history, and no-new-dependency policy.
- Among eligible candidates, rank lower conceptual/dependency/coordination cost first using the supplied pedagogical cost assumptions; do not encode a fixed library preference.
- Return a stable result containing candidate eligibility, cost evidence, selected candidate ID, and at least one requirement-linked reason plus one rejected-alternative reason.
- Recommend lifted state for the supplied small one-screen scenario, Context + reducer for supplied distant stable consumers without cross-route async requirements, and no eligible candidate when neither working candidate satisfies required centralized async/event-history capabilities.
- Preserve ties explicitly and require a stated tie-break criterion rather than relying on input order.
- Keep comparison pure, deterministic, and immutable; rendering merely presents its returned evidence.
- Do not measure raw line count as a proxy for maintainability or claim performance from render counts without an actual benchmark.

## Constraints

- JavaScript, React 19 + Vite, ESM, pinned lock file; no added runtime dependency.
- Implement only `src/decision/compare-architectures.js`; preserve both working variants, descriptor data, scenarios, view, tests, fixtures, and dependencies.
- Use supplied evidence fields and documented rules; no component source scraping, library-name preference, hard-coded scenario IDs, benchmark claims, global state, or mutation.
- This exercise compares current candidates; it does not require adding Redux to the workbench.

## Observable completion criteria

- Before claiming observed candidate parity, record actual results for the same behaviour characterisation. Without execution, label parity as supplied/source evidence and record the pending observation.
- The rendered table exposes capability gates, costs, recommendation, and reasons for each supplied scenario.
- Unit tests cover parity failure, gates, each canonical recommendation, ties, input-order independence, and immutability.
- A student can change one requirement and explain why the recommendation changes or becomes unresolved.
- Build, categorized checks, audit, and browser smoke pass; only `src/decision/compare-architectures.js` changes.

## Validation plan

### Baseline checks

- Lifted and Context + reducer variants are independently runnable and behaviorally equivalent.
- Scenario fixtures, descriptor data, table rendering, Vite entry and a supplied known-result fixture support baseline checks independently of the incomplete comparator; current execution is not implied.

### Objective checks

- Behavior-parity exclusion and required-capability gates.
- Evidence cost ranking without fixed implementation preference.
- Small-screen lifted, distant-consumer Context, and no-eligible centralized-async outcomes.
- Stable reasons, rejected alternatives, ties, and explicit tie-break behavior.
- Input-order independence, purity, immutability, and source bans.

### Regression checks

- Both candidate applications retain exact characterized interactions/accessibility.
- Production build and comparison view shell remain healthy.
- Descriptors/scenarios remain data-only. Canonical scenario recommendations are expected outcomes under the declared cost assumptions, not independent empirical evidence.
- No Redux/library dependency or fake performance claim is introduced.

## Current required ADR and optional student starter

The required deliverable is a manual State ADR. If the full comparator extension is chosen, implement only the supplied incomplete `student/src/decision/compare-architectures.js`; no private reference copy is needed or permitted. Preserve both preference candidates, descriptor data, scenarios, view and tests. Current characterisation and comparator test results require legitimate provisioned execution. Descriptor flags alone do not establish observed parity.

No completed evaluated ranking/recommendation algorithm exists in public scenario data, fixtures, tests, generated output or alternate modules. Canonical recommendation expectations are supplied pedagogical outcomes under declared assumptions.

## Bounded critique and required ADR

Write the required ADR for one concrete capstone feature. Record consumers, lifetime, authority and coordination requirements; compare applicable local, lifted, URL, Context and server-authority options. Identify capability gates before comparing assumed costs. Include one changed requirement/assumption and an explicit tie or no-eligible outcome. Reject any conclusion that Context is universally best for distant consumers or that an unimplemented Redux candidate has demonstrated the required capabilities. Do not ask Gemini for a complete comparator. One actual bounded critique for the seminar is sufficient; the optional P03 code creates no additional AI requirement.

## Debugging / extension task

- Change the distant-consumer scenario to require cross-route async coordination and event-history inspection. Explain why a previously suitable Context candidate becomes ineligible and why “pick Redux” is a future design proposal rather than evidence that either supplied candidate now passes.

## Out of scope

- Implementing a Redux candidate, production performance benchmarking, server state caches, authentication, persistence, microfrontends, or universal architecture scoring.
