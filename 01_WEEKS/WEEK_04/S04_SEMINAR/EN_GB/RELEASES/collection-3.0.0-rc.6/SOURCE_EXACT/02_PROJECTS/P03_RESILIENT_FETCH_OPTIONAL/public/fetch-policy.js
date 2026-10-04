export async function singleAttempt(fetchImpl, url, signal) {
  let response;

  try {
    response = await fetchImpl(url, { signal });
  } catch (cause) {
    const error = new Error(cause.message, { cause });
    error.retryable = true;
    throw error;
  }

  if (!response.ok) {
    const error = new Error(`request failed: ${response.status}`);
    error.retryable = response.status >= 500;
    throw error;
  }

  return response.json();
}

export async function fetchWithPolicy(url, options = {}) {
  // TODO: add timeout, retry classification, backoff, cleanup and exhaustion context.
  const fetchImpl = options.fetchImpl ?? fetch;
  const controller = options.createController?.() ?? new AbortController();
  return singleAttempt(fetchImpl, url, controller.signal);
}
