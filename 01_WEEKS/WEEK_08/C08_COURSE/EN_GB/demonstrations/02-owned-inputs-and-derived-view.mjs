import assert from 'node:assert/strict';
// Sound-mixer model: change one record, derive a filtered view and reserve an event ID.
// This is not any S08 assessed implementation and does not mount React.
const channels = Object.freeze([Object.freeze({id:'voice',muted:false}),Object.freeze({id:'music',muted:true})]);
const next = channels.map(channel => channel.id === 'voice' ? {...channel,muted:!channel.muted} : channel);
const audible = next.filter(channel => !channel.muted);
assert.notStrictEqual(next, channels);
assert.notStrictEqual(next[0], channels[0]);
assert.strictEqual(next[1], channels[1]);
assert.deepEqual(channels.map(channel => channel.muted),[false,true]);
assert.deepEqual(audible, []);
let idCalls = 0;
const allocate = () => `gesture-${++idCalls}`;
const reservedId = allocate();
const describeGesture = gain => ({id:reservedId,gain:gain+1});
const first = describeGesture(4);
const repeated = describeGesture(4);
assert.deepEqual(first,repeated);
assert.equal(idCalls,1);
console.log(JSON.stringify({scope:'FINITE_JS_VALUES_NOT_REACT_RECONCILIATION',before:channels,next,audibleIds:audible.map(channel=>channel.id),newArray:next!==channels,changedRecordReplaced:next[0]!==channels[0],unchangedRecordRetained:next[1]===channels[1],idCalls,repeatedGestureMatches:JSON.stringify(first)===JSON.stringify(repeated)}));
