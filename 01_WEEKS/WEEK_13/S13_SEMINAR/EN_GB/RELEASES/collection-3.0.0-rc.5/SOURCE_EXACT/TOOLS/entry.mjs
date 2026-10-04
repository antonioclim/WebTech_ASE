import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=path.dirname(path.dirname(path.resolve(process.argv[1])));
const digest=b=>createHash('sha256').update(b).digest('hex');
const pins={"TOOLS/PROTECTION_AUTHORITY.json": "add56da93824bd469da5fe24d6a710289accafe1422bd569014d33831a11b5cd", "TOOLS/boundary-guard.mjs": "402e4901f8238e91bf85e59d9b7bc7511685e4db6b15edc27e988045fd08f734", "TOOLS/json-test-reporter.mjs": "5e1c2808ec35ac18eed839e2b0253b20f45763c97b92e087bbaeef768b5222fc", "TOOLS/run-project-tests.mjs": "8e01837f39e28f5d25ca962dbd19b30f95a3bd5b01052505e8645505df729ab3", "TOOLS/runtime-guard.mjs": "8ccba5de35df60e5890be6a86ea32af16b73b57242e87f9671e3ba2b2b9d0f0e", "TOOLS/stop-and-cleanup.mjs": "6992ca6e7cab951b7996cb86282a4b12d44dcf2c8d86b408a03a93aedaf136f0", "TOOLS/test-result-classifier.mjs": "d52ec7d5ce6573d54f5de9b9796e3d00fe7a46d31faa2a9afe38d23308325880"};
try {
  let cursor=path.parse(root).root;
  const filesystemRoot=fs.lstatSync(cursor);
  if(!filesystemRoot.isDirectory()||filesystemRoot.isSymbolicLink())throw new Error('BLOCKED_UNSAFE_ROOT_ANCESTOR');
  for(const part of root.slice(cursor.length).split(path.sep).filter(Boolean)) {cursor=path.join(cursor,part);const s=fs.lstatSync(cursor);if(!s.isDirectory() || s.isSymbolicLink()) throw new Error('BLOCKED_UNSAFE_ROOT_ANCESTOR');}
  // Admit the entire raw namespace before reading or importing any pinned tool.
  const rawNames=new Set();let rawCount=0,rawBytes=0;
  function admitRawDirectory(dir){
    for(const name of fs.readdirSync(dir)){
      const file=path.join(dir,name),rel=path.relative(root,file).split(path.sep).join('/'),st=fs.lstatSync(file);
      if(++rawCount>10000||rel.length>220||rel.split('/').length>32)throw new Error('BLOCKED_FINITE_NAMESPACE');
      for(const part of rel.split('/')){const normal=part.normalize('NFKC');if(!normal||normal==='.'||normal==='..'||/[<>:"\\|?*\x00-\x1f\x7f]/.test(normal)||/[. ]$/.test(normal)||/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(normal))throw new Error('BLOCKED_PORTABLE_NAMESPACE: '+rel);}
      const key=rel.normalize('NFKC').toUpperCase().toLowerCase();if(rawNames.has(key))throw new Error('BLOCKED_PORTABLE_COLLISION: '+rel);rawNames.add(key);
      if(st.isSymbolicLink()||(!st.isFile()&&!st.isDirectory()))throw new Error('BLOCKED_UNSAFE_OBJECT: '+rel);
      if(st.isDirectory())admitRawDirectory(file);else{if(st.nlink!==1)throw new Error('BLOCKED_HARDLINK_OBJECT: '+rel);rawBytes+=st.size;if(!Number.isSafeInteger(st.size)||st.size<0||st.size>64*1024*1024||!Number.isSafeInteger(rawBytes)||rawBytes>512*1024*1024)throw new Error('BLOCKED_FINITE_BYTES');}
    }
  }
  admitRawDirectory(root);
  const admittedPins=[];
  for(const [rel,sha] of Object.entries(pins)) {
    let file=root;const segments=rel.split('/');
    for(let i=0;i<segments.length;i++){file=path.join(file,segments[i]);const s=fs.lstatSync(file);if(s.isSymbolicLink()||(i===segments.length-1?(!s.isFile()||s.nlink!==1):!s.isDirectory()))throw new Error('BLOCKED_VERIFIER_PATH: '+rel);if(i===segments.length-1&&(!Number.isSafeInteger(s.size)||s.size<0||s.size>8*1024*1024))throw new Error('BLOCKED_FINITE_VERIFIER_BYTES');}
    admittedPins.push({file,sha,rel});
  }
  for(const {file,sha,rel} of admittedPins){
    if(digest(fs.readFileSync(file))!==sha)throw new Error('BLOCKED_VERIFIER_AUTHORITY: '+rel);
  }
  const {catalogue,verifyBoundary}=await import('./boundary-guard.mjs');
  const authority=JSON.parse(fs.readFileSync(path.join(root,'TOOLS','PROTECTION_AUTHORITY.json'),'utf8'));
  const action=process.argv[2];
  if(action==='package') {
    verifyBoundary(root,authority);
    const files=catalogue(root,{allowedPaths:new Set([...Object.keys(authority.protected),...authority.bookkeeping,authority.allowed_edit])}),manifest=fs.readFileSync(path.join(root,'SHA256SUMS.txt'),'utf8'),pid=fs.readFileSync(path.join(root,'PACKAGE_ID.txt'),'utf8');
    if(pid!==digest(Buffer.from(manifest))+'\n') throw new Error('BLOCKED_PACKAGE_ID');
    const seen=new Set();for(const line of manifest.trimEnd().split('\n')) {const m=/^([a-f0-9]{64})  (.+)$/.exec(line);if(!m || seen.has(m[2]) || !files.has(m[2]) || files.get(m[2]).sha256!==m[1])throw new Error('BLOCKED_MANIFEST_IDENTITY');seen.add(m[2]);}
    if(files.size!==seen.size+2 || !files.has('SHA256SUMS.txt')||!files.has('PACKAGE_ID.txt')) throw new Error('BLOCKED_PACKAGE_EXACT_SET');
    console.log('PASS_PACKAGE_BYTE_IDENTITIES: '+seen.size+' manifest entries');
  } else if(action==='cleanup') {
    verifyBoundary(root,authority);
    const {stopOwnedResources}=await import('./stop-and-cleanup.mjs');stopOwnedResources(root);
  } else {
    const {checkEnvironment}=await import('./runtime-guard.mjs');
    const runtime=checkEnvironment();
    if(action==='environment') console.log(JSON.stringify({result:'PASS_EXACT_RUNTIME',runtime}));
    else {
      const initial=action==='initial'||(action==='tests' && process.argv[4]==='initial');
      const boundary=verifyBoundary(root,authority,{initial});
      if(action==='initial') console.log(JSON.stringify({result:'PASS_INITIAL_PROTECTED_BOUNDARY',boundary,runtime,behaviour_acceptance:false}));
      else if(action==='work'||action==='tests') {
        const preserved=Object.fromEntries(authority.bookkeeping.map(rel=>[rel,digest(fs.readFileSync(path.join(root,rel)))]));
        const {runProjectTests}=await import('./run-project-tests.mjs');process.exitCode=runProjectTests(root,action==='work'?'p01':process.argv[3],action==='work'?'work':process.argv[4]||'work',authority);
        const after=verifyBoundary(root,authority,{initial});
        if(after.editable_identity.sha256!==boundary.editable_identity.sha256)throw new Error('BLOCKED_ASSESSED_FILE_CHANGED_DURING_TESTS');
        for(const [rel,sha] of Object.entries(preserved))if(digest(fs.readFileSync(path.join(root,rel)))!==sha)throw new Error('BLOCKED_BOOKKEEPING_CHANGED_DURING_TESTS');
      }
      else throw new Error('BLOCKED_UNKNOWN_ACTION');
    }
  }
} catch(error) {console.error(String(error.message||'BLOCKED_CHECK_FAILED'));process.exitCode=2;}
