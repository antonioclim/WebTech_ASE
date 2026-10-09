/** Read-only capability policy. All temporary resources belong to this probe. */
import {spawn} from 'node:child_process';
import {existsSync, realpathSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {dirname, join, delimiter, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

export const REFERENCE = Object.freeze({node:'v24.21.0',npm:'11.19.0',executed:false});
export const LIMITS = Object.freeze({processMs:5000,outputBytes:65536,httpMs:4000});
export function parseVersion(value) {
  if(typeof value!=='string')return null;
  const m=/^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/.exec(value.trim());
  if(!m||m.slice(1,4).some(n=>!Number.isSafeInteger(Number(n)))||m[4]?.split('.').some(n=>/^\d+$/.test(n)&&n.length>1&&n.startsWith('0')))return null;
  return {major:Number(m[1]),minor:Number(m[2]),patch:Number(m[3]),prerelease:m[4]||null,build:m[5]||null};
}
export function compareVersions(a,b) {
  const x=parseVersion(a),y=parseVersion(b);if(!x||!y)throw Error('INVALID_VERSION');
  for(const key of ['major','minor','patch'])if(x[key]!==y[key])return x[key]>y[key]?1:-1;
  if(x.prerelease===y.prerelease)return 0;if(!x.prerelease)return 1;if(!y.prerelease)return -1;
  const p=x.prerelease.split('.'),q=y.prerelease.split('.');
  for(let i=0;i<Math.max(p.length,q.length);i++){if(p[i]===q[i])continue;if(p[i]===undefined)return -1;if(q[i]===undefined)return 1;const pn=/^\d+$/.test(p[i]),qn=/^\d+$/.test(q[i]);if(pn&&qn)return BigInt(p[i])>BigInt(q[i])?1:-1;if(pn!==qn)return pn?-1:1;return p[i]>q[i]?1:-1;}return 0;
}
// This classification is policy, not qualification on an injected runtime.
export function classifyVersion(value,reference=REFERENCE.node) {
  const parsed=parseVersion(value),ref=parseVersion(reference);
  if(!parsed)return {status:'ENV_BLOCKED',reason:'MISSING_OR_INVALID_VERSION'};
  if(compareVersions(value,reference)===0)return {status:'ENV_OK',reason:'REFERENCE_NUMBER_CAPABILITIES_STILL_REQUIRED'};
  return {status:'ENV_WARN',reason:parsed.prerelease?'PRERELEASE_UNQUALIFIED':parsed.major!==ref.major?'MAJOR_UNQUALIFIED':'REFERENCE_DIFFERS',limit:'Only the selected capability probes support continuation; no version interval or other platform is qualified.'};
}
export function decideEnvironment({nodeVersion,npmVersion=null,usesNpm=false,checks=[]}) {
  const versions={node:classifyVersion(nodeVersion),npm:usesNpm?classifyVersion(npmVersion,REFERENCE.npm):{status:'NOT_REQUIRED',reason:'NODE_ACTIVITY_DOES_NOT_USE_NPM'}};
  const blocked=Object.values(versions).some(v=>v.status==='ENV_BLOCKED')||checks.some(c=>c.status==='ENV_BLOCKED');
  const warn=Object.values(versions).some(v=>v.status==='ENV_WARN')||checks.some(c=>c.status==='ENV_WARN');
  return {status:blocked?'ENV_BLOCKED':warn?'ENV_WARN':'ENV_OK',exitCode:blocked?2:0,versionPolicy:versions};
}
export function runBounded(executable,args=[],{cwd=process.cwd(),env=process.env,timeoutMs=LIMITS.processMs,maxBytes=LIMITS.outputBytes}={}) {
  return new Promise(resolveResult=>{
    let child,stdout='',stderr='',bytes=0,reason=null,timer,finished=false;
    const finish=(code,signal)=>{if(finished)return;finished=true;clearTimeout(timer);resolveResult({ok:!reason&&code===0&&!signal,exitCode:code,signal,reason,stdout,stderr,executable,argv:args,timeoutMs,maxBytes});};
    try{child=spawn(executable,args,{cwd,env,shell:false,stdio:['ignore','pipe','pipe']});}catch(e){reason=e.code||'SPAWN_ERROR';finish(null,null);return;}
    const stop=why=>{if(reason)return;reason=why;child.kill('SIGKILL');};
    timer=setTimeout(()=>stop('PROCESS_TIMEOUT'),timeoutMs);
    for(const [stream,key]of [[child.stdout,'stdout'],[child.stderr,'stderr']])stream.on('data',chunk=>{bytes+=chunk.length;if(bytes>maxBytes){stop('OUTPUT_LIMIT');return;}if(key==='stdout')stdout+=chunk.toString();else stderr+=chunk.toString();});
    child.on('error',e=>{reason=e.code||'SPAWN_ERROR';finish(null,null);});child.on('close',finish);
  });
}
export async function probeTool(executable,{kind='version',args=['--version'],...options}={}) {
  const result=await runBounded(executable,args,options),first=result.stdout.trim().split(/\r?\n/)[0];
  const valid=kind==='code'?/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(first):!!parseVersion(first);
  return {...result,version:first,status:result.ok&&valid?'ENV_OK':'ENV_BLOCKED',requirement:'Successful exit and valid version output',reason:result.reason||(!result.ok?'TOOL_EXIT_ERROR':!valid?'INVALID_TOOL_VERSION':null)};
}
export async function probeNodeCore() {
  const modules=await Promise.all(['node:fs','node:crypto','node:path','node:url','node:assert/strict','node:child_process'].map(n=>import(n)));
  if(typeof Object.hasOwn!=='function'||typeof modules[1].createHash!=='function'||typeof modules[5].spawnSync!=='function')throw Error('NODE_CORE_API_MISSING');
  if(createHash('sha256').update('probe').digest('hex').length!==64||!Object.hasOwn({probe:1},'probe'))throw Error('NODE_CORE_OPERATION_FAILED');
  return {status:'ENV_OK',feature:'node-core',operation:'imports, own-property check and SHA-256'};
}
export async function probeHttp({timeoutMs=LIMITS.httpMs}={}) {
  const http=await import('node:http');if(typeof http.createServer!=='function'||typeof fetch!=='function'||typeof AbortController!=='function')throw Error('HTTP_API_MISSING');
  const server=http.createServer((req,res)=>{res.writeHead(200,{'content-type':'text/plain'});res.end('owned-environment-probe');});
  const sockets=new Set();server.on('connection',socket=>{sockets.add(socket);socket.on('close',()=>sockets.delete(socket));});
  const controller=new AbortController();let deadline;
  try{
    await new Promise((ok,no)=>{deadline=setTimeout(()=>{controller.abort();no(Error('HTTP_PROBE_TIMEOUT'));},timeoutMs);server.once('error',no);server.listen(0,'127.0.0.1',ok);});
    const address=server.address();const response=await fetch(`http://127.0.0.1:${address.port}/probe`,{signal:controller.signal});
    if(response.status!==200||await response.text()!=='owned-environment-probe')throw Error('HTTP_RESPONSE_INVALID');
    return {status:'ENV_OK',feature:'http',operation:'owned ephemeral 127.0.0.1 HTTP 200 and close',port:address.port};
  }finally{clearTimeout(deadline);controller.abort();for(const socket of sockets)socket.destroy();if(server.listening)await new Promise(ok=>server.close(ok));}
}
export async function probeSqlite({load=()=>import('node:sqlite')}={}) {
  const sqlite=await load();if(typeof sqlite.DatabaseSync!=='function')throw Error('SQLITE_DATABASESYNC_MISSING');
  let db;try{db=new sqlite.DatabaseSync(':memory:');for(const api of ['exec','prepare','close'])if(typeof db[api]!=='function')throw Error('SQLITE_API_MISSING '+api);
    db.exec('CREATE TABLE capability_probe (id INTEGER PRIMARY KEY, value TEXT NOT NULL)');
    const insert=db.prepare('INSERT INTO capability_probe(value) VALUES (?)');if(typeof insert.run!=='function')throw Error('SQLITE_API_MISSING run');insert.run('probe');
    const select=db.prepare('SELECT id,value FROM capability_probe');for(const api of ['get','all'])if(typeof select[api]!=='function')throw Error('SQLITE_API_MISSING '+api);
    if(select.get().value!=='probe'||select.all().length!==1)throw Error('SQLITE_OPERATION_FAILED');
    return {status:'ENV_OK',feature:'sqlite',operation:'DatabaseSync :memory:, exec/prepare/run/get/all/close'};
  }finally{if(db&&typeof db.close==='function')db.close();}
}
function npmCandidates() {
  const dirs=[...new Set([dirname(process.execPath),...(process.env.PATH||'').split(delimiter).filter(Boolean)])],candidates=[];
  for(const dir of dirs){candidates.push(join(dir,'node_modules/npm/bin/npm-cli.js'),join(dir,'../lib/node_modules/npm/bin/npm-cli.js'));try{const p=realpathSync(join(dir,process.platform==='win32'?'npm.cmd':'npm'));if(p.endsWith('.js'))candidates.push(p);}catch{}}
  return [...new Set(candidates)].filter(existsSync);
}
export async function probeNpm({cwd=process.cwd()}={}) {
  // npm-cli.js through the observed Node avoids npm.ps1 / ExecutionPolicy entirely.
  for(const cli of npmCandidates()){const result=await probeTool(process.execPath,{args:[cli,'--version'],cwd});if(result.status==='ENV_OK')return {version:result.version,executable:cli,runner:process.execPath,invoke:args=>runBounded(process.execPath,[cli,...args],{cwd})};}
  if(process.platform!=='win32'){const result=await probeTool('npm',{cwd});if(result.status==='ENV_OK')return {version:result.version,executable:'npm from PATH',invoke:args=>runBounded('npm',args,{cwd})};}
  // Do not launch an arbitrary .cmd via a shell; the Day0 PowerShell wrapper can use npm.cmd safely.
  return {version:null,executable:process.platform==='win32'?'npm-cli.js unavailable (use npm.cmd --version in terminal)':'npm unavailable'};
}
export async function assessEnvironment({unit='activity',operation='preflight',cwd=process.cwd(),command='node environment.mjs',features=['node-core'],usesNpm=false}={}) {
  const checks=[],npm=usesNpm?await probeNpm({cwd}):{version:null,executable:null},wanted=new Set(['node-core',...features]);
  for(const feature of wanted){try{let result;if(feature==='node-core')result=await probeNodeCore();else if(feature==='http'||feature==='loopback-http')result=await probeHttp();else if(feature==='fetch'){if(typeof fetch!=='function'||typeof AbortController!=='function')throw Error('FETCH_API_MISSING');result={status:'ENV_OK',feature,operation:'fetch and AbortController functions'};}else if(feature==='sqlite')result=await probeSqlite();else throw Error('UNKNOWN_PROFILE_FEATURE '+feature);checks.push(result);}catch(error){checks.push({status:'ENV_BLOCKED',feature,reason:error.code||error.message,remedy:'Use a Node installation providing the named API; rerun this command. No package installation is needed for core modules.'});}}
  if(usesNpm&&npm.version){const config=await npm.invoke(['config','get','engine-strict']);checks.push({feature:'npm-config',status:config.ok&&/^(true|false)$/.test(config.stdout.trim())?'ENV_OK':'ENV_BLOCKED',engineStrict:config.stdout.trim(),reason:config.ok?null:config.reason||'NPM_CONFIG_EXIT_ERROR'});}
  const policy=decideEnvironment({nodeVersion:process.version,npmVersion:npm.version,usesNpm,checks});
  return {schema:'webtech.environment/v1',...policy,unit,operation,cwd:resolve(cwd),command,observedCwd:process.cwd(),observedArgv:[process.execPath,...process.argv.slice(1)],recheck:{cwd:resolve(cwd),command},observedNode:process.version,nodeExecutable:process.execPath,observedNpm:npm.version,npmExecutable:npm.executable,reference:REFERENCE,checks,qualification:'Selected probes on the observed runtime only; this is not implementation PASS or native browser qualification.',remedy:policy.exitCode?'Read the failed feature and diagnostic; repair only the affected operation, then rerun from cwd.':null};
}
export async function requireEnvironment(options) {const report=await assessEnvironment(options);console.error(JSON.stringify(report));if(report.exitCode){const error=Error('ENV_BLOCKED '+options.unit+'/'+options.operation);error.environment=report;throw error;}return report;}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const args=process.argv.slice(2);let unit='activity',profile='node',tool=null,kind='version',toolArgs=null,json=false,invalid=false,cwd=process.cwd();
  while(args.length){const flag=args.shift();if(flag==='--cwd')cwd=args.shift();else if(flag==='--unit')unit=args.shift();else if(flag==='--profile')profile=args.shift();else if(flag==='--tool')tool=args.shift();else if(flag==='--kind')kind=args.shift();else if(flag==='--tool-arg'){(toolArgs??=[]).push(args.shift());}else if(flag==='--json')json=true;else invalid=true;}
  if(invalid||(!tool&&!['node','http','sqlite','npm'].includes(profile))){console.error('Use environment.mjs --unit S01 --profile node|http|sqlite|npm --json; or --tool executable --kind code|version');process.exitCode=64;}
  else{try{const report=tool?await probeTool(tool,{kind,...(toolArgs?{args:toolArgs}:{})}):await assessEnvironment({unit,operation:profile,cwd,command:process.argv.join(' '),features:profile==='http'?['http']:profile==='sqlite'?['sqlite']:['node-core'],usesNpm:profile==='npm'});console.log(json?JSON.stringify(report):JSON.stringify(report,null,2));process.exitCode=report.exitCode??(report.status==='ENV_BLOCKED'?2:0);}catch(error){console.error(JSON.stringify({status:'ENV_BLOCKED',reason:error.code||error.message,unit,operation:profile}));process.exitCode=2;}}
}
