import "./app.js";

document.querySelector("#check").click();
const result = document.querySelector("#result");
while (result.dataset.state === "loading" || !result.dataset.state) await new Promise((resolve) => setTimeout(resolve, 10));
if (result.dataset.state !== "success") throw new Error("The real fetch did not reach success");
document.documentElement.dataset.browserSmoke = "pass";
