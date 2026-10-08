/* Derived optional launcher. No install, cache, lock change or browser launch. */
import {createServer} from 'node:http';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
export const REFERENCE='v24.21.0';
const names=['01-express-request-flow','02-route-match-boundary','03-resource-contract-table','04-request-body-boundary','05-error-boundary'];
export function exampleURL(id){if(!/^(01|02|03|04|05)$/.test(id))throw new Error('Example must be 01–05');return new URL('../canonical/'+names[Number(id)-1]+'/',import.meta.url);}
export async function preflight(id){const base=exampleURL(id),req=createRequire(new URL('package.json',base));let version=null,dependencyError=null;
 try{version=JSON.parse(await readFile(req.resolve('express/package.json'),'utf8')).version;}catch(e){dependencyError=e.code||e.name;}
 return {example:id,node:process.version,referenceNode:REFERENCE,nodeMatches:process.version===REFERENCE,expressVersion:version,dependencyReady:version==='5.1.0',dependencyError,npm:'CHECK_SEPARATELY: reference 11.19.0',scope:'Resolution only; not full lock-tree integrity, Express execution or qualification'};
}
export async function listenLocal(listener,port=0){
 if(typeof listener!=='function'||!Number.isInteger(port)||port<0||port>65535)throw new TypeError('Valid listener and port required');
 const server=createServer(listener);server.requestTimeout=10000;server.headersTimeout=10000;
 await new Promise((ok,fail)=>{server.once('error',fail);server.listen(port,'127.0.0.1',()=>{server.off('error',fail);ok();});});
 let closing=null;return {server,url:'http://127.0.0.1:'+server.address().port,close(){if(!closing)closing=new Promise((ok,fail)=>{server.close(e=>e?fail(e):ok());server.closeAllConnections();});return closing;}};
}
export async function main(args){
 const [operation,id,...flags]=args;const allowed=new Set(['--allow-nonreference']);let port=0,seen=new Set();
 for(let i=0;i<flags.length;i++){const f=flags[i];if(seen.has(f))throw new Error('Duplicate option');seen.add(f);if(f==='--port'){const x=flags[++i];if(!/^(0|[1-9]\d*)$/.test(x||'')||Number(x)>65535)throw new Error('Invalid port');port=Number(x);}else if(!allowed.has(f))throw new Error('Unknown option: '+f);}
 if(!['preflight','serve'].includes(operation))throw new Error('Usage: node tools/examples.mjs preflight|serve 01..05 [--allow-nonreference] [--port 0..65535]');
 const info=await preflight(id);console.log(JSON.stringify(info,null,2));
 if(operation==='preflight')return info.dependencyReady&&info.nodeMatches?0:2;
 if(!info.nodeMatches&&!seen.has('--allow-nonreference'))throw new Error('REFERENCE_RUNTIME_BLOCKED: no installation attempted');
 if(!info.dependencyReady)throw new Error('PREREQUISITE_BLOCKED: locked Express 5.1.0 is not available; no install attempted');
 console.log(info.nodeMatches?'NODE_MATCH_ONLY — npm/tree qualification separate':'NONREFERENCE_RUNTIME — not reference acceptance');
 const module=await import(new URL('app.js',exampleURL(id)));const events=[];const app=id==='01'?module.createApp(events):module.createApp();
 const owner=await listenLocal(app,port);console.log('READY '+owner.url+' — example '+id+'; Ctrl+C to stop');
 let stop=false;const shutdown=async()=>{if(stop)return;stop=true;try{await owner.close();console.log('STOPPED');if(id==='01')console.log('OBSERVED_APP_EVENTS '+JSON.stringify(events));}catch(e){console.error('STOP_FAILED '+e.message);process.exitCode=1;}finally{process.off('SIGINT',shutdown);process.off('SIGTERM',shutdown);}};
 process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);return 0;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)main(process.argv.slice(2)).then(code=>{process.exitCode=code;}).catch(e=>{console.error(e.message);process.exitCode=2;});
