# Lecture Example — Schema and model definition

This example defines a Sequelize model, creates its table in SQLite, and compares the model contract with the resulting database schema.

`Note.getAttributes()` exposes the current public model metadata API, while `describeTable()` inspects what SQLite actually received. Model validation rejects a blank title before insertion, and the database table independently records nullability, defaults, uniqueness, and its primary key.

```bash
npm install
npm test
```

Try changing a model constraint, synchronize a fresh database, and inspect both metadata views again.
