// Finite routing/resource reading model. No HTTP and no S05 outcome mapper.
import assert from 'node:assert/strict';
const tasks=[{id:'t-1',completed:true},{id:'t-2',completed:false}];
function readCollection(target){
  const url=new URL(target,'http://example.invalid');
  const supplied=url.searchParams.get('completed');
  const selected=supplied===null?tasks:tasks.filter(task=>task.completed===(supplied==='true'));
  return {pathname:url.pathname,query:supplied,selectedIDs:selected.map(task=>task.id)};
}
const exact=readCollection('/api/tasks?completed=true'),banana=readCollection('/api/tasks?completed=banana');
assert.deepEqual(exact.selectedIDs,['t-1']);assert.deepEqual(banana.selectedIDs,['t-2']);
assert.equal(exact.pathname,'/api/tasks');
const createdRecord={id:'n-8',label:'Course note'};
const response={status:201,location:'/api/notes/'+createdRecord.id,body:{data:createdRecord}};
const followUpTarget=response.location;
assert.equal(followUpTarget,'/api/notes/n-8');
const deletion={status:204,body:''};assert.equal(deletion.body,'');
console.log(JSON.stringify({scope:'NODE_FINITE_RESOURCE_READING_MODEL_NOT_HTTP',exact,banana,response,followUpTarget,deletion,limit:'banana exposes permissive source query behaviour. The declared response is not a transmitted response or disk persistence.'},null,2));
