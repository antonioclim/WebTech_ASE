#!/usr/bin/env node
import {readFileSync} from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {verify,hash} from './integrity.mjs';import {capture,classify} from './capture.mjs';import {runtimeStatus,toolLocations} from './runtime.mjs';import {startOwned,stopOwned,sessionStatus} from './session.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const emit=v=>console.log(JSON.stringify(v,null,2));
export async function main(argv=process.argv.slice(2)){
 const [cmd='help',code,...rest]=argv;
 const allow=process.env.TW2026_ALLOW_RUNTIME_MISMATCH==='1';
 if(['stop','status'].includes(cmd)){
  // Cleanup remains available even when a student edit broke package verification.
  const rows=[];for(const c of ['p1','p2'])rows.push(cmd==='stop'?await stopOwned(root,c):await sessionStatus(root,c));
  const ok=rows.every(r=>r.ok);emit({verdict:ok?cmd==='stop'?'PASS_OWNED_SESSION_CLEANUP':'PASS_SESSION_STATUS':'STOP_SESSION_RECONCILIATION',rows});return ok?0:2;
 }
 if(!['verify','initial','result','test','start','env','help'].includes(cmd)){emit({verdict:'STOP_UNKNOWN_COMMAND'});return 2;}
 if(cmd==='help'){console.log('Use VERIFY_PACKAGE, CHECK_ENVIRONMENT, VERIFY_INITIAL_STATE, TEST_PROJECT_1/2, START_PROJECT_1/2, VERIFY_WORK_RESULT, STATUS_SERVERS and STOP_SERVERS from the package root.');return 0;}
 const integ=verify(root,{allowWork:!['verify','initial'].includes(cmd)});const cfg=integ.config;delete integ.config;
 if(!integ.ok){emit(integ);return 2;}
 if(cmd==='verify'){emit(integ);return 0;}
 const runtime=await runtimeStatus({allow});
 if(cmd==='env'){emit({verdict:runtime.classification,runtime,tools:toolLocations(),integrity:integ});return runtime.admitted?0:2;}
 if(!runtime.admitted){emit({verdict:'STOP_RUNTIME_MISMATCH',runtime});return 2;}
 if(!runtime.exact)console.log('QA ONLY — DOCUMENTED_RUNTIME_MISMATCH. This is not exact-runtime qualification.');
 if(cmd==='start'){await startOwned(root,code,cfg);return 0;}
 let projects=cmd==='test'?[code]:Object.keys(cfg.projects);if(projects.some(c=>!cfg.projects[c])){emit({verdict:'STOP_UNKNOWN_PROJECT'});return 2;}
 let mode=cmd==='initial'?'initial':'complete';
 const reports=[];
 for(const c of projects){
  const pc=cfg.projects[c];
  let projectMode=mode;
  if(cmd==='test'&&cfg.role==='student'){
   const manifest=readFileSync(path.join(root,'90_AUDIT/PAYLOAD_SHA256SUMS.txt'),'utf8');
   const baseline=new Map(manifest.trimEnd().split('\n').map(l=>[l.slice(66),l.slice(0,64)]));
   projectMode=hash(readFileSync(path.join(root,pc.editable)))===baseline.get(pc.editable)?'initial':'complete';
  }
  for(const suite of ['baseline','objective','regression']){
   const r=await capture(process.execPath,['--test','--test-reporter=tap',`tests/${suite}.test.js`],{cwd:path.join(root,pc.path),timeoutMs:cfg.suiteTimeoutMs,maxBytes:cfg.outputLimitBytes});
   const judgement=classify(r,pc.tests[suite],projectMode);
   reports.push({project:c,suite,mode:projectMode,...judgement,capture:r});
   if(judgement.verdict==='FAIL_TEST_CONTRACT'){emit({verdict:'FAIL_TEST_CONTRACT',runtime,integrity:integ,reports});return 2;}
  }
 }
 const after=verify(root,{allowWork:cmd!=='initial'});delete after.config;
 if(!after.ok){emit({verdict:'FAIL_POST_EXECUTION_BOUNDARY',after,reports});return 2;}
 emit({verdict:cmd==='initial'?'PASS_INITIAL_STATE':cmd==='result'?'PASS_WORK_RESULT':'PASS_PROJECT_TEST_CONTRACT',runtime,integrity:integ,after,reports});return 0;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{process.exitCode=await main();}catch(e){emit({verdict:'STOP_KIT_ERROR',error:e.message});process.exitCode=2;}
}
