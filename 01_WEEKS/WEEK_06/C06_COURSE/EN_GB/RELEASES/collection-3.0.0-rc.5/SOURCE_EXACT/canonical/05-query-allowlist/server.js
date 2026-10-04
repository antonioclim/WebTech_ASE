import { createApplication } from "./app.js";
const { app, close } = await createApplication();
const server = app.listen(3000, () => console.log("Report API listening on http://localhost:3000"));
async function shutdown() { server.close(async () => { await close(); process.exit(0); }); }
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
