/**
 * Teaching guide
 *
 * Goal: audit plausible generated JavaScript for coercion and hidden failure behavior.
 * Why this design: the unsafe and repaired paths process the same three small records.
 * Follow the evidence: truthiness is not boolean validation; string addition changes the
 * accumulator shape; precise parsing failures survive until the batch owner handles them.
 */

import assert from "node:assert/strict";

const generatedTotal = (rows) =>
  rows.filter((row) => row.active).reduce((total, row) => total + row.estimate, 0);

const parseActiveEstimate = (row) => {
  if (typeof row.active !== "boolean") {
    throw new TypeError("active must be boolean");
  }
  if (!Number.isFinite(row.estimate) || row.estimate < 0) {
    throw new RangeError("estimate must be a non-negative finite number");
  }
  return row;
};

const auditRows = (rows) =>
  rows.map((row, index) => {
    try {
      return { ok: true, value: parseActiveEstimate(row) };
    } catch (error) {
      return { ok: false, issue: { index, type: error.name, message: error.message } };
    }
  });

const suspicious = [
  { id: "t-1", active: true, estimate: "3" },
  { id: "t-2", active: "false", estimate: 5 },
  { id: "t-3", active: false, estimate: 8 },
];

assert.equal(generatedTotal(suspicious), "035");

const audited = auditRows(suspicious);
assert.equal(audited[0].issue.type, "RangeError");
assert.equal(audited[1].issue.type, "TypeError");
assert.equal(audited[2].ok, true);

const valid = suspicious.filter((_, index) => audited[index].ok);
assert.equal(generatedTotal(valid), 0);

console.table(audited.map((result) => (result.ok ? result.value : result.issue)));
