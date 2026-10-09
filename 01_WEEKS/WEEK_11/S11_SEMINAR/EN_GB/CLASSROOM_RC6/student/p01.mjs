// S11 classroom microcontract1.0; Authentication transfer: trusted principal
// Extract only a supplied trusted principal with nonblank string id and known role member/moderator/admin. Ignore a separate untrusted request body, even if it requests an admin role. This models one trust boundary; no password, session or real login is implemented.
// Implement your own bounded function. The retained full application is a separate contract.
export function principalOwner(input) {
  void input;
  return null; // TODO: intentional incomplete objective
}
