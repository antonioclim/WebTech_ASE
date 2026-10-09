import assert from 'node:assert/strict';
// Controlled forecast model. Promises and AbortController are real Node objects;
// no timer loader, fetch, React effect, network or browser lifecycle is executed.
function deferred() {
  let release;
  const promise = new Promise(resolve => { release = resolve; });
  return {promise, release};
}
const old = deferred();
const recent = deferred();
const controller = new AbortController();
let oldActive = true;
const abortOnly = [];
const closureOwned = [];
const order = [];
// Install owned reactions before releases. This provider deliberately ignores the signal.
const oldReaction = old.promise.then(value => {
  order.push('old settled');
  abortOnly.push(value);
  if (oldActive) closureOwned.push(value);
});
const recentReaction = recent.promise.then(value => {
  order.push('recent settled');
  abortOnly.push(value);
  closureOwned.push(value);
});
const settled = Promise.all([oldReaction,recentReaction]);
let timeout;
try {
  oldActive = false;
  controller.abort();
  recent.release('recent forecast');
  await recentReaction;
  old.release('old forecast');
  await Promise.race([settled,new Promise((_resolve,reject)=> { timeout=setTimeout(()=>reject(new Error('OWNED_DEMO_TIMEOUT')),5000); })]);
  assert.equal(controller.signal.aborted,true);
  assert.deepEqual(order,['recent settled','old settled']);
  assert.deepEqual(abortOnly,['recent forecast','old forecast']);
  assert.deepEqual(closureOwned,['recent forecast']);
  console.log(JSON.stringify({scope:'CONTROLLED_NODE_PROMISES_NOT_REACT_EFFECT',order,oldSignalAborted:controller.signal.aborted,oldStillSettled:true,abortOnly,closureOwned,limit:'The inactive closure alone refuses old work in this declared order; no generation-necessity or universal cancellation claim.'}));
} finally {
  clearTimeout(timeout);
  recent.release('cleanup recent');
  old.release('cleanup old');
  await settled;
}
