// A separate local preview entry. No server is started merely by importing this file.
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
export function isDirect(argv, url) { return typeof argv === 'string' && resolve(argv) === fileURLToPath(url); }
if (isDirect(process.argv[1], import.meta.url)) {
  if (process.argv.length !== 3 || process.argv[2] !== '--start-local') {
    console.error('Use node server/preview-server.mjs --start-local only in the separately qualified local environment.'); process.exitCode = 2;
  } else {
    const { createServer } = await import('node:http');
    const { createNotesServer } = await import('./app.js');
    const server = createServer(createNotesServer());
    server.on('error', error => { console.error('LOCAL_PREVIEW_START_FAILED: '+error.code); process.exitCode=1; });
    server.listen(3000, '127.0.0.1', () => console.log('P02 local preview: http://127.0.0.1:3000; volatile in-memory data.'));
  }
}
