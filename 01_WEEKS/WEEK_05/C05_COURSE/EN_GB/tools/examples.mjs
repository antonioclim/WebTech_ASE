/* Derived optional launcher. No install, cache, lock change or browser launch. */
import {createServer} from 'node:http';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {runBounded} from './environment.mjs';
import {assessOptionalEnvironment} from './optional-environment.mjs';
export const REFERENCE='v24.21.0';
const names=['01-express-request-flow','02-route-match-boundary','03-resource-contract-table','04-request-body-boundary','05-error-boundary'];
export function exampleURL(id){if(!/^(01|02|03|04|05)$/.test(id))throw new Error('Example must be 01–05');return new URL('../canonical/'+names[Number(id)-1]+'/',import.meta.url);}
export async function preflight(id){
 const cwd=fileURLToPath(new URL('../',import.meta.url)),root=fileURLToPath(exampleURL(id)),prefix='canonical/'+names[Number(id)-1]+'/';
 const rows=JSON.parse(readFileSync(new URL('../CANONICAL_SOURCES.json',import.meta.url),'utf8')).filter(row=>row.path.startsWith(prefix)),source={files:rows.length,errors:[]};
 for(const row of rows){try{if(createHash('sha256').update(readFileSync(resolve(cwd,row.path))).digest('hex')!==row.sha256)source.errors.push('Changed '+row.path);}catch{source.errors.push('Missing '+row.path);}}
 const result=await assessOptionalEnvironment({unit:'C05/optional-'+id,operation:'optional-preflight',cwd,command:'node tools/examples.mjs preflight '+id,root,profile:'express',usesTestRunner:true,source});
 const express=result.dependencies.find(x=>x.name==='express');
 return {example:id,status:result.environment.status,exitCode:result.environment.exitCode,node:process.version,referenceNode:REFERENCE,nodeMatches:process.version===REFERENCE,expressVersion:express?.actual??null,dependencyReady:result.ready,dependencyError:express?.error??null,npm:'NOT_REQUIRED_DIRECT_NODE',...result};
}
export async function listenLocal(listener,port=0){
 if(typeof listener!=='function'||!Number.isInteger(port)||port<0||port>65535)throw new TypeError('Valid listener and port required');
 const server=createServer(listener);server.requestTimeout=10000;server.headersTimeout=10000;
 if(typeof server.closeAllConnections!=='function'){const error=Error('Required http.Server.closeAllConnections API is missing');error.environment={status:'ENV_BLOCKED',exitCode:2,unit:'C05/optional-serve',requirement:'http.Server.closeAllConnections',reason:error.message,observedNode:process.version,nodeExecutable:process.execPath,observedCwd:process.cwd(),observedArgv:[process.execPath,...process.argv.slice(1)]};throw error;}
 await new Promise((ok,fail)=>{server.once('error',fail);server.listen(port,'127.0.0.1',()=>{server.off('error',fail);ok();});});
 let closing=null;return {server,url:'http://127.0.0.1:'+server.address().port,close(){if(!closing)closing=new Promise((ok,fail)=>{server.close(e=>e?fail(e):ok());server.closeAllConnections();});return closing;}};
}
export async function main(args){
 const [operation,id,...flags]=args;const allowed=new Set(['--allow-nonreference']);let port=0,seen=new Set();
 for(let i=0;i<flags.length;i++){const f=flags[i];if(seen.has(f))throw new Error('Duplicate option');seen.add(f);if(f==='--port'){const x=flags[++i];if(!/^(0|[1-9]\d*)$/.test(x||'')||Number(x)>65535)throw new Error('Invalid port');port=Number(x);}else if(!allowed.has(f))throw new Error('Unknown option: '+f);}
 if(!['preflight','serve','run'].includes(operation))throw new Error('Usage: node tools/examples.mjs preflight|serve|run 01..05 [--allow-nonreference] [--port 0..65535]');
 const info=await preflight(id);console.log(JSON.stringify(info,null,2));
 if(operation==='preflight')return info.exitCode;
 if(!info.dependencyReady){const error=Error('ENV_BLOCKED optional C05 example '+id);error.environment=info.environment;throw error;}
 if(operation==='run'){
  if(seen.has('--port'))throw new Error('Run takes no port');
  const cwd=fileURLToPath(exampleURL(id)),args=['--test','--test-isolation=none','--test-reporter=tap','check.test.js'];
  const env={...process.env};for(const key of ['NODE_OPTIONS','NODE_PATH','NODE_TEST_CONTEXT'])delete env[key];
  const result=await runBounded(process.execPath,args,{cwd,env,timeoutMs:20000,maxBytes:1000000});
  process.stdout.write(result.stdout);process.stderr.write(result.stderr);
  console.log(JSON.stringify({example:id,status:result.ok?'PASS_BOUNDED_CANONICAL_TESTS':result.reason||result.signal?'COURSE_EXECUTION_FAULT':'FAIL_BOUNDED_CANONICAL_TESTS',cwd,argv:[process.execPath,...args],result,referenceNode:REFERENCE,observedNode:process.version,nativeQualification:false}));
  return result.ok?0:result.reason||result.signal?2:1;
 }
 console.log(info.status+' — selected optional Express operation only; reference/native qualification absent');
 const module=await import(new URL('app.js',exampleURL(id)));const events=[];const app=id==='01'?module.createApp(events):module.createApp();
 const owner=await listenLocal(app,port);console.log('READY '+owner.url+' — example '+id+'; Ctrl+C to stop');
 let stop=false;const shutdown=async()=>{if(stop)return;stop=true;try{await owner.close();console.log('STOPPED');if(id==='01')console.log('OBSERVED_APP_EVENTS '+JSON.stringify(events));}catch(e){console.error('STOP_FAILED '+e.message);process.exitCode=1;}finally{process.off('SIGINT',shutdown);process.off('SIGTERM',shutdown);}};
 process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);return 0;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)main(process.argv.slice(2)).then(code=>{process.exitCode=code;}).catch(error=>{console.error(JSON.stringify(error.environment||{status:'STOP_COURSE_COMMAND',reason:error.message,observedNode:process.version,nodeExecutable:process.execPath,observedCwd:process.cwd(),observedArgv:[process.execPath,...process.argv.slice(1)]}));process.exitCode=2;});
