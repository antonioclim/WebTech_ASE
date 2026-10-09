import assert from 'node:assert/strict';
import {assessCourseEnvironment} from '../tools/activity-environment.mjs';
const environment=await assessCourseEnvironment({operation:'example01',cwd:process.cwd(),command:'node demonstrations/01-observation-timeline.mjs'});
if(environment.exitCode)process.exit(environment.exitCode);
// Stipulated bulletin arithmetic. No wall clock, HTTP request or push stack.
const bulletinChangedAt=11;
const observations=[0,5,10,15,20];
const firstSeeingChange=observations.find(at=>at>=bulletinChangedAt);
assert.equal(firstSeeingChange,15);
assert.equal(firstSeeingChange-bulletinChangedAt,4);
assert.equal(observations.filter(at=>at<=firstSeeingChange).length,4);
console.log(JSON.stringify({evidenceClass:'FINITE_ARITHMETIC_MODEL',domain:'weather bulletin',bulletinChangedAt,observations,firstSeeingChange,observationDelay:4,requestsThroughObservation:4,limits:['stipulated schedule, no network latency','no SSE or WebSocket execution','changing interval changes ideal request count and delay']},null,2));
