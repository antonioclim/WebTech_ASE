export function mountReadingQueue(root, { storage, initialItems, createItemId }) {
  const validItems = (value) => Array.isArray(value) && value.every((item) =>
    item && typeof item === "object" && typeof item.id === "string" && item.id.length > 0 &&
    typeof item.title === "string" && item.title.trim().length > 0 && typeof item.read === "boolean") &&
    new Set(value.map((item) => item.id)).size === value.length;
  if (!validItems(initialItems)) throw new TypeError("Invalid initial reading queue");
  let items = structuredClone(initialItems); let filter = "all";
  try { const parsed = JSON.parse(storage.getItem("reading-queue")); if (validItems(parsed)) items = parsed; } catch { /* Invalid stored data falls back to the validated fixture. */ }
  root.innerHTML = `<main><h1>Reading queue</h1><form><label>Book title <input name="title"></label><button>Add book</button></form><div class="filters" aria-label="Reading filters"></div><div class="list"></div></main>`;
  const document = root.ownerDocument;
  const element = (tag, text) => { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; return node; };
  const persist = () => storage.setItem("reading-queue", JSON.stringify(items));
  const render = () => {
    const counts = { all: items.length, remaining: items.filter((item) => !item.read).length, read: items.filter((item) => item.read).length };
    const filters = root.querySelector(".filters"); filters.replaceChildren();
    for (const name of ["all", "remaining", "read"]) {
      const button = element("button", `${name[0].toUpperCase() + name.slice(1)} (${counts[name]})`);
      button.type = "button"; button.dataset.filter = name; button.setAttribute("aria-pressed", String(filter === name)); filters.append(button);
    }
    const visible = items.filter((item) => filter === "all" || (filter === "read" ? item.read : !item.read));
    const list = root.querySelector(".list"); list.replaceChildren();
    if (!visible.length) { const status = element("p", "No books in this view."); status.setAttribute("role", "status"); list.append(status); return; }
    const ul = element("ul"); list.append(ul);
    for (const item of visible) {
      const li = element("li"); const label = element("label"); const checkbox = element("input");
      checkbox.type = "checkbox"; checkbox.dataset.toggle = item.id; checkbox.checked = item.read;
      label.append(checkbox, document.createTextNode(item.title));
      const remove = element("button", `Remove ${item.title}`); remove.type = "button"; remove.dataset.remove = item.id;
      li.append(label, remove); ul.append(li);
    }
  };
  root.addEventListener("submit", (event) => {
    event.preventDefault(); const input = root.querySelector("[name=title]"); const title = input.value.trim(); if (!title) return;
    const id = createItemId(); if (typeof id !== "string" || !id || items.some((item) => item.id === id)) throw new TypeError("Invalid or duplicate reading queue ID");
    items = [...items, { id, title, read: false }]; input.value = ""; persist(); render();
  });
  root.addEventListener("click", (event) => {
    const button = event.target.closest("button"); if (!button || !root.contains(button)) return;
    if (["all", "remaining", "read"].includes(button.dataset.filter)) filter = button.dataset.filter;
    if (button.dataset.remove !== undefined) { items = items.filter((item) => item.id !== button.dataset.remove); persist(); } render();
  });
  root.addEventListener("change", (event) => { if (event.target.dataset.toggle === undefined) return; items = items.map((item) => item.id === event.target.dataset.toggle ? { ...item, read: !item.read } : item); persist(); render(); });
  render(); return { getItems: () => structuredClone(items) };
}
