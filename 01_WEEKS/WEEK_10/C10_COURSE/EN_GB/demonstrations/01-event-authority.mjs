import assert from 'node:assert/strict';
// Audio fader: one numeric setting event, not the assessed workshop API.
const previous=Object.freeze({volume:2,channel:'left',caption:'Music'});
const event=Object.freeze({type:'volume/set',value:5});
function applyVolume(state,intent){if(intent.type!=='volume/set')throw new Error('unknown fader event');return {...state,volume:intent.value};}
const next=applyVolume(previous,event);
assert.deepEqual(next,{volume:5,channel:'left',caption:'Music'});
assert.deepEqual(previous,{volume:2,channel:'left',caption:'Music'});
assert.throws(()=>applyVolume(previous,{type:'caption/set'}),/unknown fader event/);
console.log(JSON.stringify({scope:'PURE_JS_FADER_MODEL_NO_REACT',event,previous,next,changed:['volume'],preserved:['channel','caption']},null,2));
