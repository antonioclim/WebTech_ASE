#!/usr/bin/env node
// Integrity checks only. This program does not execute learner or course code.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const MANIFEST = 'metadata/current-integrity/REPOSITORY_SHA256SUMS.txt';
const PACKAGE_ID = 'metadata/current-integrity/REPOSITORY_PACKAGE_ID.txt';
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const safe = name => {
  if (typeof name !== 'string' || !name || name.startsWith('/') || name.includes('\\')) throw Error('unsafe-path');
  for (const part of name.split('/')) {
    if (['', '.', '..'].includes(part) || /[\x00-\x1f\x7f<>:"|?*]/.test(part) || /[ .]$/.test(part) || /^(CON|PRN|AUX|NUL|COM[1-9¹²³]|LPT[1-9¹²³])(?:\.|$)/i.test(part)) throw Error('unsafe-path');
  }
  return name;
};
try {
  const args = process.argv.slice(2);
  if (args.length > 1 || (args.length && args[0] !== '--allow-student-edits')) throw Error('unsupported-argument');
  const edited = args.length === 1;
  if (fs.lstatSync(root).isSymbolicLink()) throw Error('symlink-root');
  const read = name => {
    const item = path.join(root, safe(name));
    let parent = root;
    for (const part of name.split('/')) { parent=path.join(parent,part); if (fs.lstatSync(parent).isSymbolicLink()) throw Error('symlink'); }
    if (!fs.lstatSync(item).isFile()) throw Error('non-regular-file');
    return fs.readFileSync(item);
  };
  const bytes = read(MANIFEST);
  if (read(PACKAGE_ID).toString('utf8') !== hash(bytes) + '\n') throw Error('package-id-mismatch');
  const rows = new Map();
  const text = bytes.toString('utf8');
  if (!text.endsWith('\n')) throw Error('manifest-format');
  for (const line of text.slice(0,-1).split('\n')) {
    const match = /^([0-9a-f]{64})  (.+)$/.exec(line);
    if (!match) throw Error('manifest-format');
    const name = safe(match[2]);
    if (rows.has(name) || [MANIFEST,PACKAGE_ID].includes(name)) throw Error('manifest-duplicate-or-cycle');
    rows.set(name,match[1]);
  }
  const metadataBytes = read('metadata/CLASSROOM_COLLECTION.json');
  if (hash(metadataBytes) !== rows.get('metadata/CLASSROOM_COLLECTION.json')) throw Error('metadata-mismatch');
  const meta = JSON.parse(metadataBytes);
  if (meta.schema !== 'webtech-classroom-collection/v1' || meta.distribution_version !== '3.0.0' || meta.qualificationVerdict !== 'NOT_FINAL' || meta.native_acceptance !== false || meta.publication_qualified !== false) throw Error('metadata-scope');
  if (!Array.isArray(meta.editable_files) || meta.editable_files.length !== 38 || new Set(meta.editable_files).size !== 38 || !Array.isArray(meta.generated_directories)) throw Error('metadata-edit-policy');
  const allowed = new Set(meta.editable_files.map(safe));
  if ([...allowed].some(name => !rows.has(name) || !/^01_WEEKS\/WEEK_([0-9]{2})\/S\1_SEMINAR\/EN_GB\/CLASSROOM_RC6\/(targets|student)\/.+\.(mjs|js|json|css)$/.test(name))) throw Error('metadata-edit-policy');
  const generated = new Set(meta.generated_directories.map(safe));
  const actual = new Set();
  const nodes = new Map();
  let visited = 0;
  const walk = (directory, prefix='') => {
    for (const entry of fs.readdirSync(directory,{withFileTypes:true})) {
      const name = safe(prefix + entry.name);
      const item = path.join(directory,entry.name);
      const stat = fs.lstatSync(item);
      if (stat.isSymbolicLink()) throw Error('symlink');
      const key = name.normalize('NFC').toLowerCase();
      if (nodes.has(key) && nodes.get(key)!==name) throw Error('case-or-unicode-collision');
      nodes.set(key,name);
      if (name === '.git') continue;
      if (++visited > 20000) throw Error('inventory-limit');
      if (stat.isDirectory()) {
        if (edited && generated.has(name)) continue;
        walk(item,name+'/');
      } else if (stat.isFile()) actual.add(name);
      else throw Error('non-regular-entry');
    }
  };
  walk(root);
  const expected = new Set([...rows.keys(),MANIFEST,PACKAGE_ID]);
  if (actual.size !== expected.size || [...actual].some(name=>!expected.has(name))) throw Error('inventory-mismatch');
  const changed=[];
  for (const [name, digest] of rows) {
    if (hash(read(name)) !== digest) {
      if (!edited || !allowed.has(name)) throw Error('protected-byte-mismatch:'+name);
      changed.push(name);
    }
  }
  console.log(JSON.stringify({schema:'webtech-classroom-local-integrity/v1',status:edited?'PASS_PROTECTED_FILES_ONLY':'PASS_INITIAL_BYTES_ONLY',files:actual.size,repository_package_id:hash(bytes),observedNode:process.version,allowedStudentChanges:changed,generatedDirectoriesExcluded:edited?[...generated]:[],studentProjectsQualified:false,qualificationVerdict:'NOT_FINAL',actionsStarted:false},null,2));
} catch (error) {
  console.error('STOP_COLLECTION_INTEGRITY: '+error.message);
  process.exitCode=2;
}
