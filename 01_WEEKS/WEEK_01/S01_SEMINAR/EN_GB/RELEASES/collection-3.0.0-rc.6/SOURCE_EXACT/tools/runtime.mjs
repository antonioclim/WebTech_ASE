import {existsSync, realpathSync, lstatSync} from 'node:fs';
import path from 'node:path';
import {capture} from './capture.mjs';
const unique=a=>[...new Set(a)];
export function candidates(){
 const dirs=unique([path.dirname(process.execPath),...String(process.env.PATH||'').split(path.delimiter).filter(Boolean)]);
 const cli=[];
 for(const d of dirs){
  cli.push(path.join(d,'node_modules/npm/bin/npm-cli.js'),path.join(d,'../lib/node_modules/npm/bin/npm-cli.js'));
  const shim=path.join(d,process.platform==='win32'?'npm.cmd':'npm');
  try{const r=realpathSync(shim);if(r.endsWith('.js'))cli.push(r);}catch{}
 }
 return {dirs,npmCli:unique(cli.filter(f=>existsSync(f)))};
}
export async function runtimeStatus({allow=false}={}) {
 const found=candidates();const probes=[];let npm=null,npmPath=null;
 for(const p of found.npmCli){
  const r=await capture(process.execPath,[p,'--version'],{timeoutMs:5000,maxBytes:65536});
  const v=r.stdout.trim();probes.push({path:p,code:r.code,version:v,reason:r.reason,spawnError:r.spawnError});
  if(r.code===0&&!r.reason&&!r.signal&&!r.stderr.trim()&&/^\d+\.\d+\.\d+$/.test(v)){npm=v;npmPath=p;break;}
 }
 // On Unix an ordinary executable npm can be used without a shell. On Windows never spawn npm.cmd directly.
 if(npm===null&&process.platform!=='win32'){
  const r=await capture('npm',['--version'],{timeoutMs:5000,maxBytes:65536});const v=r.stdout.trim();
  probes.push({path:'npm from PATH',code:r.code,reason:r.reason,version:v});
  if(r.code===0&&!r.reason&&!r.signal&&!r.stderr.trim()&&/^\d+\.\d+\.\d+$/.test(v)){npm=v;npmPath='npm from PATH';}
 }
 const exact=process.version==='v24.21.0'&&npm==='11.19.0';
 return {node:process.version,nodePath:process.execPath,npm,npmPath,requiredNode:'v24.21.0',requiredNpm:'11.19.0',exact,qaOverride:allow,admitted:exact||allow,classification:exact?'EXACT_RUNTIME_MATCH':allow?'DOCUMENTED_RUNTIME_MISMATCH':'STOP_RUNTIME_MISMATCH',npmProbes:probes};
}
export function toolLocations(){
 const bases=[process.env.ProgramFiles,process.env['ProgramFiles(x86)'],process.env.LOCALAPPDATA,process.env.APPDATA].filter(Boolean);
 const extra=bases.flatMap(d=>[d,path.join(d,'nodejs'),path.join(d,'Programs/Microsoft VS Code/bin'),path.join(d,'Microsoft VS Code/bin'),path.join(d,'Git/cmd'),path.join(d,'Google/Chrome/Application'),path.join(d,'Microsoft/Edge/Application'),path.join(d,'Mozilla Firefox')]);
 const dirs=unique([...candidates().dirs,...extra,'/usr/local/bin','/opt/homebrew/bin','/usr/bin']);
 const sets={node:['node','node.exe'],git:['git','git.exe'],vscode:['code','code.cmd','Code.exe'],chrome:['google-chrome','chrome.exe'],edge:['msedge','msedge.exe'],firefox:['firefox','firefox.exe']};
 const out={};
 for(const [k,names]of Object.entries(sets)){
  const seen=new Set();out[k]=[];for(const d of dirs)for(const n of names){const p=path.join(d,n);try{const rp=realpathSync(p);if(lstatSync(rp).isFile()&&!seen.has(rp)){seen.add(rp);out[k].push(rp);}}catch{}}
 }
 out.macosApplications=['Visual Studio Code.app','Google Chrome.app','Microsoft Edge.app','Firefox.app'].map(n=>path.join('/Applications',n)).filter(existsSync);
 return {located:out,note:'Location evidence only. Presence does not qualify the tool or its version. Multiple node paths require explicit reconciliation.'};
}
