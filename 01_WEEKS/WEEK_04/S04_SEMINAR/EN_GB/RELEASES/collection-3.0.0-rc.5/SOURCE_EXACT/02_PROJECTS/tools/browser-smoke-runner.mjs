import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { delimiter, join } from 'node:path';

function executableCandidates() {
  if (process.env.CHROME_BIN) return [process.env.CHROME_BIN];
  const pathEntries=(process.env.PATH ?? '').split(delimiter).filter(Boolean);
  const names=process.platform==='win32' ? ['chrome.exe','msedge.exe','chromium.exe'] : ['google-chrome','google-chrome-stable','chromium','chromium-browser'];
  const out=[];
  for (const dir of pathEntries) for (const name of names) out.push(join(dir,name));
  if (process.platform==='win32') {
    for (const base of [process.env.ProgramFiles,process.env['ProgramFiles(x86)'],process.env.LOCALAPPDATA]) if (base) out.push(join(base,'Google','Chrome','Application','chrome.exe'),join(base,'Microsoft','Edge','Application','msedge.exe'));
  } else if (process.platform==='darwin') out.push('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge');
  return [...new Set(out)];
}
export function findBrowser() { return executableCandidates().find(existsSync) ?? null; }
function killTree(child) {
  if (!child?.pid) return;
  try {
    if (process.platform==='win32') spawnSync('taskkill',['/PID',String(child.pid),'/T','/F'],{stdio:'ignore',windowsHide:true});
    else process.kill(-child.pid,'SIGKILL');
  } catch { try { child.kill('SIGKILL'); } catch {} }
}
export async function runBrowserDump(url,{virtualTimeBudget=2000,timeoutMs=8000,maxBytes=4*1024*1024}={}) {
  const browser=findBrowser();
  if (!browser) { const error=new Error('No supported Chromium browser was found.'); error.code='BROWSER_NOT_FOUND'; throw error; }
  const profile=process.env.TW_BROWSER_PROFILE;
  const args=['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--disable-background-networking','--disable-extensions','--no-first-run','--no-default-browser-check',...(profile?[`--user-data-dir=${profile}`]:[]),`--virtual-time-budget=${virtualTimeBudget}`,'--dump-dom',url];
  return await new Promise((resolve,reject)=>{
    const child=spawn(browser,args,{stdio:['ignore','pipe','pipe'],windowsHide:true,detached:process.platform!=='win32'});
    let stdout='',stderr='',settled=false;
    const finish=(error,value)=>{if(settled)return;settled=true;clearTimeout(timer);error?reject(error):resolve(value)};
    const append=(key,chunk)=>{const text=String(chunk);if(key==='stdout')stdout+=text;else stderr+=text;if(stdout.length+stderr.length>maxBytes){const e=new Error('Browser output exceeded the bounded buffer.');e.code='OUTPUT_LIMIT';killTree(child);finish(e)}};
    child.stdout.on('data',chunk=>append('stdout',chunk));child.stderr.on('data',chunk=>append('stderr',chunk));
    child.on('error',cause=>{const e=new Error(`Browser process could not start: ${cause.message}`);e.code='PROCESS_START_ERROR';finish(e)});
    child.on('exit',(code,signal)=>{if(code===0&&!signal)finish(null,{classification:'PASS_BROWSER_DUMP',browser,stdout,stderr,exitCode:code,signal:null});else{const e=new Error(`Browser process exited with code ${code} and signal ${signal}.`);e.code='PROCESS_EXIT_NONZERO';e.exitCode=code;e.signal=signal;e.stdout=stdout;e.stderr=stderr;finish(e)}});
    const timer=setTimeout(()=>{const e=new Error(`Browser process exceeded ${timeoutMs} ms.`);e.code='PROCESS_TIMEOUT';e.stdout=stdout;e.stderr=stderr;killTree(child);finish(e)},timeoutMs);
  });
}
