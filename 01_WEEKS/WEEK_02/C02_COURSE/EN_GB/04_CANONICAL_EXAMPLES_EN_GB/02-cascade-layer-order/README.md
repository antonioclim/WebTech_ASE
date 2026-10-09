# Lecture example — Cascade layer order

## Mechanism and prediction

One notice and two rules isolate layer order from a larger stylesheet repair. The domain is normal author declarations in named layers. `@layer legacy, theme` establishes `theme` later, so its normal declarations win before selector specificity is compared.

| Rule | Declared colours | Role in the original |
| --- | --- | --- |
| `#app .notice` in `legacy` | `#aaa` / `#eee` | Earlier layer, more specific selector |
| `.notice` in `theme` | `#172033` / `#dce9ff` | Later layer, less specific selector |

Predict `color=rgb(23, 32, 51)` and `background=rgb(220, 233, 255)` for this canonical file. The presentation and handout use a separate transfer fixture, `#claim .status`, including `#0f766e`; its colours are not measurements of this notice.

## Run and observe

Open `index.html` in an ordinary browser. Inspect matched rules on `#app .notice`, then compare the computed colour and background with the prediction. **Read computed colours again** takes a fresh probe of this same element after any temporary inspection change. Its counter identifies a new read; it does not prove a variation was performed.

Record the file, layer order, prediction, actual computed values and explanation. Identify source reading separately from a browser observation. If the browser is unavailable, the exact RGB pair remains a prediction.

## Compare one variation at a time

Follow the [protected-source variation method](../../C02_VARIATION_METHOD.md). Perform layer edits only in the disposable copy outside the collection and return to the original after each comparison.

1. Reverse the initial order statement to `@layer theme, legacy;`. Predict the legacy pair `rgb(170, 170, 170)` / `rgb(238, 238, 238)`, then inspect a fresh computed result in that copy.
2. In another restored copy, remove both layer wrappers and the order statement while retaining the same selectors and declarations. With the other relevant cascade factors equal, predict that the more specific `#app .notice` wins. Read both computed colours again.

These comparisons explain the winner in this stated domain. They do not establish `!important` layer order, text contrast or the cause of an element disappearing. Inspect a `display:none` declaration when visibility is the defect; a colour selector cannot restore an element removed from layout.

## Verification scope and provenance

The on-page observer executes only when the page runs in a browser. Browser controls and these variations have not been executed for this edited local collection. A source check cannot establish their results or a full accessibility audit.

The predecessor documented a headless Chromium result matching the original RGB prediction. That is historical provenance, not a fresh observation. Its exact command is retained below outside the supported student route; do not run it or change browser security settings:

```bash
google-chrome --headless=new --no-sandbox --disable-gpu --virtual-time-budget=1000 --dump-dom "file://$PWD/index.html"
```
