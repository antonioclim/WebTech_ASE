import { spawnSync } from 'node:child_process';
export function runtimeStatus() {
  const command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const npm = spawnSync(command, ['--version'], { encoding: 'utf8', timeout: 4000, windowsHide: true });
  const npmVersion = npm.status === 0 ? npm.stdout.trim().split(/\r?\n/)[0] : null;
  return {
    node: process.version,
    npm: npmVersion,
    exact: process.version === 'v24.21.0' && npmVersion === '11.19.0',
    qaOverride: process.env.TW_QA_ALLOW_RUNTIME_MISMATCH === '1'
  };
}
