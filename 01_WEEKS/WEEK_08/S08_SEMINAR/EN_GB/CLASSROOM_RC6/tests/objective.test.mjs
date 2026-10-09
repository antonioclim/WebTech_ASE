import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
const cases=JSON.parse(readFileSync(new URL("../support/cases.json",import.meta.url)));
import { queueAdd } from "../student/p01.mjs";
test("P01: classroom contract and input immutability", () => {
  const c=cases[0];
  for(let i=0;i<c.inputs.length;i++){
    const input=structuredClone(c.inputs[i]); const before=structuredClone(input);
    const output=queueAdd(input);
    assert.deepEqual(output,c.expected[i], `${c.project_id} case ${i+1}`);
    assert.deepEqual(input,before,"inputs remain unchanged");
    if(input.title.trim()) assert.notStrictEqual(output,input.items,"valid addition returns a new array");
  }
  const existing=Object.freeze({id:"kept",title:"Previous",read:true});
  const input=Object.freeze({items:Object.freeze([existing]),title:"\tNext title\n",id:"supplied-opaque"});
  const output=queueAdd(input);
  assert.deepEqual(output,[{id:"kept",title:"Previous",read:true},{id:"supplied-opaque",title:"Next title",read:false}]);
  assert.notStrictEqual(output,input.items,"non-empty valid addition returns a new array");
  assert.deepEqual(input,{items:[{id:"kept",title:"Previous",read:true}],title:"\tNext title\n",id:"supplied-opaque"});
  const blank={items:[{id:"kept",title:"Previous",read:true}],title:"\t \n",id:"unused"};
  const before=structuredClone(blank);
  assert.deepEqual(queueAdd(blank),blank.items,"blank preserves collection content without an identity requirement");
  assert.deepEqual(blank,before);
});
import { capacityView } from "../student/p02.mjs";
test("P02: classroom contract and input immutability", () => {
  const c=cases[1]; for(let i=0;i<c.inputs.length;i++){ const input=structuredClone(c.inputs[i]); const before=structuredClone(input); assert.deepEqual(capacityView(input),c.expected[i], `${c.project_id} case ${i+1}`); assert.deepEqual(input,before,"inputs remain unchanged"); }
  const boundaries=[
    [{capacity:0,attendees:[]},{used:0,remaining:0,full:true}],
    [{capacity:-1,attendees:[]},{error:"invalid_capacity"}],
    [{capacity:2.5,attendees:["a"]},{error:"invalid_capacity"}],
    [{capacity:"3",attendees:["a"]},{error:"invalid_capacity"}],
    [{capacity:2,attendees:["same","same"]},{used:2,remaining:0,full:true}],
    [{capacity:3,attendees:["a","b","c","d"]},{error:"invalid_capacity"}]
  ];
  for(const [input,expected] of boundaries){const before=structuredClone(input);assert.deepEqual(capacityView(input),expected,"capacity boundary");assert.deepEqual(input,before);}
});
import { mayPublish } from "../student/p03.mjs";
test("P03: classroom contract and input immutability", () => {
  const c=cases[2]; for(let i=0;i<c.inputs.length;i++){ const input=structuredClone(c.inputs[i]); const before=structuredClone(input); assert.deepEqual(mayPublish(input),c.expected[i], `${c.project_id} case ${i+1}`); assert.deepEqual(input,before,"inputs remain unchanged"); }
  const decisions=[
    [{active:true,currentId:"owner-Z",requestId:"owner-Z"},true],
    [{active:true,currentId:"owner-A",requestId:"owner-Z"},false],
    [{active:false,currentId:"owner-Z",requestId:"owner-Z"},false],
    [{active:false,currentId:"owner-A",requestId:"owner-Z"},false],
    [{active:true,currentId:"owner-Z",requestId:"owner-Z",aborted:true},true]
  ];
  for(const [input,expected] of decisions){const before=structuredClone(input);const output=mayPublish(input);assert.equal(typeof output,"boolean","decision is a Boolean, not a truthy value");assert.strictEqual(output,expected,"publication ownership");assert.deepEqual(input,before);}
});
