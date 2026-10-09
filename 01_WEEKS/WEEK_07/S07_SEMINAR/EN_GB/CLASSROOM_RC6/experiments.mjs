import assert from 'node:assert/strict';
import {sessionRegistrations} from './targets/p01.mjs';
import {bookSeats} from './targets/p02.mjs';
import {resourceResponse} from './targets/p03.mjs';
import {exchanges} from './http.mjs';
import {handlerFactory} from './lesson-http.mjs';
import {setImmediate as nextTurn} from 'node:timers/promises';
// SQLite is loaded only by the activities that actually use it.
const sqlite=()=>import('./store.mjs');
async function bookingWitness(mode){
 const {database,bookingStore,snapshot}=await sqlite();
 const db=database(),store=bookingStore(db,{auditFail:mode==='audit'}),before=snapshot(db);
 let result,error,createdBooking;const injected=Error('callback_fault');
 const originalCreate=store.create.bind(store);
 store.create=async(...args)=>{createdBooking=await originalCreate(...args);return createdBooking;};
 try{
  try{result=await bookSeats(store,{eventId:1,attendeeId:7,seats:2,afterCreated:async({transaction})=>{assert.ok(transaction);if(mode==='callback')throw injected;}});}catch(fault){error={name:fault.name,message:fault.message,sameInjected:fault===injected};}
  const after=snapshot(db),storedBooking=db.prepare('SELECT id,event_id,attendee_id,seats FROM bookings ORDER BY id').all().map(row=>({...row}));
  const detached=result?.booking!==null&&result?.booking!==undefined&&result.booking!==createdBooking;
  const returnedSeatsBeforeIdentityProbe=result?.booking?.seats;
  const returnedBookingBeforeIdentityProbe=result?.booking?{...result.booking}:result?.booking;
  if(result?.booking)result.booking.seats=999;
  const createdSeatsAfterResultChange=createdBooking?.seats;
  if(result?.booking)result.booking.seats=returnedSeatsBeforeIdentityProbe;
  return {before,after,result,error,calls:store.calls,storedBooking,returnedBookingBeforeIdentityProbe,detached,createdSeatsAfterResultChange,scope:'ACTUAL_BUILTIN_SQLITE_MANAGED_ADAPTER_NOT_SEQUELIZE',resultMutation:'Returned seats were changed to 999 and restored after the identity probe; createdSeatsAfterResultChange is captured from the actual store.create result before restoration, independently of saved SQL data'};
 }finally{db.close();}
}
async function heldWitness(stage,reject=false){
 const {database,bookingStore,snapshot}=await sqlite();const db=database(),store=bookingStore(db),before=snapshot(db),transactionTrace=[];
 const actualExec=db.exec.bind(db);db.exec=sql=>{const result=actualExec(sql);const name=sql.trim().toUpperCase();if(['BEGIN','COMMIT','ROLLBACK'].includes(name))transactionTrace.push(name);return result;};
 let release,fail,signalEntry,entered=false,settled=false,auditPromise;
 const reached=new Promise(resolve=>{signalEntry=resolve;});
 const enter=()=>{entered=true;signalEntry();};
 const gate=new Promise((resolve,reject)=>{release=resolve;fail=reject});gate.catch(()=>{});
 const injected=Error('held_'+stage+'_fault');
 const originalAudit=store.audit.bind(store);
 if(stage==='audit')store.audit=(booking,tx)=>{enter();auditPromise=(async()=>{await gate;return originalAudit(booking,tx)})();auditPromise.catch(()=>{});return auditPromise;};
 const operation=bookSeats(store,{eventId:1,attendeeId:7,seats:2,afterCreated:stage==='callback'?()=>{enter();return gate;}:async()=>{}});
 operation.then(()=>{settled=true},()=>{settled=true});
 let during,result,error;
 try{
  // Wait for actual entry or premature operation settlement, not a stipulated microtask count.
  // The owning command's worker bounds a genuinely non-settling learner operation.
  await Promise.race([reached,operation.then(()=>{},()=>{})]);await nextTurn();
  during={entered,outerSettled:settled,stateOnSameConnection:snapshot(db),transactionTrace:[...transactionTrace],calls:[...store.calls]};
  assert.equal(entered,true,'The declared held stage must be reached');assert.equal(settled,false,'The owned booking promise remains pending while its dependency is held');assert.deepEqual(transactionTrace,['BEGIN'],'No terminal transaction command while the owned dependency is held');assert.deepEqual(during.stateOnSameConnection,{available:3,bookings:1,audits:0});
  reject?fail(injected):release();
  try{result=await operation}catch(fault){error={message:fault.message,sameInjected:fault===injected};}
  const after=snapshot(db);
  if(reject){assert.equal(error?.sameInjected,true);assert.deepEqual(after,before);assert.deepEqual(transactionTrace,['BEGIN','ROLLBACK']);}
  else{assert.equal(error,undefined);assert.deepEqual(after,{available:3,bookings:1,audits:1});assert.deepEqual(transactionTrace,['BEGIN','COMMIT']);assert.equal(result.available,3);}
  return {stage,reject,before,during,after,result,error,transactionTrace,scope:'ACTUAL_SQLITE_TRANSACTION_WITH_HELD_ASYNC_ADAPTER_DEPENDENCY',limit:'Same-connection reads show staged state; they do not establish visibility to another reader, isolation or delayed native COMMIT.'};
 }finally{release();await operation.catch(()=>{});if(auditPromise)await auditPromise.catch(()=>{});db.close();}
}
const resourcePath=(sessionId,attendeeId)=>'/api/sessions/'+sessionId+'/registrations/'+attendeeId;
async function resourceWitness(){
 const first=resourcePath(2,9),second=resourcePath(3,9);
 return exchanges(handlerFactory(),[{path:first,method:'PUT'},{path:first,method:'PUT'},{path:second,method:'PUT'},{path:second,method:'PUT'},{path:first,method:'DELETE'},{path:first,method:'DELETE'},{path:second,method:'PUT'},{path:second,method:'PATCH'},{path:'/api/missing',method:'GET'}]);
}
export const cases=[
 {id:'P01.actual-junction-join',project:'P01',run:async()=>{
  const {database}=await sqlite();const db=database();
  try{
   const expected=[{sessionId:1,sessionTitle:'Web',attendeeId:7,attendeeName:'Ada'},{sessionId:1,sessionTitle:'Web',attendeeId:8,attendeeName:'Grace'}];assert.deepEqual(sessionRegistrations(db,1),expected);assert.deepEqual(sessionRegistrations(db,99),[]);
   let prepares=0,alls=0,rawRows,bound;
   const wrapper={prepare(sql){prepares++;const statement=db.prepare(sql);return {all(...values){alls++;bound=values;rawRows=statement.all(...values);return rawRows;}};}};
   const output=sessionRegistrations(wrapper,1);assert.deepEqual(output,expected);assert.equal(prepares,1);assert.equal(alls,1);assert.deepEqual(bound,[1]);
   for(let i=0;i<output.length;i++){assert.equal(Object.getPrototypeOf(output[i]),Object.prototype);assert.notEqual(output[i],rawRows[i]);}
   output[0].attendeeName='Changed output only';assert.equal(db.prepare('SELECT name FROM attendees WHERE id=?').get(7).name,'Ada');
   db.prepare('UPDATE attendees SET name=? WHERE id=?').run('Synthetic change',7);assert.equal(sessionRegistrations(db,1)[0]?.attendeeName,'Synthetic change');
   db.exec("INSERT INTO attendees VALUES(2,'Synthetic early');INSERT INTO sessions VALUES(2,'Another session');INSERT INTO registrations VALUES(1,2),(2,2);");
   assert.deepEqual(sessionRegistrations(db,1).map(row=>row.attendeeId),[2,7,8]);assert.deepEqual(sessionRegistrations(db,2),[{sessionId:2,sessionTitle:'Another session',attendeeId:2,attendeeName:'Synthetic early'}]);assert.deepEqual(sessionRegistrations(db,'1 OR 1=1'),[],'The supplied session value stays data, not SQL structure');
  }finally{db.close();}
 }},
 {id:'P02.success-five-shared-operations',project:'P02',run:async()=>{
  const x=await bookingWitness('success');assert.deepEqual(x.after,{available:3,bookings:1,audits:1});assert.deepEqual(x.calls.map(row=>row.name),['event','duplicate','seats','create','audit']);assert.equal(new Set(x.calls.map(row=>row.transactionId)).size,1);assert.ok(x.calls[0].transactionId!==null);assert.equal(x.storedBooking[0]?.seats,2);assert.equal(x.result?.booking?.seats,2);assert.equal(x.result?.available,3);assert.deepEqual(x.returnedBookingBeforeIdentityProbe,{id:x.storedBooking[0].id,eventId:x.storedBooking[0].event_id,attendeeId:x.storedBooking[0].attendee_id,seats:x.storedBooking[0].seats});assert.equal(x.detached,true);assert.equal(x.createdSeatsAfterResultChange,2);
  await heldWitness('callback');await heldWitness('audit');
 }},
 {id:'P02.callback-rollback',project:'P02',run:async()=>{const x=await bookingWitness('callback');assert.equal(x.error?.sameInjected,true);assert.deepEqual(x.after,x.before);assert.deepEqual(x.calls.map(row=>row.name),['event','duplicate','seats','create']);await heldWitness('callback',true);}},
 {id:'P02.audit-rollback',project:'P02',run:async()=>{const x=await bookingWitness('audit');assert.equal(x.error?.message,'injected_audit_failure');assert.deepEqual(x.after,x.before);assert.deepEqual(x.calls.map(row=>row.name),['event','duplicate','seats','create','audit']);await heldWitness('audit',true);}},
 {id:'P02.validation-and-recovery',project:'P02',run:async()=>{
  const {database,bookingStore,snapshot}=await sqlite();const db=database(),store=bookingStore(db),before=snapshot(db);let entries=0;const managed=store.managed.bind(store);store.managed=work=>{entries++;return managed(work);};
  try{
   for(const seats of [0,.5,-1,'2',NaN,Infinity])await assert.rejects(()=>bookSeats(store,{eventId:1,attendeeId:7,seats}),TypeError);assert.equal(entries,0);assert.equal(store.calls.length,0);
   const injected=Error('fault');await assert.rejects(()=>bookSeats(store,{eventId:1,attendeeId:7,seats:2,afterCreated:async()=>{throw injected;}}),fault=>fault===injected);assert.deepEqual(snapshot(db),before);
   await bookSeats(store,{eventId:1,attendeeId:8,seats:1});const stable={available:4,bookings:1,audits:1};assert.deepEqual(snapshot(db),stable);
   const previous=store.calls.length;await assert.rejects(()=>bookSeats(store,{eventId:1,attendeeId:8,seats:1}),/booking_exists/);assert.deepEqual(store.calls.slice(previous).map(row=>row.name),['event','duplicate']);assert.deepEqual(snapshot(db),stable);
   const beforePrecedence=store.calls.length;await assert.rejects(()=>bookSeats(store,{eventId:1,attendeeId:8,seats:9}),/sold_out/);assert.deepEqual(store.calls.slice(beforePrecedence).map(row=>row.name),['event']);assert.deepEqual(snapshot(db),stable);
   await assert.rejects(()=>bookSeats(store,{eventId:1,attendeeId:7,seats:9}),/sold_out/);assert.deepEqual(snapshot(db),stable);await assert.rejects(()=>bookSeats(store,{eventId:99,attendeeId:7,seats:1}),/event_not_found/);assert.deepEqual(snapshot(db),stable);
  }finally{db.close();}
 }},
 {id:'P03.idempotent-http',project:'P03',run:async()=>{
  const ids={sessionId:2,attendeeId:9},data={...ids,ticketType:'student'},path=resourcePath(2,9);
  const creation=resourceResponse('PUT',{kind:'created',data},ids);
  assert.equal(creation.status,201);assert.deepEqual(creation.body,{data});assert.deepEqual(Object.keys(creation).sort(),['body','headers','status']);
  const headerEntries=Object.entries(creation.headers);assert.equal(headerEntries.length,1);assert.equal(headerEntries[0][0].toLowerCase(),'location');assert.equal(headerEntries[0][1],path);
  assert.deepEqual(resourceResponse('PUT',{kind:'existing',data},ids),{status:200,headers:{},body:{data}});
  for(const kind of ['removed','absent'])assert.deepEqual(resourceResponse('DELETE',{kind},ids),{status:204,headers:{},body:null});
  for(const [method,kind]of [['PATCH','created'],['GET','existing'],['PUT','unknown'],['DELETE','unknown']])assert.deepEqual(resourceResponse(method,{kind,data},ids),{status:405,headers:{},body:{error:'method_not_allowed'}});
  const observed=await resourceWitness();assert.equal(observed.listenerStoppedInFinally,true);
  for(const row of observed.rows)assert.match(row.headers['content-type'],/^application\/json(?:;|$)/);assert.deepEqual(observed.rows.map(row=>row.status),[201,200,201,200,204,204,200,405,404]);
  for(const index of [0,2])assert.equal(observed.rows[index].headers.location,observed.rows[index].path);
  for(const index of [1,3,4,5,6,7,8])assert.equal(observed.rows[index].headers.location,undefined);
  for(const index of [0,1,2,3,6]){const sessionId=[2,2,3,3,3][[0,1,2,3,6].indexOf(index)];assert.deepEqual(JSON.parse(observed.rows[index].body),{data:{sessionId,attendeeId:9,ticketType:'student'}});}
  for(const index of [4,5])assert.equal(observed.rows[index].body,'');assert.deepEqual(JSON.parse(observed.rows[7].body),{error:'method_not_allowed'});assert.deepEqual(JSON.parse(observed.rows[8].body),{error:'not_found'});
 }}
];
export async function observe(project){
 if(project==='P01'){const {database}=await sqlite();const db=database();try{const beforeName=db.prepare('SELECT name FROM attendees WHERE id=?').get(7).name;const rows=sessionRegistrations(db,1);db.prepare('UPDATE attendees SET name=? WHERE id=?').run('Synthetic changed name',7);return {rows,beforeName,changedRows:sessionRegistrations(db,1),absentRows:sessionRegistrations(db,99),scope:'ACTUAL_BUILTIN_SQLITE_JUNCTION_QUERY',limit:'Finite current rows; no universal cost, ORM or reopen persistence claim'};}finally{db.close();}}
 if(project==='P02')return {success:await bookingWitness('success'),callback:await bookingWitness('callback'),audit:await bookingWitness('audit'),limit:'The check also includes held callback/audit and recovery fixtures; injected calls are not external-message cancellation or production concurrency'};
 if(project==='P03')return resourceWitness();
 return {P01:await observe('P01'),P02:await observe('P02'),P03:await observe('P03')};
}
