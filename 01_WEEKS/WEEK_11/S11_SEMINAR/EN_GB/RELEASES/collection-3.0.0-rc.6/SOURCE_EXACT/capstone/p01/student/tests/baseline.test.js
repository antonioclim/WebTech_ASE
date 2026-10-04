import assert from "node:assert/strict";
import { test } from "node:test";
import { createPasswordVerifier, dummyPasswordRecord } from "../src/passwords.js";
import { clearSessionCookie, readCookie, sessionCookie } from "../src/cookies.js";
import { createSessionStore } from "../src/session-store.js";
import { createUserRepository } from "../src/users.js";

test("supplied scrypt verifier performs real known and dummy work", async () => { const verifier = createPasswordVerifier(); const user = await createUserRepository().findByEmail("ada@example.test"); assert.equal(await verifier.verify("correct horse", user.password), true); assert.equal(await verifier.verify("wrong", user.password), false); assert.equal(await verifier.verify("dummy password", dummyPasswordRecord), true); });
test("opaque session store hashes lookup identity and expires deterministically", () => { let now = 10; const store = createSessionStore({ clock: { now: () => now }, randomBytes: () => Buffer.alloc(32, 3), ttlMs: 20 }); const created = store.create("u1"); assert.equal(created.token.includes("u1"), false); assert.equal(store.find(created.token).userId, "u1"); now = 30; assert.equal(store.find(created.token), null); assert.equal(store.size, 0); });
test("supplied cookie utilities preserve hardened scope", () => { const value = sessionCookie("a b", { secure: true, maxAgeSeconds: 60 }); assert.match(value, /^course_session=a%20b;/); assert.match(value, /HttpOnly/); assert.match(value, /SameSite=Lax/); assert.match(value, /Secure/); assert.equal(readCookie("x=1; course_session=a%20b"), "a b"); assert.match(clearSessionCookie({ secure: true }), /Max-Age=0/); });
