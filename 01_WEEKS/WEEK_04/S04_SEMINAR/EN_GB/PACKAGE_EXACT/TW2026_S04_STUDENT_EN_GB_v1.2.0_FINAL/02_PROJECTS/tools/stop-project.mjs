import { readFileSync, existsSync, unlinkSync, readdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const WRAPPER = resolve(dirname(fileURLToPath(import.meta.url)), 'run-project.mjs');
const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const packageId = readFileSync(resolve(PACKAGE_ROOT, '90_AUDIT/PACKAGE_ID.txt'), 'utf8').trim();
const prefix = `TW2026_S04_${packageId.slice(0, 16)}_`;

async function probe(record) {
  try {
    const response = await fetch(`${record.url}/__tw_control?token=${encodeURIComponent(record.token)}`, { signal: AbortSignal.timeout(1200), cache: 'no-store' });
    if (!response.ok) return false;
    const body = await response.json();
    return body?.schema === 'TW2026_CONTROL_1' && body.ok === true && body.pid === record.pid && body.project === record.project && body.packageId === packageId;
  } catch { return false; }
}
function alive(pid) { try { process.kill(pid, 0); return true; } catch (error) { if (error.code === 'ESRCH') return false; throw error; } }
async function terminate(pid) {
  try { process.kill(pid, 'SIGTERM'); } catch (error) { if (error.code !== 'ESRCH') throw error; }
  const deadline = Date.now() + 2200;
  while (Date.now() < deadline) { if (!alive(pid)) return 'SIGTERM'; await new Promise(resolve => setTimeout(resolve, 100)); }
  try { process.kill(pid, 'SIGKILL'); } catch (error) { if (error.code !== 'ESRCH') throw error; }
  return 'SIGKILL';
}

const results=[];
for (const name of readdirSync(tmpdir()).filter(value => value.startsWith(prefix) && value.endsWith('.json'))) {
  const path = join(tmpdir(), name);
  let record;
  try { record = JSON.parse(readFileSync(path, 'utf8')); } catch (error) {
    try { unlinkSync(path); } catch {}
    results.push({ file: name, classification: 'STALE_MALFORMED_REMOVED', message: error.message });
    continue;
  }
  const structurallyValid = record?.schema === 'TW2026_CONTROL_RECORD_1' && record.packageId === packageId && record.wrapper === WRAPPER && record.nodePath === process.execPath && ['P01','P02','P03'].includes(record.project) && Number.isInteger(record.pid) && record.pid > 1;
  if (!structurallyValid) {
    try { unlinkSync(path); } catch {}
    results.push({ file: name, classification: 'UNTRUSTED_RECORD_REMOVED_NO_SIGNAL' });
    continue;
  }
  if (!await probe(record)) {
    try { unlinkSync(path); } catch {}
    results.push({ file: name, project: record.project, classification: 'STALE_OR_UNVERIFIED_REMOVED_NO_SIGNAL' });
    continue;
  }
  const signal = await terminate(record.pid);
  try { unlinkSync(path); } catch {}
  results.push({ file: name, project: record.project, pid: record.pid, classification: 'VERIFIED_PROCESS_STOPPED', signal });
}
const stopped=results.filter(x=>x.classification==='VERIFIED_PROCESS_STOPPED').length;
console.log(JSON.stringify({ schema:'S04_STOP_PROJECT_1', verdict:'PASS_STOP_PROJECT', stopped, results }, null, 2));
