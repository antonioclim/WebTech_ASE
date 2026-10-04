# S08 local data tools — v1.2.0

The default verification and environment routes read local data. Their output cannot prove that a React application works, that an LLM exchange happened or that Moodle accepted a submission. The supplied binding registry is a package claim, not a signature or author authentication.

No personal action or acceptance is requested during corpus production. The commands below are a prepared future route. Do not run a project, install dependencies or use an external service merely because this file exists.

## Open the offline material later

Keep the extracted student folder together. On Windows open `OPEN_BEGINNER_GUIDE.cmd` or `OPEN_EVIDENCE_FORM.cmd`. On macOS or desktop Linux open `guide.html` or `form.html` directly. Alternatively, from a terminal in this folder use `sh OPEN_BEGINNER_GUIDE.sh` or `sh OPEN_EVIDENCE_FORM.sh`. A script does not need executable permission when launched with `sh`. Paths are quoted, including folders containing spaces or `#`. The Windows wrappers disable delayed expansion so literal `!` in a folder name is preserved. Literal `%` and `&` in a quoted folder path are not supplied as commands. Do not use a `CALL` wrapper or unquoted paths. No launcher is an observed Windows, macOS or Linux acceptance result.

Expected: the local guide or blank evidence form opens. STOP if a file is missing or an opener fails. Open the corresponding HTML file directly from the same extracted folder; do not move only the HTML file or install another tool automatically.

## Verify supplied package data later

From the student root folder, using an already installed Python 3.9 or later:

```text
python tools/verify_s08_package.py
```

On Windows where the installed launcher is `py`, use `py -3 tools/verify_s08_package.py`. On systems with `python3`, use `python3 tools/verify_s08_package.py`.

Expected for the untouched student package: `PASS_DATA_IDENTITY_AND_BOUNDARY_ONLY`, an empty `errors` list and exit status 0. This checks bound source bytes, the two-file assessed edit boundary and the exact 55-field schema contract. It does not run archived verifiers, tests or source applications. It also requires complete registry coverage of regular files in projects/, optional/ and teaching/ and rejects unexpected unbound source files. Exact-package mode rejects generated node_modules/, dist/ and .vite/ directories. In --student-work mode only, future generated directories with those exact names inside active source trees are explicitly excluded and not validated; The historical source copy is retained in the immutable original archive, not in this edition. Unsafe or symbolic source paths, including Windows reparse/junction metadata where exposed by the standard library, duplicate JSON keys and malformed registry or field-contract types fail. It does not check new unbound root documents or assets; use the package-level SHA-256 manifest for those files. This bounded check is not protection against concurrent filesystem mutation.

After making your own assessed changes, the prepared future route is:

```text
python tools/verify_s08_package.py --student-work
```

Only changed bytes in `projects/p01/student/src/App.jsx` and `projects/p03/student/src/SearchPanel.jsx` may be reported as accepted assessed edits. In student-work mode only, a changed `teaching/p01-preview/src/App.jsx` may be reported separately in `accepted_preview_copies` if its bytes exactly match the current saved P01 assessed App.jsx. The same exact paired-copy rule applies to `teaching/p03-preview/src/SearchPanel.jsx` and the current saved P03 assessed SearchPanel.jsx. Copy in that one direction; do not develop an independent solution in the preview or copy back into assessed source. Divergent previews, wrong pairs, missing files, changed preview helpers, tests, styles, entry points, lockfiles, canonical references or any other bound files fail. The exact-package mode still requires every bound source file to match its original bytes. Accepted assessed edits or preview copies are not a correct solution, functional PASS or mark. Record the complete JSON output and its mode. STOP on `FAIL_DATA_VERIFICATION`; preserve the evidence and seek the teacher exception route instead of editing the registry or expected-ID file.

## Record the environment later

```text
python tools/environment_check.py
```

Expected: `REPORT_ONLY_NO_RUNTIME_ACCEPTANCE`. This default command observes Python and the operating system and checks whether Node/npm executables are on PATH. It never starts Node/npm. Presence alone leaves their versions unobserved.

Once the separate runtime route has been authorised, an explicit version-only check is available:

```text
python tools/environment_check.py --probe-installed-versions
```

This starts only each installed executable with `--version`, with no shell or project command. It may report `PROBE_UNAVAILABLE`, including for a Windows command wrapper. Preserve that result honestly; do not turn it into PASS. The declared exact versions are Node 24.21.0 and npm 11.19.0. The observed Node prefix v is accepted; a different patch version fails. Missing, unknown or mismatched versions mean STOP before any project command. This environment-report tool neither launches a project nor installs, downloads or repairs anything.

## Offline HTML hashing

Open `verify.html` from the same extracted folder. Select the supplied registry, then select the extracted folder using the directory picker where supported. The page hashes bytes only when local Web Crypto is available. It reports unobserved or failed checks explicitly. A browser may restrict directory selection or hashing for local files. Use the Python route above if the page cannot complete the comparison. No check automatically becomes PASS because a feature is unavailable.

The offline page checks selected registry-bound bytes and selected protected-tree file coverage in exact-package mode. It accepts portable ASCII paths only and cannot establish symlink absence or empty directory coverage from a browser picker. Use Python for strict duplicate JSON keys, NFC/Unicode path handling and the student-work mode. The Python verifier additionally checks field IDs and declared execution boundaries. Neither route authenticates the registry or author. Neither has been exercised in a browser during this production phase.

## Prepared root entry points

`VERIFY_PACKAGE.cmd`/`.sh` and `VERIFY_INITIAL_STATE.cmd`/`.sh` run the exact-package data mode. `VERIFY_WORK_RESULT.cmd`/`.sh` runs the two-file student-work boundary mode. Its PASS never means a functional solution. `CHECK_ENVIRONMENT.cmd`/`.sh` runs the default presence-only report; optional arguments pass through. `OPEN_MOODLE_FORM.cmd`/`.sh` is an explicit alias for the local form and does not open Moodle or submit anything.

`START.cmd`/`.sh` and `TEST.cmd`/`.sh` are deferred runtime entry points. They are not run, tested natively or authorised for current production. By default they STOP. Once the separate runtime route is authorised, choose exactly P01 or P03:

```text
START.cmd p01 --authorised-runtime
TEST.cmd p01 --authorised-runtime
```

For macOS/Linux with an installed Python use `sh START.sh p01 --authorised-runtime` and `sh TEST.sh p01 --authorised-runtime`. Substitute `p03` when that is the intended project. The flag labels a prior authorisation; it cannot grant one. The script checks the installed Node/npm version output and the existing local Vite/Vitest entry point before using the selected student project root. It does not use npm, npx, dependency installation or a download to start or test. START binds the future development server to `127.0.0.1:5173`, requires that port to be free and leaves any browser opening manual. TEST runs the selected project's canonical suite only in that authorised future route.

STOP if a version probe is unavailable, a version mismatches, dependencies are missing or the local port is occupied. The script preserves failure as failure and does not repair or bypass it. Use the actual printed local URL, verify the selected project and retain the real test output. No start, test or version probe has been executed during current production. Starting an application does not prove correctness; expected objective RED in an incomplete starter is a source expectation, not a measured result.
