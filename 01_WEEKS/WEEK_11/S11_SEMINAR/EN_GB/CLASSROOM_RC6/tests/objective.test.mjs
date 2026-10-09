import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
const extra={
  "P01": [
    {
      "label": "padded-valid-id",
      "input": {
        "trusted": {
          "id": " u1 ",
          "role": "member"
        },
        "body": {
          "id": "claim",
          "role": "admin"
        }
      },
      "expected": {
        "id": " u1 ",
        "role": "member"
      }
    },
    {
      "label": "trusted-moderator",
      "input": {
        "trusted": {
          "id": "m",
          "role": "moderator"
        },
        "body": {
          "id": "claim",
          "role": "admin"
        }
      },
      "expected": {
        "id": "m",
        "role": "moderator"
      }
    },
    {
      "label": "trusted-admin",
      "input": {
        "trusted": {
          "id": "a",
          "role": "admin"
        },
        "body": {
          "id": "claim",
          "role": "member"
        }
      },
      "expected": {
        "id": "a",
        "role": "admin"
      }
    },
    {
      "label": "blank-id",
      "input": {
        "trusted": {
          "id": "",
          "role": "member"
        },
        "body": {
          "id": "claim",
          "role": "admin"
        }
      },
      "expected": null
    },
    {
      "label": "whitespace-id",
      "input": {
        "trusted": {
          "id": " \t\n",
          "role": "member"
        },
        "body": {
          "id": "claim",
          "role": "admin"
        }
      },
      "expected": null
    },
    {
      "label": "numeric-id",
      "input": {
        "trusted": {
          "id": 42,
          "role": "member"
        },
        "body": {
          "id": "claim",
          "role": "admin"
        }
      },
      "expected": null
    },
    {
      "label": "missing-id",
      "input": {
        "trusted": {
          "role": "member"
        },
        "body": {
          "id": "claim",
          "role": "admin"
        }
      },
      "expected": null
    },
    {
      "label": "unknown-role-with-convincing-body",
      "input": {
        "trusted": {
          "id": "u1",
          "role": "administrator"
        },
        "body": {
          "id": "claim",
          "role": "admin"
        }
      },
      "expected": null
    },
    {
      "label": "exact-role-spelling",
      "input": {
        "trusted": {
          "id": "u1",
          "role": "Member"
        },
        "body": {
          "id": "claim",
          "role": "admin"
        }
      },
      "expected": null
    },
    {
      "label": "selected-fields",
      "input": {
        "trusted": {
          "id": "u1",
          "role": "member",
          "display": "Extra"
        },
        "body": {
          "id": "claim",
          "role": "admin",
          "display": "Claim"
        }
      },
      "expected": {
        "id": "u1",
        "role": "member"
      }
    },
    {
      "label": "body-cannot-repair-absence",
      "input": {
        "trusted": null,
        "body": {
          "id": "claim",
          "role": "admin"
        }
      },
      "expected": null
    },
    {
      "label": "non-ascii-nonblank-id",
      "input": {
        "trusted": {
          "id": "識別",
          "role": "member"
        },
        "body": {
          "id": "claim",
          "role": "admin"
        }
      },
      "expected": {
        "id": "識別",
        "role": "member"
      }
    }
  ],
  "P02": [
    {
      "label": "both-absent-read",
      "input": {
        "action": "read",
        "principal": null,
        "report": null,
        "body": {
          "id": "claim",
          "role": "admin"
        }
      },
      "expected": 401
    },
    {
      "label": "authenticated-missing-report-read",
      "input": {
        "action": "read",
        "principal": {
          "id": "u1",
          "role": "member"
        },
        "report": null,
        "body": {
          "id": "claim",
          "role": "admin"
        }
      },
      "expected": 404
    },
    {
      "label": "both-absent-delete",
      "input": {
        "action": "delete",
        "principal": null,
        "report": null,
        "body": {
          "id": "claim",
          "role": "admin"
        }
      },
      "expected": 401
    },
    {
      "label": "authenticated-missing-report-delete",
      "input": {
        "action": "delete",
        "principal": {
          "id": "u1",
          "role": "member"
        },
        "report": null,
        "body": {
          "id": "claim",
          "role": "admin"
        }
      },
      "expected": 404
    },
    {
      "label": "member-owner-read",
      "input": {
        "action": "read",
        "principal": {
          "id": "person",
          "role": "member"
        },
        "report": {
          "id": "changed-report",
          "ownerId": "person"
        },
        "body": {
          "role": "admin",
          "ownerId": "person",
          "action": "delete"
        }
      },
      "expected": 200
    },
    {
      "label": "member-owner-delete",
      "input": {
        "action": "delete",
        "principal": {
          "id": "person",
          "role": "member"
        },
        "report": {
          "id": "changed-report",
          "ownerId": "person"
        },
        "body": {
          "role": "admin",
          "ownerId": "person",
          "action": "delete"
        }
      },
      "expected": 204
    },
    {
      "label": "moderator-owner-read",
      "input": {
        "action": "read",
        "principal": {
          "id": "person",
          "role": "moderator"
        },
        "report": {
          "id": "changed-report",
          "ownerId": "person"
        },
        "body": {
          "role": "admin",
          "ownerId": "person",
          "action": "delete"
        }
      },
      "expected": 200
    },
    {
      "label": "moderator-owner-delete",
      "input": {
        "action": "delete",
        "principal": {
          "id": "person",
          "role": "moderator"
        },
        "report": {
          "id": "changed-report",
          "ownerId": "person"
        },
        "body": {
          "role": "admin",
          "ownerId": "person",
          "action": "delete"
        }
      },
      "expected": 204
    },
    {
      "label": "admin-owner-read",
      "input": {
        "action": "read",
        "principal": {
          "id": "person",
          "role": "admin"
        },
        "report": {
          "id": "changed-report",
          "ownerId": "person"
        },
        "body": {
          "role": "admin",
          "ownerId": "person",
          "action": "delete"
        }
      },
      "expected": 200
    },
    {
      "label": "admin-owner-delete",
      "input": {
        "action": "delete",
        "principal": {
          "id": "person",
          "role": "admin"
        },
        "report": {
          "id": "changed-report",
          "ownerId": "person"
        },
        "body": {
          "role": "admin",
          "ownerId": "person",
          "action": "delete"
        }
      },
      "expected": 204
    },
    {
      "label": "member-unrelated-read",
      "input": {
        "action": "read",
        "principal": {
          "id": "person",
          "role": "member"
        },
        "report": {
          "id": "changed-report",
          "ownerId": "another"
        },
        "body": {
          "role": "admin",
          "ownerId": "person",
          "action": "delete"
        }
      },
      "expected": 404
    },
    {
      "label": "member-unrelated-delete",
      "input": {
        "action": "delete",
        "principal": {
          "id": "person",
          "role": "member"
        },
        "report": {
          "id": "changed-report",
          "ownerId": "another"
        },
        "body": {
          "role": "admin",
          "ownerId": "person",
          "action": "delete"
        }
      },
      "expected": 403
    },
    {
      "label": "moderator-unrelated-read",
      "input": {
        "action": "read",
        "principal": {
          "id": "person",
          "role": "moderator"
        },
        "report": {
          "id": "changed-report",
          "ownerId": "another"
        },
        "body": {
          "role": "admin",
          "ownerId": "person",
          "action": "delete"
        }
      },
      "expected": 200
    },
    {
      "label": "moderator-unrelated-delete",
      "input": {
        "action": "delete",
        "principal": {
          "id": "person",
          "role": "moderator"
        },
        "report": {
          "id": "changed-report",
          "ownerId": "another"
        },
        "body": {
          "role": "admin",
          "ownerId": "person",
          "action": "delete"
        }
      },
      "expected": 403
    },
    {
      "label": "admin-unrelated-read",
      "input": {
        "action": "read",
        "principal": {
          "id": "person",
          "role": "admin"
        },
        "report": {
          "id": "changed-report",
          "ownerId": "another"
        },
        "body": {
          "role": "admin",
          "ownerId": "person",
          "action": "delete"
        }
      },
      "expected": 200
    },
    {
      "label": "admin-unrelated-delete",
      "input": {
        "action": "delete",
        "principal": {
          "id": "person",
          "role": "admin"
        },
        "report": {
          "id": "changed-report",
          "ownerId": "another"
        },
        "body": {
          "role": "admin",
          "ownerId": "person",
          "action": "delete"
        }
      },
      "expected": 204
    }
  ],
  "P03": [
    {
      "label": "both-refused",
      "input": {
        "origin": "https://unlisted.example",
        "trusted": [
          "https://course.example"
        ],
        "method": "POST",
        "auth": "cookie",
        "tokenMatches": false
      },
      "expected": {
        "share": false,
        "csrfAllowed": false
      }
    },
    {
      "label": "lookalike-independent-allow",
      "input": {
        "origin": "https://course.example.evil",
        "trusted": [
          "https://course.example"
        ],
        "method": "POST",
        "auth": "cookie",
        "tokenMatches": true
      },
      "expected": {
        "share": false,
        "csrfAllowed": true
      }
    },
    {
      "label": "port-is-unlisted",
      "input": {
        "origin": "https://course.example:8443",
        "trusted": [
          "https://course.example"
        ],
        "method": "POST",
        "auth": "cookie",
        "tokenMatches": true
      },
      "expected": {
        "share": false,
        "csrfAllowed": true
      }
    },
    {
      "label": "explicit-default-port-is-a-different-string",
      "input": {
        "origin": "https://course.example:443",
        "trusted": [
          "https://course.example"
        ],
        "method": "POST",
        "auth": "cookie",
        "tokenMatches": true
      },
      "expected": {
        "share": false,
        "csrfAllowed": true
      }
    },
    {
      "label": "different-scheme",
      "input": {
        "origin": "http://course.example",
        "trusted": [
          "https://course.example"
        ],
        "method": "POST",
        "auth": "cookie",
        "tokenMatches": true
      },
      "expected": {
        "share": false,
        "csrfAllowed": true
      }
    },
    {
      "label": "exact-second-entry",
      "input": {
        "origin": "https://second.example",
        "trusted": [
          "https://course.example",
          "https://second.example"
        ],
        "method": "POST",
        "auth": "cookie",
        "tokenMatches": true
      },
      "expected": {
        "share": true,
        "csrfAllowed": true
      }
    },
    {
      "label": "empty-origin-list",
      "input": {
        "origin": "https://course.example",
        "trusted": [],
        "method": "GET",
        "auth": "cookie",
        "tokenMatches": false
      },
      "expected": {
        "share": false,
        "csrfAllowed": true
      }
    },
    {
      "label": "head-exemption",
      "input": {
        "origin": "https://course.example",
        "trusted": [
          "https://course.example"
        ],
        "method": "HEAD",
        "auth": "cookie",
        "tokenMatches": false
      },
      "expected": {
        "share": true,
        "csrfAllowed": true
      }
    },
    {
      "label": "options-exemption",
      "input": {
        "origin": "https://course.example",
        "trusted": [
          "https://course.example"
        ],
        "method": "OPTIONS",
        "auth": "cookie",
        "tokenMatches": false
      },
      "expected": {
        "share": true,
        "csrfAllowed": true
      }
    },
    {
      "label": "bearer-exemption",
      "input": {
        "origin": "https://course.example",
        "trusted": [
          "https://course.example"
        ],
        "method": "POST",
        "auth": "bearer",
        "tokenMatches": false
      },
      "expected": {
        "share": true,
        "csrfAllowed": true
      }
    },
    {
      "label": "unlisted-bearer",
      "input": {
        "origin": "https://unlisted.example",
        "trusted": [
          "https://course.example"
        ],
        "method": "POST",
        "auth": "bearer",
        "tokenMatches": false
      },
      "expected": {
        "share": false,
        "csrfAllowed": true
      }
    },
    {
      "label": "PUT-cookie-false",
      "input": {
        "origin": "https://course.example",
        "trusted": [
          "https://course.example"
        ],
        "method": "PUT",
        "auth": "cookie",
        "tokenMatches": false
      },
      "expected": {
        "share": true,
        "csrfAllowed": false
      }
    },
    {
      "label": "PUT-cookie-true",
      "input": {
        "origin": "https://course.example",
        "trusted": [
          "https://course.example"
        ],
        "method": "PUT",
        "auth": "cookie",
        "tokenMatches": true
      },
      "expected": {
        "share": true,
        "csrfAllowed": true
      }
    },
    {
      "label": "PATCH-cookie-false",
      "input": {
        "origin": "https://course.example",
        "trusted": [
          "https://course.example"
        ],
        "method": "PATCH",
        "auth": "cookie",
        "tokenMatches": false
      },
      "expected": {
        "share": true,
        "csrfAllowed": false
      }
    },
    {
      "label": "PATCH-cookie-true",
      "input": {
        "origin": "https://course.example",
        "trusted": [
          "https://course.example"
        ],
        "method": "PATCH",
        "auth": "cookie",
        "tokenMatches": true
      },
      "expected": {
        "share": true,
        "csrfAllowed": true
      }
    },
    {
      "label": "DELETE-cookie-false",
      "input": {
        "origin": "https://course.example",
        "trusted": [
          "https://course.example"
        ],
        "method": "DELETE",
        "auth": "cookie",
        "tokenMatches": false
      },
      "expected": {
        "share": true,
        "csrfAllowed": false
      }
    },
    {
      "label": "DELETE-cookie-true",
      "input": {
        "origin": "https://course.example",
        "trusted": [
          "https://course.example"
        ],
        "method": "DELETE",
        "auth": "cookie",
        "tokenMatches": true
      },
      "expected": {
        "share": true,
        "csrfAllowed": true
      }
    }
  ]
};
const cases=JSON.parse(readFileSync(new URL("../support/cases.json",import.meta.url)));
import { principalOwner } from "../student/p01.mjs";
test("P01: classroom contract and input immutability", () => { const c=cases[0]; for(let i=0;i<c.inputs.length;i++){ const input=structuredClone(c.inputs[i]); const before=structuredClone(input); assert.deepEqual(principalOwner(input),c.expected[i], `${c.project_id} case ${i+1}`); assert.deepEqual(input,before,"inputs remain unchanged"); } for(const row of extra.P01){ const input=structuredClone(row.input); const before=structuredClone(input); assert.deepEqual(principalOwner(input),row.expected, "P01 finite "+row.label); assert.deepEqual(input,before,"inputs remain unchanged: "+row.label); } });
import { reportPermission } from "../student/p02.mjs";
test("P02: classroom contract and input immutability", () => { const c=cases[1]; for(let i=0;i<c.inputs.length;i++){ const input=structuredClone(c.inputs[i]); const before=structuredClone(input); assert.deepEqual(reportPermission(input),c.expected[i], `${c.project_id} case ${i+1}`); assert.deepEqual(input,before,"inputs remain unchanged"); } for(const row of extra.P02){ const input=structuredClone(row.input); const before=structuredClone(input); assert.deepEqual(reportPermission(input),row.expected, "P02 finite "+row.label); assert.deepEqual(input,before,"inputs remain unchanged: "+row.label); } });
import { securityDecision } from "../student/p03.mjs";
test("P03: classroom contract and input immutability", () => { const c=cases[2]; for(let i=0;i<c.inputs.length;i++){ const input=structuredClone(c.inputs[i]); const before=structuredClone(input); assert.deepEqual(securityDecision(input),c.expected[i], `${c.project_id} case ${i+1}`); assert.deepEqual(input,before,"inputs remain unchanged"); } for(const row of extra.P03){ const input=structuredClone(row.input); const before=structuredClone(input); assert.deepEqual(securityDecision(input),row.expected, "P03 finite "+row.label); assert.deepEqual(input,before,"inputs remain unchanged: "+row.label); } });
