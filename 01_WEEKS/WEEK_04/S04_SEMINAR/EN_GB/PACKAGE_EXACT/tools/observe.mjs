// Bounded injected observations of the student's actual module; no expected result substituted.
import{readFile}from'node:fs/promises';import{resolve,dirname,join}from'node:path';import{pathToFileURL,fileURLToPath}from'node:url';import{plans,inspectTree}from'./gate.mjs';
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export async function observeDashboard(projectRoot,scenario='normal'){
 if(!['normal','deferred','transport','http','parse'].includes(scenario))throw Error('Unknown observation scenario');
 const{loadDashboard}=await import(pathToFileURL(join(projectRoot,'public/dashboard.js')));
 const values={};for(const name of ['profile','tasks','notices'])values['/data/'+name+'.json']=JSON.parse(await readFile(join(projectRoot,'public/data/'+name+'.json'),'utf8'));
 const called=[],parsed=[],rendered=[],completion=[],waiters=[];let expired=false;
 const response=p=>({ok:scenario!=='http',status:scenario==='http'?404:200,json:async()=>{parsed.push(p);if(scenario==='parse')throw Error('controlled parse rejection');return structuredClone(values[p]);}});
 const fetchImpl=p=>{called.push(p);if(scenario==='transport')return Promise.reject(Error('controlled transport rejection'));
 if(scenario==='deferred')return new Promise(done=>{if(expired)done(response(p));else waiters.push(()=>{completion.push(p);done(response(p));});});completion.push(p);return Promise.resolve(response(p));};
 const pending=loadDashboard({fetchImpl,render:m=>rendered.push(structuredClone(m))});const settled=pending.then(value=>({kind:'returned',value}),error=>({kind:'thrown',message:error.message}));
 await Promise.resolve();const initiatedBeforeRelease=[...called];
 // Release supplied deferred responses without leaving a sequential student attempt hanging.
 for(let i=0;i<6;i++){const queue=waiters.splice(0).reverse();queue.forEach(fn=>fn());await Promise.resolve();await Promise.resolve();}
 expired=true;waiters.splice(0).forEach(fn=>fn());let timer;
 const result=await Promise.race([settled,new Promise(done=>timer=setTimeout(()=>done({kind:'TIMEOUT_NOT_PEDAGOGICAL'}),1000))]);clearTimeout(timer);
 return{evidenceClass:'MODEL_OR_INJECTED',scenario,observedNode:process.version,fixture:'supplied browser JSON files, not the smaller canonical objective fixture',called,initiatedBeforeRelease,completion,parsed,rendered,result,limit:'Injected responses establish this controller observation only, not HTTP, browser Network, cancellation or arbitrary-data safety.'};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 try{const[code='P01',scenario='normal',...flags]=process.argv.slice(2);if(code!=='P01'||flags.some(f=>f!=='--allow-runtime-mismatch'))throw Error('Use P01 normal|deferred|transport|http|parse [--allow-runtime-mismatch].');if(process.version!=='v24.21.0'&&!flags.includes('--allow-runtime-mismatch'))throw Error('RUNTIME_GUARD_BLOCK: '+process.version);const root=join(ROOT,plans.P01.path);const guard=inspectTree(root,plans.P01,'complete');if(!guard.ok)throw Error('EDIT_BOUNDARY_BLOCK');const out=await observeDashboard(root,scenario);console.log(JSON.stringify(out,null,2));if(out.result.kind==='TIMEOUT_NOT_PEDAGOGICAL')process.exitCode=2;}catch(e){console.error('OBSERVATION ERROR: '+e.message);process.exitCode=2;}
}
