import React, { StrictMode } from 'react';
import { render, fireEvent } from '@testing-library/react';
import { readFile } from 'node:fs/promises';
import { it, expect, vi } from 'vitest';
import ReadingQueue from '../src/App.jsx';
import { memoryStorage, fixtures } from '../tests/helpers.jsx';
it('S08 P01 inventory checks every named responsibility separately', async()=>{
 const text=await readFile('src/App.jsx','utf8');
 for(const name of ['QueueForm','QueueFilter','QueueList','QueueItem']) expect(text).toMatch(new RegExp(String.raw`function\s+${name}\s*\(`));
});
it('S08 P01 a StrictMode add reserves one event ID', ()=>{
 const createItemId=vi.fn(()=> 'event-c');const storage=memoryStorage();
 const v=render(<StrictMode><ReadingQueue storage={storage} initialItems={fixtures} createItemId={createItemId}/></StrictMode>);
 fireEvent.change(v.getByRole('textbox',{name:/book title/i}),{target:{value:'React'}});
 fireEvent.submit(v.getByRole('button',{name:'Add book'}).closest('form'));
 expect(createItemId).toHaveBeenCalledTimes(1);expect(v.getByText('React')).toBeTruthy();
 expect(JSON.parse(storage.value()).filter(x=>x.id==='event-c')).toHaveLength(1);
});
