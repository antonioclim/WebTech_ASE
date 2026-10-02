import {
  legacyErrorHandler,
  sendLegacyOutcome,
} from "./legacy-http-fallback.js";

export function sendServiceOutcome(response, outcome) {
  // TODO: restore the public status/header/envelope mapping from spec.md.
  return sendLegacyOutcome(response, outcome);
}

export function apiErrorHandler(error, request, response, next) {
  // TODO: restore safe malformed-JSON and unexpected-error responses.
  return legacyErrorHandler(error, request, response, next);
}
