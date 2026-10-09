import assert from 'node:assert/strict';
// Property-shape demonstration only. No S13 admission function is implemented.
const inherited = Object.create({ measurement: 0 });
const samples = [['own_zero', { measurement: 0 }], ['own_false', { measurement: false }], ['own_null', { measurement: null }], ['own_undefined', { measurement: undefined }], ['missing', {}], ['inherited_only', inherited]];
const observations = samples.map(([label, object]) => ({label, own:Object.hasOwn(object,'measurement'), presentAnywhere:'measurement' in object, truthy:Boolean(object.measurement), valueType:typeof object.measurement, json:JSON.stringify(object)}));
assert.deepEqual(observations.map(row=>row.own),[true,true,true,true,false,false]);
assert.equal(observations.at(-1).presentAnywhere,true);
assert.equal(observations[3].json,'{}');
console.log(JSON.stringify({scope:'ACTUAL_NODE_PROPERTY_OPERATIONS', observations, limit:'No completion protocol or native browser endpoint is executed'},null,2));
