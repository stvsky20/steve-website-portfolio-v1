// Compact, noninteractive project facts. Icons stay beside the label so their
// dimensions cannot create extra space between the label and its value.
const symbols = {
  recognition:
    '<path d="M8 3h8v5a4 4 0 0 1-8 0V3Zm4 9v6m-4 3h8m-8-3h8M8 5H4v2a4 4 0 0 0 4 4m8-6h4v2a4 4 0 0 1-4 4"/>',
  prototype:
    '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9h18M7 6.5h.01m3 0h.01M7 13h4m-4 3h9"/>',
  status: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  client:
    '<path d="m3 9 9-6 9 6M4 10h16M5 10v10m5-10v10m4-10v10m5-10v10M3 21h18"/>',
  role: '<rect x="3" y="7" width="18" height="14" rx="3"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12a20 20 0 0 0 18 0M10 13v3h4v-3"/>',
  capstone:
    '<path d="m2 8 10-5 10 5-10 5L2 8Zm4 2v7c4 3 8 3 12 0v-7m4-2v9"/><circle cx="22" cy="19" r="1"/>',
};

export function renderProjectFacts(mount, facts = []) {
  mount.replaceChildren();
  mount.className = "project-facts";
  mount.dataset.count = String(facts.length);
  mount.hidden = !facts.length;
  for (const fact of facts) {
    const item = document.createElement("div");
    item.className = "project-facts-item";
    const label = document.createElement("dt");
    const mark = document.createElement("span");
    mark.className = "project-facts-icon";
    if (fact.logo) {
      item.classList.add("project-facts-item--branded");
      mark.className = "project-facts-logo";
      const image = document.createElement("img");
      image.src = fact.logo;
      image.alt = fact.logoAlt || `${fact.value} logo`;
      image.width = image.height = 64;
      image.decoding = "async";
      mark.append(image);
    } else {
      mark.setAttribute("aria-hidden", "true");
      mark.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${symbols[fact.icon] || symbols.role}</svg>`;
    }
    const name = document.createElement("span");
    name.textContent = fact.label;
    const value = document.createElement("dd");
    value.textContent = fact.value;
    label.append(mark, name);
    item.append(label, value);
    mount.append(item);
  }
}
