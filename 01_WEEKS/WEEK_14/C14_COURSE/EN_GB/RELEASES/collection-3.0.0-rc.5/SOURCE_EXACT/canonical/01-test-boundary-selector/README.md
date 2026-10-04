# Lecture Example — Test Boundary Selector

## Concept demonstrated

A test should use the cheapest boundary that can observe the behavior in question.

## Why this example is in the lecture

One Express task system is checked at three actual boundaries: pure policy, repository integration, and public HTTP response.

## What to observe

- Pure policy fits a unit test.
- Persistence needs an integration boundary.
- Status/header/body semantics need an API boundary.
- Focus/render/navigation behavior needs a real browser.

## Run / inspect

```bash
npm install
npm test
```

## Explanation

Higher boundaries include more components and lifecycle cost. They are justified when lower boundaries cannot observe the required contract, not because they are inherently more realistic.

## Variations

- Classify a Service Worker control/reload check.
- Identify one behavior that deserves checks at two boundaries for different reasons.

## Validation

Validated by separate unit, integration, and HTTP test commands.
