import { spawn, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { runtimeStatus } from '../../90_AUDIT/tools/runtime.mjs';

const WRAPPER = resolve(fileURLToPath(import.meta.url));
const ROOT = resolve(dirname(WRAPPER), '..');
const PACKAGE_ROOT = resolve(ROOT, '..');
const map = { P01: 'P01_MULTI_SOURCE_DASHBOARD', P02: 'P02_INTERACTIVE_TASK_LIST', P03: 'P03_RESILIENT_FETCH_OPTIONAL' };
const code = process.argv[2];
if (!map[code]) { console.error('STOP: use P01, P02 or P03.'); process.exit(2); }

const runtime = runtimeStatus();
if (!runtime.exact && !runtime.qaOverride) {
  console.error(`STOP: exact runtime required (Node.js v24.21.0 and npm 11.19.0). Observed ${runtime.node} / ${runtime.npm ?? 'npm unavailable'}.`);
  process.exit(2);
}
if (!runtime.exact && runtime.qaOverride) console.error(`QA ONLY: runtime mismatch ${runtime.node} / ${runtime.npm ?? 'npm unavailable'}.`);

const packageId = readFileSync(resolve(PACKAGE_ROOT, '90_AUDIT/PACKAGE_ID.txt'), 'utf8').trim();
const idPrefix = packageId.slice(0, 16);
const control = join(tmpdir(), `TW2026_S04_${idPrefix}_${code}.json`);
const projectRoot = join(ROOT, map[code]);
const serverScript = join(projectRoot, 'src', 'static-server.js');
if (!existsSync(serverScript)) { console.error(`STOP: project target is missing: ${serverScript}`); process.exit(2); }

async function probe(record, timeoutMs = 1200) {
  try {
    const response = await fetch(`${record.url}/__tw_control?token=${encodeURIComponent(record.token)}`, { signal: AbortSignal.timeout(timeoutMs), cache: 'no-store' });
    if (!response.ok) return false;
    const body = await response.json();
    return body?.schema === 'TW2026_CONTROL_1' && body.ok === true && body.pid === record.pid && body.project === record.project && body.packageId === record.packageId;
  } catch { return false; }
}
function removeControl() { try { unlinkSync(control); } catch {} }
async function readLiveControl() {
  if (!existsSync(control)) return null;
  try {
    const record = JSON.parse(readFileSync(control, 'utf8'));
    if (record?.schema === 'TW2026_CONTROL_RECORD_1' && record.packageId === packageId && record.wrapper === WRAPPER && await probe(record)) return record;
  } catch {}
  removeControl();
  return null;
}
function killChild(child, force = false) {
  if (!child || child.killed) return;
  try {
    if (process.platform === 'win32' && force) spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
    else child.kill(force ? 'SIGKILL' : 'SIGTERM');
  } catch {}
}

if (await readLiveControl()) { console.error('STOP: a verified controlled project process is already running. Use STOP_PROJECT first.'); process.exit(2); }

const token = randomUUID();
const child = spawn(process.execPath, ['src/static-server.js'], {
  cwd: projectRoot,
  stdio: ['ignore', 'pipe', 'pipe'],
  windowsHide: true,
  env: { ...process.env, TW_CONTROL_TOKEN: token, TW_PACKAGE_ID: packageId, TW_PROJECT_CODE: code }
});
let ready = false;
let shuttingDown = false;
let readinessTimer;
child.stdout.setEncoding('utf8');
child.stderr.setEncoding('utf8');
child.stderr.on('data', chunk => process.stderr.write(chunk));
child.on('error', error => { console.error(`STOP: project process could not start: ${error.message}`); removeControl(); process.exitCode = 2; });

async function acceptUrl(url) {
  const record = { schema: 'TW2026_CONTROL_RECORD_1', pid: child.pid, url, project: code, packageId, token, nodePath: process.execPath, wrapper: WRAPPER };
  const deadline = Date.now() + 3500;
  while (Date.now() < deadline) {
    if (await probe(record, 600)) {
      ready = true;
      clearTimeout(readinessTimer);
      writeFileSync(control, JSON.stringify(record, null, 2), { encoding: 'utf8', mode: 0o600 });
      console.log(`PASS_PROJECT_READY ${url}`);
      console.log('Press Ctrl+C or run STOP_PROJECT when finished.');
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 120));
  }
  console.error('STOP: control endpoint did not confirm the launched process.');
  shutdown(2, true);
}
child.stdout.on('data', chunk => {
  process.stdout.write(chunk);
  const match = String(chunk).match(/http:\/\/127\.0\.0\.1:\d+/);
  if (match && !ready) void acceptUrl(match[0]);
});

function shutdown(exitCode = 0, force = false) {
  if (shuttingDown) return;
  shuttingDown = true;
  clearTimeout(readinessTimer);
  removeControl();
  killChild(child, force);
  if (!force) setTimeout(() => killChild(child, true), 1500).unref();
  process.exitCode = exitCode;
}
readinessTimer = setTimeout(() => { if (!ready) { console.error('STOP: project readiness timeout.'); shutdown(2, true); } }, 12000);
process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
child.on('exit', (exitCode, signal) => {
  clearTimeout(readinessTimer);
  removeControl();
  if (!shuttingDown && !ready) console.error(`STOP: project exited before readiness (${signal ?? exitCode ?? 'unknown'}).`);
  process.exitCode = shuttingDown ? (process.exitCode ?? 0) : (ready ? (exitCode ?? 0) : 2);
});
