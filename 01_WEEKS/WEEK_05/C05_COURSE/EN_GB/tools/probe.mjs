/* Bounded client for the supplied local teaching examples only. No external target. */
import {pathToFileURL,fileURLToPath} from 'node:url';import {resolve} from 'node:path';
import {requireEnvironment} from './environment.mjs';
export function origin(port){if(!/^[1-9]\d*$/.test(String(port))||Number(port)>65535)throw new Error('Supply the printed numeric loopback port, not a URL');return 'http://127.0.0.1:'+Number(port);}
export async function request(base,path,{method='GET',body,media='application/json'}={}){
 if(!/^http:\/\/127\.0\.0\.1:[1-9]\d*$/.test(base)||Number(base.split(':').pop())>65535||!/^\/(?:api\/(?:ping|failure|tasks(?:\/[A-Za-z0-9_-]+)?)(?:\?completed=(?:true|false))?)?$/.test(path))throw new Error('Request outside teaching allowlist');
 if(!['GET','POST','DELETE'].includes(method)||body!==undefined&&typeof body!=='string')throw new Error('Invalid teaching request');
 await requireEnvironment({unit:'C05/local-probe',operation:method+' '+path,cwd:fileURLToPath(new URL('../',import.meta.url)),command:'node tools/probe.mjs '+Number(base.split(':').pop())+' '+(process.argv[3]||'flow'),features:['fetch'],usesNpm:false});
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),5000);
 try{const response=await fetch(base+path,{method,headers:body!==undefined?{'content-type':media}:{},body,redirect:'error',signal:controller.signal});const reader=response.body?.getReader();const chunks=[];let total=0;
  if(reader)while(true){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>65536){controller.abort();throw new Error('Response exceeds 64 KiB');}chunks.push(Buffer.from(value));}
  return {evidenceClass:'LOCAL_HTTP',method,path,status:response.status,headers:{location:response.headers.get('location'),'content-type':response.headers.get('content-type')},body:Buffer.concat(chunks).toString('utf8'),limit:'One real loopback exchange; not reference-runtime or browser qualification'};
 }catch(error){const reason=error.name==='AbortError'&&controller.signal.aborted?'REQUEST_TIMEOUT':error.cause?.code||(typeof error.code==='string'?error.code:error.name);error.environment={status:'ENV_BLOCKED',exitCode:2,unit:'C05/local-probe',operation:method+' '+path,reason,errorName:error.name,errorCode:error.code??null,detail:error.message,requirement:'Working bounded request to the printed owned loopback listener',observedNode:process.version,nodeExecutable:process.execPath,observedCwd:process.cwd(),observedArgv:[process.execPath,...process.argv.slice(1)],recheck:{cwd:fileURLToPath(new URL('../',import.meta.url)),command:'node tools/probe.mjs '+Number(base.split(':').pop())+' '+(process.argv[3]||'flow')}};throw error;
 }finally{clearTimeout(timer);}
}
export async function main(args){const [port,scenario,...flags]=args;if(flags.length>1||flags.length===1&&flags[0]!=='--allow-demo-writes')throw new Error('Unknown flag');const base=origin(port);if(!['flow','routes','contracts','bodies','errors'].includes(scenario))throw new Error('Choose flow, routes, contracts, bodies or errors');if(['contracts','bodies'].includes(scenario)&&flags[0]!=='--allow-demo-writes')throw new Error('These synthetic in-memory writes require --allow-demo-writes; use only the matching dedicated example');const results=[];
 const run=async(p,o)=>{const r=await request(base,p,o);results.push(r);console.log(JSON.stringify(r,null,2));return r;};
 if(scenario==='flow'){await run('/');await run('/api/ping');}
 if(scenario==='routes'){const first=await run('/api/tasks?completed=true'),missing=await run('/api/tasks/missing'),healthy=await run('/api/tasks/t-1');if(first.status!==200||missing.status!==404||healthy.status!==200)throw new Error('PROBE_ASSERTION_FAILED_ROUTE_SEQUENCE: expected healthy200, missing404, healthy200; retain actual responses');}
 if(scenario==='contracts'){await run('/api/tasks');const created=await run('/api/tasks',{method:'POST',body:'{"title":"C05 synthetic probe"}'});if(created.status!==201||!/^\/api\/tasks\/[A-Za-z0-9_-]+$/.test(created.headers.location||''))throw new Error('Creation contract not satisfied; no follow-up write');await run(created.headers.location);await run(created.headers.location,{method:'DELETE'});await run(created.headers.location);}
 if(scenario==='bodies'){for(const body of ['{"title":"Read"}','{"title":" "}','[]','null','{"title":'])await run('/api/tasks',{method:'POST',body});await run('/api/tasks',{method:'POST',body:'hello',media:'text/plain'});}
 if(scenario==='errors'){await run('/api/failure');await run('/api/tasks/missing');}
 return results;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)main(process.argv.slice(2)).catch(error=>{console.error(JSON.stringify(error.environment||{status:'PROBE_FAILED',reason:error.message}));process.exitCode=error.environment?.exitCode??1;});
