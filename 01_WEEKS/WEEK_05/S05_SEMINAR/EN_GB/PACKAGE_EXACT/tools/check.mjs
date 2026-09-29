/* Fixed-project test gate. Never installs dependencies or changes canonical sources. */
import {readFile} from 'node:fs/promises';import {resolve,join} from 'node:path';import {pathToFileURL,fileURLToPath} from 'node:url';
import {config,projectRoot,boundary,preflight,guard,REFERENCE_NODE} from './project.mjs';import {run,classify} from './runner.mjs';
export async function execute(id,mode,{allowNonreference=false,root=projectRoot(id)}={}){
 const c=config(id);if(!['initial','complete','baseline','objective','regression','teaching-initial','teaching-complete'].includes(mode))throw Error('Unknown check mode');
 const edge=await boundary(id,root);if(!edge.ok)throw Error('EDIT_BOUNDARY_BLOCKED');
 if((mode==='initial'||mode==='teaching-initial')&&!edge.untouched)throw Error('INITIAL_IDENTITY_BLOCKED: target is no longer the exact starter');
 if(mode==='initial'&&id!=='p01')throw Error('RAW_INITIAL_NOT_ASSERTION_ONLY: use separately labelled teaching-initial for optional P02/P03; canonical exceptions are not accepted');
 if(process.version!==REFERENCE_NODE&&!allowNonreference)throw Error('REFERENCE_RUNTIME_BLOCKED');
 const teaching=mode.startsWith('teaching-');const info=await preflight(id,root);
 if(!teaching)guard(info,allowNonreference);else if(id==='p01')throw Error('No replacement model suite for required P01 HTTP');
 const report={project:id,mode,observedNode:process.version,qualification:process.version===REFERENCE_NODE?'NODE_MATCH_ONLY':'NONREFERENCE_RUNTIME',evidenceClass:teaching?'MODULE_MODEL':'LOCAL_HTTP_CANONICAL_SUITE',boundary:edge,preflight:info,runs:[]};
 const categories=teaching?['teaching']:['initial','complete'].includes(mode)?['baseline','objective','regression',...(mode==='complete'?['full']:[])]:[mode];
 for(const category of categories){
  let paths,names,env={...process.env};delete env.NODE_OPTIONS;delete env.NODE_PATH;
  if(teaching){paths=[fileURLToPath(new URL('../checks/'+id+'.test.mjs',import.meta.url))];names=id==='p02'?['teaching P02 exposes three callable ordered stages','teaching P02 observer delegates and records one terminal outcome']:['teaching P03 list exposes a data array envelope','teaching P03 unexpected errors use a bounded public response'];env.S05_TARGET=pathToFileURL(join(root,c.target)).href;}
  else {const kinds=category==='full'?['baseline','objective','regression']:[category];paths=kinds.map(k=>join(root,'tests/'+k+'.test.js'));names=kinds.flatMap(k=>c.tests[k]);}
  const result=await run(process.execPath,['--test','--test-reporter=tap','--test-concurrency=1',...paths],{cwd:root,env,timeout:20000});
  const verdict=classify(result,names,{initialAssertions:teaching?mode==='teaching-initial':mode==='initial'&&category==='objective'});report.runs.push({category,...verdict,...result});
 }
 const after=await boundary(id,root);report.after=after;report.ok=report.runs.every(x=>x.ok)&&after.ok&&after.targetSha256===edge.targetSha256;report.status=report.ok?'PASS_DECLARED_CHECK_SCOPE':'FAIL_CLOSED';return report;
}
export async function main(args){const [id,mode,...flags]=args;if(flags.length>1||flags.length===1&&flags[0]!=='--allow-nonreference')throw Error('Unknown check option');const report=await execute(id,mode,{allowNonreference:flags.includes('--allow-nonreference')});console.log(JSON.stringify(report,null,2));return report.ok?0:1;}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)main(process.argv.slice(2)).then(c=>{process.exitCode=c;}).catch(e=>{console.error('BLOCKED: '+e.message);process.exitCode=2;});
