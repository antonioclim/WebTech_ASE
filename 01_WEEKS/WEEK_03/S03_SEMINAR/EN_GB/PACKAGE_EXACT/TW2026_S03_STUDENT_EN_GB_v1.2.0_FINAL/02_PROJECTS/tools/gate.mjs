// Derived S03 orchestration. No canonical project file is rewritten.
import {readFileSync, readdirSync, lstatSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {resolve, dirname, join} from 'node:path';
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export const plans=JSON.parse(readFileSync(new URL('./projects.json',import.meta.url),'utf8'));
export const starterFailures={P01:[0,1,2],P02:[0,2,3],P03:[1,2,3,4]};
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
export function runGate(code, mode='initial', options={}) {
  if(!Object.hasOwn(plans,code)||!['initial','complete'].includes(mode))throw new Error('Use P01, P02 or P03 and initial or complete.');
  const plan=plans[code],root=options.projectRoot||join(ROOT,plan.path);
  const report={schema:'S03_GATE_1',project:code,mode,node:process.version,referenceNode:'v24.21.0',referenceNpm:'11.19.0',npm:'NOT_EXECUTED_BY_GATE',runtimeMatch:process.version==='v24.21.0',runtimeQualification:'NODE_ONLY_NPM_VERSION_RECORDED_SEPARATELY',runs:[]};
  if(!report.runtimeMatch&&!options.allowMismatch){report.verdict='RUNTIME_GUARD_BLOCK';return report;}
  report.integrity=inspectTree(root,plan,mode);
  if(!report.integrity.ok){report.verdict='EDIT_BOUNDARY_BLOCK';return report;}
  const env={...process.env,NO_COLOR:'1'};delete env.NODE_OPTIONS;delete env.NODE_PATH;delete env.FORCE_COLOR;delete env.NODE_TEST_CONTEXT;delete env.NODE_CHANNEL_FD;
  const suites=['baseline','objective','regression',...(mode==='complete'?['full']:[])];
  for(const suite of suites){
    const files=suite==='full'?['baseline','objective','regression'].map(x=>'tests/'+x+'.test.js'):['tests/'+suite+'.test.js'];
    const names=suite==='full'?['baseline','objective','regression'].flatMap(x=>plan.tests[x]):plan.tests[suite];
    const failed=mode==='initial'&&suite==='objective'?starterFailures[code]:[];
    const args=['--test','--test-reporter=tap','--test-concurrency=1',...files];const start=Date.now();
    const result=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',env,timeout:8000,killSignal:'SIGKILL',maxBuffer:2*1024*1024,windowsHide:true});
    let directChildPresent=false;
    if(result.pid){try{process.kill(result.pid,0);directChildPresent=true;}catch(e){if(e.code!=='ESRCH')directChildPresent='UNKNOWN';}}
    const finding=classify(result,names,failed);
    if(directChildPresent!==false){finding.ok=false;finding.reasons.push('DIRECT_CHILD_CLEANUP_UNCONFIRMED');finding.classification='FAIL_CLOSED';}
    report.runs.push({suite,command:[process.execPath,...args],cwd:root,durationMs:Date.now()-start,exitCode:result.status,signal:result.signal,pid:result.pid,directChildPresent,descendantAudit:'NOT_A_GENERAL_PROCESS_SANDBOX',stdout:result.stdout,stderr:result.stderr,error:result.error?String(result.error):null,...finding});
  }
  report.verdict=report.runs.every(x=>x.ok)?(mode==='initial'?'PASS_INITIAL_STARTER_SIGNATURE':'PASS_COMPLETE_CANONICAL_CHECKS'):'FAIL_CLOSED';
  if(!report.runtimeMatch&&report.verdict.startsWith('PASS'))report.verdict+='_NONREFERENCE_RUNTIME';
  return report;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  try {
    const [code,mode,...flags]=process.argv.slice(2);if(flags.some(x=>x!=='--allow-runtime-mismatch'))throw new Error('Unknown option');
    const report=runGate(code,mode||'initial',{allowMismatch:flags.includes('--allow-runtime-mismatch')||process.env.TW_QA_ALLOW_RUNTIME_MISMATCH==='1'});
    console.log(JSON.stringify(report,null,2));process.exitCode=report.verdict.startsWith('PASS')?0:2;
  } catch(error){console.error('GATE ERROR: '+error.message);process.exitCode=2;}
}
