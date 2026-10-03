// Supplementary S09 local HTTP checks. Authored, not executed in this production phase.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { productionFixture, withApp, htmlHeaders } from '../tests/helpers.js';
import { createApiRouter } from '../server/api-router.js';
import { createBrokenServer } from '../evidence/broken-server.js';
import { clientDirectory } from '../tests/helpers.js';
test('S09 supplemental: served fixed-name asset is byte-identical', async()=>{
 const expected=await readFile('client-dist/assets/app-a1b2c3.js');
 const {app}=productionFixture();
 await withApp(app,async base=>{const r=await fetch(base+'/assets/app-a1b2c3.js');assert.equal(r.status,200);assert.deepEqual(Buffer.from(await r.arrayBuffer()),expected);});
});
test('S09 supplemental: universal variant preserves its supplied API miss control',async()=>{
 const log=[],app=createBrokenServer({clientDirectory,mode:'universal',apiRouter:createApiRouter(log),requestLog:log});
 await withApp(app,async base=>{const r=await fetch(base+'/api/missing',{headers:htmlHeaders});assert.equal(r.status,404);assert.equal((await r.json()).error.code,'api_not_found');});
});
test('S09 supplemental: exact API namespace and non-API prefix differ',async()=>{
 const {app}=productionFixture();
 await withApp(app,async base=>{const a=await fetch(base+'/api',{headers:htmlHeaders});assert.equal(a.status,404);assert.equal((await a.json()).error.code,'api_not_found');
 const b=await fetch(base+'/apiary',{headers:htmlHeaders});assert.equal(b.status,200);assert.match(await b.text(),/Routed notes build/);});
});
