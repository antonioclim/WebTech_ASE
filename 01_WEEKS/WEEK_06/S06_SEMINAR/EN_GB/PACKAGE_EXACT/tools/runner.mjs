/* Bounded subprocess and conservative TAP classification, not an execution sandbox. */
import {spawn} from 'node:child_process';
export function run(command,args,{cwd,timeout=15000,maxBytes=2_000_000,env=process.env}={}){
 if(typeof command!=='string'||!Array.isArray(args)||!Number.isInteger(timeout)||timeout<1||timeout>60000)throw Error('Invalid bounded-run arguments');
 return new Promise(resolve=>{
 let stdout='',stderr='',total=0,timedOut=false,overflow=false,spawnError=null,finished=false;const childEnv={...env};delete childEnv.NODE_TEST_CONTEXT;delete childEnv.NODE_OPTIONS;delete childEnv.NODE_PATH;const child=spawn(command,args,{cwd,env:childEnv,shell:false,stdio:['ignore','pipe','pipe']});
 const timer=setTimeout(()=>{timedOut=true;child.kill('SIGKILL');},timeout);
 const collect=(kind,data)=>{total+=data.length;if(total>maxBytes){overflow=true;child.kill('SIGKILL');return;}if(kind==='stdout')stdout+=data;else stderr+=data;};
 child.stdout?.on('data',d=>collect('stdout',d));child.stderr?.on('data',d=>collect('stderr',d));child.on('error',e=>{spawnError=e.code||e.message;});
 child.on('close',(exit,signal)=>{if(finished)return;finished=true;clearTimeout(timer);resolve({command,args,exit,signal,timedOut,overflow,spawnError,stdout,stderr,scope:'Direct child bounded; not arbitrary descendant containment'});});
 });
}
export function classify(result,names,{initialAssertions=false}={}){
 const bad=reason=>({ok:false,status:'FAIL_CLOSED',reason});
 if(result.spawnError||result.timedOut||result.overflow||result.signal)return bad('execution fault');
 if(result.stderr.trim())return bad('unexpected stderr');
 const out=result.stdout;const records=[...out.matchAll(/^(ok|not ok) (\d+) - (.+)$/gm)];
 if(records.length!==names.length||records.some((m,i)=>Number(m[2])!==i+1||m[3]!==names[i]))return bad('test-name/order/count mismatch');
 const count=k=>{const m=[...out.matchAll(new RegExp('^# '+k+' (\\d+)$','gm'))];return m.length===1?Number(m[0][1]):null;};
 const plans=[...out.matchAll(/^1\.\.(\d+)$/gm)];if(plans.length!==1||Number(plans[0][1])!==names.length)return bad('missing or wrong TAP plan');
 if(count('tests')!==names.length||['cancelled','skipped','todo'].some(k=>count(k)!==0)||/Bail out!|uncaughtException|unhandledRejection/.test(out))return bad('incomplete or omitted tests');
 const failed=records.filter(m=>m[1]==='not ok');
 if(initialAssertions){
  if(result.exit!==1||failed.length!==names.length||count('pass')!==0||count('fail')!==names.length)return bad('not the exact initial failure signature');
  for(let i=0;i<records.length;i++){const m=records[i],block=out.slice(m.index,records[i+1]?.index??out.length);if(!/code: ['"]?ERR_ASSERTION['"]?/.test(block)||!/failureType: ['"]?testCodeFailure/.test(block)||/ERR_TEST_FAILURE|TypeError|SyntaxError/.test(block))return bad('non-assertion test failure');}
  return {ok:true,status:'EXPECTED_INITIAL_ASSERTIONS',tests:names.length,limitation:'Unimplemented exact target, not completion'};
 }
 if(result.exit!==0||failed.length||count('pass')!==names.length||count('fail')!==0)return {ok:false,status:'ASSERTION_OR_TEST_FAIL',reason:'complete suite not green',tests:names.length};
 return {ok:true,status:'PASS_NAMED_SUITE',tests:names.length};
}
