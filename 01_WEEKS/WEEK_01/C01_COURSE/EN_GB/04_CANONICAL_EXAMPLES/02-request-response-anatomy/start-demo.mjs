import { startServer } from './server.mjs';
const server = await startServer(0);
const origin = `http://127.0.0.1:${server.address().port}`;
console.log('READY ' + origin);
console.log('Open this actual origin in your browser. Stop this owned terminal with Ctrl+C.');
let stopping = false;
process.on('SIGINT', () => {
  if (stopping) return;
  stopping = true;
  server.close(error => {
    if (error) { console.error(error.message); process.exitCode = 1; }
    else console.log('STOPPED_OWNED_LISTENER');
  });
});
