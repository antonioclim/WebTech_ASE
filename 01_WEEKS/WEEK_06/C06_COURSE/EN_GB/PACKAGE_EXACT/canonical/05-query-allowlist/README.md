# Lecture Example — Parameterized raw SQL report

An aggregate report is a reasonable place to use SQL directly. The Express route validates its public boolean query parameter, then `sequelize.query()` executes a fixed statement with a named replacement and `QueryTypes.SELECT`. User input is never interpolated into SQL.

```bash
npm install
npm test
npm start
curl -i 'http://localhost:3000/api/reports/note-summary?archived=false'
curl -i 'http://localhost:3000/api/reports/note-summary?archived=false%20OR%201%3D1'
```

Raw SQL does not bypass lifecycle, validation, error handling, or HTTP contracts. It only chooses a more direct query representation.
