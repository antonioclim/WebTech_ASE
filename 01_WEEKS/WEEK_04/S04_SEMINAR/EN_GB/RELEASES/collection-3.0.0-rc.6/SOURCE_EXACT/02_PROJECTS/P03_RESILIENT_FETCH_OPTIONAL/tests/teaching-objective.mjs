import assert from 'node:assert/strict';
import test from 'node:test';
import {fetchWithPolicy} from '../public/fetch-policy.js';
const response=(status,value={ok:true})=>({ok:status>=200&&status<300,status,json:async()=>value});
test('teaching route retries one retryable failure',async()=>{let calls=0,result,error;try{result=await fetchWithPolicy('/x',{fetchImpl:async()=>{calls++;if(calls===1)throw Error('offline');return response(200,{ok:true})},retries:1,sleep:async()=>{},setTimer:()=>1,clearTimer:()=>{}})}catch(e){error=e}assert.equal(error,undefined);assert.deepEqual(result,{ok:true});assert.equal(calls,2);});
test('teaching route uses a fresh controller for each attempt',async()=>{let calls=0,controllers=0,error;try{await fetchWithPolicy('/x',{fetchImpl:async()=>{calls++;if(calls===1)return response(503);return response(200,{ok:true})},retries:1,sleep:async()=>{},createController:()=>{controllers++;return new AbortController()},setTimer:()=>1,clearTimer:()=>{}})}catch(e){error=e}assert.equal(error,undefined);assert.equal(controllers,2);});
test('teaching route preserves exhaustion context',async()=>{await assert.rejects(()=>fetchWithPolicy('/x',{fetchImpl:async()=>{throw Error('offline')},retries:1,sleep:async()=>{},setTimer:()=>1,clearTimer:()=>{}}),e=>e.message==='request failed after 2 attempts: offline'&&e.cause?.message==='offline');});
