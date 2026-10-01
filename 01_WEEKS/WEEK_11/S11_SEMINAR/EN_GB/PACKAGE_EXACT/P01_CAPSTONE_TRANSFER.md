# P01 capstone transfer — authenticated session boundary

P01 is a semester-project integration route, not a second full implementation in the S11 hour. Use its exact student tree and specification when the capstone schedule reaches authentication.

Record the distinction between password verification, opaque server-side session state, cookie transport attributes, request-origin/HTTPS assumptions and authorisation. Do not store passwords, raw session tokens or secrets in the S11 evidence form. A deterministic generator is appropriate for reproducible tests but is not an entropy measurement. The supplied memory store is teaching infrastructure, not a production deployment.
