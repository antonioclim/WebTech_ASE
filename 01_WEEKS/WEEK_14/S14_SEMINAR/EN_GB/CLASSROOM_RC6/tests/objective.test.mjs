import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
const cases=JSON.parse(readFileSync(new URL("../support/cases.json",import.meta.url)));
import * as adapter from "../support/checklist-app.mjs";
import { persistenceWitness } from "../student/p01.mjs";
test("P01: classroom contract and input immutability", () => { const c=cases[0]; for(let i=0;i<c.inputs.length;i++){ const input=structuredClone(c.inputs[i]); const before=structuredClone(input); assert.deepEqual(persistenceWitness(input,adapter),c.expected[i], `${c.project_id} case ${i+1}`); assert.deepEqual(input,before,"inputs remain unchanged"); } });
import { evidenceGate } from "../student/p03.mjs";
test("P03: classroom contract and input immutability", () => { const c=cases[1]; for(let i=0;i<c.inputs.length;i++){ const input=structuredClone(c.inputs[i]); const before=structuredClone(input); assert.deepEqual(evidenceGate(input),c.expected[i], `${c.project_id} case ${i+1}`); assert.deepEqual(input,before,"inputs remain unchanged"); } });
