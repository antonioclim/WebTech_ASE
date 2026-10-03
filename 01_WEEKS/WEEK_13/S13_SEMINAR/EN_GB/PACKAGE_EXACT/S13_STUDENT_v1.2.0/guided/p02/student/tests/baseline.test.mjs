import assert from "node:assert/strict";
import test from "node:test";
import { directTaskFetch, registerCourseWorker } from "../src/sw-registration.js";
import { createFakeContainer } from "./fake-container.mjs";

test("supplied fake container publishes messages and controller changes", () => { const { container } = createFakeContainer(); let messages = 0; container.addEventListener("message", () => { messages += 1; }); container.emit("message", { data: {} }); assert.equal(messages, 1); });
test("supplied registration helper uses explicit script and scope", async () => { const calls = []; const container = { ready: Promise.resolve({ active: true }), async register(...args) { calls.push(args); } }; assert.deepEqual(await registerCourseWorker(container), { active: true }); assert.deepEqual(calls, [["/service-worker.js", { scope: "/" }]]); assert.equal(typeof directTaskFetch, "function"); });
