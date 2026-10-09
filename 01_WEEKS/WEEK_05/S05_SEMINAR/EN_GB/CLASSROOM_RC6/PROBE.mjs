import {assessActivityEnvironment} from './activity-environment.mjs';
import {REFERENCE} from './environment.mjs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const selectors=["P01-boundary", "P02-boundary", "P03-boundary"];
const [selector,...extra]=process.argv.slice(2);
if(selector===undefined&&!extra.length){console.log('Use: node CLASSROOM_RC6/PROBE.mjs <selector>');console.log('Available selectors: '+selectors.join(', '));process.exit(0);}
if(extra.length||!selectors.includes(selector)){console.error(JSON.stringify({status:'STOP_UNKNOWN_TEACHING_PROBE',selector:selector??null,available:selectors}));process.exit(2);}
const environment=await assessActivityEnvironment({unit:'S05/'+selector,operation:'teaching-probe',cwd:fileURLToPath(new URL('../',import.meta.url)),command:'node CLASSROOM_RC6/PROBE.mjs '+selector,usesHttp:false});console.error(JSON.stringify(environment));if(environment.exitCode)process.exit(environment.exitCode);
let temporaryWorkspace=null;
try{
const result=spawnSync(process.execPath,[fileURLToPath(new URL('./probe-worker.mjs',import.meta.url)),selector],{cwd:fileURLToPath(new URL('./',import.meta.url)),env:process.env,encoding:'utf8',timeout:10000,killSignal:'SIGKILL',maxBuffer:2000000});
if(result.stdout)process.stdout.write(result.stdout);if(result.stderr)process.stderr.write(result.stderr);
 if(result.error||result.signal||result.status===null)throw Error('BOUNDED_PROBE_CHILD_FAULT '+(result.error?.code||result.signal||'NO_EXIT_STATUS'));
 if(result.status!==0)throw Error('PROBE_CHILD_EXIT_ERROR '+result.status);
 console.error(JSON.stringify({status:'PASS_BOUNDED_TEACHING_PROBE_EXECUTION',probe:selector,referenceNode:REFERENCE.node,observedNode:process.version,limits:{timeoutMs:10000,maxBuffer:2000000},temporaryWorkspace,implementationQualification:false}));
}catch(error){console.error(JSON.stringify({status:'STOP_TEACHING_PROBE_EXECUTION',classification:'EXECUTION_FAULT',probe:selector,reason:error.message,referenceNode:REFERENCE.node,observedNode:process.version,temporaryWorkspace}));process.exitCode=2;}
