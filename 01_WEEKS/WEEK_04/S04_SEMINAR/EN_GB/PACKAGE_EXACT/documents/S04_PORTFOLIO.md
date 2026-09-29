# Required P02 portfolio — state, events and cleanup

P02 Interactive Task List is required after the seminar. Its source workload is 45–60 minutes outside the core meeting, not a guaranteed completion time. Read contracts/P02.html and use only projects/p02/public/task-view.js as the edit target. No new dependency or persistence feature is needed.

## Prediction and implementation

Before editing, predict the row structure for one completed task and for the empty array. Predict the callback for a direct checkbox click and for a span nested inside a delete button. Explain which element owns the delegated listener. Preserve these predictions in the portfolio section of the same S04 form.

Implement rendering without parsing task titles as HTML. Treat rendering and binding as distinct responsibilities; repeated rendering must not attach new row handlers. A valid submit trims and adds, a blank submit does not add and cleanup removes the handlers installed by that binding.

## Evidence sequence

Run raw initial and separate teaching checks before editing. After implementation, use complete mode and preserve the actual named results. Launch the normal Task List for genuine browser add/toggle/delete, including blank input and a literal <em>sample</em> title.

Open the printed OBSERVER URL for a separate caller. Enter a prediction, call your renderer and bind your handlers. Perform one action and record callback counts. Unbind, repeat the action and record the delta. Rebind, perform one action and record the new delta. A helper message saying cleanup was called is not proof that cleanup worked. Add a nested span with the labelled intervention button, then click that span and identify the containing task.

The scripted-submit button deliberately dispatches an event without a native form submission default action. Its result is SCRIPTED_BROWSER_EVENT, not a native submit. Use the normal application as well. An incomplete native submit handler may reload the page; preserve that observation rather than disabling browser security or adding a helper that masks the missing preventDefault.

## Completion

Add the P02 observations and one-file diff summary to the existing S04 form. Recheck the actual browser and Gemini evidence states, reflect on the remaining limits and export one final PDF after the portfolio window. Do not upload separate project ZIPs or complete conversations. P03 Resilient Fetch remains optional and is not needed for the maximum standard mark.
