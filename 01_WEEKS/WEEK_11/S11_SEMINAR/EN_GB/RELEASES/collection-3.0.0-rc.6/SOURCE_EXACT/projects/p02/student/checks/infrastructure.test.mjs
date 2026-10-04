import assert from "node:assert/strict";
import test from "node:test";
import { requireAuthentication } from "../src/authentication.js";
import { hasPermission } from "../src/permissions.js";
import { requireCsrf } from "../src/csrf.js";
import { createReportRepository } from "../src/report-repository.js";
const response = () => ({ statusCode: null, body: null, status(n) { this.statusCode = n; return this; }, json(value) { this.body = value; return this; } });
function authentication(value) { const request = { get: () => value }; const res = response(); let calls = 0; requireAuthentication(request, res, () => calls++); return { request, res, calls }; }
test("successor P02 configured fixtures attach frozen own principals", () => { for (const key of ["member-u1", "member-u2", "moderator-u2", "admin-u9"]) { const x = authentication(`Session ${key}`); assert.equal(x.calls, 1); assert.equal(Object.hasOwn(x.request.principal, "id"), true); assert.equal(Object.isFrozen(x.request.principal), true); } });
test("successor P02 inherited fixture names are stable 401 denials", () => { for (const key of ["__proto__", "constructor", "toString"]) { const x = authentication(`Session ${key}`); assert.equal(x.res.statusCode, 401); assert.equal(x.calls, 0); assert.equal(x.request.principal, undefined); } });
test("successor P02 malformed authentication headers are not coerced", () => { for (const value of [undefined, null, 3, [], {}, "session member-u1", "Session member-u1\r\n"]) { const x = authentication(value); assert.equal(x.res.statusCode, 401); assert.equal(x.calls, 0); } });
test("successor P02 unknown and inherited roles have no permission", () => { for (const role of ["unknown", "__proto__", "constructor", "toString", null, undefined, [], {}]) assert.equal(hasPermission(role, "report:resolve"), false); });
test("successor P02 configured permission vocabulary is preserved", () => { assert.equal(hasPermission("member", "report:readOwn"), true); assert.equal(hasPermission("member", "report:resolve"), false); assert.equal(hasPermission("moderator", "report:resolve"), true); assert.equal(hasPermission("admin", "report:deleteAny"), true); });
function csrf(method, supplied, principal = { id: "u1" }) { const res = response(); let calls = 0; requireCsrf({ method, principal, get: () => supplied }, res, () => calls++); return { res, calls }; }
test("successor P02 safe canonical methods pass the supplied CSRF fixture", () => { for (const method of ["GET", "HEAD", "OPTIONS"]) assert.equal(csrf(method, undefined).calls, 1); });
test("successor P02 unsafe methods require the exact synthetic token", () => { assert.equal(csrf("POST", "csrf-u1").calls, 1); for (const supplied of ["", "wrong", null, undefined, [], {}, "csrf-u1\r\n"]) { const x = csrf("POST", supplied); assert.equal(x.res.statusCode, 403); assert.equal(x.calls, 0); } });
test("successor P02 noncanonical methods are refused rather than normalised", () => { for (const method of ["get", " POST", "", null, [], "POST\r\n"]) { const x = csrf(method, "csrf-u1"); assert.equal(x.res.statusCode, 403); assert.equal(x.calls, 0); } });
test("successor P02 missing unsafe principal is stable 401", () => { const x = csrf("POST", "csrf-u1", null); assert.equal(x.res.statusCode, 401); assert.equal(x.calls, 0); });
test("successor P02 flat snapshots and fresh repositories remain isolated", async () => { const first = createReportRepository(), second = createReportRepository(); const record = await first.findById("r1"); assert.equal(Object.isFrozen(record), true); await first.submit("r1"); assert.equal((await second.findById("r1")).status, "draft"); assert.equal(record.status, "draft"); });
