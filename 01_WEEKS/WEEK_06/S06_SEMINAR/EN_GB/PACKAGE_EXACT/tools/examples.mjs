/** C06 bounded local example adapter. No install, download or fallback database. */
import {readFileSync,existsSync,realpathSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const EXAMPLES=Object.freeze({'02':'02-initialization-policy'});
export function rootFor(id){if(!Object.hasOwn(EXAMPLES,id))throw new TypeError('This S06 copy supports course Example 02 only');return path.join(ROOT,'canonical',EXAMPLES[id]);}
export function cleanEnvironment(){const env={...process.env};for(const k of ['NODE_OPTIONS','NODE_PATH','NODE_TEST_CONTEXT'])delete env[k];return env;}
export function sourceBoundary(id){const prefix='canonical/'+EXAMPLES[id]+'/';rootFor(id);const rows=JSON.parse(readFileSync(path.join(ROOT,'CANONICAL_SOURCES.json'),'utf8')).filter(r=>r.path.startsWith(prefix));const errors=[];for(const r of rows){try{const h=createHash('sha256').update(readFileSync(path.join(ROOT,r.path))).digest('hex');if(h!==r.sha256)errors.push('Changed '+r.path);}catch(e){errors.push('Missing '+r.path);}}return {files:rows.length,errors};}
export function preflight(id){const root=rootFor(id),req=createRequire(path.join(root,'package.json')),lock=JSON.parse(readFileSync(path.join(root,'package-lock.json'),'utf8'));const pkg=JSON.parse(readFileSync(path.join(root,'package.json'),'utf8'));const dependencies=[];
 for(const name of Object.keys(pkg.dependencies||{})){const expected=lock.packages['node_modules/'+name]?.version;let actual=null,resolved=null,error=null;
  try{resolved=req.resolve(name+'/package.json');const local=path.join(root,'node_modules')+path.sep;if(!realpathSync(resolved).startsWith(local))throw new Error('Dependency is not project-local');actual=JSON.parse(readFileSync(resolved,'utf8')).version;if(actual!==expected)throw new Error('Locked version mismatch');}catch(e){error=e.code||e.message;}
  dependencies.push({name,expected,actual,resolved,error});
 }
 const source=sourceBoundary(id);return {example:id,node:process.version,referenceNode:'v24.21.0',referenceNodeMatch:process.version==='v24.21.0',npm:'NOT_MEASURED_BY_THIS_GUARD',dependencies,source,ready:dependencies.every(x=>!x.error)&&source.errors.length===0,qualification:'RESOLUTION_ONLY_NATIVE_DRIVER_NOT_LOADED'};
}
export function requireReady(id,compatibility=false){const p=preflight(id);if(!p.referenceNodeMatch&&!compatibility)throw new Error('REFERENCE_RUNTIME_MISMATCH: '+p.node);if(!p.ready)throw new Error('PREREQUISITE_BLOCK: '+JSON.stringify(p));return p;}
export function boundedNode(args,cwd,timeout=20000){if(!Array.isArray(args)||args.some(x=>typeof x!=='string'))throw new TypeError('Invalid argument list');const r=spawnSync(process.execPath,args,{cwd,encoding:'utf8',env:cleanEnvironment(),timeout,maxBuffer:1_000_000,killSignal:'SIGTERM'});return {exit:r.status,signal:r.signal,error:r.error?.code||null,stdout:r.stdout||'',stderr:r.stderr||'',scope:'BOUNDED_DIRECT_CHILD_NOT_A_GENERAL_SANDBOX'};}
export function runExample(id,{compatibility=false}={}){const p=requireReady(id,compatibility),file=['01','02'].includes(id)?'example.js':'check.test.js',args=['01','02'].includes(id)?[file]:['--test','--test-reporter=tap',file];const result=boundedNode(args,rootFor(id));return {preflight:p,evidenceClass:'ACTUAL_CANONICAL_EXECUTION_ATTEMPT',nonreference:!p.referenceNodeMatch,result,completedWithoutProcessFault:result.exit===0&&!result.error&&!result.signal,limit:'A zero exit is not full native-platform or reference-runtime acceptance. Review the original assertions and output.'};}
export function main(argv=process.argv.slice(2)){const [action,id,...flags]=argv;if(!['preflight','run'].includes(action)||flags.some(x=>!['--compatibility','--allow-owned-test-data'].includes(x))||new Set(flags).size!==flags.length)throw new TypeError('Use preflight ID or run ID --allow-owned-test-data [--compatibility]');rootFor(id);if(action==='preflight'){if(flags.length)throw new TypeError('Preflight takes no flags');console.log(JSON.stringify(preflight(id),null,2));return 0;}if(!flags.includes('--allow-owned-test-data'))throw new Error('Explicit --allow-owned-test-data is required');const r=runExample(id,{compatibility:flags.includes('--compatibility')});console.log(JSON.stringify(r,null,2));return r.completedWithoutProcessFault?0:1;}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{process.exitCode=main();}catch(e){console.error(e.message);process.exitCode=2;}}
