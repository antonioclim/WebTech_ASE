import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, lstatSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const projectRoots = [
  '02_PROJECTS/P01_SHARED_WORKSHOP_STATE/student',
  '02_PROJECTS/P02_NOTIFICATION_CENTER_OPTIONAL/student',
  '02_PROJECTS/P03_ARCHITECTURE_COMPARISON/student'
];
const mutable = new Set([
  projectRoots[0] + '/src/state/workshop-state.jsx',
  projectRoots[1] + '/src/store/notifications-slice.js',
  projectRoots[2] + '/src/decision/compare-architectures.js'
]);
const generated = new Set(projectRoots.flatMap(p => ['node_modules', 'dist', 'coverage', '.vite'].map(d => p + '/' + d)));
const specials = new Set(['90_AUDIT/MANIFEST.json', '90_AUDIT/PACKAGE_ID.txt']);
const digest = value => createHash('sha256').update(value).digest('hex');

export function validateManifest(manifest) {
  if (!manifest || manifest.schema !== 'TW2026_S10_STUDENT_MANIFEST/1.0' || !Array.isArray(manifest.entries)) throw Error('INVALID_MANIFEST_SCHEMA');
  const seen = new Set(), folded = new Set();
  let previous = '';
  for (const e of manifest.entries) {
    if (!e || typeof e.path !== 'string' || !e.path || e.path.includes('\\') || e.path.startsWith('/') || e.path.split('/').some(p => !p || p === '.' || p === '..' || /[<>:"|?*\x00-\x1f]/.test(p) || /[. ]$/.test(p) || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(p))) throw Error('UNSAFE_MANIFEST_PATH');
    if (specials.has(e.path) || generated.has(e.path) || [...generated].some(g => e.path.startsWith(g + '/'))) throw Error('EXCLUDED_MANIFEST_PATH ' + e.path);
    if (seen.has(e.path) || folded.has(e.path.normalize('NFC').toLowerCase())) throw Error('DUPLICATE_MANIFEST_PATH ' + e.path);
    if (previous && previous > e.path) throw Error('UNSORTED_MANIFEST_PATHS');
    if (!/^[a-f0-9]{64}$/.test(e.sha256) || !Number.isSafeInteger(e.bytes) || e.bytes < 0 || typeof e.mutable !== 'boolean') throw Error('INVALID_MANIFEST_ENTRY ' + e.path);
    if (e.mutable !== mutable.has(e.path)) throw Error('INVALID_MUTABILITY ' + e.path);
    previous = e.path; seen.add(e.path); folded.add(e.path.normalize('NFC').toLowerCase());
  }
  for (const p of mutable) if (!seen.has(p)) throw Error('MISSING_MUTABLE_ENTRY ' + p);
  return new Map(manifest.entries.map(e => [e.path, e]));
}

function walk(root) {
  const files = [];
  function visit(dir) {
    for (const name of readdirSync(dir).sort()) {
      const path = join(dir, name), stat = lstatSync(path), rel = relative(root, path).split('\\').join('/');
      if (stat.isSymbolicLink()) throw Error('SYMLINK ' + rel);
      if (stat.isDirectory()) { if (!generated.has(rel)) visit(path); }
      else if (stat.isFile()) files.push(rel);
      else throw Error('SPECIAL_FILE ' + rel);
    }
  }
  visit(root); return files;
}

export function verifyPackage(root = ROOT) {
  try {
    const manifest = JSON.parse(readFileSync(join(root, '90_AUDIT/MANIFEST.json'), 'utf8'));
    const expected = validateManifest(manifest), allowed = new Set([...expected.keys(), ...specials]), problems = [];
    const actual = new Set(walk(root));
    for (const p of actual) if (!allowed.has(p)) problems.push('EXTRA ' + p);
    for (const [p, entry] of expected) {
      if (!actual.has(p)) problems.push('MISSING ' + p);
      else if (!entry.mutable) {
        const bytes = readFileSync(join(root, p));
        if (bytes.length !== entry.bytes || digest(bytes) !== entry.sha256) problems.push('MODIFIED ' + p);
      }
    }
    const id = digest(JSON.stringify({ schema: manifest.schema, entries: manifest.entries }));
    const stored = readFileSync(join(root, '90_AUDIT/PACKAGE_ID.txt'), 'utf8').trim();
    if (!/^[a-f0-9]{64}$/.test(stored) || id !== stored) problems.push('PACKAGE_ID_MISMATCH');
    console.log(problems.length ? 'FAIL_PACKAGE_INTEGRITY' : 'PASS_PACKAGE_INTEGRITY_EXACT_SET');
    console.log('PACKAGE_ID ' + stored);
    if (problems.length) console.log(problems.join('\n'));
    return problems.length ? 2 : 0;
  } catch (error) {
    console.error('FAIL_PACKAGE_INTEGRITY ' + error.message); return 2;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) process.exitCode = verifyPackage();
