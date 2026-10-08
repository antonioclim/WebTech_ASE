# Lecture Example — Serialization at the REST boundary

The database model stores timestamps and an internal review field, but the public REST representation deliberately exposes only `id`, `title`, `archived`, and a resource link. The serializer starts from `instance.get({ plain: true })` and constructs an explicit API contract rather than returning the live model instance.

```bash
npm install
npm test
npm start
curl -i http://localhost:3000/api/notes/1
```

Changing the table does not automatically change the API. Update the serializer only when the public representation should change.
