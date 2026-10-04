import { spawnSync } from "node:child_process";
import { existsSync, realpathSync } from "node:fs";
import { delimiter, join } from "node:path";
import { runtimeStatus } from "./runtime.mjs";
const runtime = runtimeStatus();
const entries = (process.env.PATH ?? "").split(delimiter).filter(Boolean);
const suffixes = process.platform === "win32" ? [".exe", ".cmd", ".bat", ""] : [""];
function knownDirectories() {
  const dirs=[...entries];
  if(process.platform === "win32") {
    for(const base of [process.env.ProgramFiles, process.env["ProgramFiles(x86)"], process.env.LOCALAPPDATA, process.env.APPDATA, process.env.NVM_SYMLINK]) if(base) dirs.push(base,join(base,"nodejs"),join(base,"Programs","Microsoft VS Code","bin"),join(base,"Programs","nodejs"),join(base,"Google","Chrome","Application"),join(base,"Microsoft","Edge","Application"),join(base,"Mozilla Firefox"));
  } else {
    for(const d of ["/usr/local/bin","/opt/homebrew/bin","/usr/bin","/snap/bin"]) dirs.push(d);
  }
  return [...new Set(dirs.filter(Boolean))];
}
function candidates(names) {
  const out=[]; const seen=new Set();
  for (const dir of knownDirectories()) for (const name of names) for (const suffix of suffixes) {
    const value=join(dir,name.endsWith(suffix)?name:name+suffix);
    if(existsSync(value)) { let key=value; try{key=realpathSync(value);}catch{} if(!seen.has(key)){seen.add(key);out.push(value);} }
  }
  return out;
}
function version(path) { const p=spawnSync(path,["--version"],{encoding:"utf8",timeout:4000,windowsHide:true}); return {path,ok:!p.error&&p.status===0,version:p.status===0?(p.stdout||p.stderr).trim().split(/\r?\n/)[0]:null,error:p.error?.message??null}; }
const definitions=[
  ["VS Code",["code","code.cmd","code.exe"]], ["Git",["git","git.exe"]],
  ["Chrome",["chrome","chrome.exe","google-chrome","google-chrome-stable"]],
  ["Edge",["msedge","msedge.exe"]], ["Firefox",["firefox","firefox.exe"]]
];
const tools=definitions.map(([tool,names])=>({tool,observations:candidates(names).map(version)}));
const distinctNodeVersions=[...new Set([runtime.node])];
console.log(JSON.stringify({verdict:runtime.exact?"PASS_EXACT_RUNTIME":"STOP_EXACT_RUNTIME_UNAVAILABLE",expected:{node:"v24.21.0",npm:"11.19.0"},runtime,tools,multipleRuntimeNote:distinctNodeVersions.length>1?"MULTIPLE_NODE_VERSIONS_OBSERVED":"NO_SECOND_NODE_VERSION_OBSERVED",note:"No download or installation is performed."},null,2));
process.exit(runtime.exact?0:2);
