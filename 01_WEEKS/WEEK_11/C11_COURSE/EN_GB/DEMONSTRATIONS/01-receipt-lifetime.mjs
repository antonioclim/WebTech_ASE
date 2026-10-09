// Neutral equipment receipt: state lifetime and a retained representation.
// No principal, password, cookie or session is implemented.
import assert from 'node:assert/strict';
import { assessCourseEnvironment } from '../tools/activity-environment.mjs';
const environment = await assessCourseEnvironment({ unit: 'C11', operation: 'neutral receipt lifetime', cwd: process.cwd(), command: 'node DEMONSTRATIONS/01-receipt-lifetime.mjs' });
console.log(JSON.stringify(environment));
if (environment.exitCode) process.exit(environment.exitCode);

const acceptedReceipts = new Map([['equipment-7', { item: 'tripod', expiresAt: 30 }]]);
function lookupReceipt(reference, now) {
  const record = acceptedReceipts.get(reference);
  return record && now < record.expiresAt ? { item: record.item, expiresAt: record.expiresAt } : null;
}
const before = lookupReceipt('equipment-7', 29);
const atDeadline = lookupReceipt('equipment-7', 30);
const afterDeadline = lookupReceipt('equipment-7', 31);
assert.deepEqual(before, { item: 'tripod', expiresAt: 30 });
assert.equal(atDeadline, null);
assert.equal(afterDeadline, null);
// Cancellation is independently witnessed before this receipt's deadline.
acceptedReceipts.delete('equipment-7');
const afterCancellation = lookupReceipt('equipment-7', 29);
assert.equal(afterCancellation, null);
assert.deepEqual(before, { item: 'tripod', expiresAt: 30 });
assert.equal(acceptedReceipts.size, 0);
console.log(JSON.stringify({ example: '01', scope: 'actual in-memory equipment Map and declared clock values', before, atDeadline, afterDeadline, retainedCopy: before, afterCancellation, acceptedRecordCount: acceptedReceipts.size, result: 'PASS_NEUTRAL_RECEIPT_WITNESSES', limit: 'No session, login, unpredictable token, persistence or browser observation' }));
