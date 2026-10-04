import React, { useState } from "react";
import ContextPreferences from "./candidates/ContextPreferences.jsx";
import LiftedPreferences from "./candidates/LiftedPreferences.jsx";
import { compareArchitectures } from "./decision/compare-architectures.js";
import { candidates } from "./decision/evidence.js";
import { scenarios } from "./decision/scenarios.js";

export default function App() {
  const [scenarioId, setScenarioId] = useState(scenarios[0].id);
  const scenario = scenarios.find(({ id }) => id === scenarioId);
  const result = compareArchitectures({ candidates, requirements: scenario });
  return <main><h1>Frontend architecture comparison</h1><label>Scenario <select value={scenarioId} onChange={(event) => setScenarioId(event.target.value)}>{scenarios.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
    <section className="candidates"><LiftedPreferences /><ContextPreferences /></section>
    <h2>Decision evidence</h2><table><thead><tr><th>Candidate</th><th>Eligible</th><th>Cost</th><th>Missing capabilities</th></tr></thead><tbody>{result.evidence.map((item) => <tr key={item.id}><th>{item.label}</th><td>{item.eligible ? "yes" : "no"}</td><td>{item.score ?? "—"}</td><td>{item.missingCapabilities.join(", ") || "none"}</td></tr>)}</tbody></table>
    <p role="status">Recommendation: {result.selectedCandidateId ?? "unresolved"}</p><ul>{result.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
  </main>;
}
