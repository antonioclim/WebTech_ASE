import assert from "node:assert/strict";
import { test } from "node:test";
import { hasPermission } from "../src/permissions.js";
import { auth, fixture, withApp } from "./helpers.js";

test("supplied permission map and repository snapshots are immutable", async () => { assert.equal(hasPermission("member", "report:submitOwn"), true); assert.equal(hasPermission("member", "report:resolve"), false); const { repository } = fixture(); const report = await repository.findById("r1"); assert.equal(Object.isFrozen(report), true); assert.equal(report.ownerId, "u1"); });
test("supplied auth and CSRF boundaries run before a passthrough policy", async () => { let policyCalls = 0; const authorize = ({ loadResource }) => async (request, _response, next) => { policyCalls += 1; request.authorizedResource = await loadResource(request.params.reportId); next(); }; const { app } = fixture({ authorize }); await withApp(app, async (url) => { assert.equal((await fetch(`${url}/api/reports/r1`)).status, 401); assert.equal((await fetch(`${url}/api/reports/r1/submit`, { method: "POST", headers: auth("member-u1", false) })).status, 403); assert.equal(policyCalls, 0); const allowed = await fetch(`${url}/api/reports/r1`, { headers: auth("member-u1") }); assert.equal(allowed.status, 200); assert.equal(policyCalls, 1); }); });
