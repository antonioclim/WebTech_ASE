import fs from 'node:fs';
import path from 'node:path';
export function stopOwnedResources(root) {
  const record=path.join(path.dirname(root),'S13_OWNED_RESOURCES.json');
  let metadata;try{metadata=fs.lstatSync(record);}catch(error){if(error.code==='ENOENT'){console.log('NO_OWNED_RESOURCES_RECORDED');return;}throw new Error('BLOCKED_RESOURCE_RECORD_OBSERVATION');}
  if(!metadata.isFile() || metadata.isSymbolicLink() || metadata.nlink!==1) throw new Error('BLOCKED_UNSAFE_RESOURCE_RECORD');
  if(!Number.isSafeInteger(metadata.size)||metadata.size<0||metadata.size>64*1024)throw new Error('BLOCKED_FINITE_RESOURCE_RECORD_BYTES');
  const data=JSON.parse(fs.readFileSync(record,'utf8'));
  if(!data||typeof data!=='object'||Array.isArray(data)||data.schema!=='S13_OWNED_RESOURCES/1.0' || !Array.isArray(data.resources) || data.resources.length>20) throw new Error('BLOCKED_RESOURCE_SCHEMA');
  if(!data.resources.length) {console.log('NO_OWNED_RESOURCES_RECORDED');return;}
  if(process.platform!=='linux') throw new Error('BLOCKED_NATIVE_IDENTITY_VERIFIER_UNQUALIFIED: close the original owning terminal');
  const projects=['projects/p01/student','guided/p02/student','optional/p03/student','portfolio/regression-harness/student'].map(r=>path.join(root,r));
  const verified=[];
  for(const r of data.resources) {
    if(!r||typeof r!=='object'||Array.isArray(r)||!Number.isSafeInteger(r.pid)||r.pid<=1||[process.pid,process.ppid].includes(r.pid)||r.platform!=='linux'||r.kind!=='S13_LOCAL_SERVER'||!projects.includes(r.project_root)||typeof r.start_ticks!=='string'||!/^\d+$/.test(r.start_ticks)) throw new Error('BLOCKED_RESOURCE_IDENTITY');
    let stat;try {stat=fs.readFileSync('/proc/'+r.pid+'/stat','utf8');}catch(error){if(error.code==='ENOENT')continue;throw new Error('BLOCKED_RESOURCE_OBSERVATION');}
    const fields=stat.slice(stat.lastIndexOf(')')+2).trim().split(/\s+/);
    if(fields[19]!==r.start_ticks||fs.readlinkSync('/proc/'+r.pid+'/cwd')!==r.project_root) throw new Error('BLOCKED_OWNER_IDENTITY_MISMATCH');
    verified.push(r);
  }
  // PID/start/cwd observations alone are not a launch receipt and cannot authorise killing a process.
  console.log('OBSERVED_'+verified.length+'_RECORDED_RESOURCE_IDENTITIES; no process terminated. Stop each resource in its original owning terminal and confirm exit there. Automated termination requires a separately qualified launch receipt and identity-safe native route.');
}
