# Primary sources for Seminar 01

- RFC 9110 HTTP Semantics, Fielding, Nottingham and Reschke, 2022: https://www.rfc-editor.org/rfc/rfc9110.html (DOI https://doi.org/10.17487/RFC9110). Read section 8.3 for Content-Type, sections 9.2 and 9.3 for method semantics and section 15 for status codes. A status describes the HTTP exchange; the application body carries its own business facts.
- WHATWG URL Standard: https://url.spec.whatwg.org/ . Read URL parsing and percent-encoded bytes for the distinction between a URL path/query and the decoded value used by an application.
- Node.js child_process documentation: https://nodejs.org/api/child_process.html . The kit invokes npm-cli.js using the selected Node executable rather than treating a Windows .cmd shim as a native executable.

These sources support protocol and runtime claims. The local named tests check the stated lesson contract; they do not establish complete HTTP conformance or production security.
