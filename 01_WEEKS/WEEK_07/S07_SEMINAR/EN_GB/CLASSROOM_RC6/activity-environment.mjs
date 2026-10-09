import {assessEnvironment,runBounded} from './environment.mjs';
function block(report,feature,error){report.status='ENV_BLOCKED';report.exitCode=2;report.checks.push({feature,status:'ENV_BLOCKED',reason:error.code||error.message,remedy:'Repair only the named capability and rerun the selected operation; no package installation is performed.'});report.remedy='Read the failed requirement and rerun this command after repair; independent profiles remain available.';}
async function probeTimeout(report){let signal,timer,listener;try{if(typeof AbortSignal!=='function'||typeof AbortSignal.timeout!=='function')throw Error('ABORTSIGNAL_TIMEOUT_API_MISSING');signal=AbortSignal.timeout(5);if(typeof signal.addEventListener!=='function'||typeof signal.removeEventListener!=='function')throw Error('ABORTSIGNAL_EVENT_API_MISSING');await new Promise((resolve,reject)=>{listener=resolve;signal.addEventListener('abort',listener,{once:true});timer=setTimeout(()=>reject(Error('ABORTSIGNAL_TIMEOUT_OPERATION_FAILED')),250);if(signal.aborted)resolve();});report.checks.push({feature:'http-timeout',status:'ENV_OK',operation:'Owned AbortSignal.timeout abort event before deadline'});}catch(error){block(report,'http-timeout',error);}finally{clearTimeout(timer);if(signal&&listener){try{signal.removeEventListener('abort',listener);}catch(error){block(report,'http-timeout-cleanup',error);}}}}
export async function assessActivityEnvironment({usesSqlite=false,usesHttp=false,usesHttpTimeout=false,...options}={}){
 const report=await assessEnvironment({...options,features:[...(usesSqlite?['sqlite']:[]),...(usesHttp||usesHttpTimeout?['http']:[])],usesNpm:false});
 if(!report.exitCode&&usesHttpTimeout)await probeTimeout(report);
 if(!report.exitCode&&usesSqlite){let db,pending,release,timer;try{
  const support=await import('./store.mjs');for(const name of ['database','bookingStore','snapshot'])if(typeof support[name]!=='function')throw Error('SQLITE_STORE_API_MISSING '+name);
  db=support.database();const store=support.bookingStore(db);for(const name of ['managed','event','duplicate','seats','create','audit'])if(typeof store[name]!=='function')throw Error('SQLITE_ADAPTER_API_MISSING '+name);
  const original=support.snapshot(db);if(original.available!==5||original.bookings!==0||original.audits!==0)throw Error('SQLITE_STORE_INITIAL_STATE_FAILED');
  let entered,settled=false;const ready=new Promise(resolve=>entered=resolve),held=new Promise(resolve=>release=resolve),marker={owned:true};
  pending=store.managed(async()=>{db.prepare('UPDATE events SET available=? WHERE id=?').run(4,1);entered();await held;return marker;});pending.then(()=>settled=true,()=>settled=true);
  await Promise.race([ready,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('SQLITE_MANAGED_ENTRY_TIMEOUT')),1000);})]);clearTimeout(timer);timer=null;await Promise.resolve();
  if(settled||support.snapshot(db).available!==4)throw Error('SQLITE_MANAGED_PREMATURE_SETTLEMENT');
  release();if(await pending!==marker||support.snapshot(db).available!==4)throw Error('SQLITE_MANAGED_COMMIT_FAILED');pending=null;
  const failure=Error('owned-rollback-probe');let rejected;try{await store.managed(async()=>{db.prepare('UPDATE events SET available=? WHERE id=?').run(2,1);throw failure;});}catch(error){rejected=error;}
  if(rejected!==failure||support.snapshot(db).available!==4)throw Error('SQLITE_MANAGED_ROLLBACK_FAILED');
  await store.managed(async()=>db.prepare('UPDATE events SET available=? WHERE id=?').run(5,1));if(support.snapshot(db).available!==5)throw Error('SQLITE_MANAGED_RECOVERY_FAILED');
  db.close();db=null;report.checks.push({feature:'s07-sqlite-store',status:'ENV_OK',operation:'Actual local schema/seed, held same-connection managed settlement, commit, rollback identity, independent state and recovery; close'});
 }catch(error){block(report,'s07-sqlite-store',error);}finally{clearTimeout(timer);release?.();if(pending){try{await pending;}catch(error){block(report,'s07-managed-cleanup',error);}}if(db){try{db.close();}catch(error){block(report,'s07-sqlite-close',error);}}}}
 return report;
}
