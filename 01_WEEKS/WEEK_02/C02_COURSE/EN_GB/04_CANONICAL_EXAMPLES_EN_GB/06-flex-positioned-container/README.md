# Lecture example — Flex container and positioned child

## Mechanism

Flexbox distributes normal-flow toolbar items. The card remains in flow and gives its intentionally overlapping badge a local reference through `position:relative`. Its top padding deliberately reserves room for the badge; absolute positioning does not reserve that room itself.

- `.toolbar` is a flex container with a row direction, space-between distribution, centre alignment, wrapping and a gap. Its direct children are the flex items.
- `justify-content` operates on the main axis and `align-items` on the cross axis. Their horizontal/vertical orientation depends on flex direction and writing mode.
- `.card` keeps its normal-flow space. `.badge` is absolute with block-start and inline-end offsets.

## Source check and fresh browser probe

Run `node validate.js` from this example directory if Node is available. It checks bounded source patterns for the container, positioned child and their relationship. Record the actual runtime and output. A PASS does not execute layout or keyboard interaction.

Open `index.html` in an ordinary browser, resize the viewport and inspect the same toolbar, card and badge. **Read layout again** refreshes the computed direction, distribution, alignment, wrap, gap and badge position. `badge-offsetParent=card` is a useful observation in this simple example; `offsetParent` is not a universal definition of the CSS containing block.

## Compare the anchor

Follow the [protected-source variation method](../../C02_VARIATION_METHOD.md). In DevTools, temporarily untick the card's `position:relative`, inspect the badge and read a fresh probe. Record the original and changed anchor, then reload and recheck the original. Do not move ordinary card content into absolute positioning to reproduce a screenshot.

Change `justify-content` and `align-items` independently or temporarily disable `flex-wrap` to investigate narrow-container pressure. Each experiment needs its own changed input, prediction, observation and restoration.

## Compare visual order with actual keyboard order

In a disposable copy, add `order:-1` to the Next button through DevTools or that copy's source. Predict that its visual position changes while the default sequential route of these native controls still follows their DOM order: Previous before Next. Confirm both directions with actual Tab and Shift+Tab. Reload the original or remove the temporary change after the comparison.

The on-page focus observer records a focused control and the latest recorded Tab key. Record the input you actually performed; a focus event or a stale key label alone does not demonstrate a keyboard route. `focus()` is a different input. `tabindex`, hidden/disabled states and other mechanisms can alter sequential navigation in other cases. Previous and Next have no navigation handlers, so their activation does not establish successful navigation.

## Verification scope and provenance

The predecessor documented a Node validator PASS for these source contracts. Treat a new run as a bounded source result on its observed runtime. Native browser resizing, the temporary anchor/order variations and actual keyboard controls have not been executed for this edited local collection. None of these checks is a full accessibility audit.
