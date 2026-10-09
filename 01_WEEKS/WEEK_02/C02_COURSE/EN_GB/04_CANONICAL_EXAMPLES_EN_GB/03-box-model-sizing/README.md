# Lecture example — Box model sizing

## Mechanism and prediction

Two otherwise identical boxes declare `width:200px`, `padding:20px` and a `1px` border on each side. `box-sizing` changes which edges the declared width covers. Margins stay outside the border edge.

| Box | Border-edge prediction | Content-width calculation |
| --- | --- | --- |
| `content-box` | `200 + 20 + 20 + 1 + 1 = 242px` | `200px` |
| `border-box` | `200px` | `200 − 40 − 2 = 158px` |

The presentation and handout use a separate transfer input: width 240px, padding 16px and border 2px. That input predicts 276px / 240px border edges and 204px of border-box content. Do not record those numbers as observations of this canonical 200/20/1 input.

## Run and observe

Open `index.html` in an ordinary browser and inspect both computed box models. **Measure both boxes again** reads fresh values from the same two elements. Record the actual CSS input and compare the border-edge measurement with your calculation.

The observer labels three different measurements:

- `getBoundingClientRect().width` reports the rendered border-edge width in this untransformed example.
- `clientWidth` excludes border and includes padding.
- `scrollWidth` helps inspect content that needs more horizontal space; it is not another name for the border edge.

The computed `width` is also shown beside `box-sizing`; interpret that property with its sizing mode. Keep the file, input, prediction, measurement, explanation and remaining limit in the record. Do not infer browser execution from the equations alone.

## Content-pressure variations

Follow the [protected-source variation method](../../C02_VARIATION_METHOD.md). Use temporary DevTools changes restored by reload or a disposable external copy, then measure the same box again.

- Add a supplied long unbroken token. Compare its client and scroll widths, then visually inspect the complete text. A correct border-edge calculation does not guarantee that content fits.
- Replace physical padding with logical `padding-inline` in a disposable copy and change writing direction. Record the changed input before calculating again.

Global border-box can make edge constraints easier to reason about, but it does not remove intrinsic text pressure. Hiding overflow alone does not demonstrate that content is preserved.

## Verification scope and provenance

The predecessor reported headless Chromium widths of 242px / 200px. Those historical values agree with the original calculation; they are not fresh measurements of this edited local collection. Browser controls and variations remain unexecuted here. A `file:` URL establishes local loading, without establishing an HTTP status or a published page.
