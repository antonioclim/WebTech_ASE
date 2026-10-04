import path from 'node:path';
import { spawn } from 'node:child_process';
import { ROOT, PROJECTS, checkBoundary, checkPackage } from './verifier-core.mjs';
import { requireEnvironment } from './environment-core.mjs';
try {
  if (process.argv.length !== 2) throw new Error('This command takes no arguments and has no override.');
  checkPackage(ROOT, { allowAssessedEdits: true, allowGenerated: true }); checkBoundary('p02'); await requireEnvironment();
  const cwd = path.join(ROOT, ...PROJECTS.p02.root.split('/'));
  console.log('P02_FOREGROUND_START: open http://127.0.0.1:3000/health only after the server reports listening.');
  console.log('Keep this terminal open. Stop with Ctrl+C in this terminal. No external address is opened automatically.');
  const child = spawn(process.execPath, ['src/server.js'], { cwd, stdio: 'inherit', env: { ...process.env, PORT: '3000' }, windowsHide: false });
  let stopping = false;
  const stop = signal => { if (!stopping) { stopping = true; if (child.exitCode === null && child.signalCode === null) child.kill(signal); } };
  process.on('SIGINT', () => stop('SIGINT')); process.on('SIGTERM', () => stop('SIGTERM'));
  child.on('error', error => { console.error('P02_START_BLOCKED: ' + error.message); process.exitCode = 2; });
  child.on('exit', (code, signal) => { console.log('P02_FOREGROUND_STOP: ' + (signal || String(code))); process.exitCode = stopping ? 0 : (code ?? 2); });
} catch (error) { console.error('P02_START_BLOCKED: ' + error.message); if (error.report) console.log(JSON.stringify(error.report, null, 2)); process.exitCode = 2; }
