import React from "react";
import { readFile } from "node:fs/promises";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import App from "../src/App.jsx";

it("search draft and disclosure remain local across shared actions", async () => { const user = userEvent.setup(); render(<App />); await user.type(screen.getByRole("textbox", { name: "Search" }), "route"); await user.click(screen.getByRole("button", { name: "Show details for Route ownership" })); await user.click(screen.getByRole("button", { name: "Save Route ownership" })); expect(screen.getByRole("textbox", { name: "Search" })).toHaveValue("route"); expect(screen.getByText("URLs and UI identity")).toBeInTheDocument(); });
it("unrelated files preserve prop-drilled evidence and avoid global machinery", async () => { const app = await readFile("src/App.jsx", "utf8"); const evidence = await readFile("evidence/prop-drilled-app.jsx", "utf8"); expect(evidence).toMatch(/PropDrilledApp/); expect(app).not.toMatch(/createStore|configureStore|localStorage|window\.|globalThis/); });
