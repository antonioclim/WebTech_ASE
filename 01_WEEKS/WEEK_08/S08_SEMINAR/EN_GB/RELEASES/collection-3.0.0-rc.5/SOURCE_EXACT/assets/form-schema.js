window.S08_FORM_SCHEMA = {
  "schema": "TW2026_S08_EVIDENCE_V1_2",
  "implementation_status": "AUTHORED_LOCAL_STATIC_QA_NOT_BROWSER_OR_NATIVE_WORD_QUALIFIED",
  "sections": [
    {
      "id": "identity",
      "fields": [
        {
          "id": "student_identity",
          "label": "Student identity and group",
          "kind": "text",
          "max": 16000,
          "default": "",
          "help": "Enter GROUP | Surname | Firstname. Use your student identity only; no identity-document numbers. These three parts propose the PDF filename.",
          "phase": "core",
          "placeholder": "GROUP | Surname | Firstname",
          "requiredForFinalCandidate": true
        },
        {
          "id": "package_identity",
          "label": "Package/source identity",
          "kind": "textarea",
          "max": 16000,
          "default": "",
          "help": "Record S08 v1.2.0 and the retained source v1.1.0, PACKAGE_ID.txt and your assessed file identity. Distinguish student source from any teaching preview.",
          "phase": "core",
          "placeholder": "Your own evidence or an explicit pending limitation",
          "requiredForFinalCandidate": true
        },
        {
          "id": "actual_runtime",
          "label": "Actual Node/npm and execution environment",
          "kind": "textarea",
          "max": 16000,
          "default": "",
          "help": "Copy actual node --version and npm --version output plus OS and browser/version where used. Do not copy the prescribed pin as an observation.",
          "phase": "core",
          "placeholder": "Your own evidence or an explicit pending limitation",
          "requiredForFinalCandidate": true
        },
        {
          "id": "execution_class",
          "label": "SOURCE_REASONING / MODEL / REACT_TEST / REACT_BROWSER / NOT_EXECUTED",
          "kind": "select",
          "max": 16000,
          "default": "",
          "help": "Choose the strongest actual evidence class represented. MODEL and SOURCE_REASONING are not actual React execution. Per-check classes still belong in the traces.",
          "phase": "core",
          "options": [
            "",
            "SOURCE_REASONING",
            "MODEL",
            "REACT_TEST",
            "REACT_BROWSER",
            "NOT_EXECUTED",
            "SEPARATELY_AUTHORISED_ALTERNATIVE"
          ],
          "placeholder": "",
          "requiredForFinalCandidate": true
        },
        {
          "id": "environment_limit",
          "label": "Environment block or qualification limit",
          "kind": "textarea",
          "max": 16000,
          "default": "",
          "help": "State the actual block or write NONE for no known block. No field value qualifies the environment.",
          "phase": "core",
          "placeholder": "Your own evidence or an explicit pending limitation",
          "requiredForFinalCandidate": true
        },
        {
          "id": "seminar_date",
          "label": "Seminar date",
          "kind": "date",
          "max": 16000,
          "default": "",
          "help": "Record your actual seminar date. This is not a submission deadline.",
          "phase": "final",
          "placeholder": "",
          "requiredForFinalCandidate": true,
          "introducedIn": "1.2.0"
        },
        {
          "id": "operating_system",
          "label": "Actual operating system",
          "kind": "text",
          "max": 16000,
          "default": "",
          "help": "Record your actual OS and version or explicitly mark unknown; do not copy an example.",
          "phase": "final",
          "placeholder": "",
          "requiredForFinalCandidate": true,
          "introducedIn": "1.2.0"
        },
        {
          "id": "browser_tool_versions",
          "label": "Actual browser and tool versions",
          "kind": "textarea",
          "max": 16000,
          "default": "",
          "help": "Record actual browser/version and relevant installed editor/tools. Preserve NOT_EXECUTED for absent observations.",
          "phase": "final",
          "placeholder": "Your own evidence or an explicit pending limitation",
          "requiredForFinalCandidate": true,
          "introducedIn": "1.2.0"
        }
      ],
      "title": "1. Identity and evidence class",
      "intro": "Record actual work; use explicit pending labels for unfinished evidence. Never convert a model result into a React observation."
    },
    {
      "id": "prediction",
      "fields": [
        {
          "id": "p01_prediction",
          "label": "Prediction before the selected individual action",
          "kind": "textarea",
          "max": 16000,
          "default": "",
          "help": "Record before your selected action: fixture, input, predicted state/output and a falsifying observation. A reconstructed prediction must be labelled retrospective.",
          "phase": "core",
          "placeholder": "Your own evidence or an explicit pending limitation",
          "requiredForFinalCandidate": true
        },
        {
          "id": "ownership_map",
          "label": "Vanilla responsibility to React owner map",
          "kind": "textarea",
          "max": 16000,
          "default": "",
          "help": "Map initialisation, input, items, filter, counts, events, rendering and storage to owners. Include all four required child responsibilities.",
          "phase": "core",
          "placeholder": "Your own evidence or an explicit pending limitation",
          "requiredForFinalCandidate": true
        },
        {
          "id": "fixture",
          "label": "Exact initial items and storage fixture",
          "kind": "textarea",
          "max": 16000,
          "default": "",
          "help": "Paste exact initial items and stored JSON or the explicit absence. Use the same valid fixture for both compared implementations. State the storage namespace.",
          "phase": "core",
          "placeholder": "Your own evidence or an explicit pending limitation",
          "requiredForFinalCandidate": true
        },
        {
          "id": "edit_boundary",
          "label": "App.jsx-only assessment diff boundary",
          "kind": "textarea",
          "max": 16000,
          "default": "",
          "help": "Record the assessed path projects/p01/student/src/App.jsx and boundary-check result. Preview changes are separate and do not enlarge the permitted student edit.",
          "phase": "core",
          "placeholder": "Your own evidence or an explicit pending limitation",
          "requiredForFinalCandidate": true
        }
      ],
      "title": "2. Prediction and ownership",
      "intro": "Record actual work; use explicit pending labels for unfinished evidence. Never convert a model result into a React observation."
    },
    {
      "id": "p01_evidence",
      "fields": [
        {
          "id": "p01_completion",
          "label": "P01 implementation status and unfinished work",
          "kind": "select",
          "max": 16000,
          "default": "",
          "help": "Keep IN_PROGRESS until the full P01 contract is evidenced. An 18-minute implementation segment is not project completion.",
          "phase": "core",
          "options": [
            "",
            "NOT_STARTED",
            "IN_PROGRESS",
            "COMPLETE_RECORDED"
          ],
          "placeholder": "",
          "requiredForFinalCandidate": true
        },
        {
          "id": "transition_trace",
          "label": "Add/toggle/remove/filter trace with input and output",
          "kind": "textarea",
          "max": 60000,
          "default": "",
          "help": "Give named steps for trim/blank add, toggle, remove, all/remaining/read counts, empty view and semantic controls; include actual outputs and evidence locators.",
          "phase": "final",
          "placeholder": "Your own evidence or an explicit pending limitation",
          "requiredForFinalCandidate": true
        },
        {
          "id": "persistence_trace",
          "label": "Initialisation and filter-only storage observation",
          "kind": "textarea",
          "max": 16000,
          "default": "",
          "help": "Distinguish initial writes from later events. State exact complete-array output and the filter-only write count from your actual check.",
          "phase": "final",
          "placeholder": "Your own evidence or an explicit pending limitation",
          "requiredForFinalCandidate": true
        },
        {
          "id": "identity_trace",
          "label": "ID uniqueness and reload evidence or explicit gap",
          "kind": "textarea",
          "max": 16000,
          "default": "",
          "help": "State actual add-after-reload evidence with source/preview path and IDs, or label the gap. Fresh allocation cannot repair duplicate IDs already stored or guarantee concurrent-tab uniqueness.",
          "phase": "final",
          "placeholder": "Your own evidence or an explicit pending limitation",
          "requiredForFinalCandidate": true
        },
        {
          "id": "baseline_result",
          "label": "Baseline command/name/result and evidence",
          "kind": "textarea",
          "max": 16000,
          "default": "",
          "help": "Final candidate format: ACTUAL_RECORDED: PASS; command; named checks; evidence locator. Otherwise use NOT_EXECUTED/BLOCKED/FAIL with cause.",
          "phase": "final",
          "placeholder": "Your own evidence or an explicit pending limitation",
          "requiredForFinalCandidate": true
        },
        {
          "id": "objective_result",
          "label": "Objective command/named failure class/result",
          "kind": "textarea",
          "max": 16000,
          "default": "",
          "help": "Record all six canonical P01 objective checks separately from additional checks. Use ACTUAL_RECORDED: PASS only for actual execution.",
          "phase": "final",
          "placeholder": "Your own evidence or an explicit pending limitation",
          "requiredForFinalCandidate": true
        },
        {
          "id": "regression_result",
          "label": "Regression command/result",
          "kind": "textarea",
          "max": 16000,
          "default": "",
          "help": "Record canonical regression command, result and locator. It is not a substitute for a React objective or reload test.",
          "phase": "final",
          "placeholder": "Your own evidence or an explicit pending limitation",
          "requiredForFinalCandidate": true
        },
        {
          "id": "build_result",
          "label": "Build command/output or explicit not-run status",
          "kind": "textarea",
          "max": 16000,
          "default": "",
          "help": "Record actual build command/output and locator. A build does not prove behavioural parity. No installation is part of this form.",
          "phase": "final",
          "placeholder": "Your own evidence or an explicit pending limitation",
          "requiredForFinalCandidate": true
        },
        {
          "id": "browser_result",
          "label": "Actual browser observations or pending",
          "kind": "textarea",
          "max": 16000,
          "default": "",
          "help": "Record actual browser/OS, selected steps, visible outcomes and locator. Include controls, initialisation/reload and storage limits. MODEL is not a browser result.",
          "phase": "final",
          "placeholder": "Your own evidence or an explicit pending limitation",
          "requiredForFinalCandidate": true
        },
        {
          "id": "p01_diff",
          "label": "Sanitised bounded diff and unchanged-source check",
          "kind": "textarea",
          "max": 60000,
          "default": "",
          "help": "Paste the bounded App.jsx diff or complete changed file with locator. Add pages in the DOCX route for long evidence. Do not paste a private reference solution.",
          "phase": "final",
          "placeholder": "Your own evidence or an explicit pending limitation",
          "requiredForFinalCandidate": true
        },
        {
          "id": "p01_action",
          "label": "Individual action — P01",
          "kind": "textarea",
          "max": 16000,
          "default": "",
          "help": "Name the exact file, fixture, action/command and evidence class. Use a reproducible bounded action.",
          "phase": "final",
          "placeholder": "Your own evidence or an explicit pending limitation",
          "requiredForFinalCandidate": true,
          "introducedIn": "1.2.0"
        },
        {
          "id": "p01_expected",
          "label": "Expected result before action — P01",
          "kind": "textarea",
          "max": 16000,
          "default": "",
          "help": "Record the prediction before the selected action; label retrospective reconstruction if necessary. Include a falsifier.",
          "phase": "final",
          "placeholder": "Your own evidence or an explicit pending limitation",
          "requiredForFinalCandidate": true,
          "introducedIn": "1.2.0"
        },
        {
          "id": "p01_observed",
          "label": "Observed result — P01",
          "kind": "textarea",
          "max": 16000,
          "default": "",
          "help": "Record the actual result and embedded evidence locator. Source reasoning or a synthetic/model trace is not a React/browser observation.",
          "phase": "final",
          "placeholder": "Your own evidence or an explicit pending limitation",
          "requiredForFinalCandidate": true,
          "introducedIn": "1.2.0"
        },
        {
          "id": "p01_difference",
          "label": "Expected versus observed difference — P01",
          "kind": "textarea",
          "max": 16000,
          "default": "",
          "help": "Compare your prediction with the observed result. State NO DIFFERENCE only with a named witness; do not silently rewrite the prediction.",
          "phase": "final",
          "placeholder": "Your own evidence or an explicit pending limitation",
          "requiredForFinalCandidate": true,
          "introducedIn": "1.2.0"
        },
        {
          "id": "p01_mechanism",
          "label": "Mechanism and causal explanation — P01",
          "kind": "textarea",
          "max": 16000,
          "default": "",
          "help": "Explain owners, props/callbacks, rendering and persistence with the named witness. Allocate an injected ID in the event handler before a pure functional updater.",
          "phase": "final",
          "placeholder": "Your own evidence or an explicit pending limitation",
          "requiredForFinalCandidate": true,
          "introducedIn": "1.2.0"
        }
      ],
      "title": "3. P01 complete implementation evidence",
      "intro": "Record actual work; use explicit pending labels for unfinished evidence. Never convert a model result into a React observation."
    },
    {
      "id": "p03_portfolio",
      "fields": [
        {
          "id": "p03_prediction",
          "label": "Predicted debounce/cleanup/publication timeline",
          "kind": "textarea",
          "max": 16000,
          "default": "",
          "help": "Before execution, draw old/new timing, debounce, cleanup and publication expectations with a named fake.",
          "phase": "final",
          "placeholder": "Your own evidence or an explicit pending limitation",
          "requiredForFinalCandidate": true
        },
        {
          "id": "p03_diagnostic",
          "label": "Diagnosis tied to weak evidence and exact source",
          "kind": "textarea",
          "max": 16000,
          "default": "",
          "help": "Tie your diagnosis to exact weak-source lines; separate missing-signal TypeError from lifecycle failures.",
          "phase": "final",
          "placeholder": "Your own evidence or an explicit pending limitation",
          "requiredForFinalCandidate": true
        },
        {
          "id": "p03_patch",
          "label": "SearchPanel.jsx-only bounded patch excerpt and identity",
          "kind": "textarea",
          "max": 60000,
          "default": "",
          "help": "Paste your SearchPanel.jsx-only patch/explanation and file identity. Keep generated evidence/tests unchanged.",
          "phase": "final",
          "placeholder": "Your own evidence or an explicit pending limitation",
          "requiredForFinalCandidate": true
        },
        {
          "id": "p03_timeline",
          "label": "Old/new/short-query/unmount evidence and ordering",
          "kind": "textarea",
          "max": 60000,
          "default": "",
          "help": "Record call order, timer steps, signals and settlements for old/new, shortened query and unmount. Label source/model versus actual test/browser.",
          "phase": "final",
          "placeholder": "Your own evidence or an explicit pending limitation",
          "requiredForFinalCandidate": true
        },
        {
          "id": "p03_guards",
          "label": "Which guards and which fake were used",
          "kind": "textarea",
          "max": 16000,
          "default": "",
          "help": "Record A: active and numeric guards retained; B: numeric guards removed while active remains; C: abort-only with no publication guards. Name the non-cooperative fake and record B settles then old A settles. Removing numeric guards alone need not race. Restore the assessed implementation after the comparison.",
          "phase": "final",
          "placeholder": "Your own evidence or an explicit pending limitation",
          "requiredForFinalCandidate": true
        },
        {
          "id": "p03_errors",
          "label": "Unexpected error identity and sanitised display observation",
          "kind": "textarea",
          "max": 16000,
          "default": "",
          "help": "Record abort rejection separately from an unexpected error; compare the same error object delivered to the logger with the sanitised visible message. Record the omitted-callback case and instance isolation or a precise gap. Use fabricated test data only.",
          "phase": "final",
          "placeholder": "Your own evidence or an explicit pending limitation",
          "requiredForFinalCandidate": true
        },
        {
          "id": "p03_checks",
          "label": "Named P03 baseline/objective/regression/build results",
          "kind": "textarea",
          "max": 16000,
          "default": "",
          "help": "Final candidate format contains BASELINE: PASS; OBJECTIVE: PASS; REGRESSION: PASS; BUILD: PASS; with commands, evidence IDs and ACTUAL_RECORDED. Extra checks are separate and may remain explicitly unqualified.",
          "phase": "final",
          "placeholder": "Your own evidence or an explicit pending limitation",
          "requiredForFinalCandidate": true
        },
        {
          "id": "p03_limits",
          "label": "Untested edge case including callback or runtime limit",
          "kind": "textarea",
          "max": 16000,
          "default": "",
          "help": "Record omitted-callback, unmount, accessibility and runtime checks not performed. Do not infer coverage from a test title.",
          "phase": "final",
          "placeholder": "Your own evidence or an explicit pending limitation",
          "requiredForFinalCandidate": true
        },
        {
          "id": "p03_action",
          "label": "Individual action — P03",
          "kind": "textarea",
          "max": 16000,
          "default": "",
          "help": "Name the exact file, fixture, action/command and evidence class. Use a reproducible bounded action.",
          "phase": "final",
          "placeholder": "Your own evidence or an explicit pending limitation",
          "requiredForFinalCandidate": true,
          "introducedIn": "1.2.0"
        },
        {
          "id": "p03_expected",
          "label": "Expected result before action — P03",
          "kind": "textarea",
          "max": 16000,
          "default": "",
          "help": "Record the prediction before the selected action; label retrospective reconstruction if necessary. Include a falsifier.",
          "phase": "final",
          "placeholder": "Your own evidence or an explicit pending limitation",
          "requiredForFinalCandidate": true,
          "introducedIn": "1.2.0"
        },
        {
          "id": "p03_observed",
          "label": "Observed result — P03",
          "kind": "textarea",
          "max": 16000,
          "default": "",
          "help": "Record the actual result and embedded evidence locator. Source reasoning or a synthetic/model trace is not a React/browser observation.",
          "phase": "final",
          "placeholder": "Your own evidence or an explicit pending limitation",
          "requiredForFinalCandidate": true,
          "introducedIn": "1.2.0"
        },
        {
          "id": "p03_difference",
          "label": "Expected versus observed difference — P03",
          "kind": "textarea",
          "max": 16000,
          "default": "",
          "help": "Compare your prediction with the observed result. State NO DIFFERENCE only with a named witness; do not silently rewrite the prediction.",
          "phase": "final",
          "placeholder": "Your own evidence or an explicit pending limitation",
          "requiredForFinalCandidate": true,
          "introducedIn": "1.2.0"
        },
        {
          "id": "p03_mechanism",
          "label": "Mechanism and causal explanation — P03",
          "kind": "textarea",
          "max": 16000,
          "default": "",
          "help": "Separate timer cancellation, abort signal and permission to publish. Explain the three guard variants and the role of a non-cooperative fake; a missing-signal TypeError is not a stale-publication witness.",
          "phase": "final",
          "placeholder": "Your own evidence or an explicit pending limitation",
          "requiredForFinalCandidate": true,
          "introducedIn": "1.2.0"
        }
      ],
      "title": "4. Required P03 portfolio",
      "intro": "Record actual work; use explicit pending labels for unfinished evidence. Never convert a model result into a React observation."
    },
    {
      "id": "gemini",
      "fields": [
        {
          "id": "gemini_mode",
          "label": "ACTUAL_RECORDED / PENDING / separately authorised alternative",
          "kind": "select",
          "max": 16000,
          "default": "",
          "help": "ACTUAL_RECORDED means a real bounded exchange. Synthetic practice remains PENDING unless a prior, separate teacher authorisation specifies an alternative.",
          "phase": "final",
          "options": [
            "",
            "ACTUAL_RECORDED",
            "PENDING",
            "SEPARATELY_AUTHORISED_ALTERNATIVE"
          ],
          "placeholder": "",
          "requiredForFinalCandidate": true
        },
        {
          "id": "gemini_prompt",
          "label": "Relevant sanitised prompt actually used",
          "kind": "textarea",
          "max": 16000,
          "default": "",
          "help": "Keep only the sanitised prompt actually used. Ask about one ownership/effect claim, not a complete implementation.",
          "phase": "final",
          "placeholder": "Your own evidence or an explicit pending limitation",
          "requiredForFinalCandidate": true
        },
        {
          "id": "gemini_claim",
          "label": "Relevant claim actually received",
          "kind": "textarea",
          "max": 16000,
          "default": "",
          "help": "Keep the relevant answer extract and tool/date reference. Do not paste the full conversation or label synthetic text as received.",
          "phase": "final",
          "placeholder": "Your own evidence or an explicit pending limitation",
          "requiredForFinalCandidate": true
        },
        {
          "id": "independent_check",
          "label": "Independent method and evidence locator",
          "kind": "textarea",
          "max": 16000,
          "default": "",
          "help": "State your independent method, actual result and evidence locator, not agreement between two AI answers.",
          "phase": "final",
          "placeholder": "Your own evidence or an explicit pending limitation",
          "requiredForFinalCandidate": true
        },
        {
          "id": "verdict",
          "label": "ACCEPTED / REJECTED / PARTIALLY ACCEPTED / UNKNOWN",
          "kind": "select",
          "max": 16000,
          "default": "",
          "help": "Assess the claim, not the student. PARTIALLY_ACCEPTED is the stored code for PARTIALLY ACCEPTED. UNKNOWN is not PASS or an automatic waiver.",
          "phase": "final",
          "options": [
            "",
            "ACCEPTED",
            "REJECTED",
            "PARTIALLY_ACCEPTED",
            "UNKNOWN"
          ],
          "placeholder": "",
          "requiredForFinalCandidate": true
        },
        {
          "id": "correction",
          "label": "Correction justified by the witness",
          "kind": "textarea",
          "max": 16000,
          "default": "",
          "help": "State the correction supported by the witness, or explain why no change is justified.",
          "phase": "final",
          "placeholder": "Your own evidence or an explicit pending limitation",
          "requiredForFinalCandidate": true
        },
        {
          "id": "claim_limit",
          "label": "Scope and unresolved uncertainty",
          "kind": "textarea",
          "max": 16000,
          "default": "",
          "help": "State what your check does not establish; an honest uncertainty can remain even after the check.",
          "phase": "final",
          "placeholder": "Your own evidence or an explicit pending limitation",
          "requiredForFinalCandidate": true
        }
      ],
      "title": "5. Actual Gemini claim and independent review",
      "intro": "Record actual work; use explicit pending labels for unfinished evidence. Never convert a model result into a React observation."
    },
    {
      "id": "reflection",
      "fields": [
        {
          "id": "learning_transfer",
          "label": "One ownership/identity lesson for the semester project",
          "kind": "textarea",
          "max": 16000,
          "default": "",
          "help": "Explain one ownership/identity/lifecycle lesson for the semester project in your own words.",
          "phase": "final",
          "placeholder": "Your own evidence or an explicit pending limitation",
          "requiredForFinalCandidate": true
        },
        {
          "id": "pending_work",
          "label": "Remaining work and smallest next check",
          "kind": "textarea",
          "max": 16000,
          "default": "",
          "help": "List remaining required work and smallest next check. Use NONE only when no required work remains. Optional P02 may remain undone.",
          "phase": "core",
          "placeholder": "Your own evidence or an explicit pending limitation",
          "requiredForFinalCandidate": true
        },
        {
          "id": "evidence_index",
          "label": "Locator list for snippets/screenshots/logs embedded in the PDF",
          "kind": "textarea",
          "max": 16000,
          "default": "",
          "help": "List only evidence embedded in this PDF: section/page/label. File paths alone do not embed screenshots or logs. Use the DOCX route to insert images.",
          "phase": "final",
          "placeholder": "Your own evidence or an explicit pending limitation",
          "requiredForFinalCandidate": true
        }
      ],
      "title": "6. Transfer, remaining work and evidence index",
      "intro": "Record actual work; use explicit pending labels for unfinished evidence. Never convert a model result into a React observation."
    },
    {
      "id": "declaration",
      "fields": [
        {
          "id": "declaration",
          "label": "Truthful individual work, actual observations distinguished from expectations",
          "kind": "checkbox",
          "max": 16000,
          "default": false,
          "help": "I performed the individual work described, distinguish actual observations from expectations/models and have not invented an AI exchange. This is not a teacher approval.",
          "phase": "final",
          "placeholder": "",
          "requiredForFinalCandidate": true
        },
        {
          "id": "teacher_exception",
          "label": "Prior explicit authorisation if any; absence gives no exception",
          "kind": "textarea",
          "max": 16000,
          "default": "",
          "help": "Leave blank if none. If an alternative was explicitly authorised beforehand, record teacher, date, scope, reference and required replacement evidence. Writing here or choosing a selector neither grants nor authenticates authorisation. The automated form cannot approve an exception.",
          "phase": "final",
          "placeholder": "Your own evidence or an explicit pending limitation",
          "requiredForFinalCandidate": false
        },
        {
          "id": "pdf_status",
          "label": "Draft/final candidate and local PDF review status",
          "kind": "select",
          "max": 16000,
          "default": "",
          "help": "Choose DRAFT_NOT_REVIEWED for a working draft. FINAL_CANDIDATE_NOT_YET_SAVED records your intention before saving. LOCAL_PDF_REVIEWED_NOT_MOODLE_RECEIPT records a separately reopened and reviewed PDF; regenerate after a changed answer. No state proves Moodle submission.",
          "phase": "final",
          "options": [
            "",
            "DRAFT_NOT_REVIEWED",
            "FINAL_CANDIDATE_NOT_YET_SAVED",
            "LOCAL_PDF_REVIEWED_NOT_MOODLE_RECEIPT"
          ],
          "placeholder": "",
          "requiredForFinalCandidate": true
        },
        {
          "id": "privacy_check",
          "label": "Privacy review before sharing/export",
          "kind": "select",
          "max": 16000,
          "default": "",
          "help": "Select reviewed only after checking snippets, images and extracts. Exclude passwords, tokens, API keys, cookies, real personal data beyond your required student identity, Moodle records and unauthorised private code.",
          "phase": "final",
          "placeholder": "",
          "requiredForFinalCandidate": true,
          "introducedIn": "1.2.0",
          "options": [
            "",
            "PENDING",
            "REVIEWED_NO_EXCLUDED_DATA"
          ]
        },
        {
          "id": "upload_checklist",
          "label": "Upload preflight checklist — before PDF upload",
          "kind": "select",
          "max": 16000,
          "default": "",
          "help": "Before first candidate PDF export choose PENDING because the saved file has not been reviewed. After reopening the actual saved PDF, complete the preflight before upload: one correctly named readable PDF, all sections and embedded evidence, honest required-route gaps and no secrets. Choose PREFLIGHT_REVIEWED_NOT_MOODLE_RECEIPT only for that actual review. Actual submitted state, filename and timestamp are checked separately after submission; never require a Moodle receipt inside this PDF.",
          "phase": "final",
          "placeholder": "",
          "requiredForFinalCandidate": true,
          "introducedIn": "1.2.0",
          "options": [
            "",
            "PENDING",
            "PREFLIGHT_REVIEWED_NOT_MOODLE_RECEIPT"
          ]
        }
      ],
      "title": "7. Declaration and submission boundary",
      "intro": "Record actual work; use explicit pending labels for unfinished evidence. Never convert a model result into a React observation."
    }
  ],
  "field_count": 55,
  "version": "1.2.0",
  "packageVersion": "1.2.0",
  "maxImportBytes": 2000000,
  "submissionFilename": "TW2026_S08_GROUP_Surname_Firstname.pdf",
  "evidenceAuthentication": false,
  "oneAssignment": true,
  "onePDF": true,
  "requiredRoutes": [
    "P01",
    "P03",
    "actual bounded Gemini claim with independent check"
  ],
  "optionalRoutes": [
    "P02 — no mark cap if absent"
  ]
};
