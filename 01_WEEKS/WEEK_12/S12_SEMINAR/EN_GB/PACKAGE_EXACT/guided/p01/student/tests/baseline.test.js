import assert from "node:assert/strict";
import test from "node:test";
import { runCalculation } from "../src/calculation.js";
import { withSystem } from "./helpers.js";

test("supplied calculation adapter computes a sum", async () => assert.equal(await runCalculation({ operation: "sum", values: [2, 3, 5] }), 10));
test("supplied HTTP and WebSocket server shell starts", async () => { await withSystem(async ({ httpUrl }) => { const response = await fetch(`${httpUrl}/health`); assert.equal(response.status, 200); assert.deepEqual(await response.json(), { status: "ok" }); }); });
