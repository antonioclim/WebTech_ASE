# Repository metadata

This directory contains public machine-readable and operator-facing metadata.

- `repository-metadata.yml` — repository and course settings;
- `course-map.json` — weeks 1–14 and public visibility;
- `preview-downloads.json` — WIP preview packages, checksums and pending gates;
- `development-state.json` — work-in-progress and finalisation rules;
- `github-actions-lock.json` — immutable workflow action pins;
- `GITHUB_ABOUT_BOX.md` — exact description, website and topic values;
- `OWNER_OPTIONAL_FIELDS.yml` — optional values that remain deliberately null;
- `OWNER_METADATA_COMPLETION_GUIDE.md` — safe instructions for optional fields.

The root `CITATION.cff`, `codemeta.json`, repository manifest and repository package ID remain tied to the last frozen baseline while `development-state.json` declares work in progress. Public WIP preview visibility is not a new final release identity.
