import { createSystem } from "./system.js";

const { server } = createSystem();
const port = Number(process.env.PORT ?? 3000);
server.listen(port, () => console.log(`HTTP/WebSocket reply reference listening on http://localhost:${port}`));
