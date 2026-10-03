import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { it, expect, vi, beforeEach, afterEach } from 'vitest';
import SearchPanel from '../src/SearchPanel.jsx';
import { deferredSearch } from '../tests/helpers.jsx';
beforeEach(()=>vi.useFakeTimers());afterEach(()=>vi.useRealTimers());
it('S08 P03 omitted callback settles idle without repeated effect setup',async()=>{
 const search=vi.fn(()=>Promise.resolve([]));
 const v=render(<SearchPanel search={search} debounceMs={100} minimumLength={2}/>);
 expect(v.getByRole('status')).toHaveTextContent('Enter at least 2');
 v.rerender(<SearchPanel search={search} debounceMs={100} minimumLength={2}/>);
 await act(()=>vi.advanceTimersByTimeAsync(300));expect(search).not.toHaveBeenCalled();
});
it('S08 P03 unmount aborts the started signal; late error is not logged',async()=>{
 const d=deferredSearch(),logger=vi.fn();
 const v=render(<SearchPanel search={d.search} debounceMs={100} onUnexpectedError={logger}/>);
 fireEvent.change(v.getByRole('textbox'),{target:{value:'old'}});await act(()=>vi.advanceTimersByTimeAsync(100));
 expect(d.calls).toHaveLength(1);const call=d.calls[0];v.unmount();expect(call.options.signal.aborted).toBe(true);
 await act(async()=>call.reject(new Error('fabricated late diagnostic')));expect(logger).not.toHaveBeenCalled();
});
it('S08 P03 shortening rejects a non-cooperative old settlement',async()=>{
 const d=deferredSearch(),logger=vi.fn();const v=render(<SearchPanel search={d.search} debounceMs={100} onUnexpectedError={logger}/>);
 fireEvent.change(v.getByRole('textbox'),{target:{value:'old'}});await act(()=>vi.advanceTimersByTimeAsync(100));
 fireEvent.change(v.getByRole('textbox'),{target:{value:'o'}});expect(d.calls[0].options.signal.aborted).toBe(true);
 await act(async()=>d.calls[0].resolve([{id:'x',title:'Old result'}]));
 expect(v.getByRole('status')).toHaveTextContent('Enter at least');expect(v.queryByText('Old result')).toBeNull();
});
it('S08 P03 early unmount clears the pending debounce timer',async()=>{
 const search=vi.fn();const v=render(<SearchPanel search={search} debounceMs={100}/>);
 fireEvent.change(v.getByRole('textbox'),{target:{value:'old'}});v.unmount();await act(()=>vi.advanceTimersByTimeAsync(200));expect(search).not.toHaveBeenCalled();
});
