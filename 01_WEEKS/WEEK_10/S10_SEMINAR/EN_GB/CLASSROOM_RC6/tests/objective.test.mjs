import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
const cases=JSON.parse(readFileSync(new URL("../support/cases.json",import.meta.url)));
import { workshopTransition } from "../student/p01.mjs";
test("P01: classroom contract and input immutability", () => { const c=cases[0]; for(let i=0;i<c.inputs.length;i++){ const input=structuredClone(c.inputs[i]); const before=structuredClone(input); assert.deepEqual(workshopTransition(input),c.expected[i], `${c.project_id} case ${i+1}`); assert.deepEqual(input,before,"inputs remain unchanged");}const start={track:'web',savedIds:['kept'],sort:'title',display:{compact:true}};const first=workshopTransition({state:structuredClone(start),action:{type:'session/toggled',id:'new'}});const second=workshopTransition({state:first,action:{type:'session/toggled',id:'new'}});assert.deepEqual(second,start);const frozen={state:{track:'web',savedIds:Object.freeze(['kept']),sort:'title',display:Object.freeze({compact:true})},action:{type:'session/toggled',id:'new'}};Object.freeze(frozen.state);Object.freeze(frozen.action);Object.freeze(frozen);assert.deepEqual(workshopTransition(frozen),{track:'web',savedIds:['kept','new'],sort:'title',display:{compact:true}});assert.deepEqual(frozen.state,{track:'web',savedIds:['kept'],sort:'title',display:{compact:true}});});
import { notificationRefresh } from "../student/p02.mjs";
test("P02: classroom contract and input immutability", () => { const c=cases[1]; for(let i=0;i<c.inputs.length;i++){ const input=structuredClone(c.inputs[i]); const before=structuredClone(input); assert.deepEqual(notificationRefresh(input),c.expected[i], `${c.project_id} case ${i+1}`); assert.deepEqual(input,before,"inputs remain unchanged"); } });
import { chooseArchitecture } from "../student/p03.mjs";
test("P03: classroom contract and input immutability", () => { const c=cases[2]; for(let i=0;i<c.inputs.length;i++){ const input=structuredClone(c.inputs[i]); const before=structuredClone(input); assert.deepEqual(chooseArchitecture(input),c.expected[i], `${c.project_id} case ${i+1}`); assert.deepEqual(input,before,"inputs remain unchanged"); } });

// Additional contrasts stay inside the existing P01 objective identity above.
