// S09 v1.2.0 NEW support source. UNEXECUTED during package production.
// This module never installs dependencies. Project imports occur only in explicit observe mode.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const baselinePath=path.join(root,'support/code/PROJECT_BASELINES_v1.2.0.json');
const baselineDigest='3aa8291a33a5b108965647fb873044d4d962953067a595aa166dc494afd7b0c8';
const fixed={p01:{root:'projects/p01/student',allowed:'src/NotesApp.jsx'},p02:{root:'capstone/p02/student',allowed:'client/src/NotesWorkspace.jsx'},p03:{root:'portfolio/p03/student',allowed:'server/create-production-app.js'}};
const emit=value=>console.log(JSON.stringify(value,null,2));
const schema='TW2026_S09_SUPPORT/1.2.0';
const safeRel=value=>typeof value==='string' && value.length>0 && !value.startsWith('/') && !value.includes('\\') && !value.split('/').some(x=>!x||x==='.'||x==='..') && !value.includes('\0') && !/^[A-Za-z]:/.test(value);
async function noSymlinkPath(relative,kind) {
  if(!safeRel(relative)) throw Error('UNSAFE_PATH:'+relative);
  const rootStat=await fs.lstat(root);
  if(rootStat.isSymbolicLink() || !rootStat.isDirectory()) throw Error('SYMLINK_OR_NON_DIRECTORY_PACKAGE_ROOT');
  let current=root;
  const parts=relative.split('/');
  for(let i=0;i<parts.length;i++) {
    current=path.join(current,parts[i]);
    const stat=await fs.lstat(current);
    if(stat.isSymbolicLink()) throw Error('SYMLINK_PATH_COMPONENT_BLOCKED:'+parts.slice(0,i+1).join('/'));
    if(i<parts.length-1 && !stat.isDirectory()) throw Error('NON_DIRECTORY_PATH_COMPONENT_BLOCKED');
    if(i===parts.length-1 && (kind==='file'?!stat.isFile():!stat.isDirectory())) throw Error('SPECIAL_OR_WRONG_PATH_TYPE_BLOCKED');
  }
  return current;
}
async function walk(directory,excluded=[],rel='') {
  const names=[];
  for(const entry of await fs.readdir(directory,{withFileTypes:true})) {
    const r=rel?rel+'/'+entry.name:entry.name;
    if(!safeRel(r)) throw Error('UNSAFE_PATH:'+r);
    if(entry.isSymbolicLink()) throw Error('SYMLINK_BLOCKED:'+r);
    if(entry.isDirectory()) { if(!excluded.includes(r)) names.push(...await walk(path.join(directory,entry.name),excluded,r)); }
    else if(entry.isFile()) names.push(r);else throw Error('SPECIAL_FILE_BLOCKED:'+r);
  }
  return names.sort();
}
async function sourceContract(id) {
  if(!Object.hasOwn(fixed,id)) throw Error('UNKNOWN_PROJECT');
  await noSymlinkPath('support/code/PROJECT_BASELINES_v1.2.0.json','file');
  const bytes=await fs.readFile(baselinePath);
  if(hash(bytes)!==baselineDigest) throw Error('PACKAGED_BASELINE_METADATA_CHANGED');
  const data=JSON.parse(bytes),b=data.projects[id];
  if(b.root!==fixed[id].root || JSON.stringify(b.allowed_changes)!==JSON.stringify([fixed[id].allowed])) throw Error('CONTRACT_BOUNDARY_CHANGED');
  if(Object.keys(b.files).length!==data.protected_counts[id] || Object.keys(b.files).some(x=>!safeRel(x))) throw Error('BASELINE_SHAPE_CHANGED');
  return b;
}
async function boundary(id,initial=false,quiet=false) {
  const b=await sourceContract(id),target=await noSymlinkPath(b.root,'directory');
  const actual=await walk(target,b.generated_exclusions),changes=[],issues=[];
  for(const rel of actual) {
    const digest=hash(await fs.readFile(path.join(target,rel)));
    if(!Object.hasOwn(b.files,rel)) issues.push({path:rel,status:'ADDED_PROTECTED'});
    else if(digest!==b.files[rel]) (rel===fixed[id].allowed?changes:issues).push({path:rel,status:'MODIFIED',sha256:digest});
  }
  for(const rel of Object.keys(b.files)) if(!actual.includes(rel)) issues.push({path:rel,status:'MISSING'});
  const status=issues.length?'PROTECTED_SOURCE_MISMATCH':changes.length?(initial?'INITIAL_STATE_CHANGED':'ALLOWED_OBJECTIVE_EDIT_ONLY'):'EXACT_STARTER_BYTES';
  const record={schema,project:id,mode:initial?'INITIAL_SOURCE':'WORK_SOURCE',status,changes,issues,
        ignored_generated_directories:b.generated_exclusions,application_checks:'NOT_EXECUTED',technical_completion:'NOT_ESTABLISHED',
        limitation:'Hashes/allowed paths only. Exact starter remains incomplete; an allowed edit can still be wrong. Ignored dependencies/generated output are unqualified.'};
  if(!quiet) emit(record);
  process.exitCode=issues.length||(initial&&changes.length)?1:0;
  return {clean:issues.length===0&&(!initial||changes.length===0),record};
}
async function verifyPackage() {
  const controls=['SHA256SUMS.txt','PACKAGE_ID.txt'];
  for(const control of controls) await noSymlinkPath(control,'file');
  const manifest=await fs.readFile(path.join(root,controls[0])),text=manifest.toString('utf8');
  if(text.includes('\r')||!text.endsWith('\n')) throw Error('MANIFEST_FORMAT_MUST_BE_LF');
  const expected=new Map(),folded=new Set();
  for(const row of text.trimEnd().split('\n')) {
    const match=/^([0-9a-f]{64})  (.+)$/.exec(row);
    if(!match || !safeRel(match[2]) || controls.includes(match[2])) throw Error('MANIFEST_UNSAFE_OR_INVALID_ROW');
    const key=match[2].normalize('NFC').toLowerCase();
    if(expected.has(match[2])||folded.has(key)) throw Error('MANIFEST_DUPLICATE_OR_CASE_COLLISION');
    expected.set(match[2],match[1]);folded.add(key);
  }
  const manifestNames=[...expected.keys()];
  if(JSON.stringify(manifestNames)!==JSON.stringify([...manifestNames].sort())) throw Error('MANIFEST_NOT_SORTED');
  const actual=await walk(root),payload=actual.filter(x=>!controls.includes(x)),issues=[];
  for(const rel of payload) {
    if(!expected.has(rel)) issues.push({path:rel,status:'EXTRA'});
    else if(hash(await fs.readFile(path.join(root,rel)))!==expected.get(rel)) issues.push({path:rel,status:'HASH_MISMATCH'});
  }
  for(const rel of expected.keys()) if(!payload.includes(rel)) issues.push({path:rel,status:'MISSING'});
  const packageId=(await fs.readFile(path.join(root,controls[1]),'utf8')).trim();
  if(!/^[0-9a-f]{64}$/.test(packageId)||hash(manifest)!==packageId) issues.push({path:'PACKAGE_ID.txt',status:'IDENTITY_MISMATCH'});
  emit({schema,status:issues.length?'PACKAGE_INTEGRITY_FAIL':'PACKAGE_INTEGRITY_ONLY_PASS',package_id:packageId,
        payload_files:payload.length,manifest_files:expected.size,issues,application_checks:'NOT_EXECUTED',
        limitation:'Exact regular file set/hash identity only; not origin authentication, completed objectives, browser or runtime acceptance. Added evidence files require a separate working copy.'});
  process.exitCode=issues.length?1:0;
}
function npmRead(args,cwd=root,timeout=10000) {
  if(process.platform==='win32') return spawnSync(process.env.ComSpec||'cmd.exe',['/d','/s','/c','npm '+args.join(' ')],{cwd,encoding:'utf8',timeout,windowsHide:true});
  return spawnSync('npm',args,{cwd,encoding:'utf8',timeout});
}
function environment(quiet=false) {
  const result=npmRead(['--version']),npm=result.status===0?String(result.stdout).trim():null;
  const qualified=process.version==='v24.21.0' && npm==='11.19.0';
  const data={schema,status:qualified?'DECLARED_VERSION_MATCH_ONLY':'ENVIRONMENT_BLOCK_NOT_QUALIFIED',node_actual:process.version,npm_actual:npm,
    node_required:'v24.21.0',npm_required:'11.19.0',os:process.platform,project_root:root,
    npm_probe_error:result.error?.code||null,install_performed:false,application_checks:'NOT_EXECUTED',
    limitation:'Version equality is not dependency/native provenance, package availability, browser or application qualification. No installation or substitution occurs.'};
  if(!quiet) emit(data);return {qualified,data};
}
function category(result,text) {
  if(result.error?.code==='ETIMEDOUT') return 'TIMEOUT';
  if(result.error || result.status===null) return 'COMMAND_ERROR';
  if(result.status===0) return 'ACTUAL_RECORDED_PASS';
  if(/ERR_MODULE_NOT_FOUND|MODULE_NOT_FOUND|Cannot find package|Cannot find module/.test(text)) return 'DEPENDENCY_ERROR';
  if(/SyntaxError|Unexpected token|Failed to parse|Parse failure/.test(text)) return 'PARSER_ERROR';
  if(/ReporterError|reporter.+(?:error|failed)/i.test(text)) return 'REPORTER_ERROR';
  if(/AssertionError|assertion failed|expect\(|expected.+to (?:be|equal|match)/i.test(text)) return 'ASSERTION_FAIL_REQUIRES_REVIEW';
  return 'COMMAND_ERROR_OR_CRASH_REQUIRES_REVIEW';
}
async function tests(id) {
  if(!Object.hasOwn(fixed,id)) throw Error('UNKNOWN_PROJECT');
  const env=environment(true);if(!env.qualified){emit(env.data);process.exitCode=2;return;}
  const source=await boundary(id,false,true);
  if(!source.clean){emit({schema,status:'PROTECTED_SOURCE_BLOCK_NO_TESTS_EXECUTED',source_boundary:source.record});process.exitCode=2;return;}
  const cwd=path.join(root,fixed[id].root),commands=['test:baseline','test:objective','test:regression',...(id==='p03'?[]:['build'])],results=[];
  for(const command of commands) {
    const result=npmRead(['run',command],cwd,60000),output=String(result.stdout||'')+String(result.stderr||'');
    results.push({command:'npm run '+command,project:id,exit_code:result.status,signal:result.signal||null,
      status:category(result,output),stdout:String(result.stdout||''),stderr:String(result.stderr||''),
      assertion_qualification:'Any assertion failure requires the named assertion, exact untouched starter identity and its documented unavailable objective. Parser/dependency/crash/timeout/reporting failures are never automatically intended.'});
    if(result.error?.code==='ETIMEDOUT'||result.status===null) break;
  }
  emit({schema,project:id,status:'ACTUAL_COMMAND_RECORD_REQUIRES_REVIEW',environment:env.data,source_boundary:source.record,results,technical_completion:'NOT_AUTOMATICALLY_ESTABLISHED',browser:'NOT_EXECUTED',
    limitation:'Only actually completed commands are recorded. No automatic expected-failure or grade classification; preserve full output and source identity. P03 client is never rebuilt.'});
  process.exitCode=results.every(x=>x.status==='ACTUAL_RECORDED_PASS')?0:1;
}
async function observe(mode) {
  if(!['static-only','universal','student'].includes(mode)) throw Error('UNKNOWN_LOCAL_MODE');
  const env=environment(true);if(!env.qualified){emit(env.data);process.exitCode=2;return;}
  const source=await boundary('p03',false,true);
  if(!source.clean){emit({schema,status:'PROTECTED_SOURCE_BLOCK_NO_HTTP_EXECUTED',source_boundary:source.record});process.exitCode=2;return;}
  const p03=path.join(root,fixed.p03.root);
  const {createServer}=await import('node:http');
  const {createApiRouter}=await import(pathToFileURL(path.join(p03,'server/api-router.js')).href);
  const {createProductionApp}=await import(pathToFileURL(path.join(p03,'server/create-production-app.js')).href);
  const {createBrokenServer}=await import(pathToFileURL(path.join(p03,'evidence/broken-server.js')).href);
  const requestLog=[],options={clientDirectory:path.join(p03,'client-dist'),apiRouter:createApiRouter(requestLog),requestLog};
  const app=mode==='student'?createProductionApp(options):createBrokenServer({...options,mode});
  const server=createServer(app),results=[];
  const index=hash(await fs.readFile(path.join(p03,'client-dist/index.html'))),asset=hash(await fs.readFile(path.join(p03,'client-dist/assets/app-a1b2c3.js')));
  const cases=[['P03-ROOT','GET','/','text/html'],['P03-NESTED','GET','/notes/42','text/html'],['P03-HEAD','HEAD','/notes/42','text/html'],
    ['P03-ASSET','GET','/assets/app-a1b2c3.js','*/*'],['P03-ICON','GET','/icon.svg','*/*'],['P03-API-MISS','GET','/api/missing','text/html'],
    ['P03-API-ROOT','GET','/api','text/html'],['P03-API-KNOWN','GET','/api/status','application/json'],['P03-MISSING-ASSET','GET','/assets/missing.js','text/html'],
    ['P03-FILE-LIKE','GET','/release.v2','text/html'],['P03-METHOD','POST','/notes/42','text/html'],['P03-ACCEPT','GET','/notes/42','application/json'],
    ['P03-NAMESPACE','GET','/apiary','text/html'],['P03-LATER','GET','/notes/42','text/html'],['P03-UNKNOWN-CLIENT','GET','/unlisted-client-path','text/html']];
  try {
    await new Promise((yes,no)=>{server.once('error',no);server.listen(0,'127.0.0.1',yes);});
    const base='http://127.0.0.1:'+server.address().port;
    for(const [id,method,p,accept] of cases) {
      const start=requestLog.length;
      try {
        const r=await fetch(base+p,{method,headers:{accept},redirect:'error',signal:AbortSignal.timeout(5000)}),body=Buffer.from(await r.arrayBuffer()),digest=hash(body);
        results.push({case_id:id,method,path:p,Accept:accept,evidence_class:'HTTP_LOOPBACK',status:r.status,content_type:r.headers.get('content-type'),
          cache_control:r.headers.get('cache-control'),bytes:body.length,sha256:digest,is_index_bytes:digest===index,is_asset_bytes:digest===asset,trace:requestLog.slice(start)});
      } catch(error) { results.push({case_id:id,method,path:p,Accept:accept,status:'REQUEST_ERROR',error_name:error.name,error_message:error.message,trace:requestLog.slice(start)}); }
    }
    emit({schema,class:'HTTP_LOOPBACK_ONLY',mode,environment:env.data,source_boundary:source.record,source_sha256:hash(await fs.readFile(path.join(p03,mode==='student'?'server/create-production-app.js':'evidence/broken-server.js'))),results,
      missing_index:'SEPARATE_FIXTURE_NOT_EXECUTED_BY_THIS_OBSERVER',post_header_streaming:'SEPARATE_QUALIFICATION_NOT_EXECUTED_BY_THIS_OBSERVER',browser:'NOT_EXECUTED',technical_completion:'NOT_AUTOMATICALLY_ESTABLISHED',
      limitation:'Actual local HTTP only when this command really ran. Never browser/React boot, missing-index or post-header streaming proof. No remote URL, install or client rebuild.'});
    process.exitCode=results.some(x=>x.status==='REQUEST_ERROR')?1:0;
  } finally {server.closeIdleConnections?.();if(server.listening) await new Promise(yes=>server.close(yes));}
}
export async function run(action,args) {
  try {
    if(action==='package'&&args.length===1&&args[0]==='--verify-package') await verifyPackage();
    else if(action==='environment'&&args.length===1&&args[0]==='--check-environment') {const r=environment();process.exitCode=r.qualified?0:2;}
    else if(['initial','work'].includes(action)&&args.length===2&&args[0]==='--check-source') await boundary(args[1],action==='initial');
    else if(action==='tests'&&args.length===2&&args[0]==='--run-checks') await tests(args[1]);
    else if(action==='observe'&&args.length===2&&args[0]==='--run-local') await observe(args[1]);
    else throw Error('EXPLICIT_MODE_REQUIRED: choose the named source/environment/package/checks/local observation route; no action was performed');
  } catch(error) {emit({schema,status:'SUPPORT_ERROR_NOT_QUALIFIED',error:error.message,technical_completion:'NOT_ESTABLISHED',install_performed:false});process.exitCode=2;}
}
