import { emitSound } from "./audio.js";
import * as THREE from "../vendor/three.module.js";
import { coreTools } from "./signal-core.js";
import { coreMotion } from "./core-motion.js";
import { createCoreInspection } from "./core-inspection.js";
import { technologyChip } from "./tech-logos.js";

export function createCoreInterface({
  core,
  camera,
  environment,
  host,
  story,
  state,
  journeys,
  reduce,
  requestFrame,
}) {
  const root = document.querySelector("#core-interface"),
    targets = document.querySelector("#core-targets");
  const detail = document.querySelector("#core-detail");
  const inspection = createCoreInspection(core, camera, environment);
  let previousOverflow = "",
    inspectionScroll = 0;
  let selected = -1,
    active = false;
  const buttons = coreTools.map((tool, index) => {
    const button = document.createElement("button");
    button.className = "core-target";
    button.setAttribute("aria-label", `Explore ${tool.name}`);
    button.setAttribute("aria-pressed", "false");
    const number = document.createElement("span");
    number.textContent = `0${index + 1}`;
    number.setAttribute("aria-hidden", "true");
    button.append(number, document.createTextNode(tool.name));
    button.addEventListener("click", () => select(index));
    targets.append(button);
    return button;
  });
  function select(index) {
    if (!active) return;
    emitSound("open");
    const first = selected === -1;
    selected = index;
    inspection.select(index);
    const tool = coreTools[index];
    document.querySelector("#core-part").textContent = tool.part;
    document.querySelector("#core-tool-title").textContent = tool.name;
    document.querySelector("#core-tool-copy").textContent = tool.copy;
    const slots = document.querySelector("#core-tool-slots");
    slots.replaceChildren();
    for (const label of tool.slots) {
      slots.append(technologyChip(label));
    }
    detail.hidden = false;
    document.querySelector("#core-inspect-count").textContent =
      `MODULE 0${index + 1} / 06`;
    root.classList.add("has-selection");
    document.querySelector("#station-story").classList.add("core-inspecting");
    if (first) {
      previousOverflow = document.body.style.overflow;
      inspectionScroll = window.scrollY;
      document.body.style.overflow = "hidden";
      detail.showModal();
    }
    buttons.forEach((button, i) =>
      button.setAttribute("aria-pressed", String(index === i)),
    );
    requestFrame();
  }
  function clear() {
    if (selected === -1) return;
    emitSound("close");
    const previous = selected;
    selected = -1;
    inspection.clear();
    if (detail.open) detail.close();
    detail.hidden = true;
    root.classList.remove("has-selection");
    document
      .querySelector("#station-story")
      .classList.remove("core-inspecting");
    document.body.style.overflow = previousOverflow;
    window.scrollTo({ top: inspectionScroll, behavior: "instant" });
    buttons.forEach((button) => button.setAttribute("aria-pressed", "false"));
    requestFrame();
    buttons[previous]?.focus({ preventScroll: true });
  }
  document.querySelector("#core-clear").addEventListener("click", clear);
  detail.addEventListener("cancel", (event) => {
    event.preventDefault();
    clear();
  });
  document
    .querySelector("#core-previous")
    .addEventListener("click", () => select((selected + 5) % 6));
  document
    .querySelector("#core-next")
    .addEventListener("click", () => select((selected + 1) % 6));
  detail.addEventListener("click", (event) => {
    if (event.target !== detail) return;
    const rect = detail.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      clear();
  });
  const point = new THREE.Vector3();
  return {
    select,
    render: inspection.render,
    update(now = performance.now()) {
      active =
        story.chapter === "stack" &&
        !story.stackDeparting &&
        !journeys.active &&
        !state.exploring;
      root.hidden = !active;
      const progress = story.stackProgress;
      if (selected !== -1 && progress < 0.12 && !reduce.matches) clear();
      core.update(progress, active ? selected : -1, reduce.matches);
      if (
        inspection.update(
          now,
          reduce.matches,
          host.clientWidth / host.clientHeight,
        )
      )
        requestFrame();
      if (!active) {
        if (selected !== -1) clear();
        return;
      }
      root.classList.toggle("core-reduced", reduce.matches);
      const open = progress > 0.92 || reduce.matches;
      const instruction = document.querySelector("#core-instruction");
      const message = reduce.matches
        ? "Select a category to explore."
        : open
          ? "Select a module to explore."
          : "Scroll to open the signal core.";
      if (instruction.textContent !== message)
        instruction.textContent = message;
      const motion = coreMotion(progress, reduce.matches);
      for (const [index, part] of core.parts.entries()) {
        const button = buttons[index];
        part.marker.getWorldPosition(point);
        point.project(camera);
        const visible =
          reduce.matches ||
          (motion.modules[index] > 0.72 && point.z > -1 && point.z < 1);
        button.hidden = !visible;
        if (!reduce.matches) {
          const x = (point.x * 0.5 + 0.5) * host.clientWidth,
            y = (-point.y * 0.5 + 0.5) * host.clientHeight;
          button.style.left = `${x}px`;
          button.style.top = `${y}px`;
        } else {
          button.style.left = "";
          button.style.top = "";
        }
      }
    },
  };
}
