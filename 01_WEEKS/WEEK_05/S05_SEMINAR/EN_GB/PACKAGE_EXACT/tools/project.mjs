/* Derived fixed-project adapter. No installation, external request or browser launch. */
import {createRequire} from 'node:module';
import {readFile,readdir,lstat,realpath} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createServer} from 'node:http';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {resolve,join,relative,sep} from 'node:path';
export const REFERENCE_NODE='v24.21.0';
export const configs=JSON.parse(await readFile(new URL('./projects.json',import.meta.url),'utf8'));
const publicRoot=fileURLToPath(new URL('../',import.meta.url));
export function config(id){if(!Object.hasOwn(configs,id))throw Error('Unknown fixed project identifier');return configs[id];}
export function projectRoot(id){return join(publicRoot,config(id).root);}
export const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
export async function boundary(id,root=projectRoot(id)){
 const c=config(id),files=new Map(),extra=[],changed=[],missing=[];let ignoredInstalledTree=false;
 if((await lstat(root)).isSymbolicLink())throw Error('Symlink project root refused');
 async function walk(dir,prefix=''){
  for(const e of await readdir(dir,{withFileTypes:true})){
   const name=prefix+e.name,full=join(dir,e.name);
   if(prefix===''&&e.name==='node_modules'){if(e.isSymbolicLink()||!e.isDirectory())throw Error('Non-directory local dependency tree');ignoredInstalledTree=true;continue;}
   if(e.isSymbolicLink())throw Error('Symlink in protected project');
   if(e.isDirectory())await walk(full,name+'/');else if(e.isFile()){const b=await readFile(full);files.set(name,sha(b));}else throw Error('Nonregular project entry');
  }
 }
 await walk(root);
 for(const [name,h] of Object.entries(c.files)){if(!files.has(name))missing.push(name);else if(name!==c.target&&files.get(name)!==h)changed.push(name);}
 for(const name of files.keys())if(!Object.hasOwn(c.files,name))extra.push(name);
 return {project:id,ok:!missing.length&&!extra.length&&!changed.length,missing,extra,changed,allowedTarget:c.target,targetSha256:files.get(c.target)||null,untouched:files.get(c.target)===c.initialTargetSha256,ignoredInstalledTree,scope:'Protected project bytes only; node_modules ignored, not qualified'};
}
export async function preflight(id,root=projectRoot(id)){
 const request=createRequire(join(root,'package.json'));let expressVersion=null,dependencyError=null,local=false;
 try{const resolved=await realpath(request.resolve('express/package.json'));const localBase=await realpath(join(root,'node_modules'));local=resolved.startsWith(localBase+sep);expressVersion=JSON.parse(await readFile(resolved,'utf8')).version;if(!local)dependencyError='NONLOCAL_RESOLUTION';}catch(e){dependencyError=e.code||e.name;}
 return {project:id,node:process.version,referenceNode:REFERENCE_NODE,nodeMatches:process.version===REFERENCE_NODE,expressVersion,dependencyReady:local&&expressVersion==='5.1.0',dependencyError,npm:'Measure separately: reference 11.19.0',scope:'Resolution only, not full lock-tree or reference qualification'};
}
export function guard(info,allowNonreference=false){
 if(!info.nodeMatches&&!allowNonreference)throw Error('REFERENCE_RUNTIME_BLOCKED: no runtime was acquired');
 if(!info.dependencyReady)throw Error('PREREQUISITE_BLOCKED: project-local locked Express 5.1.0 absent; no installation attempted');
}
export async function listenLocal(listener,port=0){
 if(typeof listener!=='function'||!Number.isInteger(port)||port<0||port>65535)throw Error('Invalid local listener/port');
 const server=createServer(listener);server.headersTimeout=10000;server.requestTimeout=10000;
 await new Promise((ok,fail)=>{server.once('error',fail);server.listen(port,'127.0.0.1',()=>{server.off('error',fail);ok();});});
 let closing;return {server,url:'http://127.0.0.1:'+server.address().port,close(){if(!closing)closing=new Promise((ok,fail)=>{server.close(e=>e?fail(e):ok());server.closeAllConnections();});return closing;}};
}
export async function main(args){
 const [operation,id,...flags]=args;config(id);if(!['preflight','boundary','serve'].includes(operation))throw Error('Use preflight|boundary|serve p01|p02|p03');
 const seen=new Set();let port=0;
 for(let i=0;i<flags.length;i++){const f=flags[i];if(seen.has(f))throw Error('Duplicate flag');seen.add(f);if(f==='--port'){const n=flags[++i];if(!/^(0|[1-9]\d*)$/.test(n||'')||Number(n)>65535)throw Error('Invalid port');port=Number(n);}else if(!['--allow-nonreference','--fault-repository-list'].includes(f))throw Error('Unknown option');}
 if((operation!=='serve'&&(seen.has('--port')||seen.has('--fault-repository-list')))||(id!=='p01'&&seen.has('--fault-repository-list')))throw Error('Flag outside its documented scope');
 const edge=await boundary(id);console.log(JSON.stringify(edge,null,2));if(!edge.ok)throw Error('EDIT_BOUNDARY_BLOCKED');if(operation==='boundary')return 0;
 const info=await preflight(id);console.log(JSON.stringify(info,null,2));if(operation==='preflight')return info.nodeMatches&&info.dependencyReady?0:2;
 guard(info,seen.has('--allow-nonreference'));console.log(info.nodeMatches?'NODE_MATCH_ONLY — npm and full tree qualification separate':'NONREFERENCE_RUNTIME — compatibility only');
 const {createApp}=await import(pathToFileURL(join(projectRoot(id),'src/app.js')).href);const opts={};
 if(seen.has('--fault-repository-list')){const {createTaskRepository}=await import(pathToFileURL(join(projectRoot(id),'src/task-repository.js')).href);opts.repository=createTaskRepository();opts.repository.list=async()=>{throw Error('S05 synthetic repository failure');};console.log('INJECTED_DEPENDENCY: list remains deliberately faulty; health is a separate route');}
 const owner=await listenLocal(createApp(opts),port);console.log('READY '+owner.url+' — '+id+'; Ctrl+C to stop');
 let stopping=false;async function stop(){if(stopping)return;stopping=true;try{await owner.close();console.log('STOPPED');}catch(e){console.error('STOP_FAILED '+e.message);process.exitCode=1;}finally{process.off('SIGINT',stop);process.off('SIGTERM',stop);}}
 process.on('SIGINT',stop);process.on('SIGTERM',stop);return 0;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)main(process.argv.slice(2)).then(c=>{process.exitCode=c;}).catch(e=>{console.error('BLOCKED: '+e.message);process.exitCode=2;});
