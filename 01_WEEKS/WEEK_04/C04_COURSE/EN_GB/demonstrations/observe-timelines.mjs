// Neutral course observations. No S04 target imports or assessed implementations.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const demos = require('../assets/demos.js');
const five = await demos.run('continuation');
assert.deepEqual(five.events, ['script start','function start','script end','after await','promise fulfilled']);
console.log(JSON.stringify({scenario:'continuation',...five}));
for (const scenario of ['concurrent','sequential','aggregate_reject','fetch_success','fetch_empty','fetch_http','fetch_parse','fetch_transport','stale']) {
 const observed = await demos.run(scenario);
 if (scenario==='concurrent') assert.deepEqual(observed.outcome.results,['alpha','beta','gamma']);
 if (scenario==='aggregate_reject') {
  assert.ok(observed.events.indexOf('aggregate:rejected') < observed.events.indexOf('finish:gamma'));
  assert.deepEqual(observed.settled,['fulfilled','rejected','fulfilled']);
 }
 if (scenario==='fetch_http') assert.equal(observed.parseCalls,0);
 if (scenario==='fetch_parse') assert.equal(observed.boundary,'parsing');
 if (scenario==='fetch_transport') assert.equal(observed.boundary,'transport');
 if (scenario==='stale') assert.equal(observed.visible,'B');
 console.log(JSON.stringify({scenario,...observed}));
}
console.log('PASS_NEUTRAL_CONTROLLED_TIMELINES: injected dependencies, no HTTP or native browser certification.');
