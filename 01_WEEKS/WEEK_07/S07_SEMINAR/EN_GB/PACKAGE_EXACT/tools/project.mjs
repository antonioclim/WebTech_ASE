/** S07 project-local guards and a memory-only P02 booking server adapter. No installation. */
import {readFile,readdir,lstat,realpath} from 'node:fs/promises';
import {resolve,dirname,join,sep} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {createServer} from 'node:http';
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const CONTRACT=JSON.parse(await readFile(join(ROOT,'PROJECT_CONTRACT.json'),'utf8'));
export const REFERENCE_NODE='v24.21.0';
export function config(id){if(!Object.hasOwn(CONTRACT,id))throw Error('Project must be p01, p02 or p03');return CONTRACT[id];}
export function projectRoot(id){return join(ROOT,config(id).root);}
export async function boundary(id,root=projectRoot(id)){
 const c=config(id),found=[],errors=[];async function visit(dir,rel=''){
  for(const d of await readdir(dir,{withFileTypes:true})){const p=join(dir,d.name),r=rel?rel+'/'+d.name:d.name;if(!rel&&d.name==='node_modules'){if(d.isSymbolicLink()||!d.isDirectory())errors.push('Invalid local dependency directory');continue;}
   if(d.isSymbolicLink()){errors.push('Symlink: '+r);continue;}if(d.isDirectory())await visit(p,r);else if(d.isFile())found.push(r);else errors.push('Nonregular member: '+r);
  }
 }
 try{if((await lstat(root)).isSymbolicLink())throw Error('Project root symlink');await visit(root);}catch(e){errors.push('Unreadable root: '+e.message);}
 let targetSha256=null;
 for(const r of found){if(!Object.hasOwn(c.files,r)){errors.push('Extra '+r);continue;}const digest=createHash('sha256').update(await readFile(join(root,r))).digest('hex');if(r===c.target)targetSha256=digest;else if(digest!==c.files[r])errors.push('Changed '+r);}
 for(const r of Object.keys(c.files))if(!found.includes(r))errors.push('Missing '+r);
 return {ok:errors.length===0,errors,files:found.length,allowedTarget:c.target,targetSha256,untouched:targetSha256===c.files[c.target]};
}
export async function preflight(id,root=projectRoot(id)){
 config(id);const pkg=JSON.parse(await readFile(join(root,'package.json'),'utf8')),lock=JSON.parse(await readFile(join(root,'package-lock.json'),'utf8')),req=createRequire(join(root,'package.json'));const dependencies=[];
 for(const name of Object.keys(pkg.dependencies||{})){let actual=null,resolved=null,error=null;const expected=lock.packages['node_modules/'+name]?.version;
  try{resolved=req.resolve(name+'/package.json');const rp=await realpath(resolved);if(!rp.startsWith(resolve(root,'node_modules')+sep))throw Error('NOT_PROJECT_LOCAL');actual=JSON.parse(await readFile(resolved,'utf8')).version;if(actual!==expected)throw Error('LOCK_VERSION_MISMATCH');}catch(e){error=e.code||e.message;}
  dependencies.push({name,expected,actual,resolved,error});
 }
 const edge=await boundary(id,root);return {project:id,node:process.version,referenceNode:REFERENCE_NODE,nodeMatches:process.version===REFERENCE_NODE,npm:'MEASURE_SEPARATELY',dependencies,boundary:edge,ready:dependencies.every(d=>!d.error)&&edge.ok,qualification:'RESOLUTION_AND_SOURCE_ONLY_NATIVE_NOT_LOADED'};
}
export function guard(info,allowNonreference=false){if(!info.nodeMatches&&!allowNonreference)throw Error('REFERENCE_RUNTIME_BLOCKED: '+info.node);if(!info.ready)throw Error('PREREQUISITE_OR_SOURCE_BLOCKED: '+JSON.stringify(info));return info;}
export async function listenOwned(handler,port=0){if(!Number.isInteger(port)||port<0||port>65535)throw Error('Invalid port');const server=createServer(handler);await new Promise((ok,bad)=>{server.once('error',bad);server.listen(port,'127.0.0.1',()=>{server.off('error',bad);ok();});});return {server,origin:`http://127.0.0.1:${server.address().port}`};}
export async function closeOwned(server){server.closeIdleConnections?.();await new Promise((ok,bad)=>server.close(e=>e?bad(e):ok()));}
export async function serveP02({allowNonreference=false,allowMemoryDatabase=false,port=0}={}){
 if(!allowMemoryDatabase)throw Error('Explicit --allow-memory-database is required');guard(await preflight('p02'),allowNonreference);
 const root=projectRoot('p02');const {createDatabase,initializeDatabase}=await import(pathToFileURL(join(root,'src/database.js')));const {createApp}=await import(pathToFileURL(join(root,'src/app.js')));
 const database=createDatabase();let connection=null;
 try{await initializeDatabase(database);connection=await listenOwned(createApp({database}),port);}catch(e){try{await database.sequelize.close();}catch(close){throw new AggregateError([e,close],'Initialisation and cleanup failed');}throw e;}
 let closed=false;return {...connection,storage:':memory:',async close(){if(closed)return;closed=true;let error;try{await closeOwned(connection.server);}catch(e){error=e;}try{await database.sequelize.close();}catch(e){error=error?new AggregateError([error,e],'HTTP and database closure failed'):e;}if(error)throw error;}};
}
export async function main(args=process.argv.slice(2)){
 const [action,id,...flags]=args;config(id);
 if(['preflight','boundary'].includes(action)){if(flags.length)throw Error('No extra preflight/boundary flags');const result=action==='preflight'?await preflight(id):await boundary(id);console.log(JSON.stringify(result,null,2));return action==='boundary'&&!result.ok?2:0;}
 if(action!=='serve'||id!=='p02'||flags.some(f=>!['--allow-nonreference','--allow-memory-database'].includes(f))||new Set(flags).size!==flags.length)throw Error('Use preflight ID, boundary ID or serve p02 --allow-memory-database [--allow-nonreference]');
 const running=await serveP02({allowNonreference:flags.includes('--allow-nonreference'),allowMemoryDatabase:flags.includes('--allow-memory-database')});
 console.log('READY '+running.origin+'\nP02 memory fixture only; fresh booking fixture, no persistent data. Stop with Ctrl+C.');let shutting=false;
 const stop=async()=>{if(shutting)return;shutting=true;const timer=setTimeout(()=>{console.error('CLOSE_TIMEOUT: cleanup not confirmed');process.exit(124);},5000);try{await running.close();console.log('STOPPED: listener and database closed');}catch(e){console.error('CLOSE_FAILED: '+e.message);process.exitCode=1;}finally{clearTimeout(timer);}};
 process.once('SIGINT',stop);process.once('SIGTERM',stop);return 0;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main().then(c=>process.exitCode=c).catch(e=>{console.error('BLOCKED_OR_FAILED: '+e.message);process.exitCode=2;});
