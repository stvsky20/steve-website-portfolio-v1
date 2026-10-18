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
  const title = dialog.querySelector("#project-title");
  const name = document.createElement("span");
  name.textContent = project.title;
  title.replaceChildren();
  title.classList.toggle("project-title-branded", Boolean(project.logo));
  if (project.logo) {
    const logo = document.createElement("img");
    logo.className = "project-title-logo";
    logo.dataset.layout = project.logoLayout || "icon";
    logo.src = project.logo;
    logo.alt = "";
    logo.width = logo.height = 88;
    logo.decoding = "async";
    title.append(logo);
  }
  title.append(name);
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
