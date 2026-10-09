import assert from 'node:assert/strict';
import {taskBody} from './targets/p01.mjs';
import {terminalLogger} from './targets/p02.mjs';
import {publicOutcome} from './targets/p03.mjs';
import {exchanges} from './http.mjs';
import {handler} from './lesson-http.mjs';
export const cases = [
  {id:'P01.trim-fresh-body',project:'P01',run:()=>{
    const input={title:'  plan  ',completed:false},before=JSON.stringify(input),result=taskBody(input);
    assert.deepEqual(result,{title:'plan',completed:false});assert.notEqual(result,input);assert.equal(JSON.stringify(input),before);
    const nullPrototype=Object.assign(Object.create(null),{title:' note ',completed:false});
    assert.deepEqual(taskBody(nullPrototype),{title:'note',completed:false},'A plain null-prototype record is permitted');
  }},
  {id:'P01.strict-closed-input',project:'P01',run:()=>{
    const symbolExtra={title:'x',completed:false,[Symbol('synthetic-extra')]:true};
    const hiddenExtra=Object.defineProperty({title:'x',completed:false},'syntheticExtra',{value:true});
    const customPrototype=Object.assign(Object.create({custom:true}),{title:'x',completed:false});
    for(const input of [null,[],42,{title:'x'},{completed:false},{title:42,completed:false},{title:'x',completed:'false'},{title:' ',completed:false},{title:'x',completed:false,admin:true},Object.create({title:'x',completed:false}),symbolExtra,hiddenExtra,customPrototype])assert.throws(()=>taskBody(input),TypeError);
  }},
  {id:'P02.exactly-one-terminal-record',project:'P02',run:()=>{
    const logs=[];let clockCalls=0;
    const end=terminalLogger({id:'R7',start:100,clock:()=>{clockCalls++;return 112;},logger:row=>logs.push(row)});
    assert.equal(clockCalls,0,'Creation does not read the terminal clock');
    end(201);end(499);assert.deepEqual(logs,[{id:'R7',status:201,elapsed:12}]);assert.equal(clockCalls,1);
    const other=terminalLogger({id:'R8',start:20,clock:()=>29,logger:row=>logs.push(row)});other(204);other(503);
    assert.deepEqual(logs[1],{id:'R8',status:204,elapsed:9},'A separately created callback owns its own first event');assert.equal(logs.length,2);
    for(const dependency of ['clock','logger']){
      const rows=[];let entered=false,calls=0,callback;
      const clock=()=>{calls++;if(dependency==='clock'&&!entered){entered=true;callback(499);}return 7;};
      const logger=row=>{rows.push(row);if(dependency==='logger'&&!entered){entered=true;callback(499);}};
      callback=terminalLogger({id:'R',start:2,clock,logger});callback(201);callback(503);
      assert.deepEqual(rows,[{id:'R',status:201,elapsed:5}],dependency+' can synchronously re-enter the same callback');assert.equal(calls,1);
    }
    let now=100;const terminal=[];const changed=terminalLogger({id:'T',start:100,clock:()=>now,logger:row=>terminal.push(row)});now=135;changed(202);now=200;changed(499);
    assert.deepEqual(terminal,[{id:'T',status:202,elapsed:35}],'The first terminal callback reads the supplied clock');
  }},
  {id:'P03.created-location-and-envelope',project:'P03',run:()=>{
    for(const id of [7,'N8']){const data={id,title:'Synthetic task',completed:false};assert.deepEqual(publicOutcome({kind:'created',data}),{status:201,headers:{location:'/api/tasks/'+id},body:{data}});}
  }},
  {id:'P03.safe-error-mapping',project:'P03',run:()=>{
    assert.deepEqual(publicOutcome({kind:'not_found',message:'PRIVATE'}),{status:404,headers:{},body:{error:'task_not_found'}});
    assert.deepEqual(publicOutcome({kind:'conflict',debug:'PRIVATE'}),{status:409,headers:{},body:{error:'task_exists'}});
    for(const kind of ['crash','synthetic_unknown'])assert.deepEqual(publicOutcome({kind,message:'PRIVATE',debug:{secret:'PRIVATE'}}),{status:500,headers:{},body:{error:'internal_error'}});
  }},
  {id:'P03.actual-loopback-http',project:'P03',run:async()=>{
    const exchange=await exchanges(handler,[{path:'/created'},{path:'/not_found'},{path:'/conflict'},{path:'/crash'}]);
    assert.equal(exchange.listenerStoppedInFinally,true);
    const rows=exchange.rows;assert.deepEqual(rows.map(row=>row.status),[201,404,409,500]);
    assert.equal(rows[0].headers.location,'/api/tasks/7');
    assert.deepEqual(JSON.parse(rows[0].body),{data:{id:7,title:'Synthetic task',completed:false}});
    for(const row of rows)assert.match(row.headers['content-type'],/^application\/json(?:;|$)/);
    for(const [index,error]of [[1,'task_not_found'],[2,'task_exists'],[3,'internal_error']]){assert.deepEqual(JSON.parse(rows[index].body),{error});assert.equal(rows[index].headers.location,undefined);assert.equal(rows[index].body.includes('PRIVATE'),false);}
  }}
];
export async function observe(project){
  if(project==='P01'){
    const input={title:'  plan  ',completed:false},before={...input},result=taskBody(input);
    return {input:before,before,after:input,result,fresh:result!==input,inputUnchanged:JSON.stringify(input)===JSON.stringify(before),scope:'ACTUAL_NODE_BODY_BOUNDARY_NOT_EXPRESS_PARSING'};
  }
  if(project==='P02'){
    const logs=[];let clockCalls=0;
    const finish=terminalLogger({id:'R7',start:100,clock:()=>{clockCalls++;return 112;},logger:row=>logs.push(row)});
    finish(201);finish(499);return {suppliedEvents:['finish201','close499'],logs,clockCalls,scope:'INJECTED_CALLBACKS_NOT_EXPRESS_EVENT_LOOP'};
  }
  if(project==='P03')return exchanges(handler,[{path:'/created'},{path:'/not_found'},{path:'/conflict'},{path:'/crash'}]);
  return {P01:await observe('P01'),P02:await observe('P02'),P03:await observe('P03')};
}
