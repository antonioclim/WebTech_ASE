// Protected finite teaching bodies; supplied input is not an individually designed case.
const probes = {
 "P01-boundary": async()=>{
  const {database}=await import('./store.mjs'),{sessionRegistrations}=await import('./targets/p01.mjs');
  const db=database();try{console.log(JSON.stringify({scope:'ACTUAL_SQLITE_ABSENT_SESSION',sessionId:88,result:sessionRegistrations(db,88),limit:'Absent-session case only; no complete join qualification'},null,2));}finally{db.close();}
 },
 "P02-boundary": async()=>{
  const {database,bookingStore,snapshot}=await import('./store.mjs'),{bookSeats}=await import('./targets/p02.mjs');
  const db=database();try{const store=bookingStore(db),before=snapshot(db);let managedEntries=0,error=null;const managed=store.managed.bind(store);store.managed=work=>{managedEntries++;return managed(work)};try{await bookSeats(store,{eventId:1,attendeeId:7,seats:0.5});}catch(e){error={name:e.name,message:e.message};}console.log(JSON.stringify({scope:'ACTUAL_SQLITE_INVALID_QUANTITY',seats:0.5,error,managedEntries,calls:store.calls,before,after:snapshot(db),limit:'Cheap-validation witness only; rollback and ownership require separate cases'},null,2));}finally{db.close();}
 },
 "P03-boundary": async()=>{
  const {resourceResponse}=await import('./targets/p03.mjs');console.log(JSON.stringify({scope:'DIRECT_MAPPER_NOT_HTTP',method:'PATCH',ids:{sessionId:2,attendeeId:9},result:resourceResponse('PATCH',{kind:'created',data:{sessionId:2,attendeeId:9}},{sessionId:2,attendeeId:9}),limit:'Unsupported-method case only; no actual HTTP or complete response matrix'},null,2));
 }
};
const [selector,...extra]=process.argv.slice(2);if(extra.length||!Object.keys(probes).includes(selector)){console.error(JSON.stringify({status:'STOP_UNKNOWN_TEACHING_PROBE',selector}));process.exit(2);}try{await probes[selector]();}catch(error){console.error(JSON.stringify({status:'STOP_TEACHING_PROBE_EXECUTION',classification:'EXECUTION_FAULT',probe:selector,name:error.name,message:error.message}));process.exitCode=2;}
