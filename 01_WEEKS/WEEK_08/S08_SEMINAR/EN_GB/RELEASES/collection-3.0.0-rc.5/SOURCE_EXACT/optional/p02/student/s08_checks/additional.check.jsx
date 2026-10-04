import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import WorkshopDashboard from '../src/WorkshopDashboard.jsx';
import { renderDashboard } from '../tests/helpers.jsx';
it('S08 optional P02 target actually removes a registration and releases capacity',async()=>{
 const user=userEvent.setup(),v=renderDashboard(WorkshopDashboard);
 await user.type(v.getByRole('textbox',{name:'Attendee name'}),'S08 Example');
 await user.click(v.getByRole('button',{name:'Register attendee'}));
 expect(v.getByRole('rowheader',{name:'S08 Example'})).toBeTruthy();
 await user.click(v.getByRole('button',{name:'Remove S08 Example'}));
 expect(v.queryByRole('rowheader',{name:'S08 Example'})).toBeNull();
 expect(v.getByRole('status')).toHaveTextContent('2 of 4');
});
