import {assessReactEnvironment} from './react-environment.mjs';import {runOwnedProcess} from './owned-process.mjs';import {createRequire} from 'node:module';import {readFileSync} from 'node:fs';import{createHash}from'node:crypto';import {fileURLToPath} from 'node:url';import {join} from 'node:path';
import {boundarySnapshot,assertBoundaryUnchanged} from './verify.mjs';
const packageRoot=fileURLToPath(new URL('../',import.meta.url)),root=fileURLToPath(new URL('./REACT/',import.meta.url));let boundary;
const [action='help',id,...extra]=process.argv.slice(2);
async function main(){
 if(action==='help'&&id===undefined){console.log('Use node CLASSROOM_RC6/react.mjs preflight|baseline|objective|build. Already prepared dependencies only; no installation.');return 0;}if(id!==undefined||extra.length||!['preflight','baseline','objective','build'].includes(action))throw Error('INVALID_REACT_COMMAND');
 const environment=await assessReactEnvironment({unit:'S09/optional-react',operation:'react-'+action,cwd:packageRoot,command:'node CLASSROOM_RC6/react.mjs '+action,root,usesStructuredClone:true,usesNpm:false});console.log(JSON.stringify(environment,null,2));if(environment.exitCode)return environment.exitCode;
 boundary=boundarySnapshot('work');
 if(action==='preflight')return 0;
 const require=createRequire(join(root,'package.json')),file=action==='build'?join(root,'node_modules/vite/bin/vite.js'):join(root,'node_modules/vitest/vitest.mjs'),args=action==='build'?[file,'build']:[file,'run',action==='baseline'?'baseline.test.jsx':'objective.test.jsx','--pool=threads','--no-file-parallelism','--maxWorkers=1'];
 const env={...process.env};for(const key of ['NODE_OPTIONS','NODE_PATH','NODE_TEST_CONTEXT'])delete env[key];
 const result=await runOwnedProcess(process.execPath,args,{cwd:root,env,timeoutMs:30000,maxBytes:1000000});process.stdout.write(result.stdout);process.stderr.write(result.stderr);
 assertBoundaryUnchanged(boundary);
 console.log(JSON.stringify({status:result.ok?'PASS_SELECTED_REACT_OPERATION':result.reason||result.signal?'REACT_EXECUTION_FAULT':'FAIL_SELECTED_REACT_OPERATION',result,referenceNode:environment.reference.node,observedNode:process.version,scope:'Supplied optional React fixture operation; no native browser or learner-authored application qualification'},null,2));return result.ok?0:result.reason||result.signal?2:1;
}
try{process.exitCode=await main();}catch(error){console.error(JSON.stringify({status:'STOP_OPTIONAL_REACT_COMMAND',reason:error.message,observedNode:process.version,nodeExecutable:process.execPath,observedCwd:process.cwd(),observedArgv:[process.execPath,...process.argv.slice(1)]}));process.exitCode=2;}
