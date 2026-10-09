import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
const cases=JSON.parse(readFileSync(new URL("../support/cases.json",import.meta.url)));
const additional={
 P01:[
  [{path:'/notes/new/edit'},{kind:'edit',id:'new'}],
  [{path:'/notes/NEW'},{kind:'read',id:'NEW'}],
  [{path:'/notes/Az09_-z'},{kind:'read',id:'Az09_-z'}],
  [{path:'/notes/other-2/edit'},{kind:'edit',id:'other-2'}],
  ...['/notes/topic.7','/notes/café','/notes/a b','/notes/n1/','/notes/n1?filter=x','/notes/n1#view','/notes/a%2Fb','/notes/n1/edit/extra','/notes//edit','/notes/n1/EDIT','/x/notes/n1','/notes/n1\n'].map(path=>[{path},{kind:'unknown',id:null}])
 ],
 P02:[
  [{currentId:'r2',replyId:'r2',items:[{id:'old'}],received:[]},[]],
  [{currentId:'r2',replyId:'r1',items:[],received:[{id:'deleted'}]},[]],
  [{currentId:'r2',replyId:'r1',items:[{id:'kept',title:'OLD'}],received:[{id:'tempting',title:'NEW'},{id:'more'}]},[{id:'kept',title:'OLD'}]],
  [{currentId:'r2',replyId:'r2',items:[{id:'x',title:'OLD'},{id:'removed'}],received:[{id:'x',title:'CONFIRMED'}]},[{id:'x',title:'CONFIRMED'}]],
  [{currentId:'R2',replyId:'r2',items:[1],received:[2]},[1]],
  [{currentId:'own-x',replyId:'own-x',items:[],received:[0,false,{id:'z'}]},[0,false,{id:'z'}]]
 ],
 P03:[
  [{path:'/api',method:'POST',accept:[],exists:true},'api'],
  [{path:'/api/changed',method:'GET',accept:['text/html'],exists:true},'api'],
  [{path:'/apiary',method:'GET',accept:['text/html'],exists:false},'spa'],
  [{path:'/assets',method:'HEAD',accept:['text/html'],exists:false},'404'],
  [{path:'/assets/no-extension',method:'GET',accept:['text/html'],exists:false},'404'],
  [{path:'/assets-old',method:'GET',accept:['text/html'],exists:false},'spa'],
  [{path:'/assets/app.js',method:'POST',accept:[],exists:true},'file'],
  [{path:'/other-file',method:'GET',accept:[],exists:true},'file'],
  [{path:'/notes/changed',method:'HEAD',accept:['text/html'],exists:false},'spa'],
  [{path:'/notes/changed',method:'HEAD',accept:['application/json'],exists:false},'404'],
  ...['*/*','Text/Html','text/html;q=0.9'].map(token=>[{path:'/notes/changed',method:'GET',accept:[token],exists:false},'404']),
  [{path:'/notes/changed',method:'PUT',accept:['text/html'],exists:false},'404'],
  [{path:'/notes/changed',method:'GET',accept:['application/json','text/html'],exists:false},'spa']
 ]
};
function additionalCases(project,implementation){for(const [fixture,expected] of additional[project]){const input=structuredClone(fixture),before=structuredClone(input);assert.deepEqual(implementation(input),expected,project+' clarified finite case '+JSON.stringify(fixture));assert.deepEqual(input,before,'inputs remain unchanged');}}
import { noteRoute } from "../student/p01.mjs";
test("P01: classroom contract and input immutability", () => { const c=cases[0]; for(let i=0;i<c.inputs.length;i++){ const input=structuredClone(c.inputs[i]); const before=structuredClone(input); assert.deepEqual(noteRoute(input),c.expected[i], `${c.project_id} case ${i+1}`); assert.deepEqual(input,before,"inputs remain unchanged"); } additionalCases("P01",noteRoute); });
import { applyRefresh } from "../student/p02.mjs";
test("P02: classroom contract and input immutability", () => { const c=cases[1]; for(let i=0;i<c.inputs.length;i++){ const input=structuredClone(c.inputs[i]); const before=structuredClone(input); assert.deepEqual(applyRefresh(input),c.expected[i], `${c.project_id} case ${i+1}`); assert.deepEqual(input,before,"inputs remain unchanged"); } additionalCases("P02",applyRefresh); const initial={currentId:'r2',replyId:'r2',items:[{id:'deleted'}],received:[]},firstBefore=structuredClone(initial);const empty=applyRefresh(initial);assert.deepEqual(empty,[],'current empty snapshot removes old contents');assert.deepEqual(initial,firstBefore,'inputs remain unchanged');const late={currentId:'r2',replyId:'r1',items:empty,received:[{id:'deleted'}]},lateBefore=structuredClone(late);assert.deepEqual(applyRefresh(late),[],'stale response cannot resurrect contents removed by matching empty snapshot');assert.deepEqual(late,lateBefore,'inputs remain unchanged'); });
import { deliveryLane } from "../student/p03.mjs";
test("P03: classroom contract and input immutability", () => { const c=cases[2]; for(let i=0;i<c.inputs.length;i++){ const input=structuredClone(c.inputs[i]); const before=structuredClone(input); assert.deepEqual(deliveryLane(input),c.expected[i], `${c.project_id} case ${i+1}`); assert.deepEqual(input,before,"inputs remain unchanged"); } additionalCases("P03",deliveryLane); });
