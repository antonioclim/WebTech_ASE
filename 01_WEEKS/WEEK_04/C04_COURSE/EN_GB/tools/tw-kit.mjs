#!/usr/bin/env node
import {assessEnvironment,runBounded,REFERENCE} from './environment.mjs';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';

const unit='C04';
const root=fileURLToPath(new URL('../',import.meta.url));
const examples={
  "01": "canonical/01-module-live-binding/example.js",
  "02": "canonical/02-async-continuation-order/example.js",
  "03": "canonical/03-parallel-request-shape/example.js",
  "04": "canonical/04-fetch-http-boundary/example.js",
  "05": "demonstrations/observe-timelines.mjs",
  "06": "demonstrations/listener-lifecycle.mjs"
};
const [command='help',id,...extra]=process.argv.slice(2);
const limits={timeoutMs:10000,maxBytes:65536};
const recheck=operation=>'node tools/tw-kit.mjs '+operation;
async function environment(operation){
 const report=await assessEnvironment({unit,operation,cwd:root,command:recheck(operation),features:['node-core'],usesNpm:false});
 if(!report.exitCode&&operation==='example 06'){
  let owner,handler,count=0;
  try{
   if(typeof EventTarget!=='function'||typeof Event!=='function')throw Error('Required EventTarget/Event constructors are missing');
   owner=new EventTarget();handler=()=>count++;
   for(const method of ['addEventListener','dispatchEvent','removeEventListener'])if(typeof owner[method]!=='function')throw Error('Required EventTarget.'+method+' method is missing');
   owner.addEventListener('environment-probe',handler);owner.dispatchEvent(new Event('environment-probe'));owner.removeEventListener('environment-probe',handler);owner.dispatchEvent(new Event('environment-probe'));
   if(count!==1)throw Error('EventTarget listener registration/removal roundtrip failed');
   report.checks.push({feature:'node-eventtarget',status:'ENV_OK',detail:'Owned EventTarget listener roundtrip; no native browser propagation qualification'});
  }catch(error){report.status='ENV_BLOCKED';report.exitCode=2;report.checks.push({feature:'node-eventtarget',status:'ENV_BLOCKED',detail:error.message});}
  finally{if(owner&&handler&&typeof owner.removeEventListener==='function')owner.removeEventListener('environment-probe',handler);}
 }
 return report;
}
async function runExample(exampleId){
 const entry=examples[exampleId];
 if(!entry)throw Error('UNKNOWN_NODE_EXAMPLE '+String(exampleId));
 const report=await environment('example '+exampleId);console.error(JSON.stringify(report));
 if(report.exitCode)return {example:exampleId,status:'ENV_BLOCKED',exitCode:report.exitCode,environment:report};
 const file=join(root,entry),result=await runBounded(process.execPath,[file],{cwd:dirname(file),...limits});
 process.stdout.write(result.stdout);process.stderr.write(result.stderr);
 return {example:exampleId,file,status:result.ok?'PASS_COURSE_NODE_EXAMPLE':'COURSE_EXAMPLE_EXECUTION_FAULT',exitCode:result.exitCode??2,reason:result.reason||result.signal||null,cwd:dirname(file),argv:[process.execPath,file],limits};
}
async function main(){
 if(command==='help'&&id===undefined&&!extra.length){console.log('Commands: env | example 01–06 | examples | serve. Run from this course EN_GB directory. Node examples do not use npm; browser observations are separate.');return 0;}
 if(extra.length||!['env','example','examples','serve'].includes(command)||(command!=='example'&&id!==undefined))throw Error('INVALID_COURSE_COMMAND');
 if(command==='env'){const report=await environment('env');console.log(JSON.stringify(report,null,2));return report.exitCode;}
 if(command==='serve'){const {start}=await import('./serve_event.mjs');await start();return 0;}
 const selected=command==='example'?[id]:Object.keys(examples),results=[];
 for(const exampleId of selected)results.push(await runExample(exampleId));
 const blocked=results.some(r=>r.status==='ENV_BLOCKED'),failed=results.some(r=>r.exitCode!==0);
 console.log(JSON.stringify({unit,status:blocked?'ENV_BLOCKED':failed?'FAIL_COURSE_NODE_EXAMPLES':'PASS_COURSE_NODE_EXAMPLES',referenceNode:REFERENCE.node,observedNode:process.version,nodeExecutable:process.execPath,examples:results,nativeBrowserQualification:false},null,2));
 return blocked?2:failed?1:0;
}
try{process.exitCode=await main();}catch(error){console.error(JSON.stringify({unit,status:'STOP_COURSE_COMMAND',reason:error.message,observedNode:process.version,nodeExecutable:process.execPath,observedCwd:process.cwd(),observedArgv:[process.execPath,...process.argv.slice(1)],recheck:{cwd:root,command:recheck('help')}}));process.exitCode=2;}
