import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const audit = path.join(root, "90_AUDIT");
const manifestPath = path.join(audit, "IMMUTABLE_MANIFEST.sha256");
const indexPath = path.join(audit, "FILE_INDEX.csv");
const packageIdPath = path.join(audit, "PACKAGE_ID.txt");
const mutablePath = path.join(audit, "MUTABLE_PATHS.txt");
const special = new Set(["90_AUDIT/IMMUTABLE_MANIFEST.sha256", "90_AUDIT/FILE_INDEX.csv", "90_AUDIT/PACKAGE_ID.txt"]);
const sha256 = (buffer) => crypto.createHash("sha256").update(buffer).digest("hex");
const lines = (buffer) => buffer.toString("utf8").split(/\r?\n/).filter(Boolean);
const relative = (file) => path.relative(root, file).split(path.sep).join("/");
function fail(message) { console.error(`STOP_PACKAGE_INTEGRITY ${message}`); process.exit(3); }
function walk(dir) {
  let output = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    const stat = fs.lstatSync(file);
    if (stat.isSymbolicLink()) fail(`symlink rejected: ${relative(file)}`);
    if (stat.isDirectory()) output = output.concat(walk(file));
    else if (stat.isFile()) output.push(file);
    else fail(`non-regular entry rejected: ${relative(file)}`);
  }
  return output;
}
const files = walk(root).sort((a, b) => relative(a).localeCompare(relative(b), "en"));
const actual = new Map(files.map((file) => [relative(file), file]));
const unsafe = /(^|\/)(?:\.\.?|CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\.|\/|$)/i;
const casefold = new Map();
const unicode = new Map();
for (const name of actual.keys()) {
  if (name.startsWith("/") || name.includes("\\") || unsafe.test(name) || name.split("/").some((part) => /[ .]$/.test(part))) fail(`unsafe path: ${name}`);
  const folded = name.toLocaleLowerCase("en-US");
  if (casefold.has(folded) && casefold.get(folded) !== name) fail(`case-insensitive collision: ${casefold.get(folded)} <> ${name}`);
  casefold.set(folded, name);
  const normal = name.normalize("NFC");
  if (unicode.has(normal) && unicode.get(normal) !== name) fail(`Unicode-normalisation collision: ${unicode.get(normal)} <> ${name}`);
  unicode.set(normal, name);
}
const mutable = new Set(lines(fs.readFileSync(mutablePath)));
for (const name of mutable) if (!actual.has(name)) fail(`declared mutable path missing: ${name}`);
const manifestRaw = fs.readFileSync(manifestPath);
const indexRaw = fs.readFileSync(indexPath);
const idPayload = Buffer.from(`TW2026-PACKAGE-ID-v2\nmanifest-sha256 ${sha256(manifestRaw)}\nfile-index-sha256 ${sha256(indexRaw)}\n`, "ascii");
const expectedId = sha256(idPayload);
const recordedId = fs.readFileSync(packageIdPath, "utf8").trim();
if (!/^[a-f0-9]{64}$/.test(recordedId) || recordedId !== expectedId) fail(`PACKAGE_ID mismatch expected=${expectedId} actual=${recordedId}`);

const manifest = new Map();
for (const line of lines(manifestRaw)) {
  const match = line.match(/^([a-f0-9]{64})  (.+)$/);
  if (!match || manifest.has(match[2])) fail(`bad or duplicate manifest line: ${line}`);
  manifest.set(match[2], match[1]);
}
const expectedImmutable = new Set([...actual.keys()].filter((name) => !mutable.has(name) && !special.has(name)));
if (manifest.size !== expectedImmutable.size) fail(`manifest path count expected=${expectedImmutable.size} actual=${manifest.size}`);
for (const name of expectedImmutable) {
  if (!manifest.has(name)) fail(`manifest missing: ${name}`);
  if (sha256(fs.readFileSync(actual.get(name))) !== manifest.get(name)) fail(`immutable hash mismatch: ${name}`);
}
for (const name of manifest.keys()) if (!expectedImmutable.has(name)) fail(`manifest extra path: ${name}`);

const indexText = indexRaw.toString("utf8").replace(/^\uFEFF/, "");
const rows = indexText.split(/\r?\n/).filter(Boolean);
if (rows.shift() !== "path,bytes,sha256,classification") fail("bad FILE_INDEX header");
const index = new Map();
for (const row of rows) {
  const match = row.match(/^([^,]+),(\d+),([a-f0-9]{64}),(immutable|mutable|control)$/);
  if (!match || index.has(match[1])) fail(`bad or duplicate FILE_INDEX row: ${row}`);
  index.set(match[1], { bytes: Number(match[2]), hash: match[3], classification: match[4] });
}
const expectedIndex = new Set([...actual.keys()].filter((name) => name !== "90_AUDIT/FILE_INDEX.csv" && name !== "90_AUDIT/PACKAGE_ID.txt"));
if (index.size !== expectedIndex.size) fail(`FILE_INDEX path count expected=${expectedIndex.size} actual=${index.size}`);
for (const name of expectedIndex) {
  const row = index.get(name);
  if (!row) fail(`FILE_INDEX missing: ${name}`);
  const expectedClass = mutable.has(name) ? "mutable" : name === "90_AUDIT/IMMUTABLE_MANIFEST.sha256" ? "control" : "immutable";
  if (row.classification !== expectedClass) fail(`FILE_INDEX class mismatch: ${name}`);
  const stat = fs.statSync(actual.get(name));
  if (!mutable.has(name) && (row.bytes !== stat.size || row.hash !== sha256(fs.readFileSync(actual.get(name))))) fail(`FILE_INDEX metadata mismatch: ${name}`);
}
for (const name of index.keys()) if (!expectedIndex.has(name)) fail(`FILE_INDEX extra path: ${name}`);
console.log(`PASS_PACKAGE_INTEGRITY_EXACT_SET files=${actual.size} immutable=${manifest.size} mutable=${mutable.size}`);
console.log(`PACKAGE_ID=${recordedId}`);
