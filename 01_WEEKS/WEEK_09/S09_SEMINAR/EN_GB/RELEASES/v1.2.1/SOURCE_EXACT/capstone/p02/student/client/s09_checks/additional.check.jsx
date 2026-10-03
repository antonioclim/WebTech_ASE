// Supplementary private/capstone checks. Authored; React/Vitest not executed in production.
import { act, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { deferred, fakeApi, renderWorkspace } from '../tests/helpers.jsx';
afterEach(cleanup);
it('S09: empty initial list is observed independently',async()=>{
 const v=renderWorkspace(fakeApi([]));
 expect(await v.findByText('No notes yet.')).toBeInTheDocument();
});
it('S09: a refresh predating a confirmed create cannot remove that confirmation',async()=>{
 const d=deferred(),api=fakeApi(),u=userEvent.setup();
 api.list=vi.fn().mockResolvedValueOnce([{id:'1',title:'Initial',body:''}]).mockReturnValueOnce(d.promise);
 const v=renderWorkspace(api);await v.findByRole('button',{name:'Initial'});
 await u.click(v.getByRole('button',{name:'Refresh notes'}));
 await u.type(v.getByRole('textbox',{name:'Title'}),'Confirmed');
 await u.click(v.getByRole('button',{name:'Save note'}));
 await v.findByRole('button',{name:'Confirmed'});
 await act(async()=>d.resolve([{id:'1',title:'Initial',body:''}]));
 expect(v.getByRole('button',{name:'Confirmed'})).toBeInTheDocument();
});
it('S09: unmount aborts the exact signal given to the load adapter',async()=>{
 const d=deferred(),api=fakeApi();let signal;
 api.list=vi.fn(o=>{signal=o.signal;return d.promise;});
 const v=renderWorkspace(api);await act(async()=>{});
 expect(signal.aborted).toBe(false);v.unmount();expect(signal.aborted).toBe(true);
 await act(async()=>d.resolve([]));
 // This signal/DOM test alone does not count or prove absence of late setter attempts.
});
