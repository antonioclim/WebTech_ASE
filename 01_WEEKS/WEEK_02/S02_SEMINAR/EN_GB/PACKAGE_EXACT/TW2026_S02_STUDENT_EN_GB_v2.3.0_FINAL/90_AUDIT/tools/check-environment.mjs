import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { delimiter, join } from "node:path";
import { runtimeStatus } from "./runtime.mjs";

const runtime = runtimeStatus();
const pathEntries = (process.env.PATH ?? "").split(delimiter).filter(Boolean);
const add = (list, value) => { if (value && !list.includes(value)) list.push(value); };
const executableNames = process.platform === "win32" ? [".exe", ".cmd", ".bat", ""] : [""];

function pathCandidates(names) {
  const out = [];
  for (const dir of pathEntries) for (const name of names) for (const suffix of executableNames) {
    const candidate = join(dir, name.endsWith(suffix) ? name : `${name}${suffix}`);
    if (existsSync(candidate)) add(out, candidate);
  }
  return out;
}

function commonWindows(relativePaths) {
  if (process.platform !== "win32") return [];
  const bases = [process.env.LOCALAPPDATA, process.env.PROGRAMFILES, process.env["PROGRAMFILES(X86)"], process.env.USERPROFILE].filter(Boolean);
  const out = [];
  for (const base of bases) for (const rel of relativePaths) {
    const candidate = join(base, rel);
    if (existsSync(candidate)) add(out, candidate);
  }
  return out;
}

const definitions = [
  { tool: "Chrome", names: ["chrome", "chrome.exe", "google-chrome", "google-chrome-stable"], win: ["Google/Chrome/Application/chrome.exe"] },
  { tool: "Edge", names: ["msedge", "msedge.exe"], win: ["Microsoft/Edge/Application/msedge.exe"] },
  { tool: "Firefox", names: ["firefox", "firefox.exe"], win: ["Mozilla Firefox/firefox.exe"] },
  { tool: "VS Code", names: ["code", "code.cmd", "code.exe"], win: ["Programs/Microsoft VS Code/Code.exe", "Microsoft VS Code/Code.exe"] },
  { tool: "Git", names: ["git", "git.exe"], win: ["Git/cmd/git.exe", "Git/bin/git.exe"] }
];

function versionOf(candidate) {
  const probe = spawnSync(candidate, ["--version"], { encoding: "utf8", timeout: 4000, windowsHide: true });
  return { available: !probe.error && probe.status === 0, version: probe.status === 0 ? (probe.stdout || probe.stderr).trim().split(/\r?\n/)[0] : null, exitCode: probe.status, error: probe.error?.message ?? null };
}

const tools = definitions.map((definition) => {
  const candidates = [];
  for (const c of pathCandidates(definition.names)) add(candidates, c);
  for (const c of commonWindows(definition.win)) add(candidates, c);
  if (process.platform === "darwin") {
    const mac = {
      "Chrome": "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "Edge": "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
      "Firefox": "/Applications/Firefox.app/Contents/MacOS/firefox",
      "VS Code": "/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code"
    }[definition.tool];
    if (mac && existsSync(mac)) add(candidates, mac);
  }
  const observations = candidates.map((candidate) => ({ path: candidate, ...versionOf(candidate) }));
  return { tool: definition.tool, available: observations.some((x) => x.available), observations };
});

console.log(JSON.stringify({
  verdict: runtime.exact ? "PASS_EXACT_RUNTIME" : "STOP_EXACT_RUNTIME_UNAVAILABLE",
  expected: { node: "v24.21.0", npm: "11.19.0" },
  runtime,
  tools,
  note: "This checker searches PATH and common per-user/system locations. It never downloads or installs software."
}, null, 2));
process.exit(runtime.exact ? 0 : 2);
