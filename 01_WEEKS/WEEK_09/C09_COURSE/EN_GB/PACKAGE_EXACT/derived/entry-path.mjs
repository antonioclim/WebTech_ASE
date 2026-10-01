import path from 'node:path';
import { fileURLToPath } from 'node:url';
/** Compare like-for-like native paths; this is not a permission or security check. */
export function isDirectEntry(moduleUrl, argvPath) {
  if (typeof argvPath !== 'string' || argvPath.length === 0) return false;
  try { return path.resolve(fileURLToPath(moduleUrl)) === path.resolve(argvPath); }
  catch { return false; }
}
