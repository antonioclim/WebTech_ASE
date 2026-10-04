import React, { useState } from "react";

function PreferenceControl({ compact, onToggle }) { return <button type="button" onClick={onToggle}>Use {compact ? "comfortable" : "compact"} layout</button>; }
function PreferenceSummary({ compact }) { return <p role="status">Layout: {compact ? "compact" : "comfortable"}</p>; }

export default function LiftedPreferences() {
  const [compact, setCompact] = useState(false);
  return <section aria-label="Lifted state candidate"><h2>Lifted state</h2><PreferenceControl compact={compact} onToggle={() => setCompact((value) => !value)} /><PreferenceSummary compact={compact} /></section>;
}
