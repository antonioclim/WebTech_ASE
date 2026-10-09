// Listener ownership on Node EventTarget; no browser propagation is modelled.
import assert from 'node:assert/strict';
const owner = new EventTarget();
let count = 0;
function bind() {
 const handler = () => { count++; };
 owner.addEventListener('inspect',handler);
 return () => owner.removeEventListener('inspect',handler);
}
const counts = [];
const activate = () => { owner.dispatchEvent(new Event('inspect')); counts.push(count); };
const unbind = bind(); activate(); unbind(); activate();
const secondUnbind = bind(); activate(); secondUnbind(); activate();
assert.deepEqual(counts,[1,1,2,2]);
console.log(JSON.stringify({counts,scope:'NODE_EVENTTARGET_LISTENER_LIFECYCLE_NOT_BROWSER_BUBBLING'}));
