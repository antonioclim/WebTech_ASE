
// Optional bounded assertion-first policy observations; no production policy implementation.
import test from'node:test';import assert from'node:assert/strict';import{resolve}from'node:path';import{pathToFileURL}from'node:url';
const root=process.env.S04_PROJECT_ROOT;if(!root)throw Error('Use tools/gate.mjs.');const{fetchWithPolicy}=await import(pathToFileURL(resolve(root,'public/fetch-policy.js')));
const res=status=>({ok:status>=200&&status<300,status,json:async()=>({ok:true})});
async function outcome(fn){try{return{type:'returned',value:await fn()};}catch(e){return{type:'thrown',message:e.message,cause:e.cause?.message};}}
test('derived policy: success owns and clears one timer',async()=>{let made=0,cleared=0;const out=await outcome(()=>fetchWithPolicy('/x',{fetchImpl:async()=>res(200),createController:()=>{made++;return new AbortController();},setTimer:()=>7,clearTimer:()=>cleared++}));assert.equal(out.type,'returned');assert.equal(made,1);assert.equal(cleared,1);});
test('derived policy: permanent status and parse do not retry',async()=>{for(const first of [async()=>res(404),async()=>({ok:true,status:200,json:async()=>{throw Error('controlled parse');}})]){let count=0;const out=await outcome(()=>fetchWithPolicy('/x',{fetchImpl:async()=>{count++;return first();},retries:2,setTimer:()=>1,clearTimer:()=>{}}));assert.equal(out.type,'thrown');assert.equal(count,1);}});
test('derived policy: transient failure clears before delay and retries',async()=>{let calls=0,made=0,cleared=0;const delays=[];const out=await outcome(()=>fetchWithPolicy('/x',{fetchImpl:async()=>res(++calls===1?503:200),createController:()=>{made++;return new AbortController();},retries:1,setTimer:()=>1,clearTimer:()=>cleared++,sleep:async ms=>{assert.equal(cleared,1);delays.push(ms);}}));assert.equal(out.type,'returned',JSON.stringify(out));assert.equal(calls,2);assert.equal(made,2);assert.equal(cleared,2);assert.deepEqual(delays,[50]);});
test('derived policy: abort exhaustion preserves the bounded cause', async () => {
 let calls = 0;
 const out = await outcome(() => fetchWithPolicy('/x', {
  fetchImpl: async (url, {signal}) => {
   calls++;
   return new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => reject(Error('aborted')));
    queueMicrotask(() => queueMicrotask(() => {
     if (!signal.aborted) reject(Error('abort not observed'));
    }));
   });
  },
  retries: 1, sleep: async () => {},
  setTimer: fn => { queueMicrotask(fn); return 1; }, clearTimer: () => {}
 }));
 assert.equal(out.type, 'thrown');
 assert.equal(out.message, 'request failed after 2 attempts: aborted');
 assert.equal(out.cause, 'aborted');
 assert.equal(calls, 2);
});
