import{assertCanonicalSource}from'./canonical-boundary.mjs';
import {assessReactEnvironment} from './react-environment.mjs';import {runOwnedProcess} from './owned-process.mjs';import {createRequire} from 'node:module';import {readFileSync} from 'node:fs';import{createHash}from'node:crypto';import {fileURLToPath} from 'node:url';import {join} from 'node:path';
const packageRoot=fileURLToPath(new URL('../',import.meta.url)),names=["01-state-ownership-map", "02-reducer-event-trace", "03-provider-isolation", "04-normalized-selectors", "05-latest-request-guard"];let root;
const [action='help',id,...extra]=process.argv.slice(2);
async function main(){
 if(action==='help'&&id===undefined){console.log('Use node tools/react.mjs preflight|npm-preflight|build 01–05. Canonical sources have no test script; no installation/browser launch.');return 0;}if(extra.length||!['preflight','npm-preflight','build'].includes(action)||!/^0[1-5]$/.test(id||''))throw Error('INVALID_REACT_COMMAND');root=join(packageRoot,'canonical',names[Number(id)-1]);
 const source=assertCanonicalSource({packageRoot,root,name:names[Number(id)-1]});
 const environment=await assessReactEnvironment({unit:'C10/optional-react-'+id,operation:'react-'+action,cwd:packageRoot,command:'node tools/react.mjs '+action+' '+id,root,usesStructuredClone:false,usesNpm:action==='npm-preflight'});console.log(JSON.stringify({...environment,source},null,2));if(environment.exitCode)return environment.exitCode;
 if(action==='preflight'||action==='npm-preflight')return 0;
 const require=createRequire(join(root,'package.json')),file=action==='build'?join(root,'node_modules/vite/bin/vite.js'):join(root,'node_modules/vitest/vitest.mjs'),args=action==='build'?[file,'build']:[file,'run',action==='baseline'?'baseline.test.jsx':'objective.test.jsx','--pool=threads','--no-file-parallelism','--maxWorkers=1'];
 const env={...process.env};for(const key of ['NODE_OPTIONS','NODE_PATH','NODE_TEST_CONTEXT'])delete env[key];
 const result=await runOwnedProcess(process.execPath,args,{cwd:root,env,timeoutMs:30000,maxBytes:1000000});process.stdout.write(result.stdout);process.stderr.write(result.stderr);
 assertCanonicalSource({packageRoot,root,name:names[Number(id)-1]});
 
 console.log(JSON.stringify({status:result.ok?'PASS_SELECTED_REACT_OPERATION':result.reason||result.signal?'REACT_EXECUTION_FAULT':'FAIL_SELECTED_REACT_OPERATION',result,referenceNode:environment.reference.node,observedNode:process.version,scope:'Supplied optional React fixture operation; no native browser or learner-authored application qualification'},null,2));return result.ok?0:result.reason||result.signal?2:1;
}
try{process.exitCode=await main();}catch(error){console.error(JSON.stringify({status:'STOP_OPTIONAL_REACT_COMMAND',reason:error.message,observedNode:process.version,nodeExecutable:process.execPath,observedCwd:process.cwd(),observedArgv:[process.execPath,...process.argv.slice(1)]}));process.exitCode=2;}
