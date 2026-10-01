/** Read-only local source-boundary check. Does not run code, install packages or access a network. */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const id=process.argv[2];
if(!['p01','p02','p03'].includes(id)){console.error('Usage: node tools/verify-boundary.mjs p01|p02|p03');process.exit(2);}
const contract=JSON.parse(await fs.readFile(path.join(root,'PROJECT_BASELINES.json'),'utf8'))[id];
const target=path.join(root,contract.root);const all=[];const skipped=[];
async function walk(dir,rel=''){
 for(const entry of await fs.readdir(dir,{withFileTypes:true})){
  const r=rel?rel+'/'+entry.name:entry.name;
  if(entry.isSymbolicLink())throw Error('SYMLINK_BLOCKED: '+r);
  if(entry.isDirectory()){
   if(contract.generated_exclusions.includes(r)){skipped.push(r);continue;}
   await walk(path.join(dir,entry.name),r);
  }else if(entry.isFile())all.push(r);else throw Error('SPECIAL_FILE_BLOCKED: '+r);
 }
}
try{
 for(let here=target;here!==root;here=path.dirname(here)){if((await fs.lstat(here)).isSymbolicLink())throw Error('SYMLINK_ANCESTOR_BLOCKED');}
 await walk(target);const changes=[],issues=[];const permitted=new Set(contract.allowed_changes);
 for(const r of all){const bytes=await fs.readFile(path.join(target,r)),h=crypto.createHash('sha256').update(bytes).digest('hex');
  if(!Object.hasOwn(contract.files,r)){(permitted.has(r)?changes:issues).push({path:r,status:'ADDED'});}
  else if(contract.files[r]!==h)(permitted.has(r)?changes:issues).push({path:r,status:'MODIFIED'});
 }
 for(const r of Object.keys(contract.files))if(!all.includes(r))issues.push({path:r,status:'MISSING'});
 console.log(JSON.stringify({status:issues.length?'BOUNDARY_FAIL':'BOUNDARY_ONLY_PASS',project:id,changes,issues,excluded_generated_directories:skipped,
 limitation:'Source identity only. Allowed edits may still be incomplete or wrong. Ignored dependencies/generated output are not qualified.'},null,2));process.exitCode=issues.length?1:0;
}catch(e){console.error('BOUNDARY_CHECK_ERROR: '+e.message);process.exitCode=2;}
