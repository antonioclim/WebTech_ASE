# Lecture Example — Cascade layer order

## Concept demonstrated

Cascade-layer precedence is decided before selector specificity, so a low-specificity rule in a later layer can override a high-specificity rule in an earlier layer.

## Why this example is in the lecture

One notice and two rules isolate layer order from a larger stylesheet repair.

## What to observe

- The legacy selector includes an ID and class.
- The theme selector is only a class.
- The declared layer order still makes the theme colors win.

## Run / inspect

Open `index.html` in an ordinary browser and inspect its matched rules and computed values. This is the supported student route.

### Historical provenance — do not execute

The following predecessor command is retained as exact source provenance. It is outside the current student route; do not run it or change browser security settings:

```bash
google-chrome --headless=new --no-sandbox --disable-gpu --virtual-time-budget=1000 --dump-dom "file://$PWD/index.html"
```

## Explanation

The layer statement establishes `legacy` before `theme`. Normal declarations in the later layer outrank normal declarations in the earlier layer without `!important` or selector escalation.

## Variations

Follow the [protected-source variation method](../../C02_VARIATION_METHOD.md) first. Perform layer edits only in the disposable copy outside the collection.

- Reverse the layer names in the order statement.
- Remove layers and compare the result under ordinary specificity.

## Validation

Historical predecessor validation statement, not a new RC10 execution: validated in headless Chromium; computed styles are written to `#result` as `color=rgb(23, 32, 51); background=rgb(220, 233, 255)`.
