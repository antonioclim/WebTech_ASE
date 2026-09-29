/** Observation only: calls the supplied function, never implements booking.
 * The caller provides an isolated database. No transport or driver is created here.
 */
import {isDeepStrictEqual} from 'node:util';
export const MODES=Object.freeze(['success','callback','audit','unsafe','domains']);
export const OPERATION_NAMES=Object.freeze(['Event.findByPk','Booking.findOne','Event.save','Booking.create','BookingAudit.create']);
export async function snapshot(db){
 const [events,bookings,audits]=await Promise.all([
  db.Event.findAll({order:[['id','ASC']],raw:true}),db.Booking.findAll({order:[['id','ASC']],raw:true}),db.BookingAudit.findAll({order:[['id','ASC']],raw:true})]);
 return {events,bookings,audits};
}
function instrumentation(db,{auditError=null}={}){
 const records=[],restore=[],txs=[],instances=new WeakSet();let txCalls=0;
 const txName=t=>{if(!t)return null;let i=txs.indexOf(t);if(i<0){txs.push(t);i=txs.length-1;}return 'T'+(i+1);};
 function replace(target,key,value){const own=Object.getOwnPropertyDescriptor(target,key);target[key]=value;restore.push(()=>own?Object.defineProperty(target,key,own):delete target[key]);}
 const originalTx=db.sequelize.transaction;
 replace(db.sequelize,'transaction',async function(...args){
  txCalls++;const index=args.length-1,callback=args[index];
  if(typeof callback!=='function'){records.push({stage:'unmanaged-call'});return originalTx.apply(this,args);}
  args[index]=async function(t){records.push({stage:'callback-start',transaction:txName(t)});try{const result=await callback(t);records.push({stage:'callback-complete',transaction:txName(t)});return result;}catch(e){records.push({stage:'callback-rejected',transaction:txName(t)});throw e;}};
  try{const value=await originalTx.apply(this,args);records.push({stage:'transaction-resolved'});return value;}catch(e){records.push({stage:'transaction-rejected'});throw e;}
 });
 const originalFind=db.Event.findByPk;
 replace(db.Event,'findByPk',async function(...args){
  records.push({operation:'Event.findByPk',transaction:txName(args.at(-1)?.transaction)});
  const instance=await originalFind.apply(this,args);
  if(instance&&!instances.has(instance)){
   instances.add(instance);const originalSave=instance.save;
   replace(instance,'save',function(...a){records.push({operation:'Event.save',transaction:txName(a.at(-1)?.transaction)});return originalSave.apply(this,a);});
  }
  return instance;
 });
 for(const [target,key,name] of [[db.Booking,'findOne','Booking.findOne'],[db.Booking,'create','Booking.create'],[db.BookingAudit,'create','BookingAudit.create']]){
  const original=target[key];replace(target,key,function(...args){records.push({operation:name,transaction:txName(args.at(-1)?.transaction)});if(name==='BookingAudit.create'&&auditError)throw auditError;return original.apply(this,args);});
 }
 return {records,txName,txCalls:()=>txCalls,close(){for(const restoreOne of restore.reverse())restoreOne();}};
}
export async function invokeObserved(db,book,input,{auditError=null}={}){
 const hooks=instrumentation(db,{auditError});let result,error,callbackTransaction=null;
 const callback=input.afterBookingCreated||async function(){};
 try{
  result=await book(db,{...input,afterBookingCreated:async function(ctx){callbackTransaction=hooks.txName(ctx.transaction);hooks.records.push({stage:'injected-callback',transaction:callbackTransaction});return callback(ctx);}});
  hooks.records.push({stage:'book-resolved'});
 }catch(e){error=e;hooks.records.push({stage:'book-rejected'});}finally{hooks.close();}
 const ops=hooks.records.filter(x=>x.operation),txCalls=hooks.txCalls();
 const oneTransaction=txCalls===1&&callbackTransaction!==null&&ops.length===5&&OPERATION_NAMES.every((name,i)=>ops[i].operation===name&&ops[i].transaction===callbackTransaction);
 const committed=hooks.records.findIndex(r=>r.stage==='transaction-resolved'),returned=hooks.records.findIndex(r=>r.stage==='book-resolved');
 return {result,error,trace:hooks.records,transactionCalls:txCalls,callbackTransaction,oneTransaction,outerAfterManagedSettlement:committed>=0&&returned>committed};
}
function publicAttempt(a){return {result:a.result??null,error:a.error?{name:a.error.name,code:a.error.code??null,message:a.error.message}:null,trace:a.trace,transactionCalls:a.transactionCalls,oneTransaction:a.oneTransaction,outerAfterManagedSettlement:a.outerAfterManagedSettlement};}
export async function observe(db,book,unsafe,mode){
 if(!MODES.includes(mode))throw Error('Unknown observation mode');
 const before=await snapshot(db);const report={mode,evidenceClass:'CALLER_SUPPLIED_DATABASE_OBSERVATION',before,attempts:[],checks:[],limitations:'Checks use a fresh supplied fixture and sequential operations. They do not establish concurrent scheduling, crash durability or reversibility of external effects.'};
 const check=(name,pass)=>report.checks.push({name,pass:!!pass});
 const event=before.events.find(x=>x.id===1);
 if(!event||event.availableSeats!==5||before.bookings.length||before.audits.length){report.block='Expected a fresh supplied capacity-five fixture';report.ok=false;return report;}
 if(mode==='domains'){
  for(const [label,input,code] of [['invalid',{eventId:1,attendeeId:21,seats:0},'booking_invalid'],['missing',{eventId:99,attendeeId:21,seats:1},'event_not_found'],['sold-out',{eventId:1,attendeeId:21,seats:6},'sold_out']]){
   const a=await invokeObserved(db,book,input);report.attempts.push({label,...publicAttempt(a),after:await snapshot(db)});check(label+' code',a.error?.code===code);check(label+' unchanged state',isDeepStrictEqual(before,report.attempts.at(-1).after));if(label==='invalid')check('invalid before transaction',a.transactionCalls===0);
  }
  const made=await invokeObserved(db,book,{eventId:1,attendeeId:24,seats:1});const saved=await snapshot(db);report.attempts.push({label:'prepare duplicate',...publicAttempt(made),after:saved});
  const dup=await invokeObserved(db,book,{eventId:1,attendeeId:24,seats:1});const after=await snapshot(db);report.attempts.push({label:'duplicate',...publicAttempt(dup),after});check('duplicate code',dup.error?.code==='booking_exists');check('duplicate state unchanged',!made.error&&isDeepStrictEqual(saved,after));
 }else{
  const failure=new Error('S07 controlled '+mode+' failure');
  const input={eventId:1,attendeeId:21,seats:2,...(['callback','unsafe'].includes(mode)?{afterBookingCreated:async()=>{throw failure;}}:{})};
  const a=await invokeObserved(db,mode==='unsafe'?unsafe:book,input,{auditError:mode==='audit'?failure:null});const after=await snapshot(db);report.attempts.push({label:mode,...publicAttempt(a),after});
  if(mode==='success'){
   check('resolved with detached booking/event',!a.error&&a.result?.booking&&a.result?.event&&!a.result.booking.get&&!a.result.event.get);
   check('inventory decrement',after.events[0]?.availableSeats===3);check('one matching booking and audit',after.bookings.length===1&&after.audits.length===1&&after.bookings[0].seats===2&&after.audits[0].bookingId===after.bookings[0].id&&after.audits[0].seats===2);
   check('all five operations one transaction',a.oneTransaction);check('outer result after managed settlement',a.outerAfterManagedSettlement);
  }else{
   check('injected error identity preserved',a.error===failure);
   if(mode==='unsafe'){check('supplied unsafe partial state observed',after.events[0]?.availableSeats===3&&after.bookings.length===1&&after.audits.length===0);report.limitations+=' The unsafe comparison is intentionally not an implementation completion check.';}
   else{
    check('state exactly restored after failure',isDeepStrictEqual(before,after));
    const recovered=await invokeObserved(db,book,{eventId:1,attendeeId:22,seats:1});const afterRecovery=await snapshot(db);report.attempts.push({label:'independent recovery same database',...publicAttempt(recovered),after:afterRecovery});
    check('independent success after failed attempt',!recovered.error&&afterRecovery.events[0]?.availableSeats===4&&afterRecovery.bookings.length===1&&afterRecovery.audits.length===1&&afterRecovery.bookings[0]?.attendeeId===22);
   }
  }
 }
 report.ok=report.checks.length>0&&report.checks.every(c=>c.pass);report.status=report.ok?'PASS_BOUNDED_OBSERVATION':'FAIL_OBSERVATION';return report;
}
