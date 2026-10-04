import {createHash} from 'node:crypto';
import {readFileSync,lstatSync,readdirSync,realpathSync} from 'node:fs';
import path from 'node:path';
export const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const special=new Set(['90_AUDIT/PAYLOAD_SHA256SUMS.txt','90_AUDIT/PACKAGE_ID.txt']);
export function safePath(p){return typeof p==='string'&&p.length>0&&p.length<=220&&!p.includes('\\')&&!p.includes(':')&&!/[\x00-\x1f]/.test(p)&&!p.startsWith('/')&&p.split('/').every(v=>v!==''&&v!=='.'&&v!=='..'&&!/[. ]$/.test(v)&&!/[<>"|?*]/.test(v)&&! /^(con|prn|aux|nul|com[1-9¹²³]|lpt[1-9¹²³])(?:\.|$)/i.test(v));}
export function verify(root,{allowWork=false}={}) {
 const problems=[];let manifestText,id,config;const entries=new Map();let actual=[];const directories=[];let visited=0;
 try{
  if(lstatSync(root).isSymbolicLink())throw new Error('ROOT_SYMLINK');
  const walk=(dir,depth=0)=>{if(depth>40)throw new Error('DEPTH_LIMIT');for(const n of readdirSync(dir).sort()){const p=path.join(dir,n),rel=path.relative(root,p).split(path.sep).join('/'),st=lstatSync(p);if(!safePath(rel))throw new Error('UNSAFE_PATH '+rel);if(st.isSymbolicLink())throw new Error('SYMLINK '+rel);if(++visited>4000)throw new Error('ENTRY_COUNT_LIMIT');if(st.isDirectory()){directories.push(rel);walk(p,depth+1);}else if(st.isFile())actual.push(rel);else throw new Error('NONREGULAR '+rel);}};
  walk(root);if(actual.length>2000)throw new Error('FILE_COUNT_LIMIT');
  if(new Set(actual.map(x=>x.normalize('NFC').toLowerCase())).size!==actual.length)throw new Error('CASE_OR_UNICODE_COLLISION');
  manifestText=readFileSync(path.join(root,'90_AUDIT/PAYLOAD_SHA256SUMS.txt'),'utf8');
  id=readFileSync(path.join(root,'90_AUDIT/PACKAGE_ID.txt'),'utf8');
  if(!/^[0-9a-f]{64}\n$/.test(id))throw new Error('INVALID_PACKAGE_ID');
  if(id.trim()!==hash(Buffer.from(manifestText,'utf8')))throw new Error('PACKAGE_ID_MISMATCH');
  if(!manifestText.endsWith('\n')||manifestText.includes('\r'))throw new Error('MANIFEST_ENCODING');
  const names=[];
  for(const line of manifestText.slice(0,-1).split('\n')){
   const m=/^([0-9a-f]{64})  (.+)$/.exec(line);if(!m||!safePath(m[2])||special.has(m[2])||entries.has(m[2]))throw new Error('INVALID_MANIFEST_LINE');
   entries.set(m[2],m[1]);names.push(m[2]);
  }
  if(JSON.stringify(names)!==JSON.stringify([...names].sort()))throw new Error('MANIFEST_ORDER');
  const expected=new Set([...entries.keys(),...special]);
  const expectedDirs=new Set();for(const p of expected){const a=p.split('/');a.pop();while(a.length){expectedDirs.add(a.join('/'));a.pop();}}
  for(const p of directories)if(!expectedDirs.has(p))problems.push('EXTRA_DIRECTORY '+p);
  for(const p of actual)if(!expected.has(p))problems.push('EXTRA '+p);
  for(const p of expected)if(!actual.includes(p))problems.push('MISSING '+p);
  const cfgPath='90_AUDIT/KIT_CONFIG.json';
  if(!entries.has(cfgPath))throw new Error('CONFIG_NOT_IN_MANIFEST');
  const cfgBytes=readFileSync(path.join(root,cfgPath));if(hash(cfgBytes)!==entries.get(cfgPath))throw new Error('CONFIG_MODIFIED');
  config=JSON.parse(cfgBytes);if(config.version!=='6.1.1'||!['student','teacher'].includes(config.role))throw new Error('CONFIG_IDENTITY');
  const declared=Object.values(config.projects).map(p=>p.editable).filter(Boolean);
  const required=['02_PROJECTS/P01_HTTP_DETECTIVE/case-report.json','02_PROJECTS/P02_TINY_HTTP_SERVER/src/application-handler.js'];
  if(config.role==='student'&&JSON.stringify([...declared].sort())!==JSON.stringify(required))throw new Error('EDIT_DOMAIN');
  if(config.role==='teacher'&&declared.length)throw new Error('PRIVATE_EDIT_DOMAIN');
  for(const [rel,digest] of entries){
   if(!actual.includes(rel))continue;
   if(allowWork&&declared.includes(rel))continue;
   const st=lstatSync(path.join(root,rel));if(st.size>32*1024*1024)throw new Error('FILE_SIZE_LIMIT');
   if(hash(readFileSync(path.join(root,rel)))!==digest)problems.push('MODIFIED '+rel);
  }
 }catch(e){problems.push(e.message);}
 return {verdict:problems.length?'FAIL_PACKAGE_INTEGRITY_EXACT_SET':allowWork?'PASS_WORK_EDIT_BOUNDARY':'PASS_PACKAGE_INTEGRITY_EXACT_SET',ok:problems.length===0,packageId:id?.trim(),files:actual.length,manifestEntries:entries.size,problems,config};
}
