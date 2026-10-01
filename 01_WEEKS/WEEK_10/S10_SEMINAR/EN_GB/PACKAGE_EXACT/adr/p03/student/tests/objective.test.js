// @vitest-environment node
import { readFile } from "node:fs/promises";
import { expect, it } from "vitest";
import { compareArchitectures } from "../src/decision/compare-architectures.js";
import { candidates } from "../src/decision/evidence.js";
import { scenarios } from "../src/decision/scenarios.js";

const compare = (requirements, supplied = candidates) => compareArchitectures({ candidates: supplied, requirements });
it("excludes candidates before comparison when characterized behavior differs", () => { const changed = candidates.map((item, index) => index ? { ...item, behaviorSignature: "different" } : item); const result = compare(scenarios[0], changed); expect(result.parity).toBe(false); expect(result.selectedCandidateId).toBeNull(); expect(result.evidence.every((item) => !item.eligible)).toBe(true); });
it("recommends from capability gates and evidence cost for canonical scenarios", () => { expect(compare(scenarios[0]).selectedCandidateId).toBe("lifted"); expect(compare(scenarios[1]).selectedCandidateId).toBe("context-reducer"); const unsupported = compare(scenarios[2]); expect(unsupported.selectedCandidateId).toBeNull(); expect(unsupported.evidence.every((item) => !item.eligible)).toBe(true); expect(unsupported.reasons[0]).toMatch(/No candidate satisfies/); });
it("preserves unresolved ties unless an explicit tie-break criterion exists", () => { const tied = candidates.map((item) => ({ ...item, costs: { conceptual: 1, dependency: 0, coordinationFactor: 0 } })); const requirements = { requiredCapabilities: ["noNewDependency"], coordinationPressure: 0 }; expect(compare(requirements, tied)).toMatchObject({ tie: true, selectedCandidateId: null }); expect(compare({ ...requirements, tieBreak: "candidateId" }, tied)).toMatchObject({ tie: true, selectedCandidateId: "context-reducer" }); });
it("is input-order independent, deterministic, and immutable", () => { const before = structuredClone(candidates); const forward = compare(scenarios[1]); const reverse = compare(scenarios[1], [...candidates].reverse()); expect(reverse).toEqual(forward); expect(candidates).toEqual(before); expect(compare(scenarios[1])).toEqual(forward); });
it("source uses generic evidence rather than library/scenario preferences", async () => { const source = await readFile("src/decision/compare-architectures.js", "utf8"); expect(source).not.toMatch(/lifted|context|redux|single-screen|distant-consumers|central-async|lineCount|renderCount/i); expect(source).toMatch(/requiredCapabilities/); expect(source).toMatch(/coordinationPressure/); });
