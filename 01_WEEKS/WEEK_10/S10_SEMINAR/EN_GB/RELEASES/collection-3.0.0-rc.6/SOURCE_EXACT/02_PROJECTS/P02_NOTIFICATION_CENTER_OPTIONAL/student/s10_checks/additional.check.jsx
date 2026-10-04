// S10 optional advanced regression witnesses. Actual RTK/Vitest not run during production.
import { configureStore } from '@reduxjs/toolkit';
import { expect, it } from 'vitest';
import { notificationsReducer, refreshNotifications, markNotificationRead, resetNotifications, selectNotifications, selectMarkStatus } from '../src/store/notifications-slice.js';
const note={id:'n1',title:'Notice',read:false,createdAt:'2026-01-01T00:00:00Z'};
const setup=()=>configureStore({reducer:{notifications:notificationsReducer}});
it('S10: confirmed mark survives an older list settlement',()=>{
 const s=setup();s.dispatch(refreshNotifications.pending('r1',undefined));
 s.dispatch(markNotificationRead.pending('m1','n1'));
 s.dispatch(markNotificationRead.fulfilled({...note,read:true},'m1','n1'));
 s.dispatch(refreshNotifications.fulfilled([note],'r1',undefined));
 expect(selectNotifications(s.getState())[0].read).toBe(true);
});
it('S10: reset prevents a previous mark from repopulating local state',()=>{
 const s=setup();s.dispatch(markNotificationRead.pending('m1','n1'));s.dispatch(resetNotifications());
 s.dispatch(markNotificationRead.fulfilled({...note,read:true},'m1','n1'));
 expect(selectNotifications(s.getState())).toEqual([]);
 expect(selectMarkStatus(s.getState(),'n1')).toEqual({status:'idle',error:null});
});
it('S10: a stale same-ID rejection cannot replace a newer success',()=>{
 const s=setup();s.dispatch(markNotificationRead.pending('old','n1'));s.dispatch(markNotificationRead.pending('new','n1'));
 s.dispatch(markNotificationRead.fulfilled({...note,read:true},'new','n1'));
 s.dispatch(markNotificationRead.rejected(new Error('old'),'old','n1',{id:'n1',message:'older failure'}));
 expect(selectMarkStatus(s.getState(),'n1')).toEqual({status:'succeeded',error:null});
});
it('S10: ordinary latest refresh remains a positive control',()=>{
 const s=setup();s.dispatch(refreshNotifications.pending('r1',undefined));s.dispatch(refreshNotifications.pending('r2',undefined));
 s.dispatch(refreshNotifications.fulfilled([{...note,title:'New'}],'r2',undefined));
 s.dispatch(refreshNotifications.fulfilled([note],'r1',undefined));
 expect(selectNotifications(s.getState())[0].title).toBe('New');
});
