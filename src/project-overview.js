import { renderProjectBento } from "./project-bento.js";
import { setSectionMarker } from "./section-marker.js";

import { renderProjectFacts } from "./project-facts.js";

// One project container for every screen. Projects supply content and an
// optional public deployment URL; presentation stays shared with Laundrify.
export function renderProjectOverview(project, dialog, index) {
  setSectionMarker(
    dialog.querySelector(".section-kicker"),
    `${project.kind || "PROJECT"} / ${String(index + 1).padStart(3, "0")}`,
  );
  dialog.querySelector("#project-title").textContent = project.title;
  dialog.querySelector(".dialog-subtitle").textContent = project.label;
  renderProjectFacts(
    dialog.querySelector("#project-header-facts"),
    project.headerFacts,
  );
  const deployment = dialog.querySelector("#project-deployment");
  const url = project.deployment?.url;
  deployment.hidden = !url;
  deployment.removeAttribute("href");
  deployment.querySelector("small").textContent = "Explore the live demo";
  deployment.querySelector("strong").textContent =
    project.deployment?.label || `Try ${project.title}`;
  if (url) deployment.href = url;
  renderProjectBento(project, dialog.querySelector("#project-bento"));
  dialog.classList.add("has-bento");
}
