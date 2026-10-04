import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { ROOT, PROJECTS, rejectRuntimeInjection, regularFile, trustedDirectory } from './verifier-core.mjs';
export { rejectRuntimeInjection } from './verifier-core.mjs';

export const EXPECTED_RUNTIME = Object.freeze({ node: 'v24.21.0', npm: '11.19.0' });
export async function inspectEnvironment(root = ROOT) {
  rejectRuntimeInjection();
  const npmResult = process.platform === 'win32'
    ? spawnSync('cmd.exe', ['/d', '/s', '/c', 'npm --version'], { encoding: 'utf8', timeout: 15000, maxBuffer: 1048576, windowsHide: true })
    : spawnSync('npm', ['--version'], { encoding: 'utf8', timeout: 15000, maxBuffer: 1048576 });
  const npm = npmResult.status === 0 && !npmResult.error && !npmResult.signal ? npmResult.stdout.trim() : null;
  const errors = [];
  if (process.version !== EXPECTED_RUNTIME.node) errors.push('Node mismatch: expected ' + EXPECTED_RUNTIME.node + ', observed ' + process.version + '.');
  if (npm !== EXPECTED_RUNTIME.npm) errors.push('npm mismatch or unavailable: expected ' + EXPECTED_RUNTIME.npm + ', observed ' + String(npm) + '.');
  if (typeof fetch !== 'function') errors.push('Built-in fetch is unavailable.');
  const dependencies = [];
  for (const id of ['p02']) {
    try {
      const project = trustedDirectory(root, PROJECTS[id].root), moduleDirectory = trustedDirectory(project, 'node_modules/express');
      const require = createRequire(path.join(project, 'package.json')), filename = require.resolve('express/package.json');
      if (path.resolve(filename) !== path.join(moduleDirectory, 'package.json')) throw new Error('Express metadata must resolve inside this project node_modules/express; ancestor or external dependencies are refused.');
      const installed = JSON.parse(regularFile(filename)), packageContract = JSON.parse(regularFile(path.join(project, 'package.json')));
      if (installed.version !== packageContract.dependencies?.express || installed.version !== '5.1.0') throw new Error('Express must match the fixed 5.1.0 dependency.');
      const entry = require.resolve('express'), relative = path.relative(moduleDirectory, entry), entryStat = fs.lstatSync(entry);
      if (!relative || relative.startsWith('..' + path.sep) || path.isAbsolute(relative) || !entryStat.isFile() || entryStat.isSymbolicLink() || fs.realpathSync(entry) !== path.resolve(entry)) throw new Error('Express entry must be a regular project-local file without symbolic-link indirection.');
      dependencies.push({ project: id, dependency: 'express', version: installed.version, status: 'AVAILABLE_LOCAL_METADATA_ONLY', installedPath: moduleDirectory, entryPath: entry, dependencyCodeExecuted: false });
    } catch (error) {
      dependencies.push({ project: id, dependency: 'express', status: 'BLOCKED', reason: error.message });
      errors.push(id + ': project-local Express 5.1.0 metadata and entry cannot be validated.');
    }
  }
  return { verdict: errors.length ? 'ENVIRONMENT_BLOCKED' : 'ENVIRONMENT_PASS', expected: EXPECTED_RUNTIME, observed: { node: process.version, npm, platform: process.platform, architecture: process.arch }, dependencies, errors, installsPerformed: 0, networkOperations: 0, dependencyCodeExecuted: false, limitation: 'Version, metadata and entry checks do not execute or certify Express. Native browser, TLS, deployment and owner acceptance remain separate.' };
}
export async function requireEnvironment(root = ROOT) { const report = await inspectEnvironment(root); if (report.errors.length) { const error = new Error(report.errors.join(' ') + ' STOP and retain a BLOCKED draft; request the separately prepared local teaching environment. No verifier installs dependencies.'); error.report = report; throw error; } return report; }
