import { readFile } from "node:fs/promises";
export const rawCss = await readFile(new URL("../public/styles.css", import.meta.url), "utf8");
export const html = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
// A deliberately bounded source checklist. Rendered measurements remain the result gate.
// Strings are preserved; comments, block context and selector lists are parsed separately.
export function stripComments(text) {
  let out = "", quote = null;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quote) { out += c; if (c === "\\") out += text[++i] ?? ""; else if (c === quote) quote = null; }
    else if (c === '"' || c === "'") { quote = c; out += c; }
    else if (c === "/" && text[i + 1] === "*") { const end = text.indexOf("*/", i + 2); if (end < 0) throw new Error("unclosed CSS comment"); out += " "; i = end + 1; }
    else out += c;
  }
  if (quote) throw new Error("unclosed CSS string");
  return out;
}
export const css = stripComments(rawCss);
function splitOutside(text, separator) {
  const result = []; let start = 0, quote = null, depth = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quote) { if (c === "\\") i++; else if (c === quote) quote = null; continue; }
    if (c === '"' || c === "'") quote = c;
    else if (c === "(" || c === "[") depth++;
    else if (c === ")" || c === "]") { if (--depth < 0) throw new Error("unbalanced CSS value"); }
    else if (c === separator && depth === 0) { result.push(text.slice(start, i).trim()); start = i + 1; }
  }
  if (depth || quote) throw new Error("unbalanced CSS value");
  result.push(text.slice(start).trim()); return result.filter(Boolean);
}
function parseRules(text, context = []) {
  const rules = []; let start = 0, quote = null, parentheses = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quote) { if (c === "\\") i++; else if (c === quote) quote = null; continue; }
    if (c === '"' || c === "'") { quote = c; continue; }
    if (c === "(") parentheses++; else if (c === ")") parentheses--;
    if (c === "}" && !parentheses) throw new Error("unexpected CSS closing brace");
    if (c !== "{" || parentheses) continue;
    const prelude = text.slice(start, i).trim();
    if (!prelude) throw new Error("empty CSS selector");
    let depth = 1, innerQuote = null, end = i + 1;
    for (; end < text.length && depth; end++) {
      const x = text[end];
      if (innerQuote) { if (x === "\\") end++; else if (x === innerQuote) innerQuote = null; }
      else if (x === '"' || x === "'") innerQuote = x;
      else if (x === "{") depth++; else if (x === "}") depth--;
    }
    if (depth) throw new Error("unclosed CSS block");
    const body = text.slice(i + 1, end - 1);
    if (prelude.startsWith("@")) rules.push(...parseRules(body, [...context, prelude]));
    else {
      if (body.includes("{")) throw new Error("nested style rules are outside this source checklist; request a teacher review");
      const declarations = new Map();
      for (const declaration of splitOutside(body, ";")) {
        const colon = declaration.indexOf(":"); if (colon < 1) throw new Error("malformed CSS declaration");
        const name = declaration.slice(0, colon).trim().toLowerCase();
        const value = declaration.slice(colon + 1).trim().replace(/\s*!important\s*$/i, "");
        if (!value) throw new Error("empty CSS declaration"); declarations.set(name, value);
      }
      rules.push({ selectors: splitOutside(prelude, ","), declarations, context });
    }
    i = end - 1; start = end;
  }
  if (text.slice(start).trim()) throw new Error("CSS text outside a rule");
  return rules;
}
export const rules = parseRules(css);
export const normalise = value => value?.toLowerCase().replace(/\s+/g, "") ?? "";
export function hasRule(selector, property, predicate = () => true, context = () => true) {
  return rules.some(rule => rule.selectors.includes(selector) && context(rule.context) && rule.declarations.has(property) && predicate(normalise(rule.declarations.get(property))));
}
export const baseContext = context => context.every(value => !value.startsWith("@media"));
export function minWidthContext(pixels) {
  return context => context.some(value => {
    const match = /^@media\s*\(\s*(?:min-width\s*:\s*|width\s*>=\s*)([\d.]+)(rem|px)\s*\)$/i.exec(value);
    return match && Number(match[1]) * (match[2].toLowerCase() === "rem" ? 16 : 1) === pixels;
  });
}
export function columnValue(value, count) {
  return value === `repeat(${count},minmax(0,1fr))` || value === `repeat(${count},1fr)` || value === Array(count).fill("minmax(0,1fr)").join("") || value === Array(count).fill("1fr").join("");
}
