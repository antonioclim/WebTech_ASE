// Explicitly derived fake-transport/model instrumentation, no network.
import { createFakeTransport } from "../src/fake-transport.mjs";
import { publicError } from "../src/public-errors.mjs";
import { createRequestDispatcher } from "../src/request-dispatcher.mjs";
export function clock() { let next=0; const tasks=new Map(); return { setTimeout(fn,ms) { const id=++next; tasks.set(id,{fn,ms}); return id; }, clearTimeout(id) { tasks.delete(id); }, fireAll() { for (const [id,task] of [...tasks]) { tasks.delete(id); task.fn(); } }, get size() { return tasks.size; } }; }
export function signalModel() { const listeners=new Set(); let aborted=false; return { get aborted() { return aborted; }, addEventListener(name,fn) { if(name!=="abort") throw new Error("Unexpected event"); listeners.add(fn); }, removeEventListener(name,fn) { if(name==="abort") listeners.delete(fn); }, abort() { aborted=true; for(const fn of [...listeners]) fn(); }, get listenerCount() { return listeners.size; } }; }
export function fixture(options={}) { let seq=0; const timers=options.timers??clock(); const transport=options.transport??createFakeTransport(options.transportOptions); const dispatcher=createRequestDispatcher({transport,nextId:options.nextId??(()=>`r${++seq}`),timers,makeError:publicError,maxIssuedIds:options.maxIssuedIds,defaultTimeoutMs:100}); return {transport,dispatcher,timers}; }
export async function observed(promise) { try { return {resolved:true,value:await promise}; } catch(error) { return {resolved:false,code:error.code}; } }
export function counters(f, signal) { return { pending:f.dispatcher.pendingCount,timers:f.timers.size,abortListeners:signal?.listenerCount??0,...f.transport.diagnostics() }; }
export function trace(t,caseId,values) { t.diagnostic(JSON.stringify({case:caseId,executionClass:"REAL_JAVASCRIPT_FAKE_TRANSPORT_MODEL",...values})); }
