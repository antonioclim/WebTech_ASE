export async function loadDashboard({ fetchImpl = fetch, render }) {
  // TODO: fetch all sources in parallel and render success/error states.
  // Keep the loading render first so the UI exposes the async transition.
  void fetchImpl;
  const loading = { state: "loading" };
  render(loading);
  return loading;
}
