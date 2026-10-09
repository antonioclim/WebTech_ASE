// Neutral controlled promise and public invoice projection, not saveReservation.
import assert from 'node:assert/strict';
let release,called=0,settled=false;
const savedRow={id:41,amount:50,internal:'private course fixture'};
const adapter=()=>{called++;return new Promise(resolve=>release=resolve);};
async function publicInvoice(){const saved=await adapter();return {id:saved.id,amount:saved.amount};}
const pending=publicInvoice();pending.then(()=>settled=true,()=>settled=true);
await Promise.resolve();assert.equal(called,1);assert.equal(settled,false);
const before={called,settled};release(savedRow);
const result=await pending;assert.deepEqual(result,{id:41,amount:50});assert.notEqual(result,savedRow);
result.amount=75;assert.equal(savedRow.amount,50);
const fault=Error('neutral later failure');let caught;
async function localBoundary(){try{return await Promise.reject(fault);}catch(e){caught=e;throw e;}}
await assert.rejects(localBoundary,e=>e===fault);assert.equal(caught,fault);
console.log(JSON.stringify({scope:'CONTROLLED_PROMISE_NOT_DATABASE',before,after:{settled,result,savedRow},fresh:result!==savedRow,unexpectedIdentity: caught===fault,limit:'No SQL, HTTP, browser event or general deep-clone guarantee.'},null,2));
