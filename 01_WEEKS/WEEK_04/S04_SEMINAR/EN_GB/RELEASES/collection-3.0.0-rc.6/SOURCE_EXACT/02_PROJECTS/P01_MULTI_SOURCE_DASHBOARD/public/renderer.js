export function renderDashboard(model, root = document.querySelector('#dashboard')) {
  root.dataset.state = model.state;
  root.className = model.state;
  if (model.state === 'loading') root.textContent = 'Loading dashboard…';
  else if (model.state === 'error') root.textContent = `Could not load dashboard: ${model.message}`;
  else root.innerHTML = `<h2>${model.profile.name}</h2><p>${model.openTaskCount} of ${model.totalTaskCount} tasks open</p><pre>${JSON.stringify(model.notices, null, 2)}</pre>`;
}
