# Transactional Booking — Reference

Install with `npm install`, run checks with `npm test`, and start the seeded API with `npm start` (default port `3000`). `POST /api/events/1/bookings` accepts `{ "attendeeId": 42, "seats": 2 }`.

`src/book-seats.js` is the canonical atomic implementation. `src/unsafe-book-seats.js` is a deliberately unsafe, supplied comparison used to make partial writes observable; it is not production guidance.
