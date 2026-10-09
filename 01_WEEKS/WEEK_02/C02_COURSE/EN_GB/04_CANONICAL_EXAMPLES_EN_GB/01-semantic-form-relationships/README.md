# Semantic form relationships and error states

The first form exposes a name, instructions, a group and required state through native HTML relationships. It has no registration service; use fictional values. The second section shows a supplied invalid state after validation and a corrected variation.

Run `node validate.js` from this directory for bounded source checks. Open `index.html` in a browser for the following observations:

- Click the email label and observe which input receives focus.
- Follow Tab and Shift+Tab through the form; use arrow keys in the attendance radio group.
- Inspect the instruction connected by `aria-describedby`. Where the browser offers an accessibility inspector, compare the calculated name with the description. A missing inspector limits the observation to the DOM relationships.
- In the separate error variation, inspect `aria-invalid="true"` and the linked `email-error` text. The state attribute does not supply the explanation by itself.
- Activate **Show the supplied corrected state** with a keyboard. The value changes to a fictional valid address, `aria-invalid` becomes false, the error disappears and its ID is removed from the description.
- Activate **Show the supplied invalid state** and confirm the corresponding relationships return.

The supplied states represent a validation outcome. In an actual application, avoid flagging an untouched field while the user is still entering data; show feedback after an appropriate validation check and update it when checked again. Native validation does not replace server validation.

For a counterexample, follow the [protected-source variation method](../../C02_VARIATION_METHOD.md). In a temporary DOM edit or disposable copy, leave `not-an-email` in place but set `aria-invalid="false"`. The stated invalidity has changed while the value remains invalid. Restore the original before making the corrected-state comparison. Do not count a changed state attribute alone as a corrected value.

Keep label activation, the Tab route, radio arrow-key operation and the state buttons as separate observations. A source relationship or a scripted focus call does not execute those interactions. For each one, record the file, input/state, prediction, action, observed result and limit. A browser interaction that has not been performed remains unexecuted.

The source validator does not execute the keyboard route or establish full accessibility conformance. Deliberately removing a checked label or error link in a disposable source copy should fail its bounded checks; a temporary DOM edit does not change the file it reads. For the primary definitions, read the [WHATWG forms and label sections](https://html.spec.whatwg.org/multipage/forms.html) and [WCAG 2.2 error identification and labels or instructions](https://www.w3.org/TR/WCAG22/).
