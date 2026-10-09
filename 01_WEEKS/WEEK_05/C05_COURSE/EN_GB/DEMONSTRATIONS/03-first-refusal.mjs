// Reuses the preserved title-only course derivation, not S05 taskBody.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),model=require('../assets/demos.js');
const cases=[
  ['valid','application/json','{"title":"  Read a note  "}','normalisation'],
  ['malformed','application/json','{"title":','syntax'],
  ['null','application/json','null','strict-parser-policy'],
  ['array','application/json','[]','application-shape'],
  ['extra','application/json','{"title":"Read","admin":true}','fields'],
  ['number','application/json','{"title":42}','title'],
  ['blank','application/json','{"title":"  "}','title'],
  ['media','text/plain','{"title":"Read"}','media']
];
const observations=cases.map(([id,media,raw,stage])=>{const result=model.bodyModel(media,raw);assert.equal(result.stage,stage);return {id,media,raw,result};});
assert.deepEqual(observations[0].result.normalised,{title:'Read a note'});
console.log(JSON.stringify({scope:'NODE_TITLE_ONLY_DECLARED_TEACHING_MODEL_NOT_EXPRESS_PARSER',observations,limit:'This model checks media first. Canonical04 registers express.json before the route media check. It omits S05 completed/plain-prototype/full-own-key contract.'},null,2));
