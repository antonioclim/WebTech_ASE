// Derived S04 orchestration. No canonical project file is rewritten.
import {readFileSync, readdirSync, lstatSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {resolve, dirname, join} from 'node:path';
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export const plans=JSON.parse(readFileSync(new URL('./projects.json',import.meta.url),'utf8'));
export const starterFailures={P01:[0,1,2],P02:[0,1,2,3],P03:[0,2,3]};
export function inspectTree(base, plan, mode) {
  const actual={}; const problems=[];
  function walk(path,rel='') {for(const name of readdirSync(path).sort()) {
    const p=join(path,name),r=rel?rel+'/'+name:name,s=lstatSync(p);
    if(s.isSymbolicLink())throw new Error('Symlink is not allowed: '+r);
    if(s.isDirectory())walk(p,r);else if(s.isFile())actual[r]=createHash('sha256').update(readFileSync(p)).digest('hex');
    else throw new Error('Unsupported entry: '+r);
  }}
  walk(base);
  for(const [p,h] of Object.entries(plan.hashes)) {
    if(!(p in actual))problems.push('MISSING '+p);
    else if(actual[p]!==h&&(mode==='initial'||p!==plan.allowed))problems.push('CHANGED '+p);
  }
  for(const p of Object.keys(actual))if(!(p in plan.hashes))problems.push('EXTRA '+p);
  return {ok:!problems.length,problems,allowedEdit:plan.allowed,allowedEditChanged:actual[plan.allowed]!==plan.hashes[plan.allowed]};
}
// Deliberately narrow parser for the flat, unchanged supplied Node tests. This is not a general TAP parser.
export function classify(result, expectedNames, expectedFailed) {
  const reasons=[];const text=result.stdout||'';
  if(result.error)reasons.push('PROCESS_ERROR '+(result.error.code||result.error));
  if(result.signal)reasons.push('SIGNAL '+result.signal);
  if(result.stderr?.trim())reasons.push('UNEXPECTED_STDERR');
  if(!text.startsWith('TAP version 13\n'))reasons.push('TAP_HEADER');
  if(/Bail out!|# (?:SKIP|TODO)\b|^\s+(?:not )?ok \d/m.test(text))reasons.push('UNSUPPORTED_TAP_OR_SKIPPED');
  const hits=[...text.matchAll(/^(not ok|ok) (\d+) - (.+)$/gm)];
  const failed=[];
  if(hits.length!==expectedNames.length)reasons.push('TEST_COUNT');
  hits.forEach((h,i)=>{
    if(Number(h[2])!==i+1||h[3]!==expectedNames[i])reasons.push('TEST_IDENTITY '+(i+1));
    if(h[1]==='not ok') {
      failed.push(i);
      const end=hits[i+1]?.index??text.length; const block=text.slice(h.index,end);
      if(!/^  failureType: 'testCodeFailure'$/m.test(block)||!/^  code: 'ERR_ASSERTION'$/m.test(block))reasons.push('NON_ASSERTION_FAILURE '+(i+1));
    }
  });
  const summary={}; for(const key of ['tests','suites','pass','fail','cancelled','skipped','todo']){
    const matches=[...text.matchAll(new RegExp('^# '+key+' (\\d+)$','gm'))];
    if(matches.length!==1)reasons.push('MISSING_OR_DUPLICATE_SUMMARY '+key);
    else summary[key]=Number(matches[0][1]);
  }
  if(summary.tests!==expectedNames.length||summary.pass!==expectedNames.length-failed.length||summary.fail!==failed.length||summary.suites!==0||summary.cancelled!==0||summary.skipped!==0||summary.todo!==0)reasons.push('SUMMARY_MISMATCH');
  if(!new RegExp('^1\\.\\.'+expectedNames.length+'$','m').test(text))reasons.push('PLAN');
  if(JSON.stringify(failed)!==JSON.stringify(expectedFailed))reasons.push('UNEXPECTED_FAILED_TESTS');
  if(result.status!==(failed.length?1:0))reasons.push('EXIT_STATUS');
  return {ok:!reasons.length,classification:reasons.length?'FAIL_CLOSED':failed.length?'EXPECTED_BOUNDED_ASSERTION_FAILURE':'PASS',summary,failedTests:failed.map(i=>expectedNames[i]),reasons};
}

export function boundedRun(args,cwd,extraEnv={}){
 const env={...process.env,NO_COLOR:'1',...extraEnv};
 for(const k of ['NODE_OPTIONS','NODE_PATH','FORCE_COLOR','NODE_TEST_CONTEXT','NODE_CHANNEL_FD'])delete env[k];
 const started=Date.now();
 const r=spawnSync(process.execPath,args,{cwd,encoding:'utf8',env,timeout:8000,killSignal:'SIGKILL',maxBuffer:2*1024*1024,windowsHide:true});
 let residual=false;
 if(r.pid){try{process.kill(r.pid,0);residual=true;}catch(e){if(e.code!=='ESRCH')residual='UNKNOWN';}}
 return {status:r.status,signal:r.signal,error:r.error?{code:r.error.code,message:r.error.message}:null,stdout:r.stdout||'',stderr:r.stderr||'',elapsedMs:Date.now()-started,residual};
}
export function runGate(code,mode='initial',options={}){
 if(!Object.hasOwn(plans,code)||!['initial','teaching','complete'].includes(mode))throw Error('Use P01/P02/P03 and initial/teaching/complete.');
 const plan=plans[code],projectRoot=resolve(options.projectRoot||join(ROOT,plan.path));
 const report={schema:'S04_GATE_1',project:code,mode,observedNode:process.version,referenceNode:'v24.21.0',referenceNpm:'11.19.0',npm:'NOT_EXECUTED_BY_GATE',runtimeClass:process.version==='v24.21.0'?'NODE_REFERENCE_MATCH_NPM_SEPARATE':'NONREFERENCE_RUNTIME',runs:[]};
 if(process.version!=='v24.21.0'&&!options.allowMismatch){report.verdict='RUNTIME_GUARD_BLOCK';return report;}
 report.integrity=inspectTree(projectRoot,plan,mode==='complete'?'complete':'initial');
 if(!report.integrity.ok){report.verdict='EDIT_BOUNDARY_BLOCK';return report;}
 const jobs=[];
 for(const suite of ['baseline',...(mode!=='teaching'?['objective']:[]),'regression'])
  jobs.push({kind:'CANONICAL',suite,args:['tests/'+suite+'.test.js'],names:plan.tests[suite],failed:mode==='initial'&&suite==='objective'?starterFailures[code]:[]});
 if(mode==='complete')jobs.push({kind:'CANONICAL',suite:'full',args:['baseline','objective','regression'].map(s=>'tests/'+s+'.test.js'),names:['baseline','objective','regression'].flatMap(s=>plan.tests[s]),failed:[]});
 if(mode!=='initial')jobs.push({kind:'DERIVED_ASSERTION_FIRST',suite:'teaching',args:[join(ROOT,'checks',code.toLowerCase()+'.test.mjs')],names:plan.teachingNames,failed:mode==='teaching'?plan.teachingFailures:[]});
 for(const job of jobs){
  const result=boundedRun(['--test','--test-reporter=tap','--test-concurrency=1',...job.args],projectRoot,{S04_PROJECT_ROOT:projectRoot});
  const c=classify(result,job.names,job.failed);
  if(result.residual!==false){c.ok=false;c.reasons.push('RESIDUAL_DIRECT_CHILD');c.classification='FAIL_CLOSED';}
  report.runs.push({...job,...result,check:c});
 }
 report.verdict=report.runs.every(r=>r.check.ok)?(mode==='teaching'?'PASS_DERIVED_STARTER_SIGNATURE':mode==='initial'?'PASS_CANONICAL_STARTER_SIGNATURE':'PASS_COMPLETED_BOUNDED_CHECKS'):'FAIL_CLOSED';
 report.limit='Only unchanged supplied tests and named derived checks. Model/injected evidence is not browser acceptance. This wrapper is not a process sandbox. The reference npm version is recorded separately.';
 if(mode==='initial'&&code!=='P01')report.initialNote='Preserved canonical starter objective contains test-body exceptions. They remain FAIL_CLOSED, not expected assertion-only PASS. Run teaching separately for an assertion-first instructional signature.';
 return report;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 try{const[code,mode='initial',...flags]=process.argv.slice(2);if(flags.some(f=>f!=='--allow-runtime-mismatch'))throw Error('Unknown option');const r=runGate(code,mode,{allowMismatch:flags.includes('--allow-runtime-mismatch')});console.log(JSON.stringify(r,null,2));process.exitCode=r.verdict.startsWith('PASS_')?0:2;}
 catch(e){console.error('GATE ERROR: '+e.message);process.exitCode=2;}
}
