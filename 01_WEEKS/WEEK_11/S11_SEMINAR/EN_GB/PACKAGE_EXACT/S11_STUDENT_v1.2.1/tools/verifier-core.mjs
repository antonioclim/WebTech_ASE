import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const PROJECTS = Object.freeze({ p01: { root: 'capstone/p01/student', allowed: 'src/authentication.js' }, p02: { root: 'projects/p02/student', allowed: 'src/authorization-policy.js' }, p03: { root: 'portfolio/p03-reduced/student', allowed: 'src/security-boundary.js' } });
export const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
export function rejectRuntimeInjection() {
  const forbidden = Object.keys(process.env).filter(key => /^(?:NODE_OPTIONS|NODE_PATH|NODE_TEST_CONTEXT|NODE_TEST_REPORTER|NODE_TEST_REPORTER_DESTINATION|NODE_V8_COVERAGE)$/iu.test(key) && process.env[key]);
  const unsupportedExecArgs = process.execArgv;
  if (forbidden.length || unsupportedExecArgs.length) throw new Error('Inherited runtime injection or test flags are refused. Clear: ' + forbidden.join(', ') + '; invoke the verifier with plain node and no runtime flags.');
}
export function refuse(message) { throw new Error(message); }
export function relativePath(name) {
  if (typeof name !== 'string' || !name || /[\\\u0000\r\n:]/u.test(name) || name.startsWith('/') || name.split('/').some(x => !x || x === '.' || x === '..')) refuse('Unsafe relative path: ' + String(name));
  return name;
}
export function local(root, name) { return path.join(root, ...relativePath(name).split('/')); }
export function regularFile(filename) { const s = fs.lstatSync(filename); if (!s.isFile() || s.isSymbolicLink()) refuse('A regular file is required: ' + filename); return fs.readFileSync(filename); }
export function trustedDirectory(root, name) {
  const components = name === undefined ? [] : relativePath(name).split('/');
  let directory = path.resolve(root);
  for (const component of [null, ...components]) {
    if (component !== null) directory = path.join(directory, component);
    const st = fs.lstatSync(directory);
    if (!st.isDirectory() || st.isSymbolicLink()) refuse('A real directory without symbolic-link ancestors is required: ' + directory);
  }
  return directory;
}
export function walk(root, { omitGenerated = false, projectRoot = false } = {}) {
  const files = [], directories = [], omitted = [];
  if (!fs.lstatSync(root).isDirectory() || fs.lstatSync(root).isSymbolicLink()) refuse('A real root directory is required.');
  function visit(directory, prefix = '') {
    for (const name of fs.readdirSync(directory).sort()) {
      const rel = relativePath(prefix ? prefix + '/' + name : name), full = local(root, rel), st = fs.lstatSync(full);
      if (st.isSymbolicLink()) refuse('Symbolic links are refused: ' + rel);
      if (st.isDirectory()) {
        directories.push(rel);
        const generated = Object.values(PROJECTS).some(p => rel === p.root + '/node_modules') || (projectRoot && rel === 'node_modules');
        if (omitGenerated && generated) { checkGenerated(full, rel); omitted.push(rel); }
        else visit(full, rel);
      } else if (st.isFile()) files.push(rel);
      else refuse('Special files are refused: ' + rel);
    }
  }
  function checkGenerated(directory, prefix) {
    for (const name of fs.readdirSync(directory)) {
      const full = path.join(directory, name), rel = relativePath(prefix + '/' + name), st = fs.lstatSync(full);
      if (st.isSymbolicLink()) refuse('Symbolic links are refused, including inside generated directories: ' + rel);
      if (st.isDirectory()) checkGenerated(full, rel);
      else if (!st.isFile()) refuse('Special generated files are refused: ' + rel);
    }
  }
  visit(root); return { files, directories, omitted };
}
export function readManifest(root = ROOT) {
  const bytes = regularFile(path.join(root, 'SHA256SUMS.txt')), text = bytes.toString('utf8');
  if (!text.endsWith('\n') || text.includes('\r') || !Buffer.from(text, 'utf8').equals(bytes)) refuse('Manifest must be canonical UTF-8 with LF and a final newline.');
  const records = new Map(), names = [];
  for (const line of text.slice(0, -1).split('\n')) {
    const m = /^([0-9a-f]{64})  (.+)$/u.exec(line);
    if (!m) refuse('Malformed manifest record.');
    const name = relativePath(m[2]);
    if (name === 'PACKAGE_ID.txt' || name === 'SHA256SUMS.txt' || records.has(name)) refuse('Duplicate or excluded identity entry: ' + name);
    records.set(name, m[1]); names.push(name);
  }
  if (!names.length || names.some((n, i) => i && names[i - 1] >= n)) refuse('Manifest records must be non-empty and strictly sorted by path.');
  const identity = regularFile(path.join(root, 'PACKAGE_ID.txt')).toString('utf8');
  if (identity !== digest(bytes) + '\n') refuse('PACKAGE_ID does not equal SHA-256 of the exact manifest bytes.');
  return { records, identity: identity.trim(), bytes };
}
export function checkPackage(root = ROOT, { allowAssessedEdits = false, allowGenerated = false } = {}) {
  const { records, identity } = readManifest(root), inventory = walk(root, { omitGenerated: allowGenerated });
  const expected = new Set([...records.keys(), 'SHA256SUMS.txt', 'PACKAGE_ID.txt']);
  const missing = [...expected].filter(n => !inventory.files.includes(n));
  const extra = inventory.files.filter(n => !expected.has(n));
  if (missing.length || extra.length) refuse('Exact file set differs. Missing: ' + missing.join(', ') + '; untracked: ' + extra.join(', '));
  const allowedDirectories = new Set();
  for (const n of expected) { const parts = n.split('/'); for (let i = 1; i < parts.length; i++) allowedDirectories.add(parts.slice(0, i).join('/')); }
  const extraDirectories = inventory.directories.filter(n => !allowedDirectories.has(n) && !inventory.omitted.some(o => n === o || n.startsWith(o + '/')));
  if (extraDirectories.length) refuse('Untracked directories: ' + extraDirectories.join(', '));
  const permitted = new Set(allowAssessedEdits ? Object.values(PROJECTS).map(p => p.root + '/' + p.allowed) : []), changed = [];
  for (const [n, sha] of records) if (digest(regularFile(local(root, n))) !== sha) { if (!permitted.has(n)) refuse('Protected file hash differs: ' + n); changed.push(n); }
  return { identity, regularFiles: inventory.files.length, manifestEntries: records.size, changed, generatedDirectoriesExcluded: inventory.omitted };
}
export function checkBoundary(projectId, root = ROOT) {
  if (!Object.hasOwn(PROJECTS, projectId)) refuse('Unknown project; choose p01, p02 or p03.');
  const trusted = PROJECTS[projectId], { records } = readManifest(root), bytes = regularFile(path.join(root, 'PROJECT_BASELINES.json'));
  if (digest(bytes) !== records.get('PROJECT_BASELINES.json')) refuse('PROJECT_BASELINES is not anchored to the package manifest.');
  const baselines = JSON.parse(bytes), record = baselines[projectId];
  if (!record || record.root !== trusted.root || record.allowed !== trusted.allowed || !record.files || typeof record.files !== 'object' || Array.isArray(record.files)) refuse('Baseline project contract differs from the fixed assessed boundary.');
  const project = trustedDirectory(root, trusted.root), configBytes = regularFile(path.join(project, 's11_boundary.json'));
  if (digest(configBytes) !== record.boundary_config_sha256 || digest(configBytes) !== records.get(trusted.root + '/s11_boundary.json')) refuse('s11_boundary.json is changed or unanchored.');
  const config = JSON.parse(configBytes);
  if (JSON.stringify(config) !== JSON.stringify({ root: record.root, allowed: record.allowed, files: record.files })) refuse('The local boundary configuration differs from PROJECT_BASELINES.');
  const inventory = walk(project, { omitGenerated: true, projectRoot: true }), expected = new Set([...Object.keys(record.files), 's11_boundary.json']);
  for (const n of [...expected]) relativePath(n);
  const missing = [...expected].filter(n => !inventory.files.includes(n)), extra = inventory.files.filter(n => !expected.has(n));
  if (missing.length || extra.length) refuse('Project file set differs. Missing: ' + missing.join(', ') + '; untracked: ' + extra.join(', '));
  const allowedDirectories = new Set(['node_modules']); for (const n of expected) { const a = n.split('/'); for (let i = 1; i < a.length; i++) allowedDirectories.add(a.slice(0, i).join('/')); }
  const unexpectedDirectories = inventory.directories.filter(n => !allowedDirectories.has(n) && !inventory.omitted.some(o => n === o || n.startsWith(o + '/')));
  if (unexpectedDirectories.length) refuse('Untracked project directories: ' + unexpectedDirectories.join(', '));
  const changed = [];
  for (const [n, sha] of Object.entries(record.files)) {
    if (!/^[0-9a-f]{64}$/u.test(sha) || records.get(trusted.root + '/' + n) !== sha) refuse('Baseline hash is malformed or not anchored: ' + n);
    if (digest(regularFile(local(project, n))) !== sha) { if (n !== trusted.allowed) refuse('Protected project file differs: ' + n); changed.push(n); }
  }
  return { project: projectId, allowed: trusted.allowed, changed, generatedDirectoriesExcluded: inventory.omitted, scope: 'BOUNDARY_ONLY; correctness and security are not certified.' };
}
export function runCLI(action) { try { rejectRuntimeInjection(); const result = action(); if (result?.then) result.then(value => console.log(JSON.stringify(value, null, 2))).catch(failCLI); else console.log(JSON.stringify(result, null, 2)); } catch (error) { failCLI(error); } }
export function failCLI(error) { console.error('STOP: ' + error.message); process.exitCode = 2; }
