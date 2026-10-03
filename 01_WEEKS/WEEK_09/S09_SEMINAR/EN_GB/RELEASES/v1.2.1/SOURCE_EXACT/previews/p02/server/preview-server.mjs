// S09 v1.2.0 UNASSESSED source-only preview launcher. No import-time server start.
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
export function isDirect(argv,url) { return typeof argv==='string' && resolve(argv)===fileURLToPath(url); }
if(isDirect(process.argv[1],import.meta.url)) {
  if(process.argv.length!==3 || process.argv[2]!=='--start-local') {
    console.error('Use node server/preview-server.mjs --start-local only after separate runtime qualification. No installation is performed.');
    process.exitCode=2;
  } else {
    const {createServer}=await import('node:http');
    const {createNotesServer}=await import('./app.js');
    const server=createServer(createNotesServer());
    server.on('error',error=>{console.error('LOCAL_PREVIEW_START_FAILED: '+error.code);process.exitCode=1;});
    server.listen(3000,'127.0.0.1',()=>console.log('UNASSESSED P02 preview: http://127.0.0.1:3000; volatile data. Ctrl+C stops this process.'));
    process.once('SIGINT',()=>server.close());process.once('SIGTERM',()=>server.close());
  }
}
