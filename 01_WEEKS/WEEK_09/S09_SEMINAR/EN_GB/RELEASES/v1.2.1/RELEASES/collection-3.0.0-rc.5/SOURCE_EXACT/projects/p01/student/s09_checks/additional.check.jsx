// Supplementary S09 checks, authored but NOT executed during production.
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import { afterEach, expect, it } from 'vitest';
import NotesApp from '../src/NotesApp.jsx';
import { createNotesStore } from '../src/notes-store.js';
afterEach(cleanup);
function Controls(){const n=useNavigate(),l=useLocation();return <><output aria-label="Observed path">{l.pathname}</output><button onClick={()=>n(-1)}>Probe back</button><button onClick={()=>n(1)}>Probe forward</button></>;}
function open(entries,index){const store=createNotesStore();return {store,...render(<MemoryRouter initialEntries={entries} initialIndex={index}><Controls/><NotesApp store={store}/></MemoryRouter>)};}
it('S09 supplementary: create replacement is discriminated by back and forward',async()=>{
 const v=open(['/notes','/notes/new'],1),u=userEvent.setup();
 await u.type(v.getByRole('textbox',{name:'Title'}),'Created');
 await u.click(v.getByRole('button',{name:'Save note'}));
 expect(v.getByLabelText('Observed path')).toHaveTextContent('/notes/3');
 await u.click(v.getByRole('button',{name:'Probe back'}));
 expect(v.getByLabelText('Observed path').textContent).toBe('/notes');
 expect(v.getByRole('heading',{name:'Notes'})).toBeInTheDocument();
 await u.click(v.getByRole('button',{name:'Probe forward'}));
 expect(v.getByLabelText('Observed path').textContent).toBe('/notes/3');
 expect(v.getByRole('heading',{name:'Created'})).toBeInTheDocument();
});
it('S09 supplementary: a missing edit target is data-not-found, not a form or thrown error',()=>{
 const v=open(['/notes/99/edit'],0);
 expect(v.getByRole('heading',{name:'Note not found'})).toBeInTheDocument();
 expect(v.queryByRole('textbox',{name:'Title'})).not.toBeInTheDocument();
 expect(v.store.list()).toHaveLength(2);
});
it('S09 supplementary: cancel from new leaves the store untouched',async()=>{
 const v=open(['/notes/new'],0),u=userEvent.setup(),before=v.store.list();
 await u.type(v.getByRole('textbox',{name:'Title'}),'Draft only');
 await u.click(v.getByRole('link',{name:'Cancel'}));
 expect(v.store.list()).toEqual(before);
 expect(v.getByLabelText('Observed path').textContent).toBe('/notes');
});
