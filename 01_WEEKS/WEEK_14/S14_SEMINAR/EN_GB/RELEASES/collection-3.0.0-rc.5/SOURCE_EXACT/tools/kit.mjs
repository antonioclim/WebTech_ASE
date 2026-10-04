import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawn,spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const strictJSON=createRequire(import.meta.url)('./form-core.js').strictJSON;
export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const meta=new Set(['SHA256SUMS.txt','PACKAGE_ID.txt']);
const reserved=/^(con|prn|aux|nul|com[1-9¹²³]|lpt[1-9¹²³])(?:\.|$)/i;
function need(ok,reason){if(!ok)throw Error(reason);}
export function scan(base){
 const entries=new Map(),keys=new Map(),components=new Map();
 for(let p=path.resolve(base);;p=path.dirname(p)){const s=fs.lstatSync(p);need(s.isDirectory()&&!s.isSymbolicLink(),'Unsafe root ancestor');if(p===path.dirname(p))break;}
 function walk(dir,prefix=''){
  for(const name of fs.readdirSync(dir).sort()){
   const relative=prefix?prefix+'/'+name:name;need(relative.length<=220&&relative.normalize('NFC')===relative&&!/[<>:"\\|?*\u0000-\u001f\u007f]/.test(relative)&&!/[. ]$/.test(name)&&!reserved.test(name),'Unsafe portable path');
   const normal=relative.normalize('NFKC');need(!/[<>:"\\|?*\u0000-\u001f\u007f]/.test(normal)&&normal.split('/').every(p=>!reserved.test(p)&&!/[. ]$/.test(p)),'Unsafe normalised path');
   const key=normal.toUpperCase().toLowerCase();need(!keys.has(key),'Unicode or conservative caseless collision');keys.set(key,relative);
   const p=path.join(dir,name),s=fs.lstatSync(p);need(!s.isSymbolicLink(),'Symlink refused');
   if(s.isDirectory()){entries.set(relative+'/',null);walk(p,relative);}
   else{need(s.isFile()&&s.nlink===1&&s.size<=128*1024*1024,'Special file, hardlink or size bound');entries.set(relative,p);}
  }
 }walk(base);return entries;
}
export function verify(base,work=false){
 const entries=scan(base);const manifest=fs.readFileSync(path.join(base,'SHA256SUMS.txt'));const pid=fs.readFileSync(path.join(base,'PACKAGE_ID.txt'),'utf8');need(pid===hash(manifest)+'\n','PACKAGE_ID mismatch');
 const text=manifest.toString('utf8');need(Buffer.from(text).equals(manifest)&&text.endsWith('\n'),'Manifest UTF-8 and terminal LF');const expected=new Map();for(const line of text.slice(0,-1).split('\n')){const m=/^([a-f0-9]{64})  (.+)$/.exec(line);need(m&&!expected.has(m[2])&&!meta.has(m[2]),'Manifest format/duplicate');expected.set(m[2],m[1]);}need([...expected].map(([n,h])=>h+'  '+n+'\n').sort((a,b)=>a.slice(66)<b.slice(66)?-1:a.slice(66)>b.slice(66)?1:0).join('')===text,'Canonical manifest order');
 const files=[...entries].filter(([,p])=>p!==null).map(([n])=>n);need(files.length===expected.size+2&&files.every(n=>meta.has(n)||expected.has(n)),'Missing or extra package file');
 const expectedDirs=new Set();for(const n of files){const a=n.split('/');for(let d=1;d<a.length;d++)expectedDirs.add(a.slice(0,d).join('/')+'/');}
 need([...entries].filter(([,p])=>p===null).every(([n])=>expectedDirs.has(n)),'Extra empty directory');
 const allowed=new Set(work?['projects/p01/student/src/regression-harness.mjs']:[]);const changed=[];
 for(const [n,h] of expected){const p=entries.get(n);need(p,'Missing '+n);if(hash(fs.readFileSync(p))!==h){need(allowed.has(n),'Protected file changed: '+n);changed.push(n);}}
 return {ok:true,packageId:pid.trim(),changed,mode:work?'WORK_RESULT_BOUNDARY':'EXACT_INITIAL_PACKAGE',scope:'Consistency relative to manifest, not signature or sandbox'};
}
export function environment(){
 const args=process.platform==='win32'?['/d','/s','/c','npm --version']:['--version'];const command=process.platform==='win32'?'cmd.exe':'npm';
 const r=spawnSync(command,args,{encoding:'utf8',timeout:3000,maxBuffer:1048576});const npm=String(r.stdout||'').trim();return {node:process.version,npm,requiredNode:'v24.21.0',requiredNpm:'11.19.0',ok:!r.error&&r.status===0&&process.version==='v24.21.0'&&npm==='11.19.0'};
}
function terminate(child){if(process.platform==='win32')spawnSync('taskkill',['/PID',String(child.pid),'/T','/F'],{timeout:3000,stdio:'ignore'});else{try{process.kill(-child.pid,'SIGKILL');}catch{child.kill('SIGKILL');}}}
export function bounded(args,cwd,timeout=10000,limit=2097152){return new Promise(resolve=>{
 let out=[],err=[],bytes=0,reason=null,settled=false;const child=spawn(process.execPath,args,{cwd,stdio:['ignore','pipe','pipe'],detached:process.platform!=='win32',shell:false});
 const timer=setTimeout(()=>{reason='TIMEOUT';terminate(child);},timeout);
 const collect=(target,data)=>{bytes+=data.length;if(bytes>limit){reason='OUTPUT_LIMIT';terminate(child);}else target.push(data);};child.stdout.on('data',d=>collect(out,d));child.stderr.on('data',d=>collect(err,d));
 const finish=(exitCode,signal,spawnError=null)=>{if(settled)return;settled=true;clearTimeout(timer);resolve({args,exitCode,signal,spawnError,reason,stdout:Buffer.concat(out).toString('utf8'),stderr:Buffer.concat(err).toString('utf8')});};
 child.once('error',e=>finish(null,null,e.code));child.once('close',(code,sig)=>{terminate(child);finish(code,sig);});
 });}
export function judge(result,names,expectedFailures){
 need(Array.isArray(names)&&names.length>0&&new Set(names).size===names.length&&names.every(n=>typeof n==='string')&&Number.isInteger(expectedFailures)&&expectedFailures>=0&&expectedFailures<=names.length,'Suite policy');
 need(!result.signal&&!result.spawnError&&!result.reason&&!result.stderr,'Bounded execution failure');const o=result.stdout;need(typeof o==='string'&&!/Bail out!/.test(o)&&!o.includes('\r'),'TAP bailout/encoding');
 const header=[...o.matchAll(/^TAP version (\d+)$/gm)];need(header.length===1&&header[0].index===0&&header[0][1]==='13','Exact TAP header');
 const rows=[...o.matchAll(/^(not ok|ok) (\d+) - (.+)$/gm)];need(rows.length===[...o.matchAll(/^(?:not ok|ok)(?:\s|$)/gm)].length&&JSON.stringify(rows.map(x=>x[3]))===JSON.stringify(names)&&rows.every((r,i)=>r[2]===String(i+1)),'Ordered TAP numbers/names');
 const plans=[...o.matchAll(/^1\.\.(\d+)$/gm)];need(plans.length===1&&[...o.matchAll(/^1\.\./gm)].length===1&&plans[0][1]===String(names.length)&&plans[0].index>rows.at(-1).index,'Exact TAP plan');
 function count(label,want){const hits=[...o.matchAll(new RegExp('^# '+label+' (\\d+)$','gm'))];need(hits.length===1&&[...o.matchAll(new RegExp('^# '+label+'(?:\\s|$)','gm'))].length===1&&hits[0][1]===String(want)&&hits[0].index>plans[0].index,'Exact unique TAP '+label);}
 count('tests',names.length);count('suites',0);count('pass',names.length-expectedFailures);count('fail',expectedFailures);for(const n of ['cancelled','skipped','todo'])count(n,0);
 for(let i=0;i<rows.length;i++){const r=rows[i],part=o.slice(r.index,i+1<rows.length?rows[i+1].index:plans[0].index),codes=[...part.matchAll(/^\s+code: '([^']+)'$/gm)].map(x=>x[1]);need(r[1]==='not ok'?codes.length===1&&codes[0]==='ERR_ASSERTION':codes.length===0,'Assertion category belongs to failing row');}
 need([...o.matchAll(/^\s+code: /gm)].length===expectedFailures,'No extra error code diagnostics');
 need(result.exitCode===(expectedFailures?1:0)&&rows.filter(x=>x[1]==='not ok').length===expectedFailures,'Exact exit/result');
 return {ok:true,tests:names.length,expectedFailures,classification:expectedFailures?'EXPECTED_INITIAL_ASSERTIONS':'PASS_OBSERVED_RUNTIME'};
}
export async function suites(base,initial){
 const config=JSON.parse(fs.readFileSync(path.join(base,'KIT_CONFIG.json')));const result=[];
 for(const suite of ['baseline','objective','regression']){const spec=config.suites[suite];const run=await bounded(['--test','--test-reporter=tap','tests/'+suite+'.test.mjs'],path.join(base,'projects/p01/student'));result.push({suite,...judge(run,spec.names,initial?spec.initialFailures:0),log:run.stdout});}
 return result;
}
export function validateReview(value){
 const ids=['PROJECT_IDENTITY','LOCKED_INSTALL','DEPENDENCY_AUDIT','PRODUCTION_BUILD','RUNTIME_HEALTH','LOG_REDACTION','CONFIG_SECRETS','HTTP_ERROR_HEADERS','DEPLOYMENT','EXCEPTIONS'];
 need(value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).sort().join(',')==='decision,project,rows,schema','Review shape');need(value.schema==='TW2026_S14_PRODUCTION_REVIEW/1.2'&&typeof value.project==='string'&&value.project.trim(),'Project/schema');need(Array.isArray(value.rows)&&value.rows.length===10,'Ten review rows');const seen=new Set();
 for(const r of value.rows){need(r&&typeof r==='object'&&!Array.isArray(r)&&Object.keys(r).sort().join(',')==='claim,id,limit,nextAction,owner,source,state','Row shape');need(ids.includes(r.id)&&!seen.has(r.id),'Row ID');seen.add(r.id);for(const k of ['claim','source','owner','nextAction','limit'])need(typeof r[k]==='string'&&r[k].trim()&&r[k].length<=16000,'Nonblank bounded '+k);need(['pass','fail','unknown'].includes(r.state),'State');}
 const required=value.rows.filter(r=>r.id!=='DEPLOYMENT');const expected=required.some(r=>r.state==='fail')?'fail':required.some(r=>r.state==='unknown')?'unknown':'pass';need(value.decision===expected,'Decision contradicts required evidence');return {ok:true,decision:expected,deployment:value.rows.find(r=>r.id==='DEPLOYMENT').state,certificate:false,scope:'Structural coherence only; no witness authenticity, commands or deployment qualification'};
}
async function main(){
 const action=process.argv[2];need(process.argv.length===(action==='review'?4:3),'Unsupported arguments');
 if(['stop','status'].includes(action)){console.log('NO_PERSISTENT_KIT_SERVERS: P01 test children are bounded and own cleanup. This does not inspect other applications. Stop a separately started terminal process with Ctrl+C and verify its own diagnostics.');return;}
 need(['verify','environment','initial','work','test','review'].includes(action),'Unsupported action');const integrity=verify(root,['work','test','review'].includes(action));
 if(action==='verify'){console.log(JSON.stringify(integrity,null,2));return;}
 const env=environment();console.log(JSON.stringify(env));need(env.ok,'STOP_RUNTIME_MISMATCH: no install and no public override');if(action==='environment')return;
 if(action==='review'){const p=path.resolve(process.argv[3]),st=fs.lstatSync(p);need(st.isFile()&&!st.isSymbolicLink()&&st.nlink===1&&st.size<=2000000,'Review regular file/byte limit');const raw=fs.readFileSync(p);need(raw.length<=2000000,'Review byte limit');console.log(JSON.stringify(validateReview(strictJSON(raw.toString('utf8'))),null,2));return;}
 const runs=await suites(root,action==='initial');verify(root,action!=='initial');for(const r of runs)console.log(r.log);console.log(JSON.stringify({ok:true,action,results:runs.map(({log,...r})=>r),nativeAcceptance:false}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(e=>{console.error('STOP: '+e.message);process.exitCode=1;});
