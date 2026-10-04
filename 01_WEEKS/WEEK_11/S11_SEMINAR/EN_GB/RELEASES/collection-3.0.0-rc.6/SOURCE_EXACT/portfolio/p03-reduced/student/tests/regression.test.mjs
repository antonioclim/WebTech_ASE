import assert from "node:assert/strict";import test from "node:test";import {createReducedSecurityBoundary} from "../src/security-boundary.js";
const make=()=>createReducedSecurityBoundary({trustedOrigins:["https://course.example"],expectedCsrfToken:"synthetic-token-0001",compareTokens:(a,b)=>a===b});
test("safe methods and non-cookie authentication do not require the CSRF fixture",()=>{assert.equal(make().csrfDecision({method:"GET",authMethod:"cookie"}).allowed,true);assert.equal(make().csrfDecision({method:"PATCH",authMethod:"bearer"}).allowed,true);});
test("decisions never include the expected token",()=>{const text=JSON.stringify(make().csrfDecision({method:"PATCH",authMethod:"cookie",suppliedToken:"wrong"}));assert.equal(text.includes("synthetic-token-0001"),false);});
