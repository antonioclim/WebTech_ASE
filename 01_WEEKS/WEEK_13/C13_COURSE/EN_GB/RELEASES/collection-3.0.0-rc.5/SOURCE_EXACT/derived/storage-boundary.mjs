export function validatePreference(value) {
  return Boolean(value && value.version === 1 && ['compact', 'comfortable'].includes(value.density));
}
export function readPreference(storage, key) {
  try {
    const raw = storage.getItem(key);
    if (raw === null) return { status: 'missing', value: null };
    const parsed = JSON.parse(raw);
    if (!validatePreference(parsed)) {
      try { storage.removeItem(key); } catch (error) { return { status: 'invalid_cleanup_failed', code: error?.name || 'storage_error' }; }
      return { status: 'invalid_removed', value: null };
    }
    return { status: 'valid', value: parsed };
  } catch (error) {
    return { status: 'unavailable_or_malformed', code: error?.name || 'storage_error', value: null };
  }
}
export function writePreference(storage, key, value) {
  if (!validatePreference(value)) return { ok: false, code: 'invalid_record' };
  try { storage.setItem(key, JSON.stringify(value)); return { ok: true }; }
  catch (error) { return { ok: false, code: error?.name || 'storage_error' }; }
}
