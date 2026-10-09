/* Derived C07 teaching calculations, not ORM/database/HTTP execution or assessed bookSeats. */
(function(root){'use strict';const cursor=typeof module!=='undefined'&&module.exports?require('../derived/cursor-model.js'):root.C07Cursor;
const LIMIT='Not Sequelize, SQLite, physical rollback, SQL measurement, a concurrency test or a supplied API execution.';
const scenarios=Object.freeze([
 ['key-owner','Foreign-key ownership'],['junction-fact','Membership-specific ticket type'],['duplicate-pair','Declared pair constraint versus rows'],
 ['lazy-count','Lazy statement-count calculation'],['eager-count','Eager plan is not cost'],['fanout','Joined-collection fan-out'],
 ['put-repeat','Membership PUT repeated effect'],['delete-repeat','Membership DELETE repeated effect'],['post-repeat','Action-shaped repeated effect'],
 ['cursor-id','Incorrect ID-only continuation'],['cursor-tuple','Numeric tuple continuation'],['cursor-tie','Equal primary keys need the second component'],
 ['await-sequence','Sequential writes retain partial model state'],['staged-failure','Staged model rejects the whole group'],
 ['commit-wait','Callback ready while service settlement waits'],['commit-reject','Commit-service rejection prevents public success'],
 ['error-origin','An error class does not identify its origin'],['race-schedule','Constructed lost-update schedule']
].map(([id,title])=>Object.freeze({id,title})));
async function ledger(staged,fail=true){
 const before={credits:6,records:0,receipts:0},state={...before},working=staged?{...state}:state,trace=[];
 // Each asynchronous step is awaited; this is a JavaScript state model, not SQL.
 const debit=async()=>{working.credits-=2;trace.push('model debit');};
 const append=async()=>{working.records++;trace.push('model record appended');};
 const receipt=async()=>{if(fail)throw new Error('MODEL_RECEIPT_FAILURE');working.receipts++;trace.push('model receipt appended');};
 let failureCaught=null;
 try{await debit();await append();await receipt();if(staged)Object.assign(state,working);trace.push('model group published');}
 catch(error){failureCaught=error.message;trace.push('injected failure before receipt');if(staged)trace.push('working copy discarded');}
 return {before,after:state,discardedWorking:staged&&failureCaught?working:null,trace,failureCaught,actualDatabase:false};
}
async function settlement(fail){const trace=[];let release,reject;const gate=new Promise((r,j)=>{release=r;reject=j;});let outerSettled=false;
 const service=(async()=>{const value=await(async()=>{trace.push('callback.fulfilled');return {marker:'MODEL_RESULT'};})();trace.push('commit.pending');await gate;trace.push('service.fulfilled');return value;})();
 const observed=service.then(x=>{outerSettled=true;trace.push('caller.fulfilled');return x;},e=>{outerSettled=true;trace.push('caller.rejected');return {error:e.message};});
 await Promise.resolve();await Promise.resolve();const beforeRelease={trace:[...trace],outerSettled};fail?reject(new Error('MODEL_COMMIT_REJECTED')):release();const outcome=await observed;return {beforeRelease,trace,outcome,outerSettled,actualCommit:false};
}
async function run(id){let result;
 switch(id){
 case 'key-owner':result={conferences:[{id:7,title:'Systems'}],sessions:[{id:8,conferenceId:7},{id:9,conferenceId:7}],keyOn:'Session',enforcedConstraint:false};break;
 case 'junction-fact':result={attendee:{id:42},memberships:[{sessionId:7,attendeeId:42,ticketType:'student'},{sessionId:8,attendeeId:42,ticketType:'speaker'}],globalTicketTypeWouldLoseInformation:true};break;
 case 'duplicate-pair':{const rows=[{s:7,a:42},{s:7,a:42}];result={rowCount:rows.length,distinctPairs:new Set(rows.map(x=>x.s+':'+x.a)).size,declaredRule:'UNIQUE(sessionId,attendeeId)',databaseConstraintTested:false};break;}
 case 'lazy-count':result={parents:3,calculatedStatements:1+3,sourceExampleExpectedCount:4,loggerExecuted:false};break;
 case 'eager-count':result={declaredStatementPlan:1,costMeasured:false,resultCapEstablished:false,loggerExecuted:false};break;
 case 'fanout':result={entries:3,labels:4,possibleCombinations:3*4,SQLExecuted:false};break;
 case 'put-repeat':{const state=new Map(),statuses=[];for(let i=0;i<2;i++){const fresh=!state.has('7:42');state.set('7:42',{ticketType:'student'});statuses.push(fresh?201:200);}result={statuses,memberships:state.size,value:state.get('7:42'),HTTPExecuted:false};break;}
 case 'delete-repeat':{const state=new Map([['7:42',{}]]),statuses=[];for(let i=0;i<2;i++){state.delete('7:42');statuses.push(204);}result={statuses,memberships:state.size,HTTPExecuted:false};break;}
 case 'post-repeat':{let count=0;const add=()=>++count;result={returns:[add(),add()],finalCount:count,rule:'Illustrative increment action, not the supplied booking API'};break;}
 case 'cursor-id':case 'cursor-tuple':{const first=cursor.page(cursor.fixture,2),last=first.at(-1),next=(id==='cursor-id'?cursor.wrongIdPage:cursor.page)(cursor.fixture,2,last);result={rows:cursor.fixture,firstIds:first.map(r=>r.id),last,nextIds:next.map(r=>r.id),snapshot:'fixed numeric model',SQLExecuted:false};break;}
 case 'cursor-tie':{const rows=[{id:8,rank:20},{id:2,rank:20},{id:1,rank:30}];result={first:cursor.page(rows,1),next:cursor.page(rows,2,{id:2,rank:20}),inputIds:rows.map(x=>x.id)};break;}
 case 'await-sequence':result=await ledger(false);break;
 case 'staged-failure':result=await ledger(true);break;
 case 'commit-wait':result=await settlement(false);break;
 case 'commit-reject':result=await settlement(true);break;
 case 'error-origin':{class U extends Error{};result={classOnlyMapping:['booking','callback','audit'].map(origin=>({origin,converted:new U(origin) instanceof U})),constraintIdentified:false,note:'The real source-wide class mapping is separately audited privately.'};break;}
 case 'race-schedule':{const available=1,aRead=available,bRead=available;let final=aRead-1;final=bRead-1;result={reads:[aRead,bRead],claims:2,finalAvailability:final,capacity:1,invariantMet:2<=1,actualConcurrentRequests:false};break;}
 default:throw new TypeError('Unknown C07 teaching scenario');
 }
 return {evidenceClass:'TEACHING_MODEL',scenario:id,result,limit:LIMIT};
}
const API=Object.freeze({scenarios,run,ledger,settlement});if(typeof module!=='undefined'&&module.exports)module.exports=API;else root.C07Demos=API;
})(typeof globalThis!=='undefined'?globalThis:this);
