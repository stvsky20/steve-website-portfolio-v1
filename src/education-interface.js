import { renderEducationDetails } from "./education-details.js";
import { emitSound } from "./audio.js";
import * as THREE from "../vendor/three.module.js";
import { educationRecords } from "./education-study.js";
import { renderInstitutionBrands } from "./institution-brands.js";
import { renderProjectDocumentation } from "./project-documentation.js";

export function createEducationInterface({
  study,
  story,
  host,
  camera,
  journeys,
  state,
  requestFrame,
}) {
  const root = document.querySelector("#education-interface"),
    dialog = document.querySelector("#education-dialog");
  let active = false,
    opener = null,
    scroll = 0,
    overflow = "";
  const buttons = educationRecords.map((record, index) => {
    const button = document.createElement("button");
    button.className =
      index < 3 ? "education-target" : "education-experience-button";
    button.setAttribute("aria-label", `Read ${record.kind.toLowerCase()}`);
    const label = document.createElement("span");
    label.textContent = index < 3 ? record.kind : `${record.title} ↗`;
    button.append(label);
    button.addEventListener("click", () => select(index));
    root
      .querySelector(index < 3 ? ".education-targets" : "#education-experience")
      .append(button);
    return button;
  });
  function select(index) {
    if (!active) return;
    emitSound("open");
    const record = educationRecords[index];
    renderInstitutionBrands(
      document.querySelector("#education-affiliations"),
      record.institutions || [],
    );
    opener = buttons[index];
    renderProjectDocumentation(
      document.querySelector("#education-documentation"),
      record.institutions?.includes("psc"),
    );
    scroll = window.scrollY;
    overflow = document.body.style.overflow;
    document.querySelector("#education-dialog-kind").textContent = record.kind;
    document.querySelector("#education-dialog-title").textContent =
      record.title;
    document.querySelector("#education-dialog-summary").textContent =
      record.summary;
    document.querySelector("#education-dialog-note").textContent = record.note;
    renderEducationDetails(dialog, index);
    document.body.style.overflow = "hidden";
    dialog.showModal();
    requestFrame();
  }
  function close() {
    dialog.close();
  }
  dialog.querySelector(".education-close").addEventListener("click", close);
  dialog.querySelector(".education-done").addEventListener("click", close);
  dialog.addEventListener("close", () => {
    emitSound("close");
    document.body.style.overflow = overflow;
    window.scrollTo({ top: scroll, behavior: "instant" });
    opener?.focus({ preventScroll: true });
    requestFrame();
  });
  return {
    select,
    update() {
      active =
        story.chapter === "education" && !journeys.active && !state.exploring;
      root.hidden = !active;
      study.update(story.educationReveal);
      if (!active) return;
      for (const [index, mesh] of study.records.entries()) {
        const points = [
          [-0.5, -0.5, 0.5],
          [-0.5, 0.5, 0.5],
          [0.5, -0.5, 0.5],
          [0.5, 0.5, 0.5],
        ].map((corner) =>
          mesh.localToWorld(new THREE.Vector3(...corner)).project(camera),
        );
        const xs = points.map(
            (point) => (point.x * 0.5 + 0.5) * host.clientWidth,
          ),
          ys = points.map(
            (point) => (-0.5 * point.y + 0.5) * host.clientHeight,
          );
        // The notebook is horizontal; include its upper face in its hit area.
        if (index === 2)
          for (const x of [-0.5, 0.5])
            for (const z of [-0.5, 0.5]) {
              const point = mesh
                .localToWorld(new THREE.Vector3(x, 0.5, z))
                .project(camera);
              xs.push((point.x * 0.5 + 0.5) * host.clientWidth);
              ys.push((-0.5 * point.y + 0.5) * host.clientHeight);
            }
        const button = buttons[index];
        button.style.left = `${Math.min(...xs)}px`;
        button.style.top = `${Math.min(...ys)}px`;
        button.style.width = `${Math.max(44, Math.max(...xs) - Math.min(...xs))}px`;
        button.style.height = `${Math.max(44, Math.max(...ys) - Math.min(...ys))}px`;
        button.hidden = points.some((point) => point.z < -1 || point.z > 1);
      }
    },
  };
}
