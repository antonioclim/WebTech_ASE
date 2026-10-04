import React, { createContext, useContext, useReducer } from "react";

const PreferencesContext = createContext(null);
function reducer(state, action) { if (action.type === "layout/toggled") return { compact: !state.compact }; return state; }
function PreferenceControl() { const { state, dispatch } = useContext(PreferencesContext); return <button type="button" onClick={() => dispatch({ type: "layout/toggled" })}>Use {state.compact ? "comfortable" : "compact"} layout</button>; }
function PreferenceSummary() { const { state } = useContext(PreferencesContext); return <p role="status">Layout: {state.compact ? "compact" : "comfortable"}</p>; }

export default function ContextPreferences() {
  const [state, dispatch] = useReducer(reducer, { compact: false });
  return <PreferencesContext.Provider value={{ state, dispatch }}><section aria-label="Context reducer candidate"><h2>Context + reducer</h2><PreferenceControl /><PreferenceSummary /></section></PreferencesContext.Provider>;
}
