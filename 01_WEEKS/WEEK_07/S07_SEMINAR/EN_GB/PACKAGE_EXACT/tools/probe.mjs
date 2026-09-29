/** Fixed local booking probes. No external origin, redirect following or inferred database state. */
import {request as httpRequest} from 'node:http';
import {resolve} from 'node:path';import {fileURLToPath} from 'node:url';
export function origin(value){
 if(typeof value!=='string'||!/^http:\/\/127\.0\.0\.1:([1-9][0-9]{0,4})$/.test(value))throw Error('Use an exact http://127.0.0.1:PORT origin');
 const u=new URL(value);if(!u.port||Number(u.port)>65535)throw Error('Invalid port');return u;
}
export async function request(base,method,path,body,{allowLocalWrite=false,timeout=5000,maxBytes=65536,raw=false}={}){
 const u=origin(base);if(!['GET','POST'].includes(method)||!['/health','/api/events/1/bookings','/api/events/99/bookings'].includes(path))throw Error('Unapproved method/path');
 if(method==='GET'&&path!=='/health')throw Error('No supplied booking-member GET route');
 if(method==='POST'&&!allowLocalWrite)throw Error('Explicit --allow-local-write required');
 if(!Number.isInteger(timeout)||timeout<1||timeout>10000||!Number.isInteger(maxBytes)||maxBytes<1||maxBytes>65536)throw Error('Invalid bounds');
 const text=body===undefined?undefined:raw?String(body):JSON.stringify(body);if(text!==undefined&&Buffer.byteLength(text)>4096)throw Error('Request too large');
 return new Promise((ok,bad)=>{
  let done=false,total=0;const chunks=[];let timer;
  const finish=(error,result)=>{if(done)return;done=true;clearTimeout(timer);error?bad(error):ok(result);};
  const req=httpRequest({hostname:'127.0.0.1',port:Number(u.port),method,path,headers:text===undefined?{}:{'content-type':'application/json','content-length':Buffer.byteLength(text)}},res=>{
   res.on('data',chunk=>{total+=chunk.length;if(total>maxBytes){const e=Error('RESPONSE_SIZE_LIMIT');finish(e);res.destroy();req.destroy();return;}chunks.push(chunk);});
   res.on('end',()=>finish(null,{method,path,requestBody:text??null,status:res.statusCode,headers:{'content-type':res.headers['content-type']??null,location:res.headers.location??null},body:Buffer.concat(chunks).toString('utf8'),bodyBytes:total,evidenceClass:'LOCAL_HTTP_OBSERVATION_NOT_SERVER_AUTHENTICATION'}));
   res.on('error',e=>finish(e));res.on('aborted',()=>finish(Error('RESPONSE_ABORTED')));
  });req.on('error',e=>finish(e));timer=setTimeout(()=>{finish(Error('REQUEST_TIMEOUT'));req.destroy();},timeout);if(text!==undefined)req.write(text);req.end();
 });
}
export async function series(base,mode,{allowLocalWrite=false,...opts}={}){
 origin(base);if(!['health','create-repeat','failure-recovery'].includes(mode))throw Error('Unknown probe');if(mode!=='health'&&!allowLocalWrite)throw Error('Explicit --allow-local-write required');
 const r={mode,observations:[],checks:[],referenceAcceptance:false,limitation:'A response does not prove internal row state, rollback or the identity of the server code. Use the separate genuine-stack observer. Location is recorded, not followed.'};
 const call=async(method,path,body,raw=false)=>{const o=await request(base,method,path,body,{...opts,allowLocalWrite,raw});r.observations.push(o);return o;};
 const check=(name,pass)=>r.checks.push({name,pass:!!pass});
 try{
  if(mode==='health')await call('GET','/health');
  if(mode==='create-repeat'){
   const made=await call('POST','/api/events/1/bookings',{attendeeId:21,seats:2});check('fresh booking returns 201',made.status===201);if(made.status!==201)throw Error('Creation did not meet prerequisite; evidence retained');
   let data;try{data=JSON.parse(made.body).data;}catch{throw Error('Unexpected JSON shape');}
   check('creation response contains booking/event',data?.booking?.seats===2&&data?.event?.availableSeats===3);check('Location matches returned positive integer ID',Number.isSafeInteger(data?.booking?.id)&&data.booking.id>0&&made.headers.location==='/api/bookings/'+data.booking.id);
   if(!r.checks.every(c=>c.pass))throw Error('Creation contract mismatch; no further write');
   const repeated=await call('POST','/api/events/1/bookings',{attendeeId:21,seats:2});let e;try{e=JSON.parse(repeated.body).error;}catch{}
   check('repeated booking reports conflict',repeated.status===409&&e?.code==='booking_exists');
  }
  if(mode==='failure-recovery'){
   const malformed=await call('POST','/api/events/1/bookings','{',true);check('parser rejection',malformed.status===400&&JSON.parse(malformed.body)?.error?.code==='invalid_json');
   const invalid=await call('POST','/api/events/1/bookings',{attendeeId:21,seats:0});check('invalid seats',invalid.status===400&&JSON.parse(invalid.body)?.error?.code==='booking_invalid');
   const health=await call('GET','/health');check('subsequent health',health.status===200&&JSON.parse(health.body)?.status==='ok');
  }
 }catch(e){r.error=e.message;}
 r.ok=!r.error&&r.checks.every(c=>c.pass);r.status=r.error||r.checks.some(c=>!c.pass)?'FAIL_WITH_PARTIAL_EVIDENCE':r.checks.length?'PASS_SPECIFIED_HTTP_COMPARISONS':'OBSERVATIONS_ONLY_NOT_EVALUATED';return r;
}
async function main(args){const [base,mode,...flags]=args;if(flags.some(x=>x!=='--allow-local-write')||flags.length>1)throw Error('Unknown or repeated flag');const r=await series(base,mode,{allowLocalWrite:flags.includes('--allow-local-write')});console.log(JSON.stringify(r,null,2));return r.ok?0:1;}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main(process.argv.slice(2)).then(c=>process.exitCode=c).catch(e=>{console.error('PROBE_FAILED: '+e.message);process.exitCode=2;});
