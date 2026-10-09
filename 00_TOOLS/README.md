# v4.0.0 candidate repository tools

These tools serve the current student edition in `00_SETUP`, `00_START_HERE` and `01_WEEKS`. They do not install software, run GitHub Actions, publish releases, merge branches or access student accounts.

| Folder | Purpose |
| --- | --- |
| [qa](qa/validate_public_repo.py) | Check whole-repository bytes, all 30 unit identities, the 14-week project map and local document routes. |
| [publishing](publishing/README.md) | Build a deterministic ZIP of the current folder structure offline. |
| [acceptance](acceptance/README.md) | Distinguish source checks from application, browser, native and classroom observations. |
| [maintainer](maintainer/README.md) | Maintain source seals and review a change before final integration and publication. |

From the repository root, with Python and Node already available:

```text
python 00_TOOLS/qa/validate_public_repo.py --strict
node 00_TOOLS/qa/VERIFY_COLLECTION.mjs
```

After working on the declared learner targets:

```text
python 00_TOOLS/qa/validate_public_repo.py --strict --allow-student-edits
node 00_TOOLS/qa/VERIFY_COLLECTION.mjs --allow-student-edits
```

The second mode admits only the 38 declared learner files and 83 declared runtime directories. It checks every protected file and does not grade the learner's implementation. Keep private evidence, logs, drafts and PDFs outside the entire repository.

General qualification remains **NOT_FINAL**. A successful source check does not claim native Windows/macOS, rendered-browser, Word, live Moodle or human classroom acceptance.

C01/S01 and C02/S02 have completed the T01 teaching revision. The remaining pairs await T02–T07. The latest published edition remains 3.0.0. See [candidate progress](../metadata/CANDIDATE_PROGRESS.json).
