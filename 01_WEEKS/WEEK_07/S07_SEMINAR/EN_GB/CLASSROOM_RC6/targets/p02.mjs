export async function bookSeats(store,{eventId,attendeeId,seats,afterCreated=async()=>{}}){
 if(!Number.isInteger(seats)||seats<=0)throw TypeError('invalid_seats');
 return store.managed(async tx=>{
  const event=await store.event(eventId,tx);if(!event)throw Error('event_not_found');
  if(event.available<seats)throw Error('sold_out');
  // TODO: duplicate lookup; error booking_exists before writes.
  // await seat update, booking create, afterCreated({booking,transaction:tx}), audit.
  // Pass same tx to ALL FIVE DB operations; return detached {booking,available}.
  void attendeeId;void afterCreated;return {booking:null,available:event.available};
 });
}
