import assert from "node:assert/strict";import test from "node:test";import {normaliseOriginSet,SAFE_METHODS} from "../src/support.js";
test("support accepts exact benign origins",()=>{const s=normaliseOriginSet(["https://course.example"]);assert.equal(s.has("https://course.example"),true);assert.equal(s.has("https://course.example.invalid"),false);});
test("safe methods are fixed teaching inputs",()=>assert.deepEqual([...SAFE_METHODS],["GET","HEAD","OPTIONS"]));
