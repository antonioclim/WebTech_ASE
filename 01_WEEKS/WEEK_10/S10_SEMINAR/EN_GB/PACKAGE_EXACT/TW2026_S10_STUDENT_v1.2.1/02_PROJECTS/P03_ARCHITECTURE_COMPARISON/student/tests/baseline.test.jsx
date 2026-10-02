import React from "react";
import { render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import ContextPreferences from "../src/candidates/ContextPreferences.jsx";
import LiftedPreferences from "../src/candidates/LiftedPreferences.jsx";
import { candidates } from "../src/decision/evidence.js";
import { scenarios } from "../src/decision/scenarios.js";

for (const [name, Candidate] of [["lifted", LiftedPreferences], ["context", ContextPreferences]]) it(`${name} candidate preserves characterized behavior`, async () => { const view = render(<Candidate />); expect(within(view.container).getByRole("status")).toHaveTextContent("Layout: comfortable"); await userEvent.click(within(view.container).getByRole("button", { name: "Use compact layout" })); expect(within(view.container).getByRole("status")).toHaveTextContent("Layout: compact"); });
it("supplied evidence and scenarios are immutable data without recommendations", () => { expect(candidates).toHaveLength(2); expect(scenarios).toHaveLength(3); expect(Object.isFrozen(candidates)).toBe(true); expect(scenarios.some((scenario) => "expected" in scenario || "recommendation" in scenario)).toBe(false); });
