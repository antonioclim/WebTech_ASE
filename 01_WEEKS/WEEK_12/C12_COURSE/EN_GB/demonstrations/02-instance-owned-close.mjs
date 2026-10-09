import assert from 'node:assert/strict';
import {assessCourseEnvironment} from '../tools/activity-environment.mjs';
const environment=await assessCourseEnvironment({operation:'example02',cwd:process.cwd(),command:'node demonstrations/02-instance-owned-close.mjs'});
if(environment.exitCode)process.exit(environment.exitCode);
// Fixed opaque slot: this is not a generic composite recipient encoder.
const registry=new Map();
const oldDisplay={label:'old display'},newDisplay={label:'new display'};
registry.set('display-slot',oldDisplay);
registry.set('display-slot',newDisplay);
if(registry.get('display-slot')===oldDisplay)registry.delete('display-slot');
assert.equal(registry.get('display-slot'),newDisplay);
const afterOldClose=registry.get('display-slot').label;
if(registry.get('display-slot')===newDisplay)registry.delete('display-slot');
assert.equal(registry.size,0);
console.log(JSON.stringify({evidenceClass:'OWNED_OBJECT_MAP_OPERATION',afterOldClose,afterCurrentClose:registry.size,limits:['fixed opaque slot, no recipientKey algorithm','object-instance ownership, no socket close event','no authentication, targeted delivery or distributed registry']},null,2));
