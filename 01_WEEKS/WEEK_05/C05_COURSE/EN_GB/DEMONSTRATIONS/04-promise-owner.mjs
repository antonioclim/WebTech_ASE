// Neutral explicit promise owners. No detached unhandled rejection or Express.
import assert from 'node:assert/strict';
function pending(){let reject;const promise=new Promise((_,fail)=>{reject=fail;});return {promise,reject};}
const joinedTrace=[],joined=pending();
async function joinedHandler(){joinedTrace.push('work-started');return await joined.promise;}
const joinedOwner=joinedHandler().catch(error=>joinedTrace.push('owner-caught:'+error.message));
joined.reject(Error('joined-demo'));await joinedOwner;
assert.deepEqual(joinedTrace,['work-started','owner-caught:joined-demo']);
const detachedTrace=[],detached=pending();
const separateOwner=detached.promise.catch(error=>detachedTrace.push('separate-owner:'+error.message));
async function detachedHandler(){detachedTrace.push('work-started');}
await detachedHandler();detachedTrace.push('handler-resolved');
detached.reject(Error('detached-demo'));await separateOwner;
assert.deepEqual(detachedTrace,['work-started','handler-resolved','separate-owner:detached-demo']);
console.log(JSON.stringify({scope:'ACTUAL_NODE_PROMISE_OWNERSHIP_NOT_EXPRESS_FORWARDING',joinedTrace,detachedTrace,limit:'The separate catch is attached before rejection. Express returned-promise semantics require their own assembled application witness.'},null,2));
