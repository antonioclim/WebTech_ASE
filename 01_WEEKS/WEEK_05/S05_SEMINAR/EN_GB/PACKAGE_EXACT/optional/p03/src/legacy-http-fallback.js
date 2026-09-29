// Deliberately naïve compatibility behavior retained for the repair exercise.
// It demonstrates the starting defect and must not be presented as production practice.
export function sendLegacyOutcome(response, outcome) {
  return response.status(200).json(outcome);
}

export function legacyErrorHandler(error, _request, response, next) {
  if (response.headersSent) return next(error);
  return response.status(500).json({ error: error.message });
}
