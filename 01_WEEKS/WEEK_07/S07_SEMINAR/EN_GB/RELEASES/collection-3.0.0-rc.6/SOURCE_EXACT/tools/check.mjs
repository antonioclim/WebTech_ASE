/** Canonical suite orchestration. Names and initial identity are mandatory. */
import {resolve,join} from 'node:path';import {fileURLToPath} from 'node:url';
import {config,projectRoot,boundary,preflight,guard} from './project.mjs';import {run,classify} from './runner.mjs';
export async function execute(id,mode,{allowNonreference=false,allowOwnedTestData=false,root=projectRoot(id)}={}){
 const c=config(id);if(!['initial','complete','baseline','objective','regression'].includes(mode))throw Error('Unknown mode');
 if(!allowOwnedTestData)throw Error('Explicit --allow-owned-test-data required for tests that create memory or temporary databases');
 const edge=await boundary(id,root);if(!edge.ok)throw Error('EDIT_BOUNDARY_BLOCKED');
 if(mode==='initial'&&id!=='p02')throw Error('INITIAL_ASSERTION_POLICY: only required P02 has a declared initial assertion signature. Inspect optional raw suites without relabelling exceptions.');
 if(mode==='initial'&&!edge.untouched)throw Error('INITIAL_IDENTITY_BLOCKED');
 const info=guard(await preflight(id,root),allowNonreference);
 const categories=['initial','complete'].includes(mode)?['baseline','objective','regression',...(mode==='complete'?['full']:[])]:[mode];
 const report={project:id,mode,evidenceClass:id==='p03'?'CANONICAL_EXPRESS_TEST_ATTEMPT':'CANONICAL_ORM_SQLITE_TEST_ATTEMPT',preflight:info,boundary:edge,runs:[],observers:[],referenceAcceptance:false};
 for(const category of categories){const kinds=category==='full'?['baseline','objective','regression']:[category];const files=kinds.map(k=>join(root,'tests/'+k+'.test.js')),names=kinds.flatMap(k=>c.tests[k]);
  const result=await run(process.execPath,['--test','--test-reporter=tap','--test-concurrency=1',...files],{cwd:root,timeout:30000});
  report.runs.push({category,...result,verdict:classify(result,names,{initialOutcomes:mode==='initial'&&category==='objective'?c.initialObjectiveOutcomes:null})});
 }
 if(mode==='complete'&&id==='p02'){
  if(root!==projectRoot('p02'))throw Error('COMPLETE_OBSERVERS_REQUIRE_PACKAGE_PROJECT_ROOT');
  const observer=resolve(fileURLToPath(import.meta.url),'..','booking-observe.mjs');
  for(const observation of ['success','callback','audit','domains']){
   const args=[observer,observation,'--allow-memory-database',...(allowNonreference?['--allow-nonreference']:[])];
   const result=await run(process.execPath,args,{cwd:resolve(root,'../..'),timeout:35000});let witness=null,parseError=null;
   try{witness=JSON.parse(result.stdout);}catch(e){parseError=e.message;}
   const ok=result.exit===0&&!result.spawnError&&!result.timedOut&&!result.signal&&!result.overflow&&!parseError&&witness?.ok===true&&witness.closed===true&&witness.afterBoundary?.ok===true;
   report.observers.push({observation,...result,witness,parseError,verdict:{ok,evidenceClass:'ACTUAL_ORM_SQLITE_WITH_DECLARED_OBSERVATION_HOOKS'}});
  }
 }
 report.after=await boundary(id,root);report.ok=report.runs.every(r=>r.verdict.ok)&&report.observers.every(r=>r.verdict.ok)&&report.after.ok&&report.after.targetSha256===edge.targetSha256;
 report.status=report.ok?'PASS_DECLARED_SCOPE':'FAIL_CLOSED';report.limitation='Native/runtime/platform qualification is separate. Full and focused cases overlap. P02 complete includes all four required existing observers; canonical green alone is insufficient.';return report;
}
export async function main(args=process.argv.slice(2)){const [id,mode,...flags]=args;if(flags.some(f=>!['--allow-owned-test-data','--allow-nonreference'].includes(f))||new Set(flags).size!==flags.length)throw Error('Unknown/repeated flag');const r=await execute(id,mode,{allowOwnedTestData:flags.includes('--allow-owned-test-data'),allowNonreference:flags.includes('--allow-nonreference')});console.log(JSON.stringify(r,null,2));return r.ok?0:1;}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main().then(c=>process.exitCode=c).catch(e=>{console.error('BLOCKED: '+e.message);process.exitCode=2;});
