# Operative specification — P01 authentication/session capstone transfer, S11 v1.2.1

P01 is a source/baseline-only transfer plan in this S11 meeting. Full implementation in `student/src/authentication.js` is separately scheduled; it is not a second compulsory implementation here. Preserve supplied utilities, metadata, dependencies and all canonical test bytes.

The separately scheduled implementation validates exact login shape, normalises email only, performs real supplied scrypt verification (including dummy work for unknown users), uses opaque server-side memory sessions, rotates login sessions, clears/invalidate logout and returns a frozen public principal. Cookie scope is HttpOnly, SameSite=Lax, Path=/ and Secure in declared production fixture mode. Password/hash/salt/session values must not enter submitted evidence.

Malformed client cookie escapes now classify as invalid session instead of throwing URIError. The in-memory store and x-forwarded-proto HTTPS signal remain teaching fixtures; they establish neither production persistence nor an actual TLS handshake/proxy trust policy. Unexpected failures belong to the app's sanitised handler.

Required stack is Node24.21.0/npm11.19.0 with locked Express5.1.0. No install, download or server launch is authorised by this specification. Available pure baselines are not Express qualification.

## Open canonical starter blocker

The preserved initial objective suite contains cookie-dependent operations after the fail-closed503 login. Since the starter sets no cookie, tests can throw TypeError before the expected assertions. Initial full-suite qualification remains **BLOCKED_NONASSERTION_STARTER_FAILURE_SOURCE_DERIVED_NOT_EXPRESS_EXECUTED**. This source-derived limitation is not an accepted intentional failure and has not been tested on Express in the authoring environment. No fake cookie or modified canonical test was introduced to produce a favourable result. Teacher scheduling must address the full-capstone qualification independently.

## Bounded Gemini and transfer evidence

Critique one sanitised source claim about identity/session/cookie evidence. Independently verify the claim and record its scope. Do not request a complete authentication implementation, skip verifier work or weaken protection. Record the future integration plan, exact module boundary and outstanding actual tests in the same S11 evidence route. Registration, MFA, identity providers, authorisation policy, databases and production deployment are outside scope.
