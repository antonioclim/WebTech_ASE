# C01/S01 — Minimum JavaScript bridge before C03

This read-only example maps two library cards into two summaries. It explains the operations needed by S01 without implementing either assessed function. C03 will develop JavaScript systematically.

From the C01 package root `01_WEEKS/WEEK_01/C01_COURSE/EN_GB`, run:

```sh
node 04_CANONICAL_EXAMPLES/06-javascript-bridge/example.mjs
```

Predict the two labels and availability values before running. `summariseCard(card)` names a function and its parameter. The caller provides one object; `card.title` reads its title. `return` sends a value back to the caller. `{ label: ..., available: ... }` constructs a new object. `map` calls the function once for each source row and retains source order. It does not require assignment to `card.title`.

The predicted summaries are `Maps/true` and `Poems/false`. The original first title should retain its surrounding spaces. The assertions compare source content before and after, then compare object identities separately. An empty new array could preserve the source and still fail the required two-row result. A new array containing the original objects would have a new container but fail per-row freshness. Those are different properties.

The final block parses a fictional address without sending HTTP. `pathname` excludes query and fragment; `searchParams.get` supplies a decoded query value. `decodeURIComponent` can throw `URIError` for invalid percent encoding. The `try` block marks that particular input failure and lets unrelated exceptions remain visible. `%20%20` decodes successfully but becomes empty after `trim`: successful decoding and a usable value are separate decisions.

For an optional experiment, make a disposable copy outside the collection, change only one card's copies and predict which summary changes. Do not edit the canonical example or assessed targets for this prerequisite exercise. Its observations establish the listed local transformations, not a universal URL parser or a completed S01 project.
