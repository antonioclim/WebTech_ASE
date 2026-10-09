import { isDeepStrictEqual } from "node:util";
const selectors={"P01-provenance":"P01","P02-action":"P02","P03-independent":"P03"};
const selector=process.argv[2];const project=selectors[selector];
if(!project)throw new TypeError("Unknown protected teaching selector");
const rows={
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
      }
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
      }
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
      }
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
      }
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
      }
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
      }
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
      }
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
      }
    },
    {
      "label": "supplied-conflict",
      "input": {
        "trusted": {
          "id": "u1",
          "role": "member"
        },
        "body": {
          "id": "claim",
          "role": "admin"
        }
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
      }
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
      }
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
      }
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
      }
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
      }
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
      }
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
      }
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
      }
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
      }
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
      }
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
      }
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
      }
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
      }
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
      }
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
      }
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
      }
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
      }
    },
    {
      "label": "listed-cookie-post-refused",
      "input": {
        "origin": "https://course.example",
        "trusted": [
          "https://course.example"
        ],
        "method": "POST",
        "auth": "cookie",
        "tokenMatches": false
      }
    },
    {
      "label": "listed-cookie-post-allowed",
      "input": {
        "origin": "https://course.example",
        "trusted": [
          "https://course.example"
        ],
        "method": "POST",
        "auth": "cookie",
        "tokenMatches": true
      }
    }
  ]
};
const exportsByProject={P01:"principalOwner",P02:"reportPermission",P03:"securityDecision"};
const module=await import("./student/"+project.toLowerCase()+".mjs");
const observe=module[exportsByProject[project]];
const observations=rows[project].map(row=>{const input=structuredClone(row.input);const before=structuredClone(input);const actual=observe(input);if(actual!==null&&actual!==undefined&&typeof actual.then==='function'){const error=new Error('TARGET_RETURNED_THENABLE_FOR_SYNCHRONOUS_CONTRACT');error.code='TARGET_RETURNED_THENABLE_FOR_SYNCHRONOUS_CONTRACT';throw error;}return {case:row.label,input_before:before,actual_output:actual,input_after:input,input_unchanged:isDeepStrictEqual(before,input)};});
console.log(JSON.stringify({selector,project,status:"EXECUTED_FINITE_TEACHING_OBSERVATION",scope:"Actual selected pure-function values/input-content only; no expected-value oracle or contract verdict, no login/HTTP/browser/timing qualification",truth_authenticated:false,observations},null,2));
