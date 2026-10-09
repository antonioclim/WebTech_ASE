#!/usr/bin/env node
import {assessEnvironment,runBounded,REFERENCE} from './environment.mjs';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';

const unit='C03';
const root=fileURLToPath(new URL('../',import.meta.url));
const examples={
  "01": "canonical/01-language-shape/example.js",
  "02": "canonical/02-prototype-lookup/example.js",
  "03": "canonical/03-identity-shallow-copy/example.js",
  "04": "canonical/04-higher-order-pipeline/example.js",
  "05": "canonical/05-generated-code-audit/example.js",
  "06": "DEMONSTRATIONS/six-lens-route.mjs",
  "07": "DEMONSTRATIONS/reading-bridge.mjs"
};
const [command='help',id,...extra]=process.argv.slice(2);
const limits={timeoutMs:10000,maxBytes:65536};
const recheck=operation=>'node tools/tw-kit.mjs '+operation;
async function environment(operation){return assessEnvironment({unit,operation,cwd:root,command:recheck(operation),features:['node-core'],usesNpm:false});}
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
 if(command==='help'&&id===undefined&&!extra.length){console.log('Commands: env | example 01–07 | examples. Run from this course EN_GB directory. Node examples do not use npm; browser observations are separate.');return 0;}
 if(extra.length||!['env','example','examples'].includes(command)||(command!=='example'&&id!==undefined))throw Error('INVALID_COURSE_COMMAND');
 if(command==='env'){const report=await environment('env');console.log(JSON.stringify(report,null,2));return report.exitCode;}
 
 const selected=command==='example'?[id]:Object.keys(examples),results=[];
 for(const exampleId of selected)results.push(await runExample(exampleId));
 const blocked=results.some(r=>r.status==='ENV_BLOCKED'),failed=results.some(r=>r.exitCode!==0);
 console.log(JSON.stringify({unit,status:blocked?'ENV_BLOCKED':failed?'FAIL_COURSE_NODE_EXAMPLES':'PASS_COURSE_NODE_EXAMPLES',referenceNode:REFERENCE.node,observedNode:process.version,nodeExecutable:process.execPath,examples:results,nativeBrowserQualification:false},null,2));
 return blocked?2:failed?1:0;
}
try{process.exitCode=await main();}catch(error){console.error(JSON.stringify({unit,status:'STOP_COURSE_COMMAND',reason:error.message,observedNode:process.version,nodeExecutable:process.execPath,observedCwd:process.cwd(),observedArgv:[process.execPath,...process.argv.slice(1)],recheck:{cwd:root,command:recheck('help')}}));process.exitCode=2;}
