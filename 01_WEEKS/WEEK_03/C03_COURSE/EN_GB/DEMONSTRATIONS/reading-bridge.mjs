// Neutral reading bridge: no S03 target imports or assessed implementation.
import assert from 'node:assert/strict';
const notes = [{text: " first note "}];
function label(entry) {
  return entry.text.trim();
}
const selectedFunction = label;
const returnedText = selectedFunction(notes[0]);
console.log(typeof selectedFunction, returnedText, notes[0].text);
assert.equal(typeof selectedFunction, 'function');
assert.equal(returnedText, 'first note');
assert.equal(notes[0].text, ' first note ');
