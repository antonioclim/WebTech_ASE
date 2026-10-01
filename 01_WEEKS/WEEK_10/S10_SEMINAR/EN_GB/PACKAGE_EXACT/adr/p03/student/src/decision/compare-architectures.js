export function compareArchitectures({ candidates }) {
  return {
    parity: null,
    evidence: candidates.map((candidate) => ({
      id: candidate.id,
      label: candidate.label,
      eligible: false,
      missingCapabilities: [],
      score: null
    })),
    selectedCandidateId: null,
    tie: false,
    reasons: ["Architecture comparison not implemented."]
  };
}
