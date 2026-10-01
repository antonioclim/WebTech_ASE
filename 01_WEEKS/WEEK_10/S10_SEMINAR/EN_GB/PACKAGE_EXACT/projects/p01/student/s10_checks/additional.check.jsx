// S10 supplementary checks: authored, not executed during local production.
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { WorkshopProvider, workshopReducer, useWorkshopState, useWorkshopDispatch } from '../src/state/workshop-state.jsx';
afterEach(cleanup);
it('S10: dispatch hook refuses use outside its provider',()=>{
 function Probe(){useWorkshopDispatch();return null;}
 expect(()=>render(<Probe/>)).toThrow(/inside WorkshopProvider/);
});
it('S10: no-op transitions preserve reference and frozen seed is not mutated',()=>{
 const s=Object.freeze({track:'all',savedIds:Object.freeze([])});
 expect(workshopReducer(s,{type:'track/selected',track:'all'})).toBe(s);
 expect(workshopReducer(s,{type:'saved/cleared'})).toBe(s);
 const n=workshopReducer(s,{type:'session/toggled',id:'w1'});
 expect(n.savedIds).toEqual(['w1']);expect(s.savedIds).toEqual([]);
});
it('S10: two mounted providers own distinct seed arrays',()=>{
 const snapshots=[];function Probe(){snapshots.push(useWorkshopState());return null;}
 const seed={track:'all',savedIds:['w1','w1']};
 render(<><WorkshopProvider initialState={seed}><Probe/></WorkshopProvider><WorkshopProvider initialState={seed}><Probe/></WorkshopProvider></>);
 expect(snapshots).toHaveLength(2);
 expect(snapshots[0].savedIds).toEqual(['w1']);
 expect(snapshots[0].savedIds).not.toBe(snapshots[1].savedIds);
 expect(snapshots[0].savedIds).not.toBe(seed.savedIds);
});
