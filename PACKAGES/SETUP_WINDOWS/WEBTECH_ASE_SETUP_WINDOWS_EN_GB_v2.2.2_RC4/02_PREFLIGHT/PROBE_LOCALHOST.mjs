import http from "node:http";

const deadline = setTimeout(() => {
  console.error(JSON.stringify({ ok: false, error: "timeout" }));
  process.exit(2);
}, 6000);

deadline.unref();
const server = http.createServer((request, response) => {
  if (request.url !== "/tw2026-probe") {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("not found");
    return;
  }
  response.writeHead(200, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify({ course: "TW2026", status: "ok" }));
});

server.on("error", error => {
  clearTimeout(deadline);
  console.error(JSON.stringify({ ok: false, error: error.message }));
  process.exitCode = 2;
});

server.listen(0, "127.0.0.1", () => {
  const address = server.address();
  const request = http.get({ hostname: "127.0.0.1", port: address.port, path: "/tw2026-probe", timeout: 3000 }, response => {
    let body = "";
    response.setEncoding("utf8");
    response.on("data", chunk => { body += chunk; });
    response.on("end", () => {
      clearTimeout(deadline);
      let parsed = null;
      try { parsed = JSON.parse(body); } catch {}
      const ok = response.statusCode === 200 && parsed?.course === "TW2026" && parsed?.status === "ok";
      console.log(JSON.stringify({ ok, address: "127.0.0.1", statusCode: response.statusCode, portMode: "ephemeral" }));
      server.close(() => { process.exitCode = ok ? 0 : 2; });
    });
  });
  request.on("timeout", () => request.destroy(new Error("request timeout")));
  request.on("error", error => {
    clearTimeout(deadline);
    console.error(JSON.stringify({ ok: false, error: error.message }));
    server.close(() => { process.exitCode = 2; });
  });
});
