import {assessEnvironment} from './environment.mjs';

export async function assessActivityEnvironment({usesHttp=false,usesHttpTimeout=false,...options}) {
  const report=await assessEnvironment({...options,features:usesHttp||usesHttpTimeout?['http']:['node-core'],usesNpm:false});
  if(!report.exitCode&&usesHttpTimeout){
    let signal,deadline,listener;
    try{
      if(typeof AbortSignal!=='function'||typeof AbortSignal.timeout!=='function')throw Error('ABORTSIGNAL_TIMEOUT_API_MISSING');
      signal=AbortSignal.timeout(5);
      if(typeof signal.addEventListener!=='function'||typeof signal.removeEventListener!=='function')throw Error('ABORTSIGNAL_EVENT_API_MISSING');
      await new Promise((resolve,reject)=>{
        listener=()=>resolve();signal.addEventListener('abort',listener,{once:true});
        deadline=setTimeout(()=>reject(Error('ABORTSIGNAL_TIMEOUT_OPERATION_FAILED')),250);
        if(signal.aborted)resolve();
      });
      report.checks.push({feature:'http-timeout',status:'ENV_OK',operation:'Owned AbortSignal.timeout abort event before deadline'});
    }catch(error){
      report.status='ENV_BLOCKED';report.exitCode=2;
      report.checks.push({feature:'http-timeout',status:'ENV_BLOCKED',reason:error.message,remedy:'Use a Node runtime providing working AbortSignal.timeout; rerun only this HTTP operation.'});
      report.remedy='Repair the failed HTTP timeout capability and rerun this selected command; no Express/npm installation is required.';
    }finally{clearTimeout(deadline);if(signal&&listener)signal.removeEventListener?.('abort',listener);}
  }
  return report;
}
