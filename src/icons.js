// Phosphor symbols with custom solid station arrows. No remote requests.
const stationArrows = new Set([
  "arrow-up-right", "arrow-down-left", "arrow-left",
  "arrow-right", "arrow-down", "arrow-up",
]);
const symbols = new Map([
  ["↗", "arrow-up-right"],
  ["↙", "arrow-down-left"],
  ["←", "arrow-left"],
  ["→", "arrow-right"],
  ["↓", "arrow-down"],
  ["↑", "arrow-up"],
  ["↶", "arrow-counter-clockwise"],
  ["↷", "arrow-clockwise"],
  ["⊕", "compass"],
  ["☷", "sliders-horizontal"],
  ["Ⅱ", "pause"],
  ["▷", "play"],
  ["×", "x"],
  ["−", "minus"],
]);
export function icon(name) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 256 256");
  svg.setAttribute("class", "icon");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
  const sprite = stationArrows.has(name) ? "station-arrows" : "phosphor";
  use.setAttribute("href", `assets/brand/${sprite}.svg#${name}`);
  svg.appendChild(use);
  return svg;
}
function hydrate(root) {
  const explicit = root.querySelectorAll?.("[data-icon]") || [];
  for (const target of explicit)
    if (!target.querySelector("svg"))
      target.replaceChildren(icon(target.dataset.icon));
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (
          node.parentElement?.closest(
            "svg,script,style,textarea,option,[data-icon]",
          )
        )
          return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    }),
    nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const node of nodes) {
    const value = node.nodeValue;
    const plus = value.trim() === "+";
    const hasSymbol =
      plus || [...symbols.keys()].some((s) => value.includes(s));
    if (!hasSymbol) continue;
    const fragment = document.createDocumentFragment();
    let text = "";
    for (const char of value) {
      const name = symbols.get(char) || (plus && char === "+" ? "plus" : null);
      if (name) {
        if (text) {
          fragment.appendChild(document.createTextNode(text));
          text = "";
        }
        fragment.appendChild(icon(name));
      } else text += char;
    }
    if (text) fragment.appendChild(document.createTextNode(text));
    node.replaceWith(fragment);
  }
}
hydrate(document.body);
let queued = false;
new MutationObserver(() => {
  if (queued) return;
  queued = true;
  queueMicrotask(() => {
    queued = false;
    hydrate(document.body);
  });
}).observe(document.body, { childList: true, subtree: true });
