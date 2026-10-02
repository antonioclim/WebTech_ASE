import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createStaticServer, listen } from '../src/static-server.js';
import { runBrowserDump } from '../../tools/browser-smoke-runner.mjs';

const server=createStaticServer();
const profile=await mkdtemp(join(tmpdir(), 's04-p03_resilient_fetch_optional-'));
try {
  process.env.TW_BROWSER_PROFILE=profile;
  const base=await listen(server);
  const result=await runBrowserDump(`${base}/browser-smoke.html`,{virtualTimeBudget:2000,timeoutMs:8000});
  assert.equal(result.classification,'PASS_BROWSER_DUMP');
  assert.match(result.stdout, /data-browser-smoke="pass"/);
  assert.match(result.stdout, /course-api: available/);
} finally {
  delete process.env.TW_BROWSER_PROFILE;
  server.closeAllConnections?.();
  await new Promise(resolve=>server.close(resolve));
  await rm(profile,{recursive:true,force:true});
}
