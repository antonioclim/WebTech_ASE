import { ROOT, checkBoundary, checkPackage, runCLI } from './verifier-core.mjs';
runCLI(() => {
  const ids = process.argv.slice(2);
  if (ids.length > 1) throw new Error('Choose at most one project: p01, p02 or p03. With no argument all three are checked.');
  const packageProtection = checkPackage(ROOT, { allowAssessedEdits: true, allowGenerated: true });
  return { verdict: 'BOUNDARY_ONLY_PASS', packageProtection, projects: (ids.length ? ids : ['p01', 'p02', 'p03']).map(id => checkBoundary(id)) };
});
