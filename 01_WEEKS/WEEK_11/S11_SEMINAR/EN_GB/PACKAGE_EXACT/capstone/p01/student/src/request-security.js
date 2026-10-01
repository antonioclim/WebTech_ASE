export function requireCredentialWriteBoundary({ production = false, trustedOrigin = "https://course.example" } = {}) {
  return (request, response, next) => {
    const origin = request.get("origin");
    if (origin && origin !== trustedOrigin) return response.status(403).json({ error: { code: "origin_forbidden", message: "Origin is not allowed" } });
    if (production && request.get("x-forwarded-proto") !== "https") return response.status(400).json({ error: { code: "https_required", message: "HTTPS is required" } });
    next();
  };
}
