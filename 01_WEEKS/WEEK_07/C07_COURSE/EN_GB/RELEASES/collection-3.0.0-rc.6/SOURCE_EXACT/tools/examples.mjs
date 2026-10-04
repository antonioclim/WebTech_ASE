/** C07 exact-source example runner. No installation, fake package or alternate database. */
import {readFileSync,realpathSync,lstatSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const EXAMPLES=Object.freeze({'01':'01-relationship-shapes','02':'02-eager-loading-query-count','03':'03-resource-contract','04':'04-pagination-stability','05':'05-transaction-timeline'});
export function rootFor(id){if(typeof id!=='string'||!Object.hasOwn(EXAMPLES,id))throw new TypeError('Choose example01,02,03,04 or05');return path.join(ROOT,'canonical',EXAMPLES[id]);}
export function cleanEnvironment(){const env={...process.env};for(const k of ['NODE_OPTIONS','NODE_PATH','NODE_TEST_CONTEXT'])delete env[k];return env;}
export function sourceBoundary(id){rootFor(id);const prefix='canonical/'+EXAMPLES[id]+'/';const rows=JSON.parse(readFileSync(path.join(ROOT,'CANONICAL_SOURCES.json'),'utf8')).filter(r=>r.path.startsWith(prefix));const errors=[];
 if(rows.length!==4)errors.push('Incomplete expected source registry');
 for(const row of rows){try{const p=path.join(ROOT,row.path);if(!lstatSync(p).isFile()||lstatSync(p).isSymbolicLink())throw new Error('Not a regular file');if(createHash('sha256').update(readFileSync(p)).digest('hex')!==row.sha256)throw new Error('Hash mismatch');}catch(e){errors.push(row.path+': '+e.message);}}
 return {files:rows.length,errors};}
export function preflight(id){const dir=rootFor(id),req=createRequire(path.join(dir,'package.json')),pkg=JSON.parse(readFileSync(path.join(dir,'package.json'),'utf8')),lock=JSON.parse(readFileSync(path.join(dir,'package-lock.json'),'utf8'));const dependencies=[];
 for(const name of Object.keys(pkg.dependencies||{})){const expected=lock.packages['node_modules/'+name]?.version;let actual=null,resolved=null,error=null;
  try{resolved=req.resolve(name+'/package.json');const rp=realpathSync(resolved),local=path.join(dir,'node_modules')+path.sep;if(!rp.startsWith(local))throw new Error('Dependency is not project-local');actual=JSON.parse(readFileSync(rp,'utf8')).version;if(!expected||actual!==expected)throw new Error('Locked version mismatch');}catch(e){error=e.code||e.message;}
  dependencies.push({name,expected,actual,resolved,error});}
 const source=sourceBoundary(id);return {example:id,node:process.version,referenceNode:'v24.21.0',referenceNodeMatch:process.version==='v24.21.0',npm:'MEASURE_SEPARATELY',dependencies,source,ready:dependencies.every(x=>!x.error)&&source.errors.length===0,qualification:'RESOLUTION_ONLY_NOT_NATIVE_DRIVER_OR_WHOLE_GRAPH_ACCEPTANCE'};
}
export function requireReady(id,compatibility=false){const p=preflight(id);if(!p.referenceNodeMatch&&!compatibility)throw new Error('REFERENCE_RUNTIME_MISMATCH: '+p.node);if(!p.ready)throw new Error('PREREQUISITE_BLOCK: '+JSON.stringify(p));return p;}
export function boundedNode(args,cwd,timeout=20000){if(!Array.isArray(args)||args.some(x=>typeof x!=='string')||!Number.isInteger(timeout)||timeout<10||timeout>20000)throw new TypeError('Invalid bounded command');const r=spawnSync(process.execPath,args,{cwd,encoding:'utf8',env:cleanEnvironment(),timeout,maxBuffer:1000000,killSignal:'SIGKILL'});return {exit:r.status,signal:r.signal,error:r.error?.code||null,stdout:r.stdout||'',stderr:r.stderr||'',scope:'BOUNDED_DIRECT_CHILD_NOT_GENERAL_SANDBOX'};}
export function runExample(id,{compatibility=false,allowMemoryFixture=false}={}){if(!allowMemoryFixture)throw new Error('Explicit --allow-memory-fixture required');const p=requireReady(id,compatibility),result=boundedNode(['example.js'],rootFor(id));return {preflight:p,evidenceClass:'ACTUAL_CANONICAL_EXECUTION_ATTEMPT',nonreference:!p.referenceNodeMatch,result,completedWithoutProcessFault:result.exit===0&&!result.error&&!result.signal,limit:'No native-platform or reference acceptance is implied by a zero exit. Inspect the original assertions and all output.'};}
export function main(argv=process.argv.slice(2)){const[action,id,...flags]=argv;rootFor(id);if(!['preflight','run'].includes(action)||flags.some(x=>!['--compatibility','--allow-memory-fixture'].includes(x))||new Set(flags).size!==flags.length)throw new TypeError('Use preflight ID or run ID --allow-memory-fixture [--compatibility]');if(action==='preflight'){if(flags.length)throw new TypeError('Preflight takes no flags');console.log(JSON.stringify(preflight(id),null,2));return 0;}const r=runExample(id,{compatibility:flags.includes('--compatibility'),allowMemoryFixture:flags.includes('--allow-memory-fixture')});console.log(JSON.stringify(r,null,2));return r.completedWithoutProcessFault?0:1;}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{process.exitCode=main();}catch(e){console.error(e.message);process.exitCode=2;}}
