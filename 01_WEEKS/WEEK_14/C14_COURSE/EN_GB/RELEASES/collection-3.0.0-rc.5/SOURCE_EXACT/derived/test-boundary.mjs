export function chooseBoundary(claim) {
  const c = String(claim || '').toLowerCase();
  if (/(focus|navigation|service worker|worker|iframe|browser)/.test(c)) return 'browser';
  if (/(status|header|http|location)/.test(c)) return 'api';
  if (/(persistence|repository|database|queue|redis)/.test(c)) return 'integration';
  return 'unit';
}
