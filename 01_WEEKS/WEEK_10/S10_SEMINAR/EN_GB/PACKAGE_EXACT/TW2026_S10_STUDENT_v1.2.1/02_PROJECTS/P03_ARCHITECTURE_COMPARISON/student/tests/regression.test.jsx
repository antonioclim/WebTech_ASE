import { readFile } from "node:fs/promises";
import { expect, it } from "vitest";

it("view shell keeps scenario selection local and renders supplied evidence", async () => { const source = await readFile("src/App.jsx", "utf8"); expect(source).toMatch(/useState\(scenarios\[0\]\.id\)/); expect(source).toMatch(/<table>/); expect(source).toMatch(/compareArchitectures\(\{ candidates, requirements: scenario \}\)/); });
it("candidate and evidence modules remain free of Redux and fake performance claims", async () => { const files = await Promise.all(["src/candidates/LiftedPreferences.jsx", "src/candidates/ContextPreferences.jsx", "src/decision/evidence.js"].map((file) => readFile(file, "utf8"))); expect(files.join("\n")).not.toMatch(/@reduxjs|configureStore|benchmark|faster|renderCount|lineCount/i); });
