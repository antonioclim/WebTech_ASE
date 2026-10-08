import {loadSummary} from './targets/p01.mjs';
import {delegatedAction} from './targets/p02.mjs';

const list = document.querySelector('#tasks');
const output = document.querySelector('#output');
const status = document.querySelector('#action-status');

list.addEventListener('click', event => {
  output.textContent = JSON.stringify({
    eventTarget: event.target.tagName,
    result: delegatedAction(event.target, list)
  }, null, 2);
  status.textContent = 'List click observed. Inspect the event target and function result below.';
});

document.querySelector('#load').onclick = async () => {
  status.textContent = 'Summary action started. Waiting for the function result.';
  try {
    output.textContent = JSON.stringify(await loadSummary(fetch), null, 2);
    status.textContent = 'Summary action returned. Inspect the complete function result below.';
  } catch (e) {
    output.textContent = e.message;
    status.textContent = 'Summary action failed. Inspect the error below.';
  }
};
