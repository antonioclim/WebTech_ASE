import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import PropDrilledApp from "../evidence/prop-drilled-app.jsx";
import { sessions, visibleSessions } from "../src/sessions.js";

it("supplied fixtures and derived filtering stay immutable", () => { expect(visibleSessions(sessions, "frontend", "effect").map(({ id }) => id)).toEqual(["s3"]); expect(Object.isFrozen(sessions)).toBe(true); });
it("prop-drilled evidence preserves characterized save behavior", async () => { render(<PropDrilledApp />); await userEvent.click(screen.getByRole("button", { name: "Save Route ownership" })); expect(screen.getByText("Saved: 1")).toBeInTheDocument(); expect(screen.getByRole("button", { name: "Remove Route ownership" })).toBeInTheDocument(); });
