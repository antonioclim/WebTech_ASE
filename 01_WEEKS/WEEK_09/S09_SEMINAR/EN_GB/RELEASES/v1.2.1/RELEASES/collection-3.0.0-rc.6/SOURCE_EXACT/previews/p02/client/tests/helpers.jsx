import React from "react";
import { createServer } from "node:http";
import { render } from "@testing-library/react";
import NotesWorkspace from "../src/NotesWorkspace.jsx";
import { listen } from "../../server/server.js";
export function deferred() { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; }
export function fakeApi(listResult = [{ id: "1", title: "One", body: "Body" }]) { return { list: async () => structuredClone(listResult), create: async (input) => ({ id: "2", ...input }), update: async (id, input) => ({ id, ...input }), remove: async () => null }; }
export const renderWorkspace = (api) => render(<NotesWorkspace api={api} />);
export async function withServer(app, run) { const server = createServer(app); const baseUrl = await listen(server); try { await run(baseUrl); } finally { await new Promise((resolve) => server.close(resolve)); } }
