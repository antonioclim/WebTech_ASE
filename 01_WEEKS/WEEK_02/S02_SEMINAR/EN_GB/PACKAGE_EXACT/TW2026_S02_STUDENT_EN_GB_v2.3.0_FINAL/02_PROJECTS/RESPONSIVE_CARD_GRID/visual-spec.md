# Visual and behavioural specification

| Viewport | Required columns | Bounded observation |
| --- | ---: | --- |
| 320 CSS px | 1 | Page padding remains, controls wrap and there is no horizontal scroll. |
| 768 CSS px | 2 | Two equal tracks share the available width. |
| 1280 CSS px | 4 | Four tracks remain inside a centred 72rem container. |

The collection uses CSS Grid. The header and each card use Flexbox for their internal relationship. Grid and flex items may shrink below their intrinsic minimum where the contract requires it. The media placeholder has a 16:9 ratio. Card actions align at the bottom without fixed card heights. Keyboard focus remains visible. Transitions are disabled under `prefers-reduced-motion: reduce`.

A screenshot is evidence of one visible state. It is not, by itself, evidence of the CSS mechanism or of every browser and viewport.
