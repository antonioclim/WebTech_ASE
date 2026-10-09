// Neutral ordered-dispatch model. No Express or assessed S05 target.
import assert from 'node:assert/strict';
async function trial(fallbackFirst){
  const trace=[];let writer=null;
  const write=name=>{if(writer)throw Error('second writer');writer=name;trace.push(name);queueMicrotask(()=>trace.push('finish-model'));};
  const resource=()=>write('resource');
  const fallback=()=>write('fallback');
  const delegate=()=>fallbackFirst?fallback():resource();
  function observer(){trace.push('before');delegate();trace.push('after-next');}
  observer();trace.push('stack-returned');await Promise.resolve();
  return {trace,writer,scope:'NODE_DISPATCH_AND_EXPLICIT_MICROTASK_MODEL_NOT_EXPRESS'};
}
const normal=await trial(false),earlyFallback=await trial(true);
assert.deepEqual(normal.trace,['before','resource','after-next','stack-returned','finish-model']);
assert.equal(normal.writer,'resource');assert.equal(earlyFallback.writer,'fallback');
assert.equal(earlyFallback.trace.includes('resource'),false);
console.log(JSON.stringify({normal,earlyFallback,limit:'The model explicitly queues finish; it does not observe Express scheduling or client receipt.'},null,2));
