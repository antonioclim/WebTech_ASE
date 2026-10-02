import React, { useState } from "react";
import { sessions, visibleSessions } from "./sessions.js";
import {
  WorkshopProvider,
  useWorkshopDispatch,
  useWorkshopState,
} from "./state/workshop-state.jsx";

// Search stays local here while track and saved ids live in shared
// state, which is the boundary this unit is teaching.
function Toolbar({ search, onSearchChange }) {
  const { track } = useWorkshopState();
  const dispatch = useWorkshopDispatch();

  return (
    <section aria-label="Workshop controls">
      <label>
        Track{" "}
        <select
          value={track}
          onChange={(event) =>
            dispatch({ type: "track/selected", track: event.target.value })}
        >
          <option value="all">All</option>
          <option value="frontend">Frontend</option>
          <option value="backend">Backend</option>
        </select>
      </label>
      <label>
        Search{" "}
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </label>
    </section>
  );
}

function SessionCard({ session }) {
  const { savedIds } = useWorkshopState();
  const dispatch = useWorkshopDispatch();
  const [open, setOpen] = useState(false);
  const saved = savedIds.includes(session.id);

  return (
    <article>
      <h2>{session.title}</h2>
      <p>{session.track}</p>
      <button
        type="button"
        onClick={() => dispatch({ type: "session/toggled", id: session.id })}
      >
        {saved ? "Remove" : "Save"} {session.title}
      </button>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Hide" : "Show"} details for {session.title}
      </button>
      {open && <p>{session.description}</p>}
    </article>
  );
}

function SavedSummary() {
  const { savedIds } = useWorkshopState();
  const dispatch = useWorkshopDispatch();

  return (
    <aside aria-label="Saved summary">
      <p>Saved: {savedIds.length}</p>
      <button
        type="button"
        disabled={savedIds.length === 0}
        onClick={() => dispatch({ type: "saved/cleared" })}
      >
        Clear saved
      </button>
    </aside>
  );
}

function WorkshopWorkspace() {
  const [search, setSearch] = useState("");
  const { track } = useWorkshopState();
  const shown = visibleSessions(sessions, track, search);

  return (
    <main>
      <h1>Workshop planner</h1>
      <Toolbar search={search} onSearchChange={setSearch} />
      <SavedSummary />
      <section aria-label="Sessions">
        {shown.length === 0 ? (
          <p>No matching sessions</p>
        ) : (
          shown.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))
        )}
      </section>
    </main>
  );
}

export default function App({ initialState }) {
  return (
    <WorkshopProvider initialState={initialState}>
      <WorkshopWorkspace />
    </WorkshopProvider>
  );
}
