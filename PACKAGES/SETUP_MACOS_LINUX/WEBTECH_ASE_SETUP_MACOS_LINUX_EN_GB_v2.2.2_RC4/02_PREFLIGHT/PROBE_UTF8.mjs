import fs from "node:fs";
import crypto from "node:crypto";

const path = process.argv[2];
const expected = process.argv[3];
if (!path || !expected) {
  console.error(JSON.stringify({ ok: false, error: "usage" }));
  process.exit(64);
}
try {
  const bytes = fs.readFileSync(path);
  const text = bytes.toString("utf8");
  const digest = crypto.createHash("sha256").update(bytes).digest("hex");
  const hasCR = bytes.includes(13);
  console.log(JSON.stringify({ ok: text === expected && !hasCR, utf8TextMatches: text === expected, hasCarriageReturn: hasCR, sha256: digest }));
  process.exit(text === expected && !hasCR ? 0 : 2);
} catch (error) {
  console.error(JSON.stringify({ ok: false, error: error.message }));
  process.exit(2);
}
