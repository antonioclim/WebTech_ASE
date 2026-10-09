import assert from 'node:assert/strict';
import { createNotesApi } from '../canonical/04-http-adapter-contract/adapter.js';
import { requestNote } from '../derived/request-note.mjs';
import { assessCourseEnvironment } from '../tools/activity-environment.mjs';
const environment=await assessCourseEnvironment({unit:'C09',operation:'injected response frontiers',cwd:process.cwd(),command:'node DEMONSTRATIONS/02-response-frontiers.mjs'});
console.log(JSON.stringify(environment)); if(environment.exitCode)process.exit(environment.exitCode);
// Controlled response objects expose parse order, without HTTP or any assessed seminar function.
let canonicalReads=0,canonicalUrl,canonicalSignal;const signal=new AbortController().signal;
const api=createNotesApi({fetchImpl:async(url,options)=>{canonicalUrl=url;canonicalSignal=options.signal;return{ok:false,status:503,json:async()=>{canonicalReads++;throw new SyntaxError('synthetic malformed body');}};}});
let canonicalError;try{await api.get('a/b',{signal});}catch(error){canonicalError=error.name;}
assert.equal(canonicalUrl,'/api/notes/a%2Fb');assert.equal(canonicalSignal,signal);assert.equal(canonicalError,'SyntaxError');assert.equal(canonicalReads,1);
let derivativeReads=0;const derivative=await requestNote('/synthetic',{fetchImpl:async()=>({ok:false,status:503,json:async()=>{derivativeReads++;throw new SyntaxError('synthetic');}})});
assert.deepEqual(derivative,{ok:false,kind:'HTTP',status:503});assert.equal(derivativeReads,0);
const rows=[];
for(const[name,fetchImpl,expected]of[
 ['transport',async()=>{throw new TypeError('synthetic disconnect');},{ok:false,kind:'TRANSPORT'}],
 ['cancelled',async()=>{throw Object.assign(new Error('synthetic cancellation'),{name:'AbortError'});},{ok:false,kind:'CANCELLED'}],
 ['response-interface',async()=>({json:async()=>({})}),{ok:false,kind:'PROTOCOL'}],
 ['successful-malformed-body',async()=>({ok:true,json:async()=>{throw new SyntaxError('synthetic');}}),{ok:false,kind:'PARSE'}],
 ['missing-envelope',async()=>({ok:true,json:async()=>({note:{id:'x',title:'X'}})}),{ok:false,kind:'ENVELOPE'}],
 ['invalid-shape',async()=>({ok:true,json:async()=>({data:{id:'x',title:7}})}),{ok:false,kind:'SHAPE'}],
 ['projected-note',async()=>({ok:true,json:async()=>({data:{id:'x',title:'X',internal:'discarded'}})}),{ok:true,data:{id:'x',title:'X'}}]
]){const result=await requestNote('/synthetic',{fetchImpl});assert.deepEqual(result,expected);rows.push({name,result});}
const permissive=await createNotesApi({fetchImpl:async()=>({ok:true,json:async()=>({data:{title:7}})})}).get('x');assert.deepEqual(permissive,{title:7});
console.log(JSON.stringify({status:'PASS_INJECTED_RESPONSE_WITNESSES',scope:'EXACT_CANONICAL_ADAPTER_AND_NAMED_DERIVATIVE_UNDER_INJECTED_FETCH',canonical:{url:canonicalUrl,signalForwarded:canonicalSignal===signal,error:canonicalError,jsonReads:canonicalReads,unvalidatedSuccessfulData:permissive},derivative:{result:derivative,jsonReads:derivativeReads},rows,actualHTTPExecuted:false,limit:'The canonical parses before mapping status. The derivative refuses HTTP failure before parsing. Neither validates every operation or establishes actual Express, React or network behaviour.'},null,2));
