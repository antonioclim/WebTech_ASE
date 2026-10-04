import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { delimiter, join } from "node:path";
export function browserCandidates(platform = process.platform, env = process.env) {
  const out = [], add = x => { if (x && !out.includes(x)) out.push(x); };
  add(env.CHROME_BIN);
  const names = platform === "win32" ? ["chrome.exe", "msedge.exe", "chromium.exe"] : ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser", "msedge"];
  for (const dir of (env.PATH ?? "").split(platform === "win32" ? ";" : delimiter).filter(Boolean)) for (const name of names) add(join(dir, name));
  if (platform === "win32") for (const base of [env.LOCALAPPDATA, env.PROGRAMFILES, env["PROGRAMFILES(X86)"]].filter(Boolean)) {
    for (const rel of ["Google/Chrome/Application/chrome.exe", "Microsoft/Edge/Application/msedge.exe", "Chromium/Application/chrome.exe"]) add(join(base, rel));
  }
  if (platform === "darwin") for (const name of ["Google Chrome", "Microsoft Edge", "Chromium"]) add(`/Applications/${name}.app/Contents/MacOS/${name}`);
  return out;
}
export function browserObservations() {
  return browserCandidates().filter(existsSync).map(path => {
    const result = spawnSync(path, ["--version"], { encoding: "utf8", timeout: 4000, maxBuffer: 65536, windowsHide: true });
    const version = `${result.stdout ?? ""} ${result.stderr ?? ""}`.trim();
    return { path, available: !result.error && result.status === 0, supported: /(?:Chrome|Chromium|Edge)/i.test(version), version, error: result.error?.message ?? null };
  });
}
export function findBrowser() { return browserObservations().find(x => x.available && x.supported) ?? null; }
