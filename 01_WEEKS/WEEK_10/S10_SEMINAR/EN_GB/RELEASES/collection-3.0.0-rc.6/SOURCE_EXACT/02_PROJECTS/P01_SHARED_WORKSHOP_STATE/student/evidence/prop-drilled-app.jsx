import React, { useState } from "react";
import { sessions } from "../src/sessions.js";

export default function PropDrilledApp() {
  const [savedIds, setSavedIds] = useState([]);
  const toggle = (id) => setSavedIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  return <main><h1>Prop-drilled workshop</h1><p>Saved: {savedIds.length}</p><section>{sessions.map((session) => <article key={session.id}><h2>{session.title}</h2><button type="button" onClick={() => toggle(session.id)}>{savedIds.includes(session.id) ? "Remove" : "Save"} {session.title}</button></article>)}</section></main>;
}
