const supportedActions = new Set(["report:read", "report:submit", "report:resolve", "report:delete"]);

export function authorize({ action }) {
  if (!supportedActions.has(action)) throw new TypeError(`Unsupported authorization action: ${action}`);
  return (request, response) => {
    if (!request.principal) return response.status(401).json({ error: { code: "authentication_required", message: "Authentication required" } });
    response.status(403).json({ error: { code: "forbidden", message: "Authorization policy not implemented" } });
  };
}
