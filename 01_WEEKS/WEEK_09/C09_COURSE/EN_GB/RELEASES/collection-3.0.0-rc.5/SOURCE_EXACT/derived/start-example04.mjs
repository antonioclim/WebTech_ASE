import { isDirectEntry } from './entry-path.mjs';
// This launcher is a separate instructor wrapper. It does not edit the canonical factory.
if (isDirectEntry(import.meta.url, process.argv[1])) {
  if (process.argv[2] !== '--start-local' || process.argv.length !== 3) {
    console.error('No server started. Later authorised use: node derived/start-example04.mjs --start-local');
    process.exitCode = 2;
  } else {
    const { createApp } = await import('../canonical/04-http-adapter-contract/server.js');
    const server = createApp().listen(3001, '127.0.0.1', () => {
      console.log('Example 04 requested listener: http://127.0.0.1:3001. This is not an acceptance result.');
    });
    server.on('error', () => { console.error('Local listener failed; inspect the environment separately.'); process.exitCode = 1; });
  }
}
