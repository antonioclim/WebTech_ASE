/** Future local observation only; no remote URL argument is accepted.
 * No server starts without --run-local. No files are modified or rebuilt.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const args=process.argv.slice(2);
if(args.length!==2||args[0]!=='--run-local'||!['static-only','universal','student'].includes(args[1])){
 console.error('Usage after separate environment qualification: node tools/observe-p03.mjs --run-local static-only|universal|student');process.exitCode=2;
}else{
 const mode=args[1],root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../portfolio/p03/student');
 const {createServer}=await import('node:http');
 const {createApiRouter}=await import(path.join(root,'server/api-router.js'));
 const {createProductionApp}=await import(path.join(root,'server/create-production-app.js'));
 const {createBrokenServer}=await import(path.join(root,'evidence/broken-server.js'));
 const requestLog=[],options={clientDirectory:path.join(root,'client-dist'),apiRouter:createApiRouter(requestLog),requestLog};
 const app=mode==='student'?createProductionApp(options):createBrokenServer({...options,mode});
 const server=createServer(app),results=[];
 const hash=b=>createHash('sha256').update(b).digest('hex');
 const indexHash=hash(await readFile(path.join(root,'client-dist/index.html')));
 const assetHash=hash(await readFile(path.join(root,'client-dist/assets/app-a1b2c3.js')));
 try{
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  const base='http://127.0.0.1:'+server.address().port;
  for(const [method,p,accept]of [['GET','/','text/html'],['GET','/notes/42','text/html'],['HEAD','/notes/42','text/html'],['GET','/api/status','application/json'],['GET','/api/missing','text/html'],['GET','/api','text/html'],['GET','/assets/app-a1b2c3.js','*/*'],['GET','/icon.svg','*/*'],['GET','/assets/missing.js','text/html'],['POST','/notes/42','text/html'],['GET','/notes/42','application/json'],['GET','/apiary','text/html'],['GET','/notes/recovered','text/html']]){
   const start=requestLog.length;
   const r=await fetch(base+p,{method,headers:{accept},redirect:'error',signal:AbortSignal.timeout(5000)}),body=Buffer.from(await r.arrayBuffer());
   const h=hash(body);results.push({method,path:p,accept,status:r.status,contentType:r.headers.get('content-type'),cacheControl:r.headers.get('cache-control'),bytes:body.length,sha256:h,isIndexBytes:h===indexHash,isAssetBytes:h===assetHash,trace:requestLog.slice(start)});
  }
  console.log(JSON.stringify({class:'HTTP_LOOPBACK',mode,node:process.version,sourceFileSha256:hash(await readFile(path.join(root,mode==='student'?'server/create-production-app.js':'evidence/broken-server.js'))),results,limit:'Actual local HTTP only if this command was really executed. This does not run a browser or certify a repaired app.'},null,2));
 }finally{
  server.closeIdleConnections?.();
  if(server.listening)await new Promise(resolve=>server.close(resolve));
 }
}
