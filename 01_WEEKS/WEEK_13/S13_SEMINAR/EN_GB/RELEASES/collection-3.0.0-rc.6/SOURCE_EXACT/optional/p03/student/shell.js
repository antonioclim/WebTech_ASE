import { createCompositionCoordinator } from "./src/composition-coordinator.js";

const catalog = document.querySelector("#catalog");
const details = document.querySelector("#details");
const status = document.querySelector("#status");
const selftest = new URL(location.href).searchParams.get("selftest") === "1";
let selectedId = null;
let rendered = false;
let reloaded = false;

const coordinator = createCompositionCoordinator({
  hostWindow: window,
  async selectItem(itemId) { history.pushState({}, "", `?item=${encodeURIComponent(itemId)}${selftest ? "&selftest=1" : ""}`); selectedId = itemId; const response = await fetch(`/api/items/${encodeURIComponent(itemId)}`); if (!response.ok) throw new Error("item unavailable"); return { item: (await response.json()).data }; },
  onFragmentEvent(name, type, payload) { if (name === "details" && type === "details.rendered" && payload?.itemId === selectedId) { rendered = true; maybeReload(); } },
  onReady(name, generation) { status.textContent = `${name} ready (generation ${generation})`; if (selftest && name === "catalog" && generation === 2 && rendered) { document.body.dataset.selftest = "pass"; document.body.dataset.generation = "2"; document.body.dataset.selected = selectedId; } },
  setUnavailable(name) { status.textContent = `${name} fragment unavailable`; if (selftest) document.body.dataset.selftest = "fail"; }
});

coordinator.register({ name: "catalog", origin: "http://127.0.0.1:4213", window: catalog.contentWindow, generation: 1, inbound: ["fragment.ready", "item.selected"] });
coordinator.register({ name: "details", origin: "http://127.0.0.1:4214", window: details.contentWindow, generation: 1, inbound: ["fragment.ready", "details.rendered"] });
catalog.src = catalog.dataset.src;
details.src = details.dataset.src;

function maybeReload() {
  if (!selftest || reloaded || !rendered) return;
  reloaded = true;
  coordinator.replace("catalog", catalog.contentWindow, 2);
  catalog.src = "http://127.0.0.1:4213/catalog.html?generation=2";
}

if (selftest) {
  const before = location.search;
  window.dispatchEvent(new MessageEvent("message", { origin: "https://evil.example", source: catalog.contentWindow, data: { type: "item.selected", version: 1, generation: 1, payload: { itemId: "item-2" } } }));
  document.body.dataset.forgedIgnored = location.search === before ? "true" : "false";
}
window.addEventListener("pagehide", () => coordinator.dispose(), { once: true });
