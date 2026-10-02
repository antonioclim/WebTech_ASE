import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import App from "../src/App.jsx";

it("comparison view renders evidence and responds to scenario selection", async () => { render(<App />); expect(screen.getByText("Recommendation: lifted")).toBeInTheDocument(); await userEvent.selectOptions(screen.getByRole("combobox", { name: "Scenario" }), "distant-consumers"); expect(screen.getByText("Recommendation: context-reducer")).toBeInTheDocument(); await userEvent.selectOptions(screen.getByRole("combobox", { name: "Scenario" }), "central-async"); expect(screen.getByText("Recommendation: unresolved")).toBeInTheDocument(); expect(screen.getByRole("table")).toBeInTheDocument(); });
