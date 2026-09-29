/** Canonical suite orchestration. Names and initial identity are mandatory. */
import {resolve,join} from 'node:path';import {fileURLToPath} from 'node:url';
import {config,projectRoot,boundary,preflight,guard} from './project.mjs';import {run,classify} from './runner.mjs';
export async function execute(id,mode,{allowNonreference=false,allowOwnedTestData=false,root=projectRoot(id)}={}){
 const c=config(id);if(!['initial','complete','baseline','objective','regression'].includes(mode))throw Error('Unknown mode');
 if(!allowOwnedTestData)throw Error('Explicit --allow-owned-test-data required for tests that create memory or temporary databases');
 const edge=await boundary(id,root);if(!edge.ok)throw Error('EDIT_BOUNDARY_BLOCKED');
 if(mode==='initial'&&id!=='p02')throw Error('INITIAL_ASSERTION_POLICY: only required P02 has a declared all-assertion initial signature. Inspect optional raw suites without relabelling exceptions.');
 if(mode==='initial'&&!edge.untouched)throw Error('INITIAL_IDENTITY_BLOCKED');
 const info=guard(await preflight(id,root),allowNonreference);
 const categories=['initial','complete'].includes(mode)?['baseline','objective','regression',...(mode==='complete'?['full']:[])]:[mode];
 const report={project:id,mode,evidenceClass:'CANONICAL_ORM_SQLITE_TEST_ATTEMPT',preflight:info,boundary:edge,runs:[],referenceAcceptance:false};
 for(const category of categories){const kinds=category==='full'?['baseline','objective','regression']:[category];const files=kinds.map(k=>join(root,'tests/'+k+'.test.js')),names=kinds.flatMap(k=>c.tests[k]);
  const result=await run(process.execPath,['--test','--test-reporter=tap','--test-concurrency=1',...files],{cwd:root,timeout:30000});
  report.runs.push({category,...result,verdict:classify(result,names,{initialAssertions:mode==='initial'&&category==='objective'})});
 }
 report.after=await boundary(id,root);report.ok=report.runs.every(r=>r.verdict.ok)&&report.after.ok&&report.after.targetSha256===edge.targetSha256;
 report.status=report.ok?'PASS_DECLARED_SCOPE':'FAIL_CLOSED';report.limitation='Native/runtime/platform qualification is separate. Full and focused cases overlap.';return report;
}
export async function main(args=process.argv.slice(2)){const [id,mode,...flags]=args;if(flags.some(f=>!['--allow-owned-test-data','--allow-nonreference'].includes(f))||new Set(flags).size!==flags.length)throw Error('Unknown/repeated flag');const r=await execute(id,mode,{allowOwnedTestData:flags.includes('--allow-owned-test-data'),allowNonreference:flags.includes('--allow-nonreference')});console.log(JSON.stringify(r,null,2));return r.ok?0:1;}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main().then(c=>process.exitCode=c).catch(e=>{console.error('BLOCKED: '+e.message);process.exitCode=2;});
