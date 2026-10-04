import "./app.js";

const form = document.querySelector("#task-form");
form.elements.title.value = "Browser task";
form.requestSubmit();
let row = [...document.querySelectorAll("[data-task-id]")].at(-1);
row.querySelector('[data-action="toggle"]').click();
row = [...document.querySelectorAll("[data-task-id]")].at(-1);
if (!row.classList.contains("completed")) throw new Error("Toggle event did not update the task");
row.querySelector('[data-action="delete"]').click();
if (document.body.textContent.includes("Browser task")) throw new Error("Delete event did not remove the added task");
document.documentElement.dataset.browserSmoke = "pass";
