export function createProductionReview() {
  const diagnostics = Object.freeze({ activeReviews: 0, runnerActive: 0 });
  async function review() {
    return Object.freeze({
      project: "unknown",
      passed: false,
      findings: Object.freeze([{ ruleId: "REVIEW_UNAVAILABLE", severity: "high", status: "unknown", location: "review", remediation: "Implement the scoped evidence review.", required: true }]),
      summary: Object.freeze({ pass: 0, fail: 0, unknown: 1 }),
      limitations: Object.freeze(["No live deployment, penetration test, or compliance certification was performed."])
    });
  }
  return Object.freeze({ review, get diagnostics() { return diagnostics; } });
}
