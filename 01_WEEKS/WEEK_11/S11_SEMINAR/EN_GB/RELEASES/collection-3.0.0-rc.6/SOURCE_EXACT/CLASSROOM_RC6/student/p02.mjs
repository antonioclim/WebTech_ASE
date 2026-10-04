// S11 classroom microcontract1.0; Authorization: owner versus role
// For a supplied server-loaded report implement READ for owner/moderator/admin and DELETE for owner/admin. Missing report and unrelated READ give 404; unauthenticated gives 401; unrelated DELETE gives403. Ignore body privileges. This narrow pure policy leaves submit/resolve/loading errors and Express middleware unqualified.
// Implement your own bounded function. The retained full application is a separate contract.
export function reportPermission(input) {
  void input;
  return null; // TODO: intentional incomplete objective
}
