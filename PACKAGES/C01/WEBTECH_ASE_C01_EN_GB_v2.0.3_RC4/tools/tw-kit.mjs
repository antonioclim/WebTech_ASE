#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { existsSync, realpathSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestName = '90_AUDIT/PAYLOAD_SHA256SUMS.txt';
const identityName = '90_AUDIT/PACKAGE_ID.txt';
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const out = (kind, message) => console.log(`${kind.padEnd(7)} ${message}`);
const rel = absolute => path.relative(root, absolute).split(path.sep).join('/');
const cfg = JSON.parse(await readFile(path.join(root, '90_AUDIT/KIT_CONFIG.json'), 'utf8'));
const requiredNode = cfg.requiredNode || 'v24.21.0';
const requiredNpm = cfg.requiredNpm || '11.19.0';
const args = process.argv.slice(2);
const command = args.shift() || 'help';
const allow = args.includes('--allow-runtime-mismatch') || process.env.TW2026_ALLOW_RUNTIME_MISMATCH === '1';

function safePath(name) {
  if (typeof name !== 'string' || !name || /[\\\x00-\x1f\x7f:]/.test(name) || path.posix.isAbsolute(name)) return false;
  return name.split('/').every(part => part && part !== '.' && part !== '..' && !/[. ]$/.test(part) && !/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\.|$)/i.test(part));
}
const caseKey = name => name.normalize('NFC').toLowerCase();
async function walk(dir) {
  const files = [];
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    // Symbolic links and other special entries cannot establish a portable exact set.
    if (item.isDirectory()) files.push(...await walk(full));
    else if (item.isFile()) files.push(full);
    else throw new Error(`Unsupported filesystem entry: ${rel(full)}`);
  }
  return files;
}
async function verify() {
  const bytes = await readFile(path.join(root, manifestName));
  const id = await readFile(path.join(root, identityName), 'utf8');
  if (!/^[0-9a-f]{64}(?:\r?\n)?$/.test(id) || id.trim() !== digest(bytes)) throw new Error('PACKAGE_ID must equal SHA-256 of the exact manifest bytes');
  const expected = new Map();
  const folded = new Set();
  for (const line of bytes.toString('utf8').split(/\r?\n/)) {
    if (!line) continue;
    const match = /^([0-9a-f]{64})  (.+)$/.exec(line);
    if (!match || !safePath(match[2])) throw new Error(`Invalid or unsafe manifest entry: ${line}`);
    const name = match[2];
    if (name === manifestName || name === identityName) throw new Error('Identity files must not be self-referential manifest entries');
    if (expected.has(name) || folded.has(caseKey(name))) throw new Error(`Duplicate or case-colliding manifest path: ${name}`);
    expected.set(name, match[1]);
    folded.add(caseKey(name));
  }
  if (expected.size === 0) throw new Error('The payload manifest must contain files');
  const actual = new Map();
  const actualFolded = new Set();
  for (const full of await walk(root)) {
    const name = rel(full);
    if (!safePath(name) || actualFolded.has(caseKey(name))) throw new Error(`Unsafe or case-colliding package path: ${name}`);
    actual.set(name, full);
    actualFolded.add(caseKey(name));
  }
  const allowed = new Set([...expected.keys(), manifestName, identityName]);
  let failures = 0;
  for (const [name, hash] of expected) {
    if (!actual.has(name)) { out('FAIL', `missing ${name}`); failures++; continue; }
    if (digest(await readFile(actual.get(name))) !== hash) { out('FAIL', `hash ${name}`); failures++; }
  }
  for (const name of actual.keys()) if (!allowed.has(name)) { out('FAIL', `extra ${name}`); failures++; }
  out('VERDICT', failures ? 'FAIL_PACKAGE_INTEGRITY_EXACT_SET' : 'PASS_PACKAGE_INTEGRITY_EXACT_SET');
  if (!failures) out('PASS', `${expected.size} payload files; PACKAGE_ID ${id.trim()}`);
  return failures ? 1 : 0;
}
function versionProbe(executable, argv) {
  const result = spawnSync(executable, argv, { encoding: 'utf8', shell: false, timeout: 5000, maxBuffer: 65536 });
  const value = (result.stdout || '').trim();
  return result.status === 0 && !result.error && !result.signal && !(result.stderr || '').trim() && /^\d+\.\d+\.\d+$/.test(value) ? value : null;
}
function npmVersion() {
  const dirs = [...new Set([path.dirname(process.execPath), ...String(process.env.PATH || '').split(path.delimiter).filter(Boolean)])];
  const candidates = [];
  for (const dir of dirs) {
    candidates.push(path.join(dir, 'node_modules/npm/bin/npm-cli.js'), path.join(dir, '../lib/node_modules/npm/bin/npm-cli.js'));
    try { const resolved = realpathSync(path.join(dir, process.platform === 'win32' ? 'npm.cmd' : 'npm')); if (resolved.endsWith('.js')) candidates.push(resolved); } catch {}
  }
  for (const cli of [...new Set(candidates)].filter(existsSync)) {
    const version = versionProbe(process.execPath, [cli, '--version']);
    if (version) return { version, source: cli };
  }
  // A Windows .cmd shim is not an executable. Invoke npm-cli.js through this Node binary.
  if (process.platform !== 'win32') return { version: versionProbe('npm', ['--version']), source: 'npm from PATH' };
  return { version: null, source: 'npm-cli.js unavailable' };
}
function env() {
  const npm = npmVersion();
  const exact = process.version === requiredNode && npm.version === requiredNpm;
  out('INFO', `platform=${process.platform} arch=${process.arch}; Node binary=${process.execPath}`);
  out(process.version === requiredNode ? 'PASS' : allow ? 'WARN' : 'FAIL', `Node ${process.version}; required ${requiredNode}`);
  out(npm.version === requiredNpm ? 'PASS' : allow ? 'WARN' : 'FAIL', `npm ${npm.version || 'unavailable'}; required ${requiredNpm}; source=${npm.source}`);
  out('VERDICT', exact ? 'READY_RUNTIME' : allow ? 'RUNTIME_MISMATCH_ALLOWED_FOR_QA' : 'NOT_READY_RUNTIME');
  return exact || allow ? 0 : 2;
}
function runExampleProcess(entry, cwd) {
  return new Promise(resolve => {
    const child = spawn(process.execPath, [entry], { cwd, stdio: ['ignore', 'pipe', 'pipe'], shell: false });
    let reason = null, bytes = 0;
    const stop = message => { if (reason) return; reason = message; child.kill('SIGKILL'); };
    const timer = setTimeout(() => stop('TIME_LIMIT_20_SECONDS'), 20000);
    const output = (stream, chunk) => {
      bytes += chunk.length;
      if (bytes > 1048576) { stop('OUTPUT_LIMIT_1_MIB'); return; }
      stream.write(chunk);
    };
    child.stdout.on('data', chunk => output(process.stdout, chunk));
    child.stderr.on('data', chunk => output(process.stderr, chunk));
    child.on('error', error => { reason = `SPAWN_ERROR ${error.message}`; });
    child.on('close', (code, signal) => {
      clearTimeout(timer);
      if (reason || signal) out('FAIL', reason || `SIGNAL ${signal}`);
      resolve(reason || signal ? 1 : code ?? 1);
    });
  });
}
async function example(id) {
  const entry = cfg.examples?.[id];
  if (!entry || !safePath(entry.path) || !safePath(entry.entry)) throw new Error(`Unknown or unsafe example ${id}`);
  return runExampleProcess(entry.entry, path.join(root, ...entry.path.split('/')));
}
async function main() {
  if (command === 'verify') return verify();
  if (command === 'env') return env();
  if (command === 'example' || command === 'examples') {
    if (env() !== 0) return 2;
    if (command === 'example') return example(args[0]);
    let failed = false;
    for (const id of Object.keys(cfg.examples || {})) { out('INFO', `example ${id}`); if (await example(id)) failed = true; }
    out('VERDICT', failed ? 'FAIL_EXAMPLES' : 'PASS_EXAMPLES');
    return failed ? 1 : 0;
  }
  console.log('Commands: verify | env | example <01–05> | examples');
  return command === 'help' ? 0 : 2;
}
try { process.exitCode = await main(); }
catch (error) { out('FAIL', error.message); out('VERDICT', command === 'verify' ? 'FAIL_PACKAGE_INTEGRITY_EXACT_SET' : 'FAIL_COMMAND'); process.exitCode = 1; }
