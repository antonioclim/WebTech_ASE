#!/usr/bin/env node
import {assessCourseEnvironment} from './activity-environment.mjs';
import {assessEnvironment,runBounded,REFERENCE} from './environment.mjs';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
const unit="C08",root=fileURLToPath(new URL('../',import.meta.url)),examples={
  "01": "demonstrations/01-snapshot-and-requests.mjs",
  "02": "demonstrations/02-owned-inputs-and-derived-view.mjs",
  "03": "demonstrations/03-noncooperative-settlement.mjs"
},sqliteIDs=[];
const [command='help',id,...extra]=process.argv.slice(2),limits={timeoutMs:10000,maxBytes:65536};
async function environment(operation,profile='core'){
 return assessCourseEnvironment({unit,operation,cwd:root,command:'node tools/tw-kit.mjs '+operation,requiresAbort:operation==='example 03'});
}
async function runExample(example){
 if(!Object.keys(examples).includes(example))throw Error('UNKNOWN_NEUTRAL_EXAMPLE '+String(example));
 const report=await environment('example '+example,sqliteIDs.includes(example)?'sqlite':'core');console.error(JSON.stringify(report));
 if(report.exitCode)return {example,status:'ENV_BLOCKED',exitCode:report.exitCode,environment:report};
 const file=join(root,examples[example]),cwd=dirname(file),result=await runBounded(process.execPath,[file],{cwd,...limits});
 process.stdout.write(result.stdout);process.stderr.write(result.stderr);
 return {example,file,cwd,argv:[process.execPath,file],status:result.ok?'PASS_NEUTRAL_NODE_EXAMPLE':'COURSE_EXAMPLE_EXECUTION_FAULT',exitCode:result.exitCode??2,reason:result.reason||result.signal||null,limits};
}
async function main(){
 if(command==='help'&&id===undefined&&!extra.length){console.log('Commands: env [core] | example 01–03 | examples. Neutral Node examples require no npm/Express/ORM. Optional canonical React sources use tools/react.mjs separately.');return 0;}
 if(extra.length||!['env','example','examples'].includes(command)||(command==='examples'&&id!==undefined))throw Error('INVALID_COURSE_COMMAND');
 if(command==='env'){
  const selected=id??"core";if(!["core"].includes(selected))throw Error('UNKNOWN_ENVIRONMENT_PROFILE');
  const report=await environment('env '+selected,selected);console.log(JSON.stringify(report,null,2));return report.exitCode;
 }
 const selected=command==='example'?[id]:Object.keys(examples),results=[];
 for(const example of selected)results.push(await runExample(example));
 const blocked=results.some(x=>x.status==='ENV_BLOCKED'),failed=results.some(x=>x.exitCode!==0);
 console.log(JSON.stringify({unit,status:blocked?'ENV_BLOCKED':failed?'FAIL_NEUTRAL_NODE_EXAMPLES':'PASS_NEUTRAL_NODE_EXAMPLES',referenceNode:REFERENCE.node,observedNode:process.version,nodeExecutable:process.execPath,examples:results,optionalCanonicalExamplesSeparate:true,nativeQualification:false},null,2));
 return blocked?2:failed?1:0;
}
try{process.exitCode=await main();}catch(error){console.error(JSON.stringify({unit,status:'STOP_COURSE_COMMAND',reason:error.message,observedNode:process.version,nodeExecutable:process.execPath,observedCwd:process.cwd(),observedArgv:[process.execPath,...process.argv.slice(1)],recheck:{cwd:root,command:'node tools/tw-kit.mjs help'}}));process.exitCode=2;}
