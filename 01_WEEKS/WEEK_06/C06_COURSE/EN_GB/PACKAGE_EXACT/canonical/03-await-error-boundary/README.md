# Lecture Example — Sequelize CRUD through Express

This Notes API performs create, ordered read, partial update, and delete operations against SQLite. Every persistence promise is awaited before the response is completed. Central Express error middleware maps Sequelize validation to `400`, uniqueness conflicts to `409`, and hides unexpected details.

```bash
npm install
npm test
npm start
```

```bash
curl -i -X POST http://localhost:3000/api/notes -H 'content-type: application/json' -d '{"title":"Stored note"}'
curl -i http://localhost:3000/api/notes
curl -i -X PATCH http://localhost:3000/api/notes/1 -H 'content-type: application/json' -d '{"archived":true}'
curl -i -X DELETE http://localhost:3000/api/notes/1
```
