export function handleControlRequest(req, res, project) {
  const url = new URL(req.url ?? '/', 'http://127.0.0.1');
  if (url.pathname !== '/__tw_control') return false;
  const expected = process.env.TW_CONTROL_TOKEN ?? '';
  const packageId = process.env.TW_PACKAGE_ID ?? '';
  if (!expected || url.searchParams.get('token') !== expected) {
    res.writeHead(403, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
    res.end(JSON.stringify({ ok: false, error: 'forbidden' }));
    return true;
  }
  res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify({ schema: 'TW2026_CONTROL_1', ok: true, pid: process.pid, project, packageId }));
  return true;
}
