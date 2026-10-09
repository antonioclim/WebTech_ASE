import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import { assessCourseEnvironment } from '../tools/activity-environment.mjs';
const environment=await assessCourseEnvironment({unit:'C09',operation:'owned equipment confirmation HTTP',cwd:process.cwd(),command:'node DEMONSTRATIONS/03-owned-confirmation.mjs',usesHttp:true,usesHttpTimeout:true,usesHttpCloseAll:true});
console.log(JSON.stringify(environment));if(environment.exitCode)process.exit(environment.exitCode);
// A separate equipment-label fixture: actual requests, no Router, refresh selector or deliveryLane implementation.
let equipment={id:'lamp-4',label:'Stored label'};const trace=[];
const server=http.createServer(async(req,res)=>{trace.push({method:req.method,path:req.url});const send=(status,data)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8'});res.end(JSON.stringify(data));};
 if(req.method==='GET'&&req.url==='/equipment/lamp-4')return send(200,{data:equipment});
 if(req.method==='GET'&&req.url==='/synthetic-malformed'){res.writeHead(200,{'content-type':'application/json'});return res.end('{');}
 if(req.method==='PATCH'&&req.url==='/equipment/lamp-4'){let text='';for await(const chunk of req){text+=chunk;if(text.length>1000)return send(413,{error:{code:'fixture_body_limit'}});}let body;try{body=JSON.parse(text);}catch{return send(400,{error:{code:'invalid_json'}});}if(typeof body.label!=='string'||!body.label.trim())return send(400,{error:{code:'invalid_label'}});equipment={id:'lamp-4',label:body.label.trim().toUpperCase()};return send(200,{data:equipment});}
 return send(404,{error:{code:'equipment_not_found'}});
});let ownedListenerClosed=false;const rows=[];
try{server.listen(0,'127.0.0.1');await once(server,'listening');const base=`http://127.0.0.1:${server.address().port}`;
 async function request(path,options={}){const response=await fetch(base+path,{...options,signal:AbortSignal.timeout(3000)});const text=await response.text();const row={method:options.method??'GET',path,status:response.status,contentType:response.headers.get('content-type'),body:text};rows.push(row);return row;}
 const initial=await request('/equipment/lamp-4');assert.deepEqual(JSON.parse(initial.body),{data:{id:'lamp-4',label:'Stored label'}});
 const draft='  mixed Case  ';const accepted=await request('/equipment/lamp-4',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({label:draft})});assert.equal(accepted.status,200);assert.equal(JSON.parse(accepted.body).data.label,'MIXED CASE');assert.notEqual(JSON.parse(accepted.body).data.label,draft);
 const refused=await request('/equipment/lamp-4',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({label:'   '})});assert.equal(refused.status,400);assert.deepEqual(JSON.parse(refused.body),{error:{code:'invalid_label'}});
 const independent=await request('/equipment/lamp-4');assert.deepEqual(JSON.parse(independent.body),JSON.parse(accepted.body));
 const malformed=await request('/synthetic-malformed');assert.equal(malformed.status,200);assert.throws(()=>JSON.parse(malformed.body),SyntaxError);
 const missing=await request('/equipment/missing');assert.equal(missing.status,404);assert.deepEqual(JSON.parse(missing.body),{error:{code:'equipment_not_found'}});
 assert.equal(trace.length,6);
}finally{server.closeAllConnections();if(server.listening)await new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()));ownedListenerClosed=!server.listening;}
console.log(JSON.stringify({status:'PASS_OWNED_HTTP_CONFIRMATION',scope:'SIX_REAL_NODE_LOOPBACK_HTTP_EXCHANGES',rows,handlerTrace:trace,ownedListenerClosed,durableStorage:false,reactExecuted:false,expressExecuted:false,limit:'The independent GET witnesses this listener’s in-memory confirmed value after a refused write. It does not establish persistence after restart, native UI adoption or the canonical Express stack.'},null,2));
