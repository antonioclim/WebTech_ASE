import {DatabaseSync}from 'node:sqlite';
export function database(){const db=new DatabaseSync(':memory:');try{db.exec(`PRAGMA foreign_keys=ON;
CREATE TABLE sessions(id INTEGER PRIMARY KEY,title TEXT NOT NULL);CREATE TABLE attendees(id INTEGER PRIMARY KEY,name TEXT NOT NULL);
CREATE TABLE registrations(session_id INTEGER REFERENCES sessions(id),attendee_id INTEGER REFERENCES attendees(id),UNIQUE(session_id,attendee_id));
INSERT INTO sessions VALUES(1,'Web');INSERT INTO attendees VALUES(7,'Ada'),(8,'Grace');INSERT INTO registrations VALUES(1,8),(1,7);
CREATE TABLE events(id INTEGER PRIMARY KEY,available INTEGER NOT NULL CHECK(available>=0));INSERT INTO events VALUES(1,5);
CREATE TABLE bookings(id INTEGER PRIMARY KEY,event_id INTEGER NOT NULL REFERENCES events(id),attendee_id INTEGER NOT NULL REFERENCES attendees(id),seats INTEGER NOT NULL CHECK(seats>0),UNIQUE(event_id,attendee_id));
CREATE TABLE audits(id INTEGER PRIMARY KEY,booking_id INTEGER NOT NULL REFERENCES bookings(id),seats INTEGER NOT NULL CHECK(seats>0));`);return db;}catch(error){try{db.close();}catch(closeError){throw new AggregateError([error,closeError],'SQLite schema initialisation and owned connection closure failed',{cause:error});}throw error;}}
export function bookingStore(db,{auditFail=false}={}){let counter=0,active=null;const calls=[];
 function same(tx,name){calls.push({name,transactionId:tx?.id??null});if(tx!==active||!tx)throw Error('missing_shared_transaction');}
 return {calls,async managed(work){if(typeof work!=='function')throw new TypeError('Transaction work must be a function');if(active)throw Error('nested_transaction');const tx={id:++counter};let begun=false;active=tx;try{db.exec('BEGIN');begun=true;const result=await work(tx);db.exec('COMMIT');begun=false;return result;}catch(error){if(begun){try{db.exec('ROLLBACK');}catch(rollbackError){throw new AggregateError([error,rollbackError],'Owned transaction and rollback failed',{cause:error});}}throw error;}finally{active=null;}},
 async event(id,tx){same(tx,'event');const row=db.prepare('SELECT * FROM events WHERE id=?').get(id);return row?{...row}:null;},
 async duplicate(eventId,attendeeId,tx){same(tx,'duplicate');return !!db.prepare('SELECT id FROM bookings WHERE event_id=? AND attendee_id=?').get(eventId,attendeeId);},
 async seats(id,available,tx){same(tx,'seats');db.prepare('UPDATE events SET available=? WHERE id=?').run(available,id);},
 async create({eventId,attendeeId,seats},tx){same(tx,'create');const r=db.prepare('INSERT INTO bookings(event_id,attendee_id,seats)VALUES(?,?,?)').run(eventId,attendeeId,seats);return {id:Number(r.lastInsertRowid),eventId,attendeeId,seats};},
 async audit(booking,tx){same(tx,'audit');if(auditFail)throw Error('injected_audit_failure');db.prepare('INSERT INTO audits(booking_id,seats)VALUES(?,?)').run(booking.id,booking.seats);}};}
export function snapshot(db){return {available:db.prepare('SELECT available FROM events WHERE id=1').get().available,bookings:db.prepare('SELECT COUNT(*) n FROM bookings').get().n,audits:db.prepare('SELECT COUNT(*) n FROM audits').get().n};}
