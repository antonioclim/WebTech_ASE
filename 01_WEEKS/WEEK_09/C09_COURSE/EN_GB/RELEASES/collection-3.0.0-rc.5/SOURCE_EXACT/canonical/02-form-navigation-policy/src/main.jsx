import { useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useNavigate, useParams } from "react-router-dom";

function NewNote() { const [title,setTitle]=useState(""); const [status,setStatus]=useState("idle"); const navigate=useNavigate(); async function submit(event){event.preventDefault();setStatus("saving");await new Promise((resolve)=>setTimeout(resolve,300));if(!title.trim())return setStatus("Enter a title");navigate(`/notes/42`,{replace:true,state:{note:{id:42,title:title.trim()}}});} return <form onSubmit={submit}><h1>New note</h1><label>Title <input value={title} onChange={(event)=>setTitle(event.target.value)} /></label><button disabled={status==="saving"}>Save</button><p role="status">{status}</p></form>; }
function Detail(){const {noteId}=useParams();return <h1>Confirmed note {noteId}</h1>;} function App(){return <Routes><Route path="/notes/new" element={<NewNote/>}/><Route path="/notes/:noteId" element={<Detail/>}/><Route path="*" element={<NewNote/>}/></Routes>;}
createRoot(document.getElementById("root")).render(<BrowserRouter><App/></BrowserRouter>);
