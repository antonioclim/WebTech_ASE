# S08 — Required P03 Portfolio

**Student route · v1.1.0 · WIP/PREVIEW · Included in the single S08 PDF**

This is required individual work after the meeting, not an optional appendix. Its source estimate is 45–60 minutes; completion time and deadline have not been measured or set here. The assessed change is only `projects/p03/student/src/SearchPanel.jsx`. Read its derived contract and preserve the weak comparator, fixtures, tests and package identity.

## 1. Predict and diagnose before patching

Record your source version, current implementation and a prediction for a named timeline. Use explicit times relative to the test start rather than vague “fast” and “slow”. Choose query A, then query B, and a deferred fake which may resolve A after its signal was aborted. Name which query owns the current display at each step.

Read the weak evidence and identify concrete owners and boundaries: query input, request status/results/error, derived display, effect dependencies, debounce timer, controller and permission to publish. A generated component can look correct on an immediate happy path while violating a later timeline. Source expectations do not become recorded observations.

The supplied demo adapter dereferences an absent signal when called by the weak starter. Record that TypeError separately. It does not establish the intended debounce or stale-settlement failure. The canonical baseline uses a deterministic fake. A compatible separate teaching preview is available, but its lifecycle remains weak and it is not the assessed baseline.

## 2. Implement within the one-file boundary

Keep query and request state, calculate displayed count/content during rendering and avoid a mirrored result array. Use stable values in the one lifecycle effect. Manage eligible trimmed input, debounce replacement, started requests, cleanup and visible state ownership. Suppressing dependency warnings or adding an arbitrary options object is not a reasoned fix.

Match the exact supplied accessible text for idle/loading/empty/results/error. Preserve the original unexpected error object for the provided logger, but show only the sanitised message to the user. Handle the omitted callback with a stable default; this delivery's private successor and additional test address that source edge case separately.

Do not add a library, edit the fake or change weak evidence. Keep a small diff and explain why each change exists. P02's full refactor is not a prerequisite: use C08's component/props concepts directly.

<!--pagebreak-->

## 3. Build an evidence table from actual work

Use the deterministic harness when a qualified project environment is available. Record the command, test name, source version, input, observed output and locator. Real test execution has not been performed by this package's production audit.

| Witness | What the observation must distinguish |
| --- | --- |
| Debounce | Changes before the delay expires replace the earlier timer; only the final eligible query starts. |
| Minimum length | Shortening the query resets the visible state and prevents later old publication. |
| Out-of-order settlement | Resolve B, then A; use a fake that can settle despite abort. Record the visible result after each. |
| Unmount | Check timer removal or signal abortion as appropriate, then settle/reject old work and check no publication/logging. |
| Error path | The logger receives the same unexpected object, visible text is sanitised and abort rejection is not logged. |
| Callback omitted | Render and change/recheck a short query without a supplied logger; distinguish stable behaviour from repeated effects. |
| Separate instances | Inputs, timers, controllers and results do not leak into a second panel. |

A test title is not its complete assertion set. Inspect the body: a regex alternation is not proof of every named responsibility, and calling unmount without an assertion about its consequences is not sufficient evidence of cleanup. Preserve canonical tests and identify additional witnesses as additional.

## 4. Three exact guard conditions

For diagnostic comparison, name your own implementation's publication conditions rather than copying a completed reference. Use controlled local variants and restore the valid assessed file afterwards. The three conceptual witnesses are:

**A — Guards retained.** The current lifecycle rejects settlement from a disposed or superseded request. Record your actual guard expressions and the fake used.

**B — Numeric comparisons removed; active/disposed condition retained.** Old settlement may still be rejected. Do not invent a failure to satisfy a claim that a numeric ID is universally necessary.

**C — Abort-only; publication guards removed.** With a deliberately non-cooperative fake, old work may publish after new work. Name exactly what you removed; an abort flag and a permission check are different conditions.

Use a trace such as “start A → cleanup/abort A → start B → settle B → settle A”. This is a planned sequence, **not** a pre-recorded successful run. A model trace must remain labelled MODEL; an actual React trace must include the source, command and observed output. Never alter a test so that an expected failure is manufactured.

<!--pagebreak-->

## 5. What goes into the single final PDF

Include the prior prediction, a source-linked diagnostic, the bounded patch/diff, at least one scheduling/settlement trace and its independently checked result, named guard conditions, error-handling evidence, actual check categories and remaining limits. Place them in the P03 section of the same S08 form as P01.

Your Gemini review may concern one P03 claim or one P01 claim. It does not require separate full conversations for each project. Keep the actual relevant extract and evaluate it yourself. Required P03 evidence cannot be replaced by a Gemini assertion or a hypothetical model result.

## 6. Result classification and stopping

Use ACTUAL_RECORDED only for an observation you really performed. Expected starter failures require the exact preserved starter/test signature and the intended failed assertion. A syntax error, unavailable command, missing package, crashed process, timeout or incidental adaptor TypeError is not automatically the intended pedagogical result. Record its class and preserve output.

After implementation, the standard final route expects actual canonical baseline/objective/regression/build successes and actual browser observations, with additional checks reported separately. If an essential route is unavailable or failing, save a draft and describe the block. An explicitly prior teacher-authorised alternative needs its reference and replacement evidence; the form cannot grant it.

The required output is a readable PDF with causal evidence, not an unreviewed code dump. Check that any actual screenshots named in the evidence index are included. Do not claim the PDF was saved or the Moodle assignment submitted until those separate actions have been verified.
