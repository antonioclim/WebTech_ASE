import express from "express";

export function createApp({ production = false } = {}) {
  const app = express();
  app.post("/session", (_req, res) => {
    const attributes = ["session=opaque-random-id", "HttpOnly", production && "Secure", "SameSite=Lax", "Path=/", "Max-Age=1800"].filter(Boolean);
    res.setHeader("Set-Cookie", attributes.join("; "));
    res.status(204).end();
  });
  return app;
}
if (import.meta.url === `file://${process.argv[1]}`) createApp({ production: process.env.NODE_ENV === "production" }).listen(3000, () => console.log("Cookie service: http://localhost:3000"));
