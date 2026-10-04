# S01 glossary

**Request**: a client's method, target, headers and optional body sent to the server. **Response**: the server's status, headers and optional representation.

**Method**: the operation label, such as GET or POST. **Path**: the URL component such as /api/greetings/Ada. **Query**: named parameters after `?`. **Body**: content sent separately from the URL, such as POST JSON.

**Content-Type**: the representation's declared media type. Request Content-Type and response Content-Type belong to different messages. **Location**: a response field identifying a resource; P01 supplies it with the 201 response.

**Loopback**: this computer's local network interface. S01 binds to 127.0.0.1 rather than a public interface. **Port**: an endpoint number printed when the server starts; do not guess it.

**DevTools**: browser development tools. **Network panel**: the record of requests associated with the selected browser tab. **DevOps** is not the name of this panel.

**Assertion**: a deliberate comparison that fails when the actual result differs from the specified result. **Syntax error**: invalid code that cannot be parsed. **Timeout**: failure to finish within the declared time. These categories are not interchangeable.

**Manifest**: the exact list of package paths and content hashes. **PACKAGE_ID**: the hash of the manifest bytes. Hashes detect a mismatch; without a trusted external value they do not authenticate who supplied a package.

**Prediction**: a statement saved before the observation. **Falsifier**: an observation that would disprove the prediction. **Witness**: a bounded input and result distinguishing two explanations. **Mechanism**: why the observation occurred.

**Draft**: saved but not necessarily finally submitted work. **Verdict**: ACCEPTED, REJECTED, PARTIALLY ACCEPTED or UNKNOWN after independent verification.
