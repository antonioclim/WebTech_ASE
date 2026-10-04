export function acceptIntent({event, expectedOrigin, expectedSource, version = 1, maxItemIdLength = 80}) {
  if (!event || event.origin !== expectedOrigin) return { accepted: false, code: 'wrong_origin' };
  if (event.source !== expectedSource) return { accepted: false, code: 'wrong_source' };
  const data = event.data;
  if (!data || data.version !== version || data.type !== 'item.selected') return { accepted: false, code: 'wrong_envelope' };
  if (typeof data.itemId !== 'string' || data.itemId.length < 1 || data.itemId.length > maxItemIdLength || !/^[A-Za-z0-9._:-]+$/.test(data.itemId)) {
    return { accepted: false, code: 'invalid_item_id' };
  }
  return { accepted: true, intent: { type: 'item.selected', itemId: data.itemId } };
}
