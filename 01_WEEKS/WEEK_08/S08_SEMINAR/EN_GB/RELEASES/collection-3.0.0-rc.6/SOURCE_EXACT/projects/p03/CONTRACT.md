# P03 — required portfolio contract

**Required individual diagnostic, one-file patch and causal explanation. Not optional.**

Edit only `student/src/SearchPanel.jsx`. Preserve `evidence/GeneratedSearchPanel.jsx`, tests, entry, styling, dependencies and injected fake. Retain props search, debounceMs, minimumLength and onUnexpectedError.

Keep user-owned query and request-owned status/results/error state; derive visible count/content rather than mirror it in state. Input is controlled and immediate. Trimmed queries shorter than minimumLength reset to idle/empty and do not search. Debounce eligible queries, replace prior timers and clean up on changes and unmount. Each started request receives a per-request AbortController signal and is aborted during cleanup. Old settlement must not publish even when a fake resolves after abort.

Show exact idle/loading/empty/results/sanitised-error states with accessible status semantics. Pass unexpected error objects unchanged to the logger without displaying internal messages. Abort-related cleanup rejection is not an unexpected error. Depend on stable props/used values; no lint suppression, arbitrary recreated options, mirrored derived state, data-fetching library, reducer/global state or custom-hook extraction. One effect owns the request lifecycle.

Completion includes named actual debounce, ordering, resolve-after-abort, short-query, unmount, errors, instance isolation, source-boundary and browser observations plus canonical baseline/objective/regression/build categories. The supplementary omitted-callback/unmount checks are separate authored tests, not historical canonical coverage.

The original weak starter omits a signal that its original demo adapter requires. An incidental TypeError is not the stale-response baseline objective. The separate compatible teaching preview leaves the weak panel unrepaired and does not authorise changing the assessed adapter. For the guard experiment, distinguish original guards, numeric comparisons removed while active remains and abort-only with publication guards removed. The middle condition may still reject old settlement. Record the exact variant, non-cooperative fake, order and restoration.

Source: U08 project-03/spec.md and W08 F07–F10. The active 14-week curriculum makes this required portfolio; conceptual decomposition knowledge does not require implementing optional P02. Bounded Gemini critique replaces the original complete-implementation prompt in the derived delivery route.
