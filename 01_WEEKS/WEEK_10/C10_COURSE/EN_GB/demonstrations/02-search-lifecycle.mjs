import assert from 'node:assert/strict';
import lifecycle from '../derived/search-lifecycle.js';
// Preserved generic helper has rejected/reset policy absent from canonical05.
let state=lifecycle.initial();const observations=[];
for(const event of [{type:'pending',id:'a'},{type:'pending',id:'b'},{type:'fulfilled',id:'b',items:['B result']},{type:'fulfilled',id:'a',items:['A late']},{type:'pending',id:'c'},{type:'rejected',id:'c'},{type:'reset'}]){state=lifecycle.transition(state,event);observations.push({event,state});}
assert.deepEqual(observations[2].state.items,['B result']);
assert.deepEqual(observations[3].state.items,['B result']);
assert.equal(observations[2].state.requestId,null);
assert.equal(observations[5].state.status,'failed');
assert.deepEqual(state,lifecycle.initial());
console.log(JSON.stringify({scope:'PURE_JS_SEARCH_HELPER_NO_THUNK_HTTP_REACT',observations},null,2));
