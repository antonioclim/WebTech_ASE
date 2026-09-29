/* Derived assertion-first response model, not Express or HTTP execution. */
import assert from 'node:assert/strict';import test from 'node:test';import {pathToFileURL} from 'node:url';import {resolve} from 'node:path';
const source=process.env.S05_TARGET||new URL('../optional/p03/src/http-contract.js',import.meta.url).href;
const {sendServiceOutcome,apiErrorHandler}=await import(source.startsWith('file:')?source:pathToFileURL(resolve(source)).href);
const fake=()=>({statusCode:200,headersSent:false,body:null,headers:{},status(n){this.statusCode=n;return this;},location(v){this.headers.location=v;return this;},json(v){this.body=v;return this;}});
test('teaching P03 list exposes a data array envelope',()=>{const r=fake();sendServiceOutcome(r,Object.freeze({kind:'listed',meetings:[]}));assert.ok(r.body&&Array.isArray(r.body.data),'data envelope must exist before dereferencing it');});
test('teaching P03 unexpected errors use a bounded public response',()=>{const r=fake();apiErrorHandler(new Error('private test detail'),{},r,()=>assert.fail('unexpected delegation'));assert.equal(r.statusCode,500);assert.equal(r.body?.error?.code,'internal_error');assert.doesNotMatch(JSON.stringify(r.body),/private test detail/);});
