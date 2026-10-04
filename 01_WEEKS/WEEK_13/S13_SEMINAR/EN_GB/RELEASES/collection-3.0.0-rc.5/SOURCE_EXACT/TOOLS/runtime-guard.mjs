import {spawnSync} from 'node:child_process';
import path from 'node:path';
export function checkEnvironment() {
  const denied = ['NODE_OPTIONS','NODE_PATH','LD_PRELOAD','DYLD_INSERT_LIBRARIES'];
  for (const key of denied) if (process.env[key]) throw new Error('BLOCKED_ENVIRONMENT_CONFLICT: '+key);
  const npm = process.platform==='win32' ? spawnSync(process.execPath,[path.join(path.dirname(process.execPath),'node_modules','npm','bin','npm-cli.js'),'--version'],{encoding:'utf8',timeout:5000,windowsHide:true}) : spawnSync('npm',['--version'], {encoding:'utf8',timeout:5000,shell:false});
  if (npm.error || npm.status !== 0) throw new Error('BLOCKED_NPM_UNAVAILABLE');
  const actual = {node:process.versions.node,npm:npm.stdout.trim()};
  if (actual.node !== '24.21.0' || actual.npm !== '11.19.0') throw new Error('BLOCKED_RUNTIME_MISMATCH: Node '+actual.node+' / npm '+actual.npm+'; required Node24.21.0 / npm11.19.0');
  return actual;
}
