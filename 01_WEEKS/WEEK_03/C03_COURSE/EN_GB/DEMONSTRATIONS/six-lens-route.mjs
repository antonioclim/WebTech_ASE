// C03 non-assessed claims demonstration. It never imports S03 target functions.
import assert from 'node:assert/strict';
const defaults = { priority: 'normal' };
const claims = [
  Object.assign(Object.create(defaults), {id:'c-2', approved:true, amount:8, supplier:{city:'York'}}),
  {id:'c-1', approved:true, amount:3, supplier:{city:'Bath'}},
  {id:'c-3', approved:false, amount:20, supplier:{city:'York'}}
];
const before = JSON.stringify(claims);
for (const claim of claims) {
  assert.equal(typeof claim.amount, 'number'); assert.ok(Number.isFinite(claim.amount));
}
const property = {lookup:claims[0].priority, priorityOwn:Object.hasOwn(claims[0],'priority'), amountOwn:Object.hasOwn(claims[0],'amount')};
assert.equal(property.lookup, 'normal'); assert.equal(property.priorityOwn,false);
const containerCopy = [...claims];
const shallow = {...claims[0]};
const updated = {...claims[0], supplier:{...claims[0].supplier, city:'Leeds'}};
const identity = {newArray:containerCopy!==claims, sharedRecord:containerCopy[0]===claims[0], sharedSupplier:shallow.supplier===claims[0].supplier, copiedChangedPath:updated.supplier!==claims[0].supplier, originalCity:claims[0].supplier.city, updatedCity:updated.supplier.city};
assert.deepEqual(identity,{newArray:true,sharedRecord:true,sharedSupplier:true,copiedChangedPath:true,originalCity:'York',updatedCity:'Leeds'});
function makeMinimum(minimum) {
  if (!Number.isFinite(minimum)) throw new TypeError('minimum must be finite');
  return claim => claim.amount >= minimum; // admitted numeric fixture is the precondition
}
const minimum3 = makeMinimum(3), minimum10 = makeMinimum(10);
const receiver = {id:'c-2', describe(){return this.id;}};
const detached = receiver.describe;
assert.equal(receiver.describe(),'c-2'); assert.equal(detached.call(receiver),'c-2');
let bareError;try { detached(); } catch(error){bareError=error.name;}
assert.equal(bareError,'TypeError'); assert.throws(()=>makeMinimum('3'),TypeError);
const selected = claims.filter(claim=>claim.approved && minimum3(claim));
const views = selected.map(claim=>({id:claim.id,amount:claim.amount}));
const ordered = [...views].sort((a,b)=>a.amount-b.amount);
const total = ordered.reduce((sum,view)=>sum+view.amount,0);
assert.deepEqual(selected.map(x=>x.id),['c-2','c-1']);
assert.deepEqual(ordered.map(x=>x.id),['c-1','c-2']);assert.equal(total,11);
assert.equal(ordered.reduce((s,x)=>s+x.amount,0),11);assert.equal([].reduce((s,x)=>s+x.amount,0),0);
assert.equal(claims.reduce((s,x)=>s+x.amount,0),31);
assert.equal(JSON.stringify(claims),before);
assert.ok(views.every(x=>claims.every(y=>x!==y)));
console.log(JSON.stringify({scope:'ACTUAL_SYNCHRONOUS_NODE_COURSE_FIXTURE', value:{booleanString:Boolean('false'),mixedAddition:0+'3'}, property, identity, function:{minimum3For8:minimum3(claims[0]),minimum10For8:minimum10(claims[0]),method:receiver.describe(),explicit:detached.call(receiver),bareError}, shape:{inputIDs:claims.map(x=>x.id),selectedIDs:selected.map(x=>x.id),viewIDs:views.map(x=>x.id),ordered,total,allTotal:31,emptyTotal:0}, effect:{inputUnchanged:JSON.stringify(claims)===before,freshViews:views.every(x=>claims.every(y=>x!==y)),orderedSharesViewRecords:ordered[0]===views[1]}},null,2));
