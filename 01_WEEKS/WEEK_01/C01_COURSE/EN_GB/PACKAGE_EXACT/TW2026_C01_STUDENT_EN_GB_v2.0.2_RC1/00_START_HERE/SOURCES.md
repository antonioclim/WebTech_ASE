# C01 primary reading map

Use the section relevant to the claim you are checking. Whole standards are reference material, rather than compulsory cover-to-cover reading.

| Source | Targeted reading | Connection to C01 |
| --- | --- | --- |
| Fielding, R. T., Nottingham, M. and Reschke, J., editors (2022), [RFC 9110 HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html), [DOI 10.17487/RFC9110](https://doi.org/10.17487/RFC9110) | §§3.1–3.4; §8.3; §8.5; §§9.1–9.3; §§15.3.2, 15.5.1; §10.2.2 | Resources and messages; media type and Content-Language; method semantics; creation, bad requests and Location. Examples 02–04 and handout pages 1–3. |
| WHATWG, [URL Standard](https://url.spec.whatwg.org/) | URL representation, basic URL parser and URLSearchParams | Parsed components and query decoding in example 01. The fragment is omitted from an HTTP target; see also RFC 9110 §4.2.5. |
| Fielding, R. T. (2000), [Architectural Styles and the Design of Network-based Software Architectures, chapter 5](https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm) | §§5.1.2–5.1.5 | REST constraints behind the distinction between JSON syntax and an architectural style. A route name alone does not establish those constraints. |
| Node.js, [v24 child process documentation](https://nodejs.org/docs/latest-v24.x/api/child_process.html) | Spawning .bat and .cmd files on Windows; spawn and spawnSync options | The package environment check invokes npm-cli.js through the selected Node binary and bounds its probes. This is tooling reference, rather than an assessed HTTP outcome. |

The handout's expenses and notes are teaching examples. Their business rules do not come from HTTP itself. A source link supports a defined mechanism; it does not qualify a particular browser, operating system or classroom deployment.
