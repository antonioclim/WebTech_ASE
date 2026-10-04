# S06 Query API glossary

## API

An interface exposed by the running application. Here GET /api/notes is one HTTP route.

## Archived

A stored boolean flag. A URL query supplies text that the translator must validate deliberately.

## Assertion

A test comparison that reports a genuine assertion diagnostic when it fails. A generic error with assertion text in its message is different.

## BLOCKED

A required prerequisite or operation is unavailable. Record the actual reason instead of inventing success.

## Connection

A normal database session. Closing and reopening it in the same process is not a process restart.

## Evidence class

A label for what actually happened, such as source expectation, synthetic practice, module inspection, actual ORM/SQLite or local HTTP.

## Fields / projection

The attributes included in returned rows. The translator always includes id, while the public fields token accepts only the documented subset.

## Fixture

The frozen seed data that makes source expectations reproducible.

## findAll

The Sequelize model operation that receives translated options and returns matching rows.

## Fresh options

A newly returned options structure that does not reuse mutable structures across calls or mutate the input.

## HTTP 400

A client-input error status. It does not by itself count database/model calls.

## Literal substring

Search text whose percent or underscore characters keep their ordinary character meaning.

## Node process

The running JavaScript runtime instance. A new database connection within it does not make a new process.

## ORM

Object-relational mapper. Sequelize translates documented options into operations for the SQLite dialect.

## PACKAGE_ID

A reproducible identity of the distributed package. It is separate from kit version and measured runtime values.

## PENDING

Required work or evidence is not yet completed. Drafts may retain it honestly.

## Prediction

A falsifiable statement preserved before execution and compared with the actual observation afterwards.

## Query parameter

A name/value in the URL after ?. Separate tokens with & and quote the whole URL in the terminal.

## READY origin

The scheme, local address and actual port printed by the owned running server.

## Regression check

A check that expected existing behaviour still works after a change.

## SQLite :memory:

An in-memory database used by P02 for determinism. It is not proof of file durability.

## Tie-breaker

The final id ASC order that resolves equal primary sort values. Stable-looking output alone does not prove it.

## Translator

The assessed function converting a validated small query language into Sequelize options.

## Unknown cleanup

The tool cannot establish that owned resources closed or were removed. Keep this different from successful cleanup.

## ZIP

A compressed archive. Extract it before running launchers or editing project files.

