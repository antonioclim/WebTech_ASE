/** Direct-child time/output bounds. This is not an execution sandbox. */
import {spawn} from 'node:child_process';
export function cleanEnvironment(env=process.env){const out={...env};for(const key of ['NODE_OPTIONS','NODE_PATH','NODE_TEST_CONTEXT'])delete out[key];return out;}
export function runBounded(command,args,{cwd,timeout=30000,maxBytes=2_000_000,env=process.env}={}){
 if(typeof command!=='string'||!Array.isArray(args)||args.some(x=>typeof x!=='string')||!Number.isInteger(timeout)||timeout<1||timeout>60000||!Number.isInteger(maxBytes)||maxBytes<1||maxBytes>4_000_000)throw new TypeError('Invalid direct-child bounds');
 return new Promise(resolve=>{let chunks={stdout:[],stderr:[]},bytes=0,timedOut=false,overflow=false,spawnError=null,finished=false,exitCode=null,exitSignal=null,grace;const child=spawn(command,args,{cwd,env:cleanEnvironment(env),shell:false,stdio:['ignore','pipe','pipe']});
 const finish=(controllerFallback=false)=>{if(finished)return;finished=true;clearTimeout(timer);clearTimeout(grace);resolve({command,args,exit:exitCode,signal:exitSignal,timedOut,overflow,spawnError,stdout:Buffer.concat(chunks.stdout).toString('utf8'),stderr:Buffer.concat(chunks.stderr).toString('utf8'),capturedBytes:Math.min(bytes,maxBytes),controllerFallback,scope:'DIRECT_CHILD_BOUND_ONLY_NOT_A_GENERAL_SANDBOX',cleanup:timedOut||overflow||exitSignal||controllerFallback?'UNKNOWN_AFTER_FORCED_OR_SIGNAL_TERMINATION':'NOT_INFERRED_FROM_EXIT'});};
 const terminate=()=>{if(!child.killed)child.kill('SIGKILL');if(!grace)grace=setTimeout(()=>{child.stdout?.destroy();child.stderr?.destroy();child.unref();finish(true);},1000);};const timer=setTimeout(()=>{timedOut=true;terminate();},timeout);
 for(const kind of ['stdout','stderr'])child[kind]?.on('data',chunk=>{const room=Math.max(0,maxBytes-bytes);if(room)chunks[kind].push(chunk.subarray(0,room));bytes+=chunk.length;if(bytes>maxBytes){overflow=true;terminate();}});
 child.on('error',e=>{spawnError=e.code||e.message;});child.on('exit',(code,signal)=>{exitCode=code;exitSignal=signal;});child.on('close',(code,signal)=>{exitCode=code;exitSignal=signal;finish();});
 });
}
const scalar=value=>{if(/^'[^']*'$/.test(value))return value.slice(1,-1);if(/^"[^"\\]*"$/.test(value))return value.slice(1,-1);if(/^[A-Za-z_][A-Za-z0-9_]*$/.test(value))return value;return null;};
/** Parse a deliberately flat Node TAP report. Diagnostic fields are at exactly two spaces.
 * Error/stack block scalars are indented four or more spaces and never metadata. */
export function parseFlatTap(output,names){
 const bad=reason=>({ok:false,reason});if(typeof output!=='string'||!Array.isArray(names)||names.length===0||names.some(n=>typeof n!=='string'||n.length===0)||new Set(names).size!==names.length)return bad('invalid parser inputs');
 if(output.includes('\r')||output.includes('\0'))return bad('unexpected control character');const lines=output.split('\n');let i=0;if(lines[i++]!=='TAP version 13')return bad('missing TAP header');const cases=[];
 for(let index=0;index<names.length;index++){
  if(lines[i++]!==`# Subtest: ${names[index]}`)return bad('subtest name/order mismatch');
  const expected=new RegExp(`^(ok|not ok) ${index+1} - (.*)$`),record=lines[i++]?.match(expected);if(!record||record[2]!==names[index])return bad('record name/order/directive mismatch');
  if(lines[i++]!=='  ---')return bad('missing diagnostic mapping');const fields={},duplicates=[];let closed=false;
  for(;i<lines.length;i++){const line=lines[i];if(line==='  ...'){i++;closed=true;break;}if(line==='')continue;
   const field=line.match(/^  ([A-Za-z][A-Za-z0-9_]*):(?: (.*))?$/);if(field){if(Object.hasOwn(fields,field[1]))duplicates.push(field[1]);fields[field[1]]=field[2]??'';continue;}
   if(!/^ {4,}/.test(line))return bad('malformed diagnostic structure');
  }
  if(!closed||duplicates.length)return bad('missing diagnostic end or duplicate field');if(scalar(fields.type)!=='test')return bad('wrong or missing diagnostic type');
  if(record[1]==='ok'&&['code','name','failureType','error'].some(k=>Object.hasOwn(fields,k)))return bad('failure metadata on successful case');
  cases.push({status:record[1],name:names[index],fields,diagnostic:{code:scalar(fields.code??''),name:scalar(fields.name??''),failureType:scalar(fields.failureType??'')}});
 }
 if(lines[i++]!==`1..${names.length}`)return bad('missing or wrong plan');const summary={};for(;i<lines.length;i++){const line=lines[i];if(line==='')continue;const m=line.match(/^# (tests|suites|pass|fail|cancelled|skipped|todo) (\d+)$/);if(m){if(Object.hasOwn(summary,m[1]))return bad('duplicate summary');summary[m[1]]=Number(m[2]);continue;}if(/^# duration_ms \d+(?:\.\d+)?$/.test(line))continue;return bad('unexpected output outside diagnostic');}
 if(summary.tests!==names.length||summary.suites!==0||['cancelled','skipped','todo'].some(k=>summary[k]!==0))return bad('incomplete or omitted tests');
 const failures=cases.filter(c=>c.status==='not ok').length;if(summary.fail!==failures||summary.pass!==names.length-failures)return bad('summary/record disagreement');return {ok:true,cases,summary};
}
export function classify(result,names,{initialAssertions=false}={}){
 const bad=reason=>({ok:false,status:'FAIL_CLOSED',reason});if(result.spawnError||result.timedOut||result.overflow||result.signal)return bad('execution fault');if(typeof result.stderr!=='string'||result.stderr.trim())return bad('unexpected stderr');const parsed=parseFlatTap(result.stdout,names);if(!parsed.ok)return bad(parsed.reason);
 if(initialAssertions){if(result.exit!==1||parsed.summary.fail!==names.length||parsed.cases.some(c=>c.status!=='not ok'||c.diagnostic.code!=='ERR_ASSERTION'||c.diagnostic.name!=='AssertionError'||c.diagnostic.failureType!=='testCodeFailure'))return bad('not the exact assertion diagnostic signature');return {ok:true,status:'EXPECTED_INITIAL_ASSERTIONS',tests:names.length,limitation:'Untouched incomplete target; not completion or native qualification'};}
 if(result.exit!==0||parsed.summary.fail!==0)return {ok:false,status:'ASSERTION_OR_TEST_FAIL',reason:'complete named suite not green',tests:names.length};return {ok:true,status:'PASS_NAMED_SUITE',tests:names.length};
}
