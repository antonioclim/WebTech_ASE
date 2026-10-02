import {spawn, spawnSync} from 'node:child_process';
/** Execute one owned child tree. Limits are wall time and combined stdout/stderr bytes. */
export function capture(command,args,{cwd,timeoutMs=10000,maxBytes=2097152,env=process.env}={}) {
 return new Promise(resolve=>{
  let child,stdout='',stderr='',bytes=0,reason=null,spawnError=null,done=false,escalation;
  const stopTree=signal=>{
   if(!child?.pid)return;
   if(process.platform==='win32') {
    // PID is the child created by this invocation, never a user-supplied PID or an image-name search.
    spawnSync('taskkill.exe',['/PID',String(child.pid),'/T','/F'],{timeout:3000,windowsHide:true,stdio:'ignore'});
   } else {try{process.kill(-child.pid,signal);}catch(e){if(e.code!=='ESRCH')spawnError??=e.message;}}
  };
  const stop=why=>{if(reason)return;reason=why;stopTree('SIGTERM');escalation=setTimeout(()=>stopTree('SIGKILL'),400);};
  const onINT=()=>stop('INTERRUPTED_SIGINT'),onTERM=()=>stop('INTERRUPTED_SIGTERM');
  process.once('SIGINT',onINT);process.once('SIGTERM',onTERM);
  const timer=setTimeout(()=>stop('TIMEOUT'),timeoutMs);
  const finish=(code,signal)=>{
   if(done)return;done=true;clearTimeout(timer);clearTimeout(escalation);
   // Clear surviving descendants of this owned session before declaring capture complete.
   if(process.platform!=='win32')stopTree('SIGKILL');
   process.removeListener('SIGINT',onINT);process.removeListener('SIGTERM',onTERM);
   resolve({code,signal,reason,spawnError,stdout,stderr,bytes,timeoutMs,maxBytes});
  };
  try{
   child=spawn(command,args,{cwd,env,shell:false,detached:process.platform!=='win32',windowsHide:true,stdio:['ignore','pipe','pipe']});
   const chunk=(b,key)=>{bytes+=b.length;if(bytes>maxBytes){stop('OUTPUT_LIMIT');return;}if(key==='out')stdout+=b.toString('utf8');else stderr+=b.toString('utf8');};
   child.stdout.on('data',b=>chunk(b,'out'));child.stderr.on('data',b=>chunk(b,'err'));
   child.on('error',e=>{spawnError=e.message;});child.on('close',finish);
  }catch(e){spawnError=e.message;finish(null,null);}
 });
}
/** Only the flat, named TAP contract used by this seminar is admitted. */
export function classify(result,contract,mode) {
 const text=result.stdout.replace(/\r\n/g,'\n');const rows=[...text.matchAll(/^(ok|not ok) (\d+) - (.+)$/gm)];
 const summary={};for(const k of ['tests','suites','pass','fail','cancelled','skipped','todo']){
  const m=[...text.matchAll(new RegExp('^# '+k+' (\\d+)$','gm'))];summary[k]=m.length===1?Number(m[0][1]):null;
 }
 const plan=[...text.matchAll(/^1\.\.(\d+)$/gm)];
 const names=rows.map(m=>m[3]);const failureNames=rows.filter(m=>m[1]==='not ok').map(m=>m[3]);
 const expectedFail=mode==='initial'?contract.initial_failures:0;
 const reasons=[];
 if(/^Bail out!/im.test(text))reasons.push('TAP_BAILOUT');
 if((text.match(/^TAP version 13$/gm)||[]).length!==1)reasons.push('TAP_VERSION');
 if(result.reason)reasons.push(result.reason);if(result.signal)reasons.push('SIGNAL');if(result.spawnError)reasons.push('SPAWN_ERROR');
 if(result.stderr.trim())reasons.push('STDERR');
 if(result.code!==(expectedFail?1:0))reasons.push('EXIT_CODE');
 if(JSON.stringify(names)!==JSON.stringify(contract.names))reasons.push('TEST_IDENTITIES');
 if(rows.some((r,i)=>Number(r[2])!==i+1))reasons.push('TEST_NUMBERING');
 if(plan.length!==1||Number(plan[0][1])!==contract.names.length)reasons.push('TAP_PLAN');
 if(summary.tests!==contract.names.length||summary.suites!==0||summary.pass!==contract.names.length-expectedFail||summary.fail!==expectedFail||summary.cancelled!==0||summary.skipped!==0||summary.todo!==0)reasons.push('TAP_SUMMARY');
 if(failureNames.length!==expectedFail)reasons.push('FAILURE_COUNT');
 for(let i=0;i<rows.length;i++){
  if(rows[i][1]!=='not ok')continue;
  const from=rows[i].index+rows[i][0].length,to=i+1<rows.length?rows[i+1].index:text.length,block=text.slice(from,to);
  if(!/^  code: 'ERR_ASSERTION'$/m.test(block)||!/^  failureType: 'testCodeFailure'$/m.test(block))reasons.push('NOT_ASSERTION_FAILURE');
 }
 return {verdict:reasons.length?'FAIL_TEST_CONTRACT':expectedFail?'PASS_EXPECTED_NAMED_ASSERTIONS':'PASS_ALL_NAMED_TESTS',reasons,names,failureNames,summary};
}
