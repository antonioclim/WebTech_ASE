const messages = Object.freeze({
  invalid_request: "Request type and timeout are invalid",
  duplicate_request_id: "A unique request ID could not be created",
  request_timeout: "The request timed out",
  request_aborted: "The request was cancelled",
  remote_failure: "The remote operation failed",
  send_failed: "The request could not be sent",
  transport_closed: "The transport closed",
  id_generation_failed: "A request ID could not be created",
  id_capacity_exhausted: "The dispatcher ID limit has been reached",
  dispatcher_unavailable: "The dispatcher is unavailable",
  dispatcher_disposed: "The dispatcher is disposed"
});

export function publicError(code) {
  const error = new Error(messages[code] ?? "Request failed");
  error.code = code;
  return error;
}
