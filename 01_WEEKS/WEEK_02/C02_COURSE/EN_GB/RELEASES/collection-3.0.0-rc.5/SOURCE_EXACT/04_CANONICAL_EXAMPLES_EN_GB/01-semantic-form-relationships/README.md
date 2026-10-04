# Semantic form relationships and error states

The first form exposes a name, instructions, a group and required state through native HTML relationships. It has no registration service; use fictional values. The second section shows a supplied invalid state after validation and a corrected variation.

Run `node validate.js` from this directory for bounded source checks. Open `index.html` in a browser for the following observations:

- Click the email label and observe which input receives focus.
- Follow Tab and Shift+Tab through the form; use arrow keys in the attendance radio group.
- Inspect the instruction connected by `aria-describedby`.
- In the separate error variation, inspect `aria-invalid="true"` and the linked `email-error` text. The state attribute does not supply the explanation by itself.
- Activate **Show the supplied corrected state** with a keyboard. The value changes to a fictional valid address, `aria-invalid` becomes false, the error disappears and its ID is removed from the description.
- Activate **Show the supplied invalid state** and confirm the corresponding relationships return.

The supplied states represent a validation outcome. In an actual application, avoid flagging an untouched field while the user is still entering data; show feedback after an appropriate validation check and update it when checked again. Native validation does not replace server validation.

The source validator does not execute the keyboard route or establish full accessibility conformance. Deliberately removing a label or an error link should fail its bounded checks. For the primary definitions, read the [WHATWG forms and label sections](https://html.spec.whatwg.org/multipage/forms.html) and [WCAG 2.2 error identification and labels or instructions](https://www.w3.org/TR/WCAG22/).
