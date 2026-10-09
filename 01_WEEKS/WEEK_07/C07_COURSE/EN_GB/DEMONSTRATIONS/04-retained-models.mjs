// Execute preserved models, explicitly separate from the new SQLite witnesses.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),d=require('../assets/demos.js');
const ids=['lazy-count','eager-count','fanout','await-sequence','staged-failure','commit-wait','commit-reject','put-repeat','delete-repeat','cursor-id','cursor-tuple','cursor-tie','race-schedule'];
const observations=[];for(const id of ids)observations.push(await d.run(id));
const find=id=>observations.find(row=>row.scenario===id).result;
assert.deepEqual(find('await-sequence').after,{credits:4,records:1,receipts:0});assert.deepEqual(find('staged-failure').after,{credits:6,records:0,receipts:0});
assert.equal(find('commit-wait').beforeRelease.outerSettled,false);assert.equal(find('commit-wait').outerSettled,true);assert.equal(find('commit-reject').outcome.error,'MODEL_COMMIT_REJECTED');
assert.deepEqual(find('cursor-id').nextIds,[]);assert.deepEqual(find('cursor-tuple').nextIds,[1]);assert.deepEqual(find('put-repeat').statuses,[201,200]);assert.equal(find('race-schedule').invariantMet,false);
console.log(JSON.stringify({scope:'ACTUAL_NODE_EXECUTION_OF_PRESERVED_DECLARED_MODELS',observations,limit:'No SQL logger, actual rollback, ORM commit, HTTP or concurrent requests are executed by these models. Current canonical04 already has a composite context-bound cursor.'},null,2));
