import { createRoot } from "react-dom/client";
import { BrowserRouter, Link, Route, Routes, useParams, useSearchParams } from "react-router-dom";

function List() { const [search, setSearch] = useSearchParams(); const filter = search.get("filter") ?? "all"; return <><h1>Notes</h1><p>URL filter: {filter}</p><button onClick={() => setSearch({ filter: "archived" })}>Show archived</button><ul><li><Link to="/notes/42">Open note 42</Link></li></ul></>; }
function Detail() { const { noteId } = useParams(); return <><h1>Note {noteId}</h1><Link to="/notes">Back to notes</Link></>; }
function App() { return <main><nav><Link to="/notes">Notes</Link> <Link to="/notes/new">New note</Link></nav><Routes><Route path="/notes" element={<List />} /><Route path="/notes/new" element={<h1>New note</h1>} /><Route path="/notes/:noteId" element={<Detail />} /><Route path="*" element={<h1>Page not found</h1>} /></Routes></main>; }
createRoot(document.getElementById("root")).render(<BrowserRouter><App /></BrowserRouter>);
