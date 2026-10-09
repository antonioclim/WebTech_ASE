import {runOwnedProcess} from './owned-process.mjs';
export async function runOwnedWorker(args,{cwd,env=process.env,timeoutMs=10000,maxBytes=1000000}={}){
 if(!Array.isArray(args)||args.some(x=>typeof x!=='string')||typeof cwd!=='string'||!Number.isInteger(timeoutMs)||timeoutMs<10||timeoutMs>60000||!Number.isInteger(maxBytes)||maxBytes<1)throw new TypeError('Invalid bounded worker options');
 const result=await runOwnedProcess(process.execPath,args,{cwd,env,timeoutMs,maxBytes});
 console.error(JSON.stringify({status:'OWNED_WORKER_TEMPORARY_DIRECTORY',...result.temporaryWorkspace,processOwnership:result.processOwnership,treeCleanup:result.treeCleanup}));
 return {...result,status:result.exitCode,error:result.reason?{code:result.reason}:undefined};
}
export function assertWorkerCompleted(result){if(result.error||result.signal||result.status===null){const error=Error('BOUNDED_CHILD_FAULT '+(result.error?.code||result.signal||'NO_EXIT_STATUS'));error.temporaryWorkspace=result.temporaryWorkspace;throw error;}if(result.status!==0&&!result.stdout?.trim()){const error=Error('WORKER_EXIT_ERROR '+result.status);error.temporaryWorkspace=result.temporaryWorkspace;throw error;}}
