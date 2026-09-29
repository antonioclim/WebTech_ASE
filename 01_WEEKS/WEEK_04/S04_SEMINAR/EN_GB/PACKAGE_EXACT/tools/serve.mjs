// Derived launch adapter. Canonical server modules are imported, never edited.
import {readFile, readdir} from 'node:fs/promises';
import {resolve,dirname,join}from'node:path';import{fileURLToPath,pathToFileURL}from'node:url';
import{request}from'node:http';import{plans,inspectTree}from'./gate.mjs';
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export async function startServer({project='P01',projectRoot,scenario='normal',delayMs=0,port=0}={}){
 if(!Object.hasOwn(plans,project))throw Error('Use P01, P02 or P03.');
 if(!['normal','missing-tasks','malformed-tasks'].includes(scenario)||(project!=='P01'&&scenario!=='normal'))throw Error('Only P01 supports the controlled task-response scenarios.');
 if(!Number.isInteger(delayMs)||delayMs<0||delayMs>1000||!Number.isInteger(port)||port<0||port>65535)throw Error('Use delay 0–1000 ms and port 0–65535.');
 const root=resolve(projectRoot||join(ROOT,plans[project].path));const check=inspectTree(root,plans[project],'complete');if(!check.ok)throw Error('Protected project files differ: '+check.problems.join('; '));
 const {createStaticServer,listen}=await import(pathToFileURL(join(root,'src/static-server.js')));
 const server=createStaticServer(),handlers=server.listeners('request');server.removeAllListeners('request');
 const allowed=new Set(Object.keys(plans[project].hashes).filter(p=>p.startsWith('public/')&&!p.endsWith('browser-smoke.js')).map(p=>'/'+p.slice(7)));allowed.add('/');
 const helper=new Map(project==='P02'?[['/__s04/task-observer.html',['observers/task-observer.html','text/html']],['/__s04/task-observer.js',['observers/task-observer.js','text/javascript']]]:[]);
 const timers=new Map(),sockets=new Set();let closing=false;
 const answer=(res,status,type,text)=>{res.writeHead(status,{'content-type':type+'; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(text);};
 server.on('connection',s=>{sockets.add(s);s.on('close',()=>sockets.delete(s));});
 server.on('request',(req,res)=>{(async()=>{
  if(!['GET','HEAD'].includes(req.method)){res.setHeader('Allow','GET, HEAD');return answer(res,405,'text/plain','Read-only local teaching server.');}
  const path=new URL(req.url,'http://127.0.0.1').pathname;
  if(helper.has(path)){const[file,type]=helper.get(path);return answer(res,200,type,await readFile(join(ROOT,file)));}
  if(!allowed.has(path))return answer(res,404,'text/plain','Not an allowed teaching resource.');
  if(project==='P01'&&path.startsWith('/data/')&&delayMs){await new Promise(done=>{const t=setTimeout(()=>{timers.delete(t);done();},delayMs);timers.set(t,done);});if(closing)return;}
  if(path==='/data/tasks.json'&&scenario==='missing-tasks')return answer(res,404,'application/json','{"error":"controlled_missing_tasks"}');
  if(path==='/data/tasks.json'&&scenario==='malformed-tasks')return answer(res,200,'application/json','{ controlled malformed JSON');
  res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
  for(const fn of handlers)await fn(req,res);
 })().catch(e=>{if(!res.headersSent)answer(res,500,'text/plain','Local adapter error.');else res.destroy();});});
 let url;try{url=await listen(server,port);}catch(e){server.close();throw e;}
 const close=async()=>{if(closing)return;closing=true;for(const [t,done] of timers){clearTimeout(t);done();}timers.clear();await new Promise(done=>{server.close(done);server.closeAllConnections?.();for(const s of sockets)s.destroy();});};
 return{server,url,close,scenario,project,delayMs};
}
export function probe(url){return new Promise((ok,bad)=>{const req=request(url,{method:'GET',timeout:1500},res=>{let data='';res.setEncoding('utf8');res.on('data',x=>data+=x);res.on('end',()=>res.statusCode===200&&data.includes('<html')?ok():bad(Error('Readiness response did not match the page.')));});req.on('error',bad);req.on('timeout',()=>req.destroy(Error('Readiness timeout')));req.end();});}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 let running;
 try{const[project='P01',...args]=process.argv.slice(2);let scenario='normal',delayMs=0,port=0,allow=false;
  for(let i=0;i<args.length;i++){const k=args[i];if(k==='--allow-runtime-mismatch')allow=true;else if(['--scenario','--delay-ms','--port'].includes(k)){const v=args[++i];if(v===undefined)throw Error('Missing option value');if(k==='--scenario')scenario=v;else if(k==='--delay-ms')delayMs=Number(v);else port=Number(v);}else throw Error('Unknown option: '+k);}
  if(process.version!=='v24.21.0'&&!allow)throw Error('RUNTIME_GUARD_BLOCK: expected Node v24.21.0, observed '+process.version+'. An explicitly permitted compatibility run uses --allow-runtime-mismatch.');
  running=await startServer({project,scenario,delayMs,port});await probe(running.url);
  console.log('READY '+project+' '+running.url+' | scenario='+scenario+' | '+process.version+(process.version==='v24.21.0'?' | Node reference matches; npm separate':' | NONREFERENCE_RUNTIME'));
  if(project==='P02')console.log('OBSERVER '+running.url+'/__s04/task-observer.html');
  console.log('Open the exact URL manually. This does not assert that a browser opened. Keep this terminal open; Ctrl+C stops only this server.');
  let stopping=false;for(const signal of ['SIGINT','SIGTERM'])process.on(signal,async()=>{if(stopping)return;stopping=true;await running.close();console.log('STOPPED '+project);});
 }catch(e){if(running)await running.close();console.error('LAUNCH BLOCKED: '+e.message);process.exitCode=2;}
}
