const query = new URLSearchParams(location.search);
const grid = document.querySelector(".card-grid"), header = document.querySelector(".site-header");
const cards = [...document.querySelectorAll(".card")];
if (query.has("long-token")) cards[0].querySelector("p").textContent = "RO49AAAA1B31007593840000ENTERPRISESERVICECATALOGUEIDENTIFIERWITHOUTBREAKS".repeat(3);
const rect = element => element.getBoundingClientRect();
const style = element => getComputedStyle(element);
const near = (a, b, tolerance = 2) => Math.abs(a - b) <= tolerance;
const columns = style(grid).gridTemplateColumns.split(" ").filter(Boolean).length;
const layoutWidth = document.documentElement.clientWidth;
const rootFont = parseFloat(style(document.documentElement).fontSize);
const containers = [document.querySelector("main"), header];
const fits = element => element.scrollWidth <= element.clientWidth + 1;
const nonTransparent = colour => colour !== "transparent" && colour !== "rgba(0, 0, 0, 0)";
const focusObservations = [...document.querySelectorAll("a,button,select")].map(control => {
  control.focus(); const s = style(control);
  return { tag: control.tagName, visible: parseFloat(s.outlineWidth) >= 3 && !["none", "hidden"].includes(s.outlineStyle) && nonTransparent(s.outlineColor) };
});
const rowActionsAligned = cards.every(card => {
  const row = cards.filter(other => near(rect(other).top, rect(card).top));
  return row.every(other => near(rect(other.querySelector("a")).bottom, rect(card.querySelector("a")).bottom));
});
const noConcealment = [document.documentElement, document.body, grid, ...cards, ...cards.flatMap(card => [...card.querySelectorAll("h2,p,a")])].every(element => {
  const s = style(element);
  return s.display !== "none" && s.visibility === "visible" && Number(s.opacity) > 0 && !["hidden", "clip"].includes(s.overflowX) && fits(element);
});
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const checks = {
  gridMechanism: style(grid).display === "grid", headerFlex: style(header).display === "flex",
  allCardsFlex: cards.every(card => style(card).display === "flex" && style(card).flexDirection === "column"),
  containersCentredAndCapped: containers.every(element => { const r = rect(element); return r.width <= 72 * rootFont + 2 && r.width <= layoutWidth - 16 && near(r.left, layoutWidth - r.right); }),
  mediaRatio: cards.every(card => { const r = rect(card.querySelector(".card-media")); return r.height > 0 && Math.abs(r.width / r.height - 16 / 9) < 0.03; }),
  actionsAtBottom: cards.every(card => { const s = style(card), r = rect(card), a = rect(card.querySelector("a")); return near(a.bottom, r.bottom - parseFloat(s.paddingBottom) - parseFloat(s.borderBottomWidth), 3); }) && rowActionsAligned,
  noPageOverflow: document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
  contentPreserved: noConcealment,
  focusIndicators: focusObservations.every(item => item.visible),
  reducedMotion: !reduced || [header, grid, ...cards, ...cards.flatMap(card => [...card.querySelectorAll("a")])].every(element => style(element).transitionDuration.split(",").every(value => parseFloat(value) === 0))
};
document.documentElement.dataset.columns = String(columns);
document.documentElement.dataset.viewport = String(innerWidth);
document.documentElement.dataset.browserSmoke = Object.values(checks).every(Boolean) ? "pass" : "fail";
document.documentElement.dataset.checks = JSON.stringify({ ...checks, columns, reducedMotionEmulated: reduced, focusObservations });
