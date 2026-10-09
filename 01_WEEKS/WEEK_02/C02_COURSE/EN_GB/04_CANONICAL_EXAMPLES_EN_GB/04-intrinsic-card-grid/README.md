# Lecture example — Intrinsic card Grid

## Mechanism and prediction

Three cards retain the rule `repeat(auto-fit, minmax(min(100%, 14rem), 1fr))`. Grid chooses tracks from the available space and card height follows content. `auto-fit` collapses unused repeated tracks. JavaScript observes the layout and supplies labelled text variations; it does not select the columns.

For a 16px initial root font, the 14rem minimum is 224px, body padding totals 32px and the gap is 16px. Three minimum tracks require `3 × 224 + 2 × 16 = 704px` of grid space.

| Viewport in CSS pixels | Predicted grid space | Predicted populated columns |
| --- | --- | --- |
| 320px | 288px | 1 |
| 768px | 736px | 3 |
| 1280px | 1248px | 3 |

These predictions depend on the stated font, padding and gap. This canonical file is a separate three-card example; the seminar fixture has its own contract. Do not apply a seminar column-count target to this page.

## Run and observe

Open `index.html` in an ordinary browser. Use a responsive viewport control to set each width, then choose **Read grid measurements again**. In Chrome/Chromium this is the DevTools device toolbar; in Firefox it is Responsive Design Mode. Read the actual width in CSS pixels rather than treating a phone preset name or monitor resolution as the measurement.

The fresh probe reads root font size, grid width, gap and computed tracks. `populated-columns` counts the distinct horizontal positions of the three cards in this example. Document and card client/scroll widths provide separate overflow clues. Inspect the same grid in DevTools and confirm the visual arrangement.

Record browser/version, actual viewport width, browser zoom, root font, exact text, prediction and observed result. Native browser zoom at 200% is a separate input from doubling a CSS font. After a zoom or font change, measure again and restore the initial setting. If a control is unavailable, leave its observation blocked.

## Compare two text inputs

At the same measured width, choose **Use supplied multiword text**, inspect the complete sample in the Explain card and record a fresh probe. Then choose **Use supplied continuous token** and repeat on the same card. The second sample joins the same fictional words without spaces. **Restore original text** removes the sample; reload also restores the original state.

The `min(100%, 14rem)` track minimum prevents that minimum alone from exceeding a narrow grid. It does not promise to wrap every continuous token. Read the text visually as well as checking overflow: zero document overflow can coexist with a clipped descendant. This example deliberately supplies no automatic wrapping or clipping repair.

For additional CSS experiments, follow the [protected-source variation method](../../C02_VARIATION_METHOD.md). Replace `auto-fit` with `auto-fill` in a disposable copy and inspect the unused tracks. Any repair must name the owner of the defect and be rechecked on the same text and width; border-box, a wrapping declaration or hidden overflow are not interchangeable evidence.

## Verification scope and provenance

The predecessor recorded headless captures at 360px and 900px with one and three columns. Those are historical claims about different recorded inputs. Browser resizing, native zoom and the new observation controls have not been executed for this edited local collection. Source inspection and the table above establish predictions, not fresh browser results or a full accessibility audit.
