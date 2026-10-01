import { cp, mkdir } from "node:fs/promises";
await mkdir("dist", { recursive: true });
await cp("src/server.mjs", "dist/server.mjs");
