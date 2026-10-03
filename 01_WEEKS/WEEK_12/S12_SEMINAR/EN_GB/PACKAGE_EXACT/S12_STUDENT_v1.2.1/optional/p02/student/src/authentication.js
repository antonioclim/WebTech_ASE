const principals = new Map([
  ["alice-session", Object.freeze({ id: "u1", displayName: "Alice" })],
  ["malik-session", Object.freeze({ id: "u2", displayName: "Malik" })]
]);

export function authenticate(request, response, next) {
  const principal = principals.get(request.get("x-session-id"));
  if (!principal) return response.status(401).json({ error: { code: "authentication_required", message: "Authentication required" } });
  request.principal = principal;
  next();
}
