import { configureStore, createSlice } from "@reduxjs/toolkit";
import { expect, it } from "vitest";
import { createNotificationsApi } from "../src/notifications-api.js";

it("supplied notification API returns detached data and authoritative mark result", async () => { const api = createNotificationsApi(); const first = await api.list(); first[0].title = "mutated"; expect((await api.list())[0].title).toBe("Build finished"); expect((await api.markRead("n1")).read).toBe(true); });
it("Redux Toolkit store and injected thunk plumbing work independently", async () => { const probe = createSlice({ name: "probe", initialState: 0, reducers: { increment: (state) => state + 1 } }); const store = configureStore({ reducer: { probe: probe.reducer }, middleware: (getDefault) => getDefault({ thunk: { extraArgument: { marker: 7 } } }) }); const value = await store.dispatch((_, __, extra) => extra.marker); store.dispatch(probe.actions.increment()); expect(value).toBe(7); expect(store.getState().probe).toBe(1); });
