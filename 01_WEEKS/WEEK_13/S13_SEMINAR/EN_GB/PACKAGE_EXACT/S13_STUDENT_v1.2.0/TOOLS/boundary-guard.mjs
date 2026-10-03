import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
export const hash = bytes => createHash('sha256').update(bytes).digest('hex');
// A conservative portable namespace policy. Root directory names are not members.
const namespaceKey = rel => rel.normalize('NFKC').toUpperCase().toLowerCase();
function assertPortableMember(rel) {
  for(const part of rel.split('/')) {
    const normal=part.normalize('NFKC');
    if(!normal || normal==='.' || normal==='..' || /[<>:"\\|?*\x00-\x1f\x7f]/.test(normal) || /[. ]$/.test(normal) || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(normal)) throw new Error('BLOCKED_PORTABLE_NAMESPACE: '+rel);
  }
}
export function assertRegularAncestors(root) {
  if(!path.isAbsolute(root))throw new Error('BLOCKED_RELATIVE_ROOT');
  let cursor = path.parse(root).root;
  const first=fs.lstatSync(cursor);
  if(!first.isDirectory() || first.isSymbolicLink())throw new Error('BLOCKED_UNSAFE_ANCESTOR');
  for (const part of root.slice(cursor.length).split(path.sep).filter(Boolean)) {
    cursor = path.join(cursor,part);
    const st=fs.lstatSync(cursor);
    if (!st.isDirectory() || st.isSymbolicLink()) throw new Error('BLOCKED_UNSAFE_ANCESTOR');
  }
}
export function catalogue(root,{allowedPaths=null}={}) {
  assertRegularAncestors(root); const out = new Map(), admitted=[],portable=new Set(),allowedDirectories=new Set();let entries=0,total=0;
  if(allowedPaths)for(const rel of allowedPaths){const parts=rel.split('/');for(let i=1;i<parts.length;i++)allowedDirectories.add(parts.slice(0,i).join('/'));}
  function walk(dir) {
    for (const entry of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name,'en'))) {
      const file=path.join(dir,entry.name), st=fs.lstatSync(file), rel=path.relative(root,file).split(path.sep).join('/');
      if(++entries>10000 || rel.length>220 || rel.split('/').length>32)throw new Error('BLOCKED_FINITE_NAMESPACE');
      assertPortableMember(rel);const key=namespaceKey(rel);if(portable.has(key))throw new Error('BLOCKED_PORTABLE_COLLISION: '+rel);portable.add(key);
      if (st.isSymbolicLink() || (!st.isFile() && !st.isDirectory())) throw new Error('BLOCKED_UNSAFE_OBJECT: '+rel);
      if (st.isDirectory()) {if(allowedPaths&&!allowedDirectories.has(rel))throw new Error('BLOCKED_UNEXPECTED_DIRECTORY: '+rel);walk(file);} else {
        if(st.nlink!==1)throw new Error('BLOCKED_HARDLINK_OBJECT: '+rel);
        if(allowedPaths&&!allowedPaths.has(rel))throw new Error('BLOCKED_UNEXPECTED_FILE: '+rel);
        total+=st.size;if(!Number.isSafeInteger(st.size)||st.size<0||st.size>64*1024*1024||!Number.isSafeInteger(total)||total>512*1024*1024)throw new Error('BLOCKED_FINITE_BYTES');
        admitted.push({file,rel,bytes:st.size});
      }
    }
  }
  walk(root);for(const f of admitted)out.set(f.rel,{bytes:f.bytes,sha256:hash(fs.readFileSync(f.file))});return out;
}
export function verifyBoundary(root,authority,{initial=false}={}) {
  if(authority?.schema!=='TW2026_S13_PROTECTION_AUTHORITY/1.0'||typeof authority.allowed_edit!=='string'||!authority.protected||typeof authority.protected!=='object'||!Array.isArray(authority.bookkeeping))throw new Error('BLOCKED_PROTECTION_AUTHORITY_SCHEMA');
  const allowed=authority.allowed_edit,known=new Set([...Object.keys(authority.protected),...authority.bookkeeping,allowed]),files=catalogue(root,{allowedPaths:known});
  for(const rel of authority.bookkeeping)if(!files.has(rel))throw new Error('BLOCKED_MISSING_BOOKKEEPING: '+rel);
  for (const [rel,identity] of Object.entries(authority.protected)) {
    const actual=files.get(rel); if(!actual || actual.bytes!==identity.bytes || actual.sha256!==identity.sha256) throw new Error('BLOCKED_PROTECTED_IDENTITY: '+rel);
  }
  for(const rel of files.keys()) if(!(rel in authority.protected) && !authority.bookkeeping.includes(rel) && rel!==allowed) throw new Error('BLOCKED_UNEXPECTED_FILE: '+rel);
  const edit=files.get(allowed);if(!edit) throw new Error('BLOCKED_MISSING_ASSESSED_FILE');
  if(initial && (edit.sha256!==authority.initial_edit.sha256 || edit.bytes!==authority.initial_edit.bytes)) throw new Error('BLOCKED_NOT_INITIAL_STARTER');
  return {protected:Object.keys(authority.protected).length,editable:allowed,editable_identity:edit,initial};
}
