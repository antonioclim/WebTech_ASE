import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { join, relative, resolve, sep } from "node:path";

export function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`symlink not allowed: ${path}`);
    if (entry.isDirectory()) out.push(...await walk(path));
    else if (entry.isFile()) out.push(path);
  }
  return out;
}

export async function verifyPackage(root) {
  root = resolve(root);
  const audit = join(root, "90_AUDIT");
  const manifestPath = join(audit, "IMMUTABLE_MANIFEST.sha256");
  const idPath = join(audit, "PACKAGE_ID.txt");
  const mutablePath = join(audit, "MUTABLE_PATHS.txt");
  const manifestBytes = await readFile(manifestPath);
  const expectedId = sha256(manifestBytes);
  const actualId = (await readFile(idPath, "utf8")).trim();
  if (actualId !== expectedId) throw new Error("PACKAGE_ID does not match the manifest bytes");
  if (!/^[0-9a-f]{64}$/.test(actualId)) throw new Error("invalid PACKAGE_ID format");
  const safePath = value => value && !value.startsWith("/") && !value.includes("\\") && !value.split("/").some(part => !part || part === "." || part === "..") && !/^[A-Za-z]:/.test(value);
  const mutable = new Set((await readFile(mutablePath, "utf8"))
    .split(/\r?\n/).map((x) => x.trim()).filter(Boolean));
  if (mutable.size !== 1 || !mutable.has("02_PROJECTS/RESPONSIVE_CARD_GRID/public/styles.css")) throw new Error("unexpected mutable-file contract");
  const expected = new Map(), folded = new Set();
  for (const line of manifestBytes.toString("utf8").split(/\r?\n/)) {
    if (!line.trim()) continue;
    const match = /^([0-9a-f]{64})  (.+)$/.exec(line);
    if (!match) throw new Error(`malformed manifest line: ${line}`);
    if (!safePath(match[2]) || expected.has(match[2]) || folded.has(match[2].toLowerCase()) || mutable.has(match[2])) throw new Error("unsafe, duplicate or mutable manifest path");
    folded.add(match[2].toLowerCase()); expected.set(match[2], match[1]);
  }
  const special = new Set(["90_AUDIT/IMMUTABLE_MANIFEST.sha256", "90_AUDIT/PACKAGE_ID.txt"]);
  const actualFiles = (await walk(root)).map((path) => relative(root, path).split(sep).join("/"));
  const expectedSet = new Set([...expected.keys(), ...mutable, ...special]);
  const extra = actualFiles.filter((path) => !expectedSet.has(path));
  const missing = [...expectedSet].filter((path) => !actualFiles.includes(path));
  const modified = [];
  for (const [path, hash] of expected) {
    const bytes = await readFile(join(root, path));
    if (sha256(bytes) !== hash) modified.push(path);
  }
  if (extra.length || missing.length || modified.length) {
    const error = new Error("package integrity failure");
    error.details = { extra, missing, modified };
    throw error;
  }
  return { packageId: actualId, immutableFiles: expected.size, mutable: [...mutable], actualFiles: actualFiles.length };
}
