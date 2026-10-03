globalThis.S12_SCHEMA = {
  "schema": "TW2026_S12_EVIDENCE",
  "version": "1.2.0",
  "maxImportBytes": 2000000,
  "sections": [
    {
      "id": "identity_execution",
      "title": "Identity and execution",
      "intro": "Core draft, minutes 00–05. Record actual identity and execution lane before making predictions. Imported text and metadata remain unverified.",
      "fields": [
        {
          "id": "student_code",
          "label": "Student code or approved alias",
          "kind": "text",
          "default": "",
          "max": 16000,
          "options": null,
          "help": "Use only the student code or alias approved by the teacher. The teacher keeps the private identity mapping. CODE proposes TW2026_S12_CODE.pdf; do not add surname or group fields.",
          "phase": "core"
        },
        {
          "id": "package_id",
          "label": "Public package ID",
          "kind": "text",
          "default": "",
          "max": 16000,
          "options": null,
          "help": "Copy the exact 64-character ID from PACKAGE_ID.txt at the extracted student root. Run VERIFY_PACKAGE before editing; after editing use the separate one-file work boundary.",
          "phase": "core"
        },
        {
          "id": "source_sha256",
          "label": "Assessed source SHA-256",
          "kind": "text",
          "default": "",
          "max": 16000,
          "options": null,
          "help": "Before implementation, copy source_sha256 from a successful VERIFY_INITIAL_STATE receipt and its output locator. If that gate is blocked, record NOT_RECORDED or BLOCKED with the actual reason; do not invent a hash. After required work passes, replace this entry with source_sha256 from VERIFY_WORK_RESULT and its final receipt locator before the assessed PDF. A hash identifies bytes, not correct behaviour.",
          "phase": "core"
        },
        {
          "id": "actual_node",
          "label": "Actual Node.js version",
          "kind": "text",
          "default": "",
          "max": 16000,
          "options": null,
          "help": "Copy the actually displayed Node version from CHECK_ENVIRONMENT. Prescribed v24.21.0; a mismatch is a block for strict runtime qualification, not permission to relabel your version.",
          "phase": "core"
        },
        {
          "id": "actual_npm",
          "label": "Actual npm version",
          "kind": "text",
          "default": "",
          "max": 16000,
          "options": null,
          "help": "Copy the actually displayed npm version from CHECK_ENVIRONMENT. Prescribed 11.19.0. Do not install or update tools through this form.",
          "phase": "core"
        },
        {
          "id": "execution_class",
          "label": "Evidence execution class",
          "kind": "select",
          "default": "",
          "max": 16000,
          "options": [
            "",
            "NOT_EXECUTED",
            "SOURCE_ANALYSIS",
            "PURE_JS",
            "MODEL",
            "CANONICAL_TESTS",
            "REAL_PROTOCOL"
          ],
          "help": "Choose the strongest class actually used. PURE_JS means executable JavaScript with the supplied fake transport, MODEL means a constructed trace, REAL_PROTOCOL requires an actual protocol run. Per-field metadata below narrows individual claims.",
          "phase": "core"
        },
        {
          "id": "environment_limit",
          "label": "Environment limitation or block",
          "kind": "textarea",
          "default": "",
          "max": 16000,
          "options": null,
          "help": "Record the exact available lane, block and action requested from the teacher. The real WebSocket lane is separate; no dependency installation is a hidden requirement of the fake-unit lane.",
          "phase": "core"
        }
      ]
    },
    {
      "id": "protocol_prediction",
      "title": "Protocol and prediction",
      "intro": "Core draft, minutes 05–12. Write predictions before implementation and observation; distinguish request state from lifetime subscriptions.",
      "fields": [
        {
          "id": "accepted_owner_map",
          "label": "Acceptance, execution and delivery owner map",
          "kind": "textarea",
          "default": "",
          "max": 16000,
          "options": null,
          "help": "At 05–12 minutes predict E07: HTTP accepts, calculation executes and the registered connection receives delivery. An HTTP 202 response does not say that calculation is complete.",
          "phase": "core"
        },
        {
          "id": "transport_choice",
          "label": "Chosen transport and justification",
          "kind": "textarea",
          "default": "",
          "max": 16000,
          "options": null,
          "help": "Explain why a shared WebSocket channel needs correlation while the HTTP request has its own response. State whether your evidence is a fake-unit run, source analysis, model or real protocol.",
          "phase": "core"
        },
        {
          "id": "connection_identity",
          "label": "Principal, connection and request identity map",
          "kind": "textarea",
          "default": "",
          "max": 16000,
          "options": null,
          "help": "E07: distinguish principal identity, connectionId and requestId. Locate guided/p01 source or S12_P01_GUIDED_TRACE.md. Query identity in the teaching fixture is not production authentication.",
          "phase": "core"
        },
        {
          "id": "pending_before_send_prediction",
          "label": "Prediction: pending-before-send ordering",
          "kind": "textarea",
          "default": "",
          "max": 16000,
          "options": null,
          "help": "E02: predict what happens if transport.send immediately calls the message listener. State why the pending entry must already exist before send.",
          "phase": "core"
        },
        {
          "id": "terminal_paths_prediction",
          "label": "Predicted terminal paths",
          "kind": "textarea",
          "default": "",
          "max": 16000,
          "options": null,
          "help": "E03–E06: predict completion, remote failure, send failure, timeout, abort, close and disposal. Name the owner that removes state before settling once.",
          "phase": "core"
        },
        {
          "id": "cleanup_invariant",
          "label": "Scoped cleanup invariant",
          "kind": "textarea",
          "default": "",
          "max": 16000,
          "options": null,
          "help": "E04–E05: predict per-request pending/timer/abort cleanup. One dispatcher subscription pair remains until dispose; the adapter and socket have separate owners. Zero pending is a narrow claim.",
          "phase": "core"
        }
      ]
    },
    {
      "id": "p03_evidence",
      "title": "P03 implementation and evidence",
      "intro": "Later fields, minutes 12–39 and work after STOP 60. One implementation path is assessed. Required fake-unit observations and separate real-protocol qualification have different gates.",
      "fields": [
        {
          "id": "p03_changed_path",
          "label": "Assessed P03 path changed",
          "kind": "text",
          "default": "",
          "max": 16000,
          "options": null,
          "help": "Enter exactly projects/p03/student/src/request-dispatcher.mjs, relative to the extracted student root. This is the only assessed implementation file you edit.",
          "phase": "final"
        },
        {
          "id": "p03_diff_locator",
          "label": "Narrow diff or hash locator",
          "kind": "textarea",
          "default": "",
          "max": 16000,
          "options": null,
          "help": "Locate your narrow diff and completed source hash. Explain changes relevant to E01–E06 without pasting a full answer into Gemini.",
          "phase": "final"
        },
        {
          "id": "p03_baseline_results",
          "label": "P03 baseline results",
          "kind": "textarea",
          "default": "",
          "max": 16000,
          "options": null,
          "help": "Record actual baseline count, result and output locator. Select class PURE_JS or CANONICAL_TESTS and outcome PASS only after observing the completed-work verifier.",
          "phase": "final"
        },
        {
          "id": "p03_objective_results",
          "label": "P03 objective results",
          "kind": "textarea",
          "default": "",
          "max": 16000,
          "options": null,
          "help": "Record original canonical objective checks and derived successor checks from VERIFY_WORK_RESULT. The starter direct rejection is not an intended assertion. Normal assessed completeness requires actual PASS.",
          "phase": "final"
        },
        {
          "id": "p03_regression_results",
          "label": "P03 regression results",
          "kind": "textarea",
          "default": "",
          "max": 16000,
          "options": null,
          "help": "Record actual regression counts and output locator from VERIFY_WORK_RESULT. A parser failure, skip, cancellation, timeout or guard block is not PASS.",
          "phase": "final"
        },
        {
          "id": "p03_integration_results",
          "label": "P03 integration result or honest block",
          "kind": "textarea",
          "default": "",
          "max": 16000,
          "options": null,
          "help": "Separate qualification: name the real ws run and limits if actually performed. Otherwise write the actual NOT_EXECUTED/BLOCKED reason and choose that metadata. This field does not require a real protocol run for the fake-unit assessment lane.",
          "phase": "final"
        },
        {
          "id": "p03_reversed_order_trace",
          "label": "Reversed-order trace",
          "kind": "textarea",
          "default": "",
          "max": 16000,
          "options": null,
          "help": "E01: start r1, r2 and r3; deliver r3, r1 then r2. Record which caller receives each result, the output locator and any difference from prediction.",
          "phase": "final"
        },
        {
          "id": "p03_sync_reply_trace",
          "label": "Synchronous reply trace",
          "kind": "textarea",
          "default": "",
          "max": 16000,
          "options": null,
          "help": "E02: record the immediate-reply fake transport case, the state-before-send ordering and the observed result. Do not describe a queued asynchronous reply as a synchronous test.",
          "phase": "final"
        },
        {
          "id": "p03_timeout_trace",
          "label": "Timeout trace",
          "kind": "textarea",
          "default": "",
          "max": 16000,
          "options": null,
          "help": "E04: record timeout outcome, one settlement and late completion behaviour. Name the pending/timer/abort counters and their observation point.",
          "phase": "final"
        },
        {
          "id": "p03_abort_trace",
          "label": "Abort trace",
          "kind": "textarea",
          "default": "",
          "max": 16000,
          "options": null,
          "help": "E03–E04: record pre-abort send count 0 and active abort cleanup. Local promise rejection does not prove cancellation of server work.",
          "phase": "final"
        },
        {
          "id": "p03_close_trace",
          "label": "Transport close trace",
          "kind": "textarea",
          "default": "",
          "max": 16000,
          "options": null,
          "help": "E05: record rejection of pending requests and refusal of dispatch after permanent close. Include output or test locator.",
          "phase": "final"
        },
        {
          "id": "p03_dispose_trace",
          "label": "Dispose trace",
          "kind": "textarea",
          "default": "",
          "max": 16000,
          "options": null,
          "help": "E05: record idempotent dispose, removal of dispatcher subscriptions and refusal of future dispatch. Adapter disposal and closing the socket are separate obligations.",
          "phase": "final"
        },
        {
          "id": "p03_zero_pending",
          "label": "Evidence that pending count returns to zero",
          "kind": "textarea",
          "default": "",
          "max": 16000,
          "options": null,
          "help": "E04–E05: report the actual pending count after each terminal path with a locator. Explain that zero pending alone says nothing about adapter/socket resources.",
          "phase": "final"
        },
        {
          "id": "p03_zero_listeners_timers",
          "label": "Scoped listener and timer cleanup evidence",
          "kind": "textarea",
          "default": "",
          "max": 16000,
          "options": null,
          "help": "E04–E05: separate per-request timer/abort listeners (zero after settlement), dispatcher subscription pair (retained until dispose) and adapter/socket ownership. Record each scope rather than invent one global zero.",
          "phase": "final"
        },
        {
          "id": "p03_unresolved_work",
          "label": "Unresolved P03 work",
          "kind": "textarea",
          "default": "",
          "max": 16000,
          "options": null,
          "help": "List genuinely unresolved required obligations or explicitly state that none remain and give the completed-work result locator. The 18-minute seminar implementation segment is not guaranteed full completion.",
          "phase": "final"
        }
      ]
    },
    {
      "id": "p01_guided_trace",
      "title": "P01 guided trace",
      "intro": "Later fields, minutes 50–55. Each student individually annotates the required P01 source/model trace. The labels do not turn a constructed trace into a live HTTP/WebSocket run.",
      "fields": [
        {
          "id": "p01_demo_scope",
          "label": "P01 guided demonstration scope",
          "kind": "textarea",
          "default": "",
          "max": 16000,
          "options": null,
          "help": "E07 required individual guided trace: identify the supplied source/model trace or actual run. Name the source file or model locator and your individual annotations.",
          "phase": "final"
        },
        {
          "id": "p01_http_acceptance",
          "label": "HTTP acceptance observation",
          "kind": "textarea",
          "default": "",
          "max": 16000,
          "options": null,
          "help": "E07: annotate the HTTP 202/requestId acceptance point and the later completion point. If source/model only, say so and select matching metadata.",
          "phase": "final"
        },
        {
          "id": "p01_ws_registration",
          "label": "WebSocket registration observation",
          "kind": "textarea",
          "default": "",
          "max": 16000,
          "options": null,
          "help": "E07: annotate connection registration, acknowledgement and matching target. Identify observed versus inferred behaviour.",
          "phase": "final"
        },
        {
          "id": "p01_targeted_result",
          "label": "Targeted result observation",
          "kind": "textarea",
          "default": "",
          "max": 16000,
          "options": null,
          "help": "E07: trace the principal/connection/request tuple to its target. Explain why an out-of-order result must reach its own caller.",
          "phase": "final"
        },
        {
          "id": "p01_identity_binding",
          "label": "Identity binding observation",
          "kind": "textarea",
          "default": "",
          "max": 16000,
          "options": null,
          "help": "E07: record the binding and the limit of the query-identity teaching fixture. Do not call it production authentication.",
          "phase": "final"
        },
        {
          "id": "p01_cleanup_observation",
          "label": "Cleanup observation",
          "kind": "textarea",
          "default": "",
          "max": 16000,
          "options": null,
          "help": "E07: annotate pending removal at delivery and source limitations: original duplicate IDs can overwrite ownership and disconnect does not remove pending work. Source analysis is not a repaired live system.",
          "phase": "final"
        },
        {
          "id": "p01_demo_limit",
          "label": "Guided-demo limitation",
          "kind": "textarea",
          "default": "",
          "max": 16000,
          "options": null,
          "help": "State the evidence class, source limitations and untested real HTTP/WebSocket behaviour. A source/model trace is acceptable for the required guided trace when labelled accurately.",
          "phase": "final"
        }
      ]
    },
    {
      "id": "gemini",
      "title": "Bounded Gemini critique",
      "intro": "Later fields, minutes 39–50. Preserve one actual bounded critique and your independent check. Unavailable access stays a truthful draft; this form grants no alternative.",
      "fields": [
        {
          "id": "gemini_prompt",
          "label": "Actual bounded Gemini prompt",
          "kind": "textarea",
          "default": "",
          "max": 16000,
          "options": null,
          "help": "Paste the one actual sanitised prompt you sent using GEMINI_PROMPT_EN_GB.txt. Include only a minimal public excerpt; no full dispatcher, credentials, private code or Moodle data.",
          "phase": "final"
        },
        {
          "id": "gemini_response_excerpt",
          "label": "Relevant Gemini response excerpt",
          "kind": "textarea",
          "default": "",
          "max": 16000,
          "options": null,
          "help": "Preserve the relevant actual response excerpt, model label if visible and a local locator. No invented dialogue. If access is blocked choose BLOCKED and retain a truthful draft.",
          "phase": "final"
        },
        {
          "id": "gemini_claim",
          "label": "Falsifiable claim evaluated",
          "kind": "textarea",
          "default": "",
          "max": 16000,
          "options": null,
          "help": "Quote or paraphrase one falsifiable response claim and distinguish Observed, Inferred or Unknown. The supplied flawed claim says pendingCount 0 proves all lifecycle cleanup.",
          "phase": "final"
        },
        {
          "id": "gemini_independent_check",
          "label": "Independent check",
          "kind": "textarea",
          "default": "",
          "max": 16000,
          "options": null,
          "help": "E04–E05 or a narrow source counterexample: record your own check, result, locator and limit. A Gemini answer cannot serve as its own independent check.",
          "phase": "final"
        },
        {
          "id": "gemini_verdict_correction",
          "label": "Verdict, correction and limitation",
          "kind": "textarea",
          "default": "",
          "max": 16000,
          "options": null,
          "help": "State ACCEPTED, REJECTED, PARTIALLY ACCEPTED or UNKNOWN, then correction and limit. The verdict must follow your independent check, not the model confidence.",
          "phase": "final"
        }
      ]
    },
    {
      "id": "reflection_transfer",
      "title": "Reflection and transfer",
      "intro": "Later fields and exit ticket, minutes 55–60. P02 is optional. Record limits and next work at STOP 60 without promising completion in the seminar.",
      "fields": [
        {
          "id": "p02_optional_status",
          "label": "Optional P02 status",
          "kind": "select",
          "default": "",
          "max": 16000,
          "options": [
            "",
            "NOT_STARTED",
            "PLANNED",
            "PARTIAL",
            "COMPLETE_UNVERIFIED",
            "COMPLETE_WITH_EVIDENCE"
          ],
          "help": "Choose NOT_STARTED if you did not attempt optional Redis/BullMQ work. P02 adds no assessed implementation gate and no hidden provisioning requirement.",
          "phase": "final"
        },
        {
          "id": "cross_protocol_reflection",
          "label": "Cross-protocol reflection",
          "kind": "textarea",
          "default": "",
          "max": 16000,
          "options": null,
          "help": "Explain how acceptance, execution and targeted delivery differ, using your own P03 and P01 locators. Include one risk such as an accepted report export being mistaken for a completed total.",
          "phase": "final"
        },
        {
          "id": "evidence_class_limits",
          "label": "Evidence-class limitations",
          "kind": "textarea",
          "default": "",
          "max": 16000,
          "options": null,
          "help": "List which claims are actual fake-unit observations, source/model annotations or real protocol observations, and which remain untested.",
          "phase": "final"
        },
        {
          "id": "next_work",
          "label": "Required next work",
          "kind": "textarea",
          "default": "",
          "max": 16000,
          "options": null,
          "help": "At minute 60 record the next required action, teacher-set deadline when actually known and outstanding qualification. No deadline or penalty is invented by this form.",
          "phase": "final"
        }
      ]
    },
    {
      "id": "declaration_pdf",
      "title": "Declaration and PDF route",
      "intro": "After required work and final review. Declarations renew after edits or import. Printing, PDF saving and Moodle final submission are separate observed actions.",
      "fields": [
        {
          "id": "privacy_redaction",
          "label": "I removed credentials, tokens, cookies and unnecessary personal data",
          "kind": "checkbox",
          "default": false,
          "max": 16000,
          "options": null,
          "help": "After the latest edit, inspect all fields and remove passwords, tokens, API keys, session cookies, real personal data, private account screenshots, private code and Moodle data. Then renew this declaration.",
          "phase": "final"
        },
        {
          "id": "declaration_truthful",
          "label": "I declare that the evidence and limitations are truthful",
          "kind": "checkbox",
          "default": false,
          "max": 16000,
          "options": null,
          "help": "Declare only your own truthful evidence and limits. Structural completeness is not teacher approval or evidence verification. Import and substantive edits reset this declaration.",
          "phase": "final"
        },
        {
          "id": "pdf_review_status",
          "label": "PDF review status",
          "kind": "select",
          "default": "",
          "max": 16000,
          "options": [
            "",
            "NOT_REVIEWED",
            "DRAFT_REVIEWED",
            "FINAL_REVIEWED"
          ],
          "help": "Choose FINAL_REVIEWED only after opening the actual saved PDF and checking every page, filename, text, evidence status and redaction. Browser print alone cannot verify saving.",
          "phase": "final"
        },
        {
          "id": "submission_status",
          "label": "Submission status",
          "kind": "select",
          "default": "",
          "max": 16000,
          "options": [
            "",
            "NOT_SUBMITTED",
            "READY_NOT_SUBMITTED",
            "SUBMITTED_UNVERIFIED"
          ],
          "help": "READY_NOT_SUBMITTED describes local readiness. SUBMITTED_UNVERIFIED records a claim you must support by observing the actual Moodle final status/name/timestamp. Draft is not final submission.",
          "phase": "final"
        },
        {
          "id": "final_status",
          "label": "Form status",
          "kind": "select",
          "default": "",
          "max": 16000,
          "options": [
            "",
            "DRAFT",
            "FINAL_FIELDS_COMPLETE_NOT_VERIFIED"
          ],
          "help": "FINAL_FIELDS_COMPLETE_NOT_VERIFIED is a structural candidate, not correctness, teacher approval or a Moodle receipt. Keep DRAFT whenever required implementation, actual Gemini exchange or evidence remains blocked.",
          "phase": "final"
        }
      ]
    }
  ],
  "supportedImportVersions": [
    "1.1.0",
    "1.2.0"
  ],
  "status": "FINAL_LOCAL — content and packaging only",
  "evidencePolicy": {
    "classes": [
      "NOT_RECORDED",
      "NOT_EXECUTED",
      "BLOCKED",
      "SOURCE_ANALYSIS",
      "MODEL",
      "PURE_JS",
      "CANONICAL_TESTS",
      "REAL_PROTOCOL",
      "ACTUAL_GEMINI"
    ],
    "outcomes": [
      "NOT_RECORDED",
      "NOT_EXECUTED",
      "BLOCKED",
      "OBSERVED",
      "PASS",
      "FAIL"
    ],
    "fields": {
      "p03_baseline_results": {
        "requiredForAssessment": true,
        "allowedClasses": [
          "PURE_JS",
          "CANONICAL_TESTS"
        ],
        "allowedOutcomes": [
          "PASS"
        ]
      },
      "p03_objective_results": {
        "requiredForAssessment": true,
        "allowedClasses": [
          "PURE_JS",
          "CANONICAL_TESTS"
        ],
        "allowedOutcomes": [
          "PASS"
        ]
      },
      "p03_regression_results": {
        "requiredForAssessment": true,
        "allowedClasses": [
          "PURE_JS",
          "CANONICAL_TESTS"
        ],
        "allowedOutcomes": [
          "PASS"
        ]
      },
      "p03_reversed_order_trace": {
        "requiredForAssessment": true,
        "allowedClasses": [
          "PURE_JS",
          "CANONICAL_TESTS"
        ],
        "allowedOutcomes": [
          "OBSERVED",
          "PASS"
        ]
      },
      "p03_sync_reply_trace": {
        "requiredForAssessment": true,
        "allowedClasses": [
          "PURE_JS",
          "CANONICAL_TESTS"
        ],
        "allowedOutcomes": [
          "OBSERVED",
          "PASS"
        ]
      },
      "p03_timeout_trace": {
        "requiredForAssessment": true,
        "allowedClasses": [
          "PURE_JS",
          "CANONICAL_TESTS"
        ],
        "allowedOutcomes": [
          "OBSERVED",
          "PASS"
        ]
      },
      "p03_abort_trace": {
        "requiredForAssessment": true,
        "allowedClasses": [
          "PURE_JS",
          "CANONICAL_TESTS"
        ],
        "allowedOutcomes": [
          "OBSERVED",
          "PASS"
        ]
      },
      "p03_close_trace": {
        "requiredForAssessment": true,
        "allowedClasses": [
          "PURE_JS",
          "CANONICAL_TESTS"
        ],
        "allowedOutcomes": [
          "OBSERVED",
          "PASS"
        ]
      },
      "p03_dispose_trace": {
        "requiredForAssessment": true,
        "allowedClasses": [
          "PURE_JS",
          "CANONICAL_TESTS"
        ],
        "allowedOutcomes": [
          "OBSERVED",
          "PASS"
        ]
      },
      "p03_zero_pending": {
        "requiredForAssessment": true,
        "allowedClasses": [
          "PURE_JS",
          "CANONICAL_TESTS"
        ],
        "allowedOutcomes": [
          "OBSERVED",
          "PASS"
        ]
      },
      "p03_zero_listeners_timers": {
        "requiredForAssessment": true,
        "allowedClasses": [
          "PURE_JS",
          "CANONICAL_TESTS"
        ],
        "allowedOutcomes": [
          "OBSERVED",
          "PASS"
        ]
      },
      "p03_integration_results": {
        "requiredForAssessment": false,
        "allowedClasses": [
          "REAL_PROTOCOL",
          "NOT_EXECUTED",
          "BLOCKED"
        ],
        "allowedOutcomes": [
          "PASS",
          "FAIL",
          "NOT_EXECUTED",
          "BLOCKED",
          "OBSERVED"
        ]
      },
      "p01_demo_scope": {
        "requiredForAssessment": true,
        "allowedClasses": [
          "SOURCE_ANALYSIS",
          "MODEL",
          "PURE_JS",
          "REAL_PROTOCOL"
        ],
        "allowedOutcomes": [
          "OBSERVED",
          "PASS"
        ]
      },
      "p01_http_acceptance": {
        "requiredForAssessment": true,
        "allowedClasses": [
          "SOURCE_ANALYSIS",
          "MODEL",
          "PURE_JS",
          "REAL_PROTOCOL"
        ],
        "allowedOutcomes": [
          "OBSERVED",
          "PASS"
        ]
      },
      "p01_ws_registration": {
        "requiredForAssessment": true,
        "allowedClasses": [
          "SOURCE_ANALYSIS",
          "MODEL",
          "PURE_JS",
          "REAL_PROTOCOL"
        ],
        "allowedOutcomes": [
          "OBSERVED",
          "PASS"
        ]
      },
      "p01_targeted_result": {
        "requiredForAssessment": true,
        "allowedClasses": [
          "SOURCE_ANALYSIS",
          "MODEL",
          "PURE_JS",
          "REAL_PROTOCOL"
        ],
        "allowedOutcomes": [
          "OBSERVED",
          "PASS"
        ]
      },
      "p01_identity_binding": {
        "requiredForAssessment": true,
        "allowedClasses": [
          "SOURCE_ANALYSIS",
          "MODEL",
          "PURE_JS",
          "REAL_PROTOCOL"
        ],
        "allowedOutcomes": [
          "OBSERVED",
          "PASS"
        ]
      },
      "p01_cleanup_observation": {
        "requiredForAssessment": true,
        "allowedClasses": [
          "SOURCE_ANALYSIS",
          "MODEL",
          "PURE_JS",
          "REAL_PROTOCOL"
        ],
        "allowedOutcomes": [
          "OBSERVED",
          "PASS"
        ]
      },
      "p01_demo_limit": {
        "requiredForAssessment": true,
        "allowedClasses": [
          "SOURCE_ANALYSIS",
          "MODEL",
          "PURE_JS",
          "REAL_PROTOCOL"
        ],
        "allowedOutcomes": [
          "OBSERVED",
          "PASS"
        ]
      },
      "gemini_prompt": {
        "requiredForAssessment": true,
        "allowedClasses": [
          "ACTUAL_GEMINI"
        ],
        "allowedOutcomes": [
          "OBSERVED"
        ]
      },
      "gemini_response_excerpt": {
        "requiredForAssessment": true,
        "allowedClasses": [
          "ACTUAL_GEMINI"
        ],
        "allowedOutcomes": [
          "OBSERVED"
        ]
      },
      "gemini_claim": {
        "requiredForAssessment": true,
        "allowedClasses": [
          "ACTUAL_GEMINI"
        ],
        "allowedOutcomes": [
          "OBSERVED"
        ]
      },
      "gemini_independent_check": {
        "requiredForAssessment": true,
        "allowedClasses": [
          "SOURCE_ANALYSIS",
          "MODEL",
          "PURE_JS",
          "CANONICAL_TESTS",
          "REAL_PROTOCOL"
        ],
        "allowedOutcomes": [
          "OBSERVED",
          "PASS",
          "FAIL"
        ]
      },
      "gemini_verdict_correction": {
        "requiredForAssessment": true,
        "allowedClasses": [
          "SOURCE_ANALYSIS",
          "MODEL",
          "PURE_JS",
          "CANONICAL_TESTS",
          "REAL_PROTOCOL"
        ],
        "allowedOutcomes": [
          "OBSERVED",
          "PASS",
          "FAIL"
        ]
      }
    },
    "note": "Student-declared metadata is not independently verified truth. Required fields gate structural assessed completeness; the real integration field remains separate qualification."
  },
  "releaseVersion": "1.2.1"
};
