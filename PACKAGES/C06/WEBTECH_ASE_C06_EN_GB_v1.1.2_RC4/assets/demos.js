/* C06 teaching illustrations. No Sequelize, native addon, SQL, fetch or disk database. */
(function (root) {
 'use strict';
 const scenarios = [
  ['metadata','Declarations are not schema inspection'],
  ['normalise-text','Trim text without coercing other types'],
  ['normalise-blank','Blank after normalisation'],
  ['normalise-number','A number remains a number in the setter'],
  ['memory-reopen','Memory lifecycle — toy model'],
  ['file-reopen','File reopen — toy model only'],
  ['file-reset','Explicit reset — toy model only'],
  ['patch-false','A supplied false is not absence'],
  ['awaited-rejection','Local catch owns an awaited rejection'],
  ['returned-rejection','Returned rejection reaches the caller'],
  ['plain-projection','Plain data needs a public field policy'],
  ['invoice-trace','A non-assessed invoice result trace'],
  ['tie-primary','Primary-only order leaves a tie'],
  ['tie-complete','Secondary ID resolves a tie'],
  ['literal-percent','Literal percent character search'],
  ['ascii-rule','ASCII rule versus JavaScript case conversion']
 ].map(([id,label])=>Object.freeze({id,label}));
 function normalise(value){return typeof value==='string'?value.trim():value;}
 function lifecycle(storage,reset){
  if(!['memory','file'].includes(storage)||typeof reset!=='boolean')throw new TypeError('Use memory/file and an explicit boolean reset');
  const before=['Seeded once','Application row'];
  // Retained JavaScript values are a toy plan, never an actual SQLite file.
  const reopened=storage==='file'&&!reset?before.slice():['Seeded once'];
  return {storageModel:storage,reset,before,reopened,boundary:'CALCULATED_SAME_PROCESS_CONNECTION_PLAN',fileOpened:false};
 }
 const invoices=()=>[{id:22,owner:'Ada',paid:false,amount:50},{id:21,owner:'Ada',paid:false,amount:50},{id:23,owner:'Lin',paid:false,amount:90}];
 const asciiLower=s=>s.replace(/[A-Z]/g,c=>c.toLowerCase());
 async function rejection(awaitInside){
  const trace=[];const work=()=>Promise.reject(new Error('illustrative write rejection'));
  async function owner(){try {if(awaitInside)return await work();return work();}catch(e){trace.push('LOCAL_CATCH');return {category:'illustrative_failure'};}}
  // Immediately attach caller handlers: the example is not an unhandled-rejection test.
  let result;try{result=await owner();trace.push('CALLER_RESOLVED');}catch(e){trace.push('CALLER_CAUGHT');result={message:e.message};}
  return {trace,result,databaseCalled:false};
 }
 async function run(id){
  if(!scenarios.some(s=>s.id===id))throw new RangeError('Unknown C06 scenario');
  let result;
  switch(id){
   case 'metadata':result={declared:{allowNull:false,unique:true,defaultArchived:false},schemaInspected:false,insertExecuted:false};break;
   case 'normalise-text':case 'normalise-blank':case 'normalise-number': {const input=id==='normalise-text'?'  Note  ':id==='normalise-blank'?'   ':42;const output=normalise(input);result={input,output,type:typeof output,completeValidationExecuted:false};break;}
   case 'memory-reopen':result=lifecycle('memory',false);break;
   case 'file-reopen':result=lifecycle('file',false);break;
   case 'file-reset':result=lifecycle('file',true);break;
   case 'patch-false':{const input={archived:false},a={archived:true},b={archived:true};if(input.archived)a.archived=input.archived;if(Object.hasOwn(input,'archived'))b.archived=input.archived;result={input,truthyBranch:a,presenceBranch:b,saveExecuted:false};break;}
   case 'awaited-rejection':result=await rejection(true);break;
   case 'returned-rejection':result=await rejection(false);break;
   case 'plain-projection':{const plain={id:7,title:'Public note',archived:false,internalReview:'synthetic staff-only marker'};const {id,title,archived}=plain;const publicValue={id,title,archived,links:{self:'/api/notes/'+id}};result={plainKeys:Object.keys(plain),publicValue,originalUnchanged:plain.internalReview==='synthetic staff-only marker'};break;}
   case 'invoice-trace':{const source=invoices(),selected=source.filter(x=>x.owner==='Ada'&&x.paid===false);selected.sort((a,b)=>b.amount-a.amount||a.id-b.id);result={source,selectedIds:selected.map(x=>x.id),publicRows:selected.map(({id,amount})=>({id,amount})),note:'Fixed illustrative invoice calculation. P02 forbids post-query in-memory processing.'};break;}
   case 'tie-primary':case 'tie-complete':{const a=invoices().filter(x=>x.owner==='Ada'),b=a.slice().reverse();const cmp=id==='tie-complete'?((a,b)=>b.amount-a.amount||a.id-b.id):((a,b)=>b.amount-a.amount);result={first:a.slice().sort(cmp).map(x=>x.id),reversedInput:b.slice().sort(cmp).map(x=>x.id),tieBreaker:id==='tie-complete',note:'JS sorting witness, not a prediction of SQLite incidental order.'};break;}
   case 'literal-percent':{const text=['Margin 50%','Margin 50','Ordinary'];result={text,search:'%',literalMatches:text.filter(x=>x.includes('%')),SQLExecuted:false};break;}
   case 'ascii-rule':{const value='ÀBC';result={value,explicitASCIIRule:asciiLower(value),JavaScriptLower:value.toLowerCase(),SQLiteExecuted:false,limit:'Default SQLite lower is documented as ASCII-only; no SQL executed by this comparison.'};break;}
  }
  return {scenario:id,evidenceClass:'TEACHING_MODEL',result,limit:'Not Sequelize or SQLite execution. No native driver, database file or HTTP request was used.'};
 }
 const api=Object.freeze({scenarios:Object.freeze(scenarios),normalise,lifecycle,asciiLower,run});
 if(typeof module==='object'&&module.exports)module.exports=api;root.C06Demos=api;
})(typeof globalThis!=='undefined'?globalThis:this);
