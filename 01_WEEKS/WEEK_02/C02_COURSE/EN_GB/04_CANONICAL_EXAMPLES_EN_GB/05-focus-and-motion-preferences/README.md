# Lecture example — Focus and motion preferences

## Mechanism

The native Save changes button retains its hover transform, `:focus-visible` outline and conditional reduced-motion rule. The initial `focus()` call remains a labelled programmatic demonstration. Separate route markers and observers make it possible to investigate actual keyboard input without counting that call as a Tab test. The action has no saving service.

## Observe the keyboard route and activation

1. Open `index.html` in an ordinary browser. The initial output says `source=initial-programmatic-focus`; it can establish the active element after that call only. It does not establish sequential focus order or a visible, unobscured indicator.
2. Click **Keyboard route start**, then press actual Tab to **Save changes** and Tab again to **Keyboard route end**. Use actual Shift+Tab to return. Observe the focus indicator visually at each step. Do not substitute `focus()`, a script-created key event or a source declaration for this route.
3. With Save changes focused through the keyboard, press Enter and Space separately. Record each input and the observed click count. The on-page click listener is added local instrumentation, installed once when the page loads and reset by reload. It witnesses an event, without proving that anything was saved.

The focus output shows the active element, latest recorded key and computed action focus style. A previously recorded key alone does not identify the source of a later focus event. The click output includes `isTrusted` and `detail`; keep pointer, keyboard and scripted inputs distinct in your record. No on-page observer proves visual visibility or full accessibility conformance.

## Observe both actual preference states

Use browser media emulation or the system preference, rather than a CSS-class simulation. In Chrome/Chromium, find the Rendering panel's **Emulate CSS media feature prefers-reduced-motion** control. In Firefox, use the available accessibility/media simulation for reduced motion or change the system preference. Menu placement varies by browser version. If one state cannot be set through an available control, record that observation as blocked.

| Actual input | `matchMedia('(prefers-reduced-motion: reduce)').matches` prediction | Computed transition prediction |
| --- | --- | --- |
| `no-preference` | `false` | property `transform`, duration `0.2s` |
| `reduce` | `true` | property `none`, duration `0s` |

Set each state, reload this page and choose **Read actual preference again** for a fresh probe. Record browser/version, whether the input was browser emulation or a system preference, the probe number and both actual results. A media-query change also requests a fresh probe; the initial output must not be reused after the input changes. Restore the original preference setting after the comparison.

An unconditional `transition:none` could yield 0s in both states, so a zero duration alone does not establish that this query responded correctly. Reduced motion here removes the transition while the native action remains available. Hover styling, focus indication and activation are separate observations.

## Variations and verification scope

Follow the [protected-source variation method](../../C02_VARIATION_METHOD.md). Temporarily disable the custom focus declaration in DevTools to inspect the user-agent default, then reload to restore it. Do not treat a default indicator as absent without observing it.

The predecessor claimed headless programmatic focus and manual preference emulation. Those statements describe historical checks, not fresh keyboard or preference results for this edited local collection. Actual Tab/Shift+Tab, Enter/Space, both emulated preference states and these browser controls remain unexecuted here. Source inspection can support the predictions while those observations remain pending.
