import assert from 'node:assert/strict';
import http from 'node:http';
import {once} from 'node:events';
import {assessCourseEnvironment} from '../tools/activity-environment.mjs';
const environment=await assessCourseEnvironment({unit:'C09',operation:'literal library delivery HTTP',cwd:process.cwd(),command:'node DEMONSTRATIONS/04-delivery-frontier.mjs',usesHttp:true,usesHttpTimeout:true,usesHttpCloseAll:true});console.log(JSON.stringify(environment));if(environment.exitCode)process.exit(environment.exitCode);
// Literal fixture handlers teach transmitted representation. This is no general fallback or assessed lane algorithm.
const document='<!doctype html><title>Library fixture</title><p id="marker">Library document</p>';
const script='globalThis.libraryFixtureLoaded = true;';const trace=[];
const server=http.createServer((req,res)=>{trace.push({method:req.method,path:req.url});const send=(status,type,body)=>{res.writeHead(status,{'content-type':type,'content-length':Buffer.byteLength(body)});res.end(req.method==='HEAD'?undefined:body);};
 if(req.url==='/books/b-7'&&(req.method==='GET'||req.method==='HEAD'))return send(200,'text/html; charset=utf-8',document);
 if(req.url==='/books/b-7')return send(405,'application/json','{"error":"method_not_allowed"}');
 if(req.url==='/static/library.js'&&req.method==='GET')return send(200,'text/javascript; charset=utf-8',script);
 if(req.url==='/service/health'&&req.method==='GET')return send(200,'application/json','{"status":"ok"}');
 return send(404,'application/json','{"error":"fixture_not_found"}');
});const rows=[];let ownedListenerClosed=false;
try{server.listen(0,'127.0.0.1');await once(server,'listening');const base=`http://127.0.0.1:${server.address().port}`;
 for(const [method,path,accept]of[['GET','/books/b-7','text/html'],['HEAD','/books/b-7','text/html'],['GET','/static/library.js','*/*'],['GET','/static/missing.js','text/html'],['GET','/service/health','text/html'],['GET','/service/missing','text/html'],['POST','/books/b-7','text/html']]){const response=await fetch(base+path,{method,headers:{accept},signal:AbortSignal.timeout(3000)}),body=await response.text();rows.push({method,path,accept,status:response.status,contentType:response.headers.get('content-type'),contentLength:response.headers.get('content-length'),body,bodyBytes:Buffer.byteLength(body)});}
 assert.equal(rows[0].body,document);assert.equal(rows[1].status,200);assert.equal(rows[1].contentType,rows[0].contentType);assert.equal(rows[1].contentLength,rows[0].contentLength);assert.equal(rows[1].bodyBytes,0);
 assert.equal(rows[2].body,script);assert.match(rows[2].contentType,/text\/javascript/);assert.equal(rows[3].status,404);assert.equal(rows[3].body,'{"error":"fixture_not_found"}');assert.equal(rows[4].status,200);assert.equal(rows[5].status,404);assert.equal(rows[6].status,405);assert.equal(trace.length,7);assert.doesNotMatch(document,/<script\b/i);
}finally{server.closeAllConnections();if(server.listening)await new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()));ownedListenerClosed=!server.listening;}
console.log(JSON.stringify({status:'PASS_LITERAL_DELIVERY_HTTP',scope:'SEVEN_REAL_NODE_HTTP_FIXTURE_EXCHANGES',rows,handlerTrace:trace,ownedListenerClosed,documentHasScriptElement:false,scriptFetchDoesNotProveExecution:true,nativeBootExecuted:false,expressNegotiationExecuted:false,limit:'The fixture sends exact document/script/API bytes and an empty HEAD body. Separate script retrieval does not execute it; the scriptless marker cannot establish React boot, native history or production fallback correctness.'},null,2));
