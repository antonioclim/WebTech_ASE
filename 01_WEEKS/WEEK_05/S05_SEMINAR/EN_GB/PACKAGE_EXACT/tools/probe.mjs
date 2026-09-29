/* Fixed local Task API client. Writes require an explicit CLI flag. No third-party URLs. */
import {resolve} from 'node:path';import {pathToFileURL} from 'node:url';
export function origin(port){if(!/^[1-9]\d*$/.test(String(port))||Number(port)>65535)throw Error('Use the printed numeric local port, not a URL');return 'http://127.0.0.1:'+Number(port);}
function member(path){if(typeof path!=='string'||!path.startsWith('/api/tasks/'))return false;const part=path.slice(11);if(!part||part.length>200||/[/?#\\]/.test(part))return false;try{const d=decodeURIComponent(part);return !!d&&!['.','..'].includes(d)&&!/[\x00-\x20/\\?#]/.test(d);}catch{return false;}}
export function locationPath(value){if(!member(value))throw Error('Returned Location is not a bounded local task-member path');return value;}
export async function request(base,path,{method='GET',body,media='application/json',timeout=5000}={}){
 if(!/^http:\/\/127\.0\.0\.1:[1-9]\d*$/.test(base)||Number(base.split(':').pop())>65535)throw Error('Nonlocal origin refused');
 if(!['/','/health','/api/tasks','/api/unknown'].includes(path)&&!member(path))throw Error('Path outside fixed Task API allowlist');
 if(!['GET','POST','PATCH','DELETE'].includes(method)||body!==undefined&&(typeof body!=='string'||Buffer.byteLength(body)>4096)||!['application/json','text/plain'].includes(media)||!Number.isInteger(timeout)||timeout<1||timeout>5000)throw Error('Invalid bounded request');
 if(method==='GET'&&body!==undefined)throw Error('GET body refused');
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeout);const when=new Date().toISOString();
 try{
  const response=await fetch(base+path,{method,body,headers:body!==undefined?{'content-type':media}:{},redirect:'manual',signal:controller.signal});let bytes=0;const chunks=[];const reader=response.body?.getReader();
  if(reader)while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>65536){controller.abort();throw Error('Response exceeds 64 KiB');}chunks.push(Buffer.from(value));}
  return {evidenceClass:'LOCAL_HTTP',when,origin:base,method,path,requestBody:body??null,requestMedia:body!==undefined?media:null,status:response.status,headers:{location:response.headers.get('location'),'content-type':response.headers.get('content-type')},bodyBytes:bytes,body:Buffer.concat(chunks).toString('utf8'),limitation:'One observed loopback exchange; client cannot authenticate which program owns the port; no browser/reference qualification'};
 }finally{clearTimeout(timer);}
}
export async function scenario(base,name,{allowWrites=false}={}){
 if(!['read','lifecycle','failures','error'].includes(name))throw Error('Choose read, lifecycle, failures or error');
 if(['lifecycle','failures'].includes(name)&&!allowWrites)throw Error('Synthetic writes require --allow-local-writes on a dedicated local Task API');
 const report={scenario:name,node:process.version,origin:base,observations:[],comparisons:[],state:'IN_PROGRESS',createdLocation:null,limitation:'Recorded observations and bounded comparisons; not a complete test suite or publication approval'};
 const run=async(path,options)=>{const r=await request(base,path,options);report.observations.push(r);return r;};const data=r=>JSON.parse(r.body);const compare=(name,pass)=>report.comparisons.push({name,pass:!!pass});
 try{
  if(name==='read'){await run('/');await run('/health');await run('/api/tasks');}
  if(name==='error'){await run('/api/tasks');await run('/health');report.injection='Use only the explicitly injected-list server for this interpretation. Health success does not repair the list.';}
  if(name==='lifecycle'){
   await run('/api/tasks');const c=await run('/api/tasks',{method:'POST',body:'{"title":"  S05 synthetic lifecycle  "}'});
   if(c.status!==201)throw Error('Create did not return 201; no follow-up writes');
   const loc=locationPath(c.headers.location);report.createdLocation=loc;const first=data(c).data;
   if(!first||typeof first.id!=='string'||loc!=='/api/tasks/'+encodeURIComponent(first.id)||first.title!=='S05 synthetic lifecycle'||first.completed!==false)throw Error('Created representation/Location does not match the dedicated synthetic resource; no follow-up writes');
   const g=await run(loc);compare('created task fetched',g.status===200&&JSON.stringify(data(g).data)===JSON.stringify(first));
   const p=await run(loc,{method:'PATCH',body:'{"completed":true}'});const updated=p.status===200?data(p).data:null;compare('PATCH preserves ID/title and changes completed',updated?.id===first.id&&updated?.title===first.title&&updated?.completed===true);
   if(!updated||updated.id!==first.id)throw Error('PATCH did not identify the same resource; stop before DELETE');
   const d=await run(loc,{method:'DELETE'});compare('DELETE has required 204/no representation/no Content-Type',d.status===204&&d.bodyBytes===0&&d.headers['content-type']===null);
   const m=await run(loc);compare('deleted task is missing',m.status===404&&data(m).error?.code==='task_not_found');
  }
  if(name==='failures'){
   const before=await run('/api/tasks');if(before.status!==200||!Array.isArray(data(before).data))throw Error('List unavailable; cannot compare failed-write state');
   const cases=[['text/plain','{"title":"S05 invalid-media probe"}',415,'json_required'],['application/json','[]',400,'validation_failed'],['application/json','{"title":" "}',400,'validation_failed'],['application/json','{"title":"valid","extra":true}',400,'validation_failed'],['application/json','{"title":',400,'invalid_json'],['application/json','null',400,'invalid_json']];
   for(const [media,body,status,code] of cases){const r=await run('/api/tasks',{method:'POST',body,media});let actual;try{actual=data(r).error?.code;}catch{actual=null;}compare('failure '+body+' '+media,r.status===status&&actual===code);if(r.status>=200&&r.status<300)throw Error('Invalid request unexpectedly succeeded; stop and preserve state evidence');}
   const after=await run('/api/tasks');compare('complete list unchanged around failed writes',after.status===200&&JSON.stringify(data(before))===JSON.stringify(data(after)));
   await run('/api/tasks/S05-absent-witness');await run('/api/unknown');await run('/health');
  }
  report.state=report.comparisons.length===0?'OBSERVATIONS_RECORDED_NOT_EVALUATED':report.comparisons.every(x=>x.pass)?'OBSERVED_BOUNDED_CHECKS_SATISFIED':'OBSERVED_DISCREPANCY';
 }catch(e){report.state='STOPPED_INCOMPLETE';report.error=e.message;report.cleanup='No automatic deletion of an uncertain resource. Preserve this trace; inspect the dedicated instance or stop it normally.';}
 return report;
}
export async function main(args){const [port,name,...flags]=args;if(flags.length>1||flags.length===1&&flags[0]!=='--allow-local-writes')throw Error('Unknown flag');const r=await scenario(origin(port),name,{allowWrites:flags.includes('--allow-local-writes')});console.log(JSON.stringify(r,null,2));return ['OBSERVED_BOUNDED_CHECKS_SATISFIED','OBSERVATIONS_RECORDED_NOT_EVALUATED'].includes(r.state)?0:1;}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)main(process.argv.slice(2)).then(c=>{process.exitCode=c;}).catch(e=>{console.error('PROBE_BLOCKED: '+e.message);process.exitCode=2;});
