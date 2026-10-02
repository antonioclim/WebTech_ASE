import {createServer as httpServer,request} from 'node:http';
import {randomBytes,createHash,timingSafeEqual} from 'node:crypto';
import {mkdirSync,lstatSync,readFileSync,writeFileSync,unlinkSync,realpathSync,existsSync,chmodSync} from 'node:fs';
import os from 'node:os';import path from 'node:path';import {pathToFileURL} from 'node:url';
const hash=t=>createHash('sha256').update(t).digest('hex');
function location(root){
 const dir=path.join(os.tmpdir(),`tw2026-s01-${typeof process.getuid==='function'?process.getuid():'user'}`);
 if(!existsSync(dir))mkdirSync(dir,{mode:0o700});
 const st=lstatSync(dir);if(st.isSymbolicLink()||!st.isDirectory())throw new Error('UNSAFE_SESSION_DIRECTORY');
 if(process.platform!=='win32'&&(st.uid!==process.getuid()||(st.mode&0o077)))throw new Error('SESSION_DIRECTORY_PERMISSIONS');
 return {dir,key:hash(realpathSync(root))};
}
function statePath(root,code){const {dir,key}=location(root);if(!['p1','p2'].includes(code))throw new Error('UNKNOWN_PROJECT');return {file:path.join(dir,`${key}-${code}.json`),key};}
export function readState(root,code){const {file,key}=statePath(root,code);if(!existsSync(file))return null;const st=lstatSync(file);if(!st.isFile()||st.isSymbolicLink()||st.size>4096)throw new Error('UNSAFE_SESSION_RECORD');if(process.platform!=='win32'&&(st.uid!==process.getuid()||(st.mode&0o077)))throw new Error('SESSION_RECORD_PERMISSIONS');const s=JSON.parse(readFileSync(file,'utf8'));if(s.rootKey!==key||s.code!==code||!Number.isInteger(s.controlPort)||s.controlPort<1||s.controlPort>65535||!Number.isInteger(s.appPort)||s.appPort<1||s.appPort>65535||!/^[0-9a-f]{64}$/.test(s.token))throw new Error('INVALID_SESSION_RECORD');return {...s,file};}
function call(s,method){return new Promise((resolve,reject)=>{
 let bytes=0,body='';let deadline;const r=request({hostname:'127.0.0.1',port:s.controlPort,path:'/session',method,headers:{'x-tw-token':s.token,'content-length':'0'},timeout:2000},res=>{res.on('data',b=>{bytes+=b.length;if(bytes>4096)r.destroy(new Error('CONTROL_OUTPUT_LIMIT'));else body+=b});res.on('end',()=>{try{const v=JSON.parse(body);if(res.statusCode!==200||v.rootKey!==s.rootKey||v.code!==s.code)throw new Error('CONTROL_IDENTITY_MISMATCH');resolve(v);}catch(e){reject(e);}});});deadline=setTimeout(()=>r.destroy(new Error('CONTROL_WALL_TIME_LIMIT')),3000);r.on('close',()=>clearTimeout(deadline));r.on('timeout',()=>r.destroy(new Error('CONTROL_TIMEOUT')));r.on('error',reject);r.end();
});}
export async function stopOwned(root,code){
 const s=readState(root,code);if(!s)return {code,status:'NO_OWNED_SESSION',ok:true};
 try{await call(s,'GET');await call(s,'POST');
  for(let i=0;i<30;i++){if(!existsSync(s.file))return {code,status:'OWNED_SESSION_STOPPED',ok:true};await new Promise(r=>setTimeout(r,100));}
  return {code,status:'STOP_ACKNOWLEDGED_RECORD_REMAINS',ok:false};
 }catch(e){return {code,status:'STALE_OR_UNREACHABLE_SESSION_NO_PID_KILL',ok:false,error:e.message,sessionRecord:s.file};}
}
export async function sessionStatus(root,code){const s=readState(root,code);if(!s)return {code,status:'NO_OWNED_SESSION',ok:true};try{await call(s,'GET');return {code,status:'OWNED_SESSION_RUNNING',url:`http://127.0.0.1:${s.appPort}`,ok:true};}catch(e){return {code,status:'STALE_OR_UNREACHABLE_SESSION',ok:false,error:e.message};}}
export async function startOwned(root,code,cfg){
 const {file,key}=statePath(root,code);if(existsSync(file))throw new Error('SESSION_RECORD_EXISTS: run STATUS_SERVERS then STOP_SERVERS; do not start a duplicate.');
 const conf=cfg.projects[code];if(!conf)throw new Error('UNKNOWN_PROJECT');
 const mod=await import(pathToFileURL(path.join(root,conf.path,'src/server.js')).href);
 const app=code==='p1'?mod.createInvestigationServer():mod.createServer();
 const token=randomBytes(32).toString('hex');const same=t=>typeof t==='string'&&/^[0-9a-f]{64}$/.test(t)&&timingSafeEqual(Buffer.from(t,'ascii'),Buffer.from(token,'ascii'));
 let stopped=false,control,life,owns=false;
 const clean=async(reason,exitCode=0)=>{if(stopped)return;stopped=true;clearTimeout(life);
  await Promise.all([app,control].filter(Boolean).map(s=>new Promise(r=>{if(!s.listening)return r();s.close(r);s.closeAllConnections?.();})));
  if(owns){try{const s=JSON.parse(readFileSync(file,'utf8'));if(s.token===token)unlinkSync(file);}catch{}}
  console.log(`SESSION_STOPPED ${code} ${reason}`);process.exitCode=exitCode;
  process.removeListener('SIGINT',onINT);process.removeListener('SIGTERM',onTERM);
 };
 const onINT=()=>void clean('CTRL_C'),onTERM=()=>void clean('SIGTERM');
 try{
  // Original route behaviour is preserved. Supervisor chooses loopback, ephemeral port and lifetime.
  const url=await mod.listen(app,0);
  control=httpServer((req,res)=>{
   if(req.url!=='/session'||!same(req.headers['x-tw-token'])||!['GET','POST'].includes(req.method)){res.writeHead(403);res.end();return;}
   res.setHeader('content-type','application/json');res.setHeader('cache-control','no-store');
   res.end(JSON.stringify({rootKey:key,code,status:req.method==='POST'?'stopping':'running'}));
   if(req.method==='POST')setImmediate(()=>void clean('AUTHENTICATED_STOP'));
  });
  await new Promise((r,j)=>{control.once('error',j);control.listen(0,'127.0.0.1',r)});
  writeFileSync(file,JSON.stringify({rootKey:key,code,token,appPort:app.address().port,controlPort:control.address().port,pid:process.pid}),{flag:'wx',mode:0o600});owns=true;
  process.once('SIGINT',onINT);process.once('SIGTERM',onTERM);
  life=setTimeout(()=>void clean('LIFETIME_LIMIT'),cfg.serverLifetimeMinutes*60000);
  console.log(`S01 ${code.toUpperCase()} LOOPBACK_URL ${url}`);console.log('Keep this terminal open. Ctrl+C stops only this session. STOP_SERVERS uses the private local control channel.');
  return {ok:true,url};
 }catch(e){await clean('START_FAILURE',2);throw e;}
}
