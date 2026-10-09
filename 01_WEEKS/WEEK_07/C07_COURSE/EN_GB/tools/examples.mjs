import {assessOptionalEnvironment} from './optional-environment.mjs';
/** C07 exact-source example runner. No installation, fake package or alternate database. */
import {readFileSync,realpathSync,lstatSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const EXAMPLES=Object.freeze({'01':'01-relationship-shapes','02':'02-eager-loading-query-count','03':'03-resource-contract','04':'04-pagination-stability','05':'05-transaction-timeline'});
export function rootFor(id){if(typeof id!=='string'||!Object.keys(EXAMPLES).includes(id))throw new TypeError('Choose example01,02,03,04 or05');return path.join(ROOT,'canonical',EXAMPLES[id]);}
export function cleanEnvironment(){const env={...process.env};for(const k of ['NODE_OPTIONS','NODE_PATH','NODE_TEST_CONTEXT'])delete env[k];return env;}
export function sourceBoundary(id){
 rootFor(id);
 const prefix='canonical/'+EXAMPLES[id]+'/',names=['README.md','example.js','package.json','package-lock.json'];
 const expected=new Set(names.map(name=>prefix+name)),allExpected=new Set(['canonical/reading-list-next.md']);
 for(const name of Object.values(EXAMPLES))for(const file of names)allExpected.add('canonical/'+name+'/'+file);
 const errors=[],seen=new Set();let rows=[];
 try{
  const registryPath=path.join(ROOT,'CANONICAL_SOURCES.json');
  if(lstatSync(registryPath).isSymbolicLink()||!lstatSync(registryPath).isFile())throw new Error('Source registry is not a regular file');
  const registry=JSON.parse(readFileSync(registryPath,'utf8'));
  if(!Array.isArray(registry)||registry.length!==allExpected.size)throw new Error('Incomplete expected source registry');
  for(const row of registry){
   if(!row||typeof row!=='object'||Array.isArray(row)||typeof row.path!=='string'||typeof row.sha256!=='string'||!allExpected.has(row.path)||!(/^[0-9a-f]{64}$/).test(row.sha256)){
    errors.push('Malformed or unexpected source registry entry');continue;
   }
   if(seen.has(row.path))errors.push(row.path+': Duplicate source registry path');
   seen.add(row.path);
   if(row.path.startsWith(prefix))rows.push(row);
  }
  if(seen.size!==allExpected.size||[...allExpected].some(name=>!seen.has(name)))errors.push('Incomplete expected source registry');
  const selected=new Set(rows.map(row=>row.path));
  if(rows.length!==4||selected.size!==4||[...expected].some(name=>!selected.has(name)))errors.push('Incomplete expected example source registry');
  for(const row of rows){try{
   let current=ROOT;
   for(const component of row.path.split('/')){
    current=path.join(current,component);
    if(lstatSync(current).isSymbolicLink())throw new Error('Source path contains a symbolic link');
   }
   const p=path.join(ROOT,row.path),resolved=realpathSync(p),root=realpathSync(ROOT)+path.sep;
   if(!resolved.startsWith(root)||!lstatSync(p).isFile())throw new Error('Not a project-local regular file');
   if(createHash('sha256').update(readFileSync(p)).digest('hex')!==row.sha256)throw new Error('Hash mismatch');
  }catch(e){errors.push(row.path+': '+e.message);}}
 }catch(e){errors.push('Source registry: '+e.message);}
 return {files:rows.length,errors};
}
export async function preflight(id){
 const root=rootFor(id),result=await assessOptionalEnvironment({unit:'C07/optional-'+id,operation:'optional-preflight',cwd:ROOT,command:'node tools/examples.mjs preflight '+id,root,profile:'orm',usesHttp:['03','04'].includes(id),source:sourceBoundary(id)});
 return {example:id,status:result.environment.status,exitCode:result.environment.exitCode,node:process.version,referenceNode:'v24.21.0',referenceNodeMatch:process.version==='v24.21.0',npm:'NOT_REQUIRED_DIRECT_NODE',...result,qualification:'SELECTED_OPTIONAL_API_PROBES_ONLY_NO_REFERENCE_OR_NATIVE_QUALIFICATION'};
}
export async function requireReady(id,compatibility=false){const p=await preflight(id);if(!p.ready){const error=Error('ENV_BLOCKED optional C07 example '+id);error.environment=p.environment;throw error;}return p;}
export function boundedNode(args,cwd,timeout=20000){if(!Array.isArray(args)||args.some(x=>typeof x!=='string')||!Number.isInteger(timeout)||timeout<10||timeout>20000)throw new TypeError('Invalid bounded command');const r=spawnSync(process.execPath,args,{cwd,encoding:'utf8',env:cleanEnvironment(),timeout,maxBuffer:1000000,killSignal:'SIGKILL'});return {cwd,argv:[process.execPath,...args],timeoutMs:timeout,maxBytesPerStream:1000000,exit:r.status,signal:r.signal,error:r.error?.code||null,stdout:r.stdout||'',stderr:r.stderr||'',scope:'BOUNDED_DIRECT_CHILD_NOT_GENERAL_SANDBOX'};}
export async function runExample(id,{compatibility=false,allowMemoryFixture=false}={}){if(!allowMemoryFixture)throw new Error('Explicit --allow-memory-fixture required');const p=await requireReady(id,compatibility),result=boundedNode(['example.js'],rootFor(id));return {preflight:p,evidenceClass:'ACTUAL_CANONICAL_EXECUTION_ATTEMPT',nonreference:!p.referenceNodeMatch,result,completedWithoutProcessFault:result.exit===0&&!result.error&&!result.signal,limit:'No native-platform or reference acceptance is implied by a zero exit. Inspect the original assertions and all output.'};}
export async function main(argv=process.argv.slice(2)){const[action,id,...flags]=argv;rootFor(id);if(!['preflight','run'].includes(action)||flags.some(x=>!['--compatibility','--allow-memory-fixture'].includes(x))||new Set(flags).size!==flags.length)throw new TypeError('Use preflight ID or run ID --allow-memory-fixture [--compatibility]');if(action==='preflight'){if(flags.length)throw new TypeError('Preflight takes no flags');const result=await preflight(id);console.log(JSON.stringify(result,null,2));return result.exitCode;}const r=await runExample(id,{compatibility:flags.includes('--compatibility'),allowMemoryFixture:flags.includes('--allow-memory-fixture')});console.log(JSON.stringify(r,null,2));return r.completedWithoutProcessFault?0:1;}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){main().then(code=>process.exitCode=code).catch(error=>{console.error(JSON.stringify(error.environment||{status:'STOP_COURSE_COMMAND',reason:error.message,observedNode:process.version,nodeExecutable:process.execPath,observedCwd:process.cwd(),observedArgv:[process.execPath,...process.argv.slice(1)]}));process.exitCode=2;});}
