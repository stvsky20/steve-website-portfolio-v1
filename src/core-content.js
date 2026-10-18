import { technologyChip } from "./tech-logos.js";

// Shared by the live inspection and the readable, non-3D fallback.
export function renderCoreContent(tool, mount) {
  mount.replaceChildren();
  const primary = document.createElement("div");
  primary.className = "technology-list";
  primary.append(...tool.slots.map(technologyChip));
  mount.append(primary);
  for (const group of tool.groups || []) {
    const section = document.createElement("section");
    section.className = "core-content-group";
    const label = document.createElement("h4");
    label.textContent = group.label;
    const chips = document.createElement("div");
    chips.className = "technology-list";
    chips.append(...group.slots.map(technologyChip));
    section.append(label, chips);
    mount.append(section);
  }
  if (tool.evidence) {
    const evidence = document.createElement("p");
    evidence.className = "core-evidence";
    evidence.textContent = tool.evidence;
    mount.append(evidence);
  }
}
