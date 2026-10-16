import "./icons.js";
import { createStationAudio, emitSound } from "./audio.js";
import { createOperator } from "./operator.js";
import {
  applyScriptedView,
  updateInteractiveView,
  advanceDishScan,
} from "./scene-control.js";
import { createNightMode } from "./night-mode.js";
import { studioReflections } from "./cinematic.js";
import * as THREE from "../vendor/three.module.js";
import { OrbitControls } from "../vendor/OrbitControls.js";
import { createStation } from "./model.js?project-displays=1";
import { createEnvironment } from "./environment.js";
import { clamp, radians } from "./geometry.js";
import { createJourneys } from "./journeys.js";
import { createOutbuildings } from "./outbuildings.js?education-records=1";
import { createCoreInterface } from "./core-interface.js";
import { createEducationInterface } from "./education-interface.js";
import { createStory } from "./story.js";
import { projects } from "./projects.js";
import { technologyChip } from "./tech-logos.js";
import { coreTools } from "./signal-core.js";

// Share the same real content between the 3D experience and reading fallback.
const stackGroups = document.querySelector("#stack .stack-groups");
stackGroups.replaceChildren(
  ...coreTools.map((tool) => {
    const group = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = tool.name;
    const copy = document.createElement("p");
    copy.textContent = tool.copy;
    const chips = document.createElement("div");
    chips.className = "technology-list";
    chips.append(...tool.slots.map(technologyChip));
    group.append(title, copy, chips);
    return group;
  }),
);
document.querySelectorAll(".screen-target").forEach((button, index) => {
  button.setAttribute(
    "aria-label",
    `Open ${projects[index].kind || "project"} ${String(index + 1).padStart(3, "0")}: ${projects[index].title}`,
  );
  button.querySelector("span").textContent =
    `${projects[index].title} — ${projects[index].label}`;
});

const $ = (selector) => document.querySelector(selector);
const host = $("#world"),
  stationElement = $("#station");
const reduce = matchMedia("(prefers-reduced-motion: reduce)");
createStationAudio();
let operator;
const state = {
  paused: false,
  exploring: false,
  scan: true,
  scanTime: 0,
  bearing: -10,
  elevation: 38,
  lights: true,
  time: 0,
  dragging: false,
};
let controls,
  renderer,
  camera,
  scene,
  model,
  environment,
  journeys,
  story,
  outbuildings,
  coreInterface,
  educationInterface,
  studyLighting,
  nightMode,
  frame = 0,
  visible = true,
  contextLost = false;
let lastTime = 0,
  cameraTransition = null,
  hovered = null,
  dragStart = null;
const raycaster = new THREE.Raycaster(),
  pointer = new THREE.Vector2();

// Portfolio navigation remains usable even if the graphics context cannot start.
const dialog = $("#project-dialog");
let dialogOpener = null,
  dialogScroll = 0,
  previousOverflow = "";
function openProject(opener = document.activeElement, index = 0) {
  const project = projects[index] || projects[0];
  dialog.querySelector(".section-kicker").textContent =
    `${project.kind || "PROJECT"} / 00${index + 1}`;
  $("#project-title").textContent = project.title;
  $(".dialog-subtitle").textContent = project.label;
  $("#project-description").textContent = project.description;
  $("#project-recognition-text").textContent = project.recognition;
  $("#project-detail-note").textContent = project.note;
  dialog.querySelectorAll("h3")[1].textContent =
    index === 0 ? "Recognition" : index === 1 ? "Academic context" : "Impact";
  const contributions = $("#project-contributions");
  contributions.replaceChildren(
    ...project.contributions.map((text) => {
      const item = document.createElement("li");
      item.textContent = text;
      return item;
    }),
  );
  $("#project-technologies").replaceChildren(
    ...project.technologies.map(technologyChip),
  );
  dialogOpener = opener;
  dialogScroll = window.scrollY;
  previousOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  dialog.showModal();
  emitSound("open");
  window.scrollTo({ top: dialogScroll, behavior: "instant" });
  requestFrame();
}
$("#open-project").addEventListener("click", () =>
  openProject($("#open-project")),
);
document.querySelectorAll("[data-open-record]").forEach((button) => {
  button.addEventListener("click", () =>
    openProject(button, Number(button.dataset.openRecord)),
  );
});
for (const button of document.querySelectorAll(".screen-target"))
  button.addEventListener("click", () =>
    openProject(button, Number(button.dataset.project)),
  );
$(".dialog-close").addEventListener("click", () => dialog.close());
$(".dialog-done").addEventListener("click", () => dialog.close());
dialog.addEventListener("close", () => {
  emitSound("close");
  document.body.style.overflow = previousOverflow;
  window.scrollTo({ top: dialogScroll, behavior: "instant" });
  dialogOpener?.focus?.({ preventScroll: true });
  requestFrame();
});

function announce(message) {
  $("#announcement").textContent = message;
}
function syncControls() {
  $("#bearing").value = String(Math.round(state.bearing));
  $("#bearing-value").value = `${Math.round(state.bearing)}°`;
  $("#elevation").value = String(Math.round(state.elevation));
  $("#elevation-value").value = `${Math.round(state.elevation)}°`;
  $("#scan").checked = state.scan;
  $("#tracking-state").textContent = state.scan ? "AUTO SCAN" : "MANUAL AIM";
  const stopped = state.paused || reduce.matches;
  $("#pause").setAttribute("aria-pressed", String(stopped));
  $("#pause-text").textContent = reduce.matches
    ? "Motion reduced"
    : state.paused
      ? "Resume motion"
      : "Pause motion";
  $("#pause-icon").textContent = stopped ? "▷" : "Ⅱ";
  $("#pause").disabled = reduce.matches;
}
$("#bearing").addEventListener("input", (event) => {
  state.bearing = Number(event.target.value);
  state.scan = false;
  syncControls();
  requestFrame();
});
$("#elevation").addEventListener("input", (event) => {
  state.elevation = Number(event.target.value);
  state.scan = false;
  syncControls();
  requestFrame();
});
$("#scan").addEventListener("change", (event) => {
  state.scan = event.target.checked;
  if (state.scan) {
    state.time = 0;
    state.bearing = -10;
  }
  syncControls();
  requestFrame();
});
$("#reset-dish").addEventListener("click", () => {
  state.bearing = -10;
  state.elevation = 38;
  state.scan = true;
  state.time = 0;
  syncControls();
  announce("Dish reset. Automatic scanning enabled.");
  requestFrame();
});
$("#lights").addEventListener("change", (event) => {
  state.lights = event.target.checked;
  requestFrame();
});
$("#pause").addEventListener("click", () => {
  state.paused = !state.paused;
  syncControls();
  requestFrame();
});
$("#dish-hotspot").addEventListener("click", () => {
  journeys?.focus("dish", $("#dish-hotspot"));
});
$("#console-hotspot").addEventListener("click", () => {
  showProjectDisplays();
});
function showProjectDisplays() {
  if (journeys?.active) journeys.returnStation(true);
  const section = $("#work");
  section.focus({ preventScroll: true });
  section.scrollIntoView({
    block: "start",
    behavior: reduce.matches ? "instant" : "smooth",
  });
  if (location.hash !== "#work") history.pushState(null, "", "#work");
}

function homeView() {
  const mobile = host.clientWidth < 650;
  return mobile
    ? {
        position: new THREE.Vector3(25, 14, 36),
        target: new THREE.Vector3(3.8, 11.5, 0),
      }
    : {
        position: new THREE.Vector3(19, 8.5, 26),
        target: new THREE.Vector3(-3, 7.2, 0),
      };
}
function moveCamera(position, target, immediate = false) {
  if (!camera || !controls) return;
  if (immediate || reduce.matches) {
    applyScriptedView(camera, controls, position, target);
    cameraTransition = null;
  } else
    cameraTransition = {
      from: camera.position.clone(),
      to: position,
      fromTarget: controls.target.clone(),
      toTarget: target,
      start: performance.now(),
      duration: 950,
    };
  requestFrame();
}
function setExploring(exploring) {
  if (journeys?.active) {
    journeys.returnStation(true);
    if (!exploring) return;
  }
  state.exploring = exploring;
  if (controls) controls.enableDamping = !reduce.matches;
  stationElement.classList.toggle("exploring", exploring);
  $("#explore-message").hidden = !exploring;
  $(".introduction").inert = exploring;
  controls && (controls.enabled = exploring);
  if (exploring)
    moveCamera(new THREE.Vector3(24, 16, 27), new THREE.Vector3(3.1, 3, 0));
  else {
    const view = homeView();
    moveCamera(view.position, view.target);
  }
  announce(
    exploring
      ? "Explore mode. Drag to orbit, scroll to zoom. Station controls provide alternatives to dragging."
      : "Station overview restored.",
  );
}
$("#return-view").addEventListener("click", () => {
  setExploring(false);
  $(".wordmark").focus({ preventScroll: true });
});
$("#reset-camera").addEventListener("click", () => {
  setExploring(false);
});
document.querySelectorAll("[data-view]").forEach((button) =>
  button.addEventListener("click", () => {
    if (!controls) return;
    if (!state.exploring) {
      setExploring(true);
      moveCamera(
        new THREE.Vector3(24, 16, 27),
        new THREE.Vector3(3.1, 3, 0),
        true,
      );
    }
    cameraTransition = null;
    const offset = camera.position.clone().sub(controls.target),
      spherical = new THREE.Spherical().setFromVector3(offset);
    const direction = button.dataset.view;
    if (direction === "left") spherical.theta -= radians(15);
    if (direction === "right") spherical.theta += radians(15);
    if (direction === "closer")
      spherical.radius = clamp(spherical.radius * 0.85, 18, 70);
    if (direction === "farther")
      spherical.radius = clamp(spherical.radius / 0.85, 18, 70);
    camera.position
      .copy(controls.target)
      .add(new THREE.Vector3().setFromSpherical(spherical));
    controls.update();
    requestFrame();
  }),
);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !dialog.open && state.exploring) {
    setExploring(false);
    $(".wordmark").focus({ preventScroll: true });
  }
});
reduce.addEventListener("change", () => {
  if (controls) controls.enableDamping = !reduce.matches;
  syncControls();
  requestFrame();
});
syncControls();

try {
  initialize();
} catch (error) {
  console.error("Signal Station renderer:", error);
  showFailure(
    "The 3D scene could not start on this device. You can still explore the work and About sections below.",
  );
}
function showFailure(message) {
  $("#loading-text").textContent = message;
  $("#loading").classList.add("error");
  stationElement.classList.remove("ready");
  $("#hotspots").hidden = true;
  $("#controls").hidden = true;
  $("#pause").hidden = true;
}

function initialize() {
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x79868a, 0.008);
  camera = new THREE.PerspectiveCamera(43, 1, 0.3, 1600);
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(
    Math.min(devicePixelRatio, host.clientWidth < 650 ? 1.5 : 1.75),
  );
  renderer.setSize(host.clientWidth, host.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.appendChild(renderer.domElement);
  studioReflections(renderer, scene);
  const ambient = new THREE.HemisphereLight(0xb8dce8, 0x384e47, 1.25);
  scene.add(ambient);
  const sun = new THREE.DirectionalLight(0xffd29a, 4.3);
  sun.position.set(-24, 26, 18);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -32;
  sun.shadow.camera.right = 32;
  sun.shadow.camera.top = 24;
  sun.shadow.camera.bottom = -24;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 100;
  sun.shadow.normalBias = 0.035;
  sun.shadow.radius = 3;
  sun.shadow.bias = -0.0001;
  sun.target.position.set(3, 3, 0);
  scene.add(sun, sun.target);
  const rim = new THREE.DirectionalLight(0x96d2e0, 1.5);
  rim.position.set(20, 13, -20);
  studyLighting = { ambient, sun, rim };
  scene.add(rim);
  environment = createEnvironment(scene);
  model = createStation();
  operator = createOperator();
  model.root.add(operator.root);
  outbuildings = createOutbuildings(model);
  scene.add(model.root);
  model.root.traverse((object) => {
    if (object.isMesh && object.material.isMeshStandardMaterial)
      object.material.envMapIntensity = 0.45;
  });
  nightMode = createNightMode({
    scene,
    model,
    environment,
    lighting: studyLighting,
    reduce,
    requestFrame,
  });
  nightMode.update(0, 0, state.lights);
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enabled = false;
  controls.enableDamping = !reduce.matches;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 18;
  controls.maxDistance = 70;
  controls.minPolarAngle = 0.55;
  controls.maxPolarAngle = 1.38;
  controls.autoRotate = false;
  controls.zoomSpeed = 0.65;
  controls.rotateSpeed = 0.55;
  controls.addEventListener("start", () => {
    cameraTransition = null;
  });
  controls.addEventListener("change", requestFrame);
  journeys = createJourneys({
    scene,
    camera,
    controls,
    model,
    environment,
    host,
    state,
    reduce,
    homeView,
    requestFrame,
    cancelCamera: () => {
      cameraTransition = null;
    },
    syncControls,
    announce,
    openProject,
  });
  resize(true);
  bindPicking();
  renderer.domElement.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    contextLost = true;
    cancelAnimationFrame(frame);
    frame = 0;
    showFailure(
      "The graphics context was interrupted. Reload to restart the station. Work and About remain available below.",
    );
  });
  renderer.render(scene, camera);
  stationElement.classList.add("ready");
  story = createStory({
    camera,
    controls,
    journeys,
    state,
    reduce,
    requestFrame,
    cancelCamera: () => {
      cameraTransition = null;
    },
  });
  coreInterface = createCoreInterface({
    core: outbuildings.core,
    environment: scene.environment,
    camera,
    host,
    story,
    state,
    journeys,
    reduce,
    requestFrame,
  });
  educationInterface = createEducationInterface({
    study: outbuildings.education,
    story,
    host,
    camera,
    journeys,
    state,
    requestFrame,
  });
  $("#hotspots").hidden = true;
  new ResizeObserver(() => resize()).observe(host);
  new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      if (visible) {
        lastTime = performance.now();
        requestFrame();
      }
    },
    { threshold: 0.02 },
  ).observe(stationElement);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      lastTime = performance.now();
      requestFrame();
    }
  });
  requestFrame();
}
function resize(initial = false) {
  if (!renderer) return;
  camera.aspect = host.clientWidth / host.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(host.clientWidth, host.clientHeight);
  if (journeys?.active) {
    journeys.resize();
  } else if (!state.exploring) {
    const view = homeView();
    moveCamera(view.position, view.target, true);
  }
  requestFrame();
}
function requestFrame() {
  if (!renderer || contextLost || frame || document.hidden) return;
  frame = requestAnimationFrame(tick);
}
function tick(now) {
  frame = 0;
  if (contextLost || !visible || document.hidden) return;
  const dt = Math.min((now - (lastTime || now)) / 1000, 0.05);
  lastTime = now;
  const animate = !state.paused && !reduce.matches;
  if (animate) state.time += dt;
  const t = state.time;
  model.fan.rotation.z = t * 1.7;
  model.cups.rotation.y = t * 0.75;
  model.beacon.rotation.y = t * 0.55;
  const flag = model.flag.geometry.attributes.position;
  for (let i = 0; i < flag.count; i++) {
    const x = model.flagRest[i * 3];
    flag.setZ(i, Math.sin(x * 7 - t * 2.5) * 0.07 * ((x + 0.4) / 0.8));
  }
  flag.needsUpdate = true;
  const lidTarget =
    dialog.open || journeys?.mode === "console" || story?.chapter === "projects"
      ? -0.63
      : -0.15;
  model.lid.rotation.x = reduce.matches
    ? lidTarget
    : model.lid.rotation.x +
      (lidTarget - model.lid.rotation.x) * (1 - Math.exp(-dt * 12));
  for (const light of model.lamps) light.visible = state.lights;
  model.materials.lamp.emissiveIntensity = state.lights ? 2 : 0;
  model.materials.lamp.color.set(state.lights ? 0xffcb79 : 0x4a4435);
  model.materials.screen.emissiveIntensity = state.lights ? 1.3 : 0;
  for (const screen of model.screenMeshes)
    screen.material.emissiveIntensity = state.lights ? 0.65 : 0;
  environment.seaUniforms.time.value = t;
  environment.skyUniforms.time.value = t;
  environment.seaUniforms.eye.value.copy(camera.position);
  for (const bird of environment.birds) {
    bird.group.position.x = -22 + ((t * 0.52 + bird.phase * 8) % 58);
    bird.group.position.y = 11 + Math.sin(t * 0.21 + bird.phase) * 0.7;
    bird.right.rotation.z = Math.sin(t * 2.2 + bird.phase) * 0.18;
    bird.left.rotation.z = -Math.sin(t * 2.2 + bird.phase) * 0.18;
  }
  story?.update(dt);
  journeys?.update(now);
  operator?.update(t, {
    reduced: reduce.matches,
    uplink: journeys?.mode === "flight",
    dt: animate ? dt : 0,
  });
  // Capture/flight runs first, against the last rendered dish pose. Its scan
  // clock freezes during flight and resumes from that same phase on return.
  if (state.scan && animate && !state.dragging) {
    const previous = Math.round(state.bearing);
    const scan = advanceDishScan(state.scanTime, dt, true);
    state.scanTime = scan.time;
    state.bearing = scan.bearing;
    if (previous !== Math.round(state.bearing)) syncControls();
  }
  model.yaw.rotation.y = radians(state.bearing);
  model.tilt.rotation.x = -radians(state.elevation);
  outbuildings?.update(
    t,
    story?.chapter,
    reduce.matches,
    nightMode?.amount || 0,
  );
  coreInterface?.update(now);
  educationInterface?.update();
  const studyReveal = story?.educationReveal || 0;
  const nightChanging = nightMode.update(dt, studyReveal, state.lights);
  if (cameraTransition) {
    const p = clamp(
      (now - cameraTransition.start) / cameraTransition.duration,
      0,
      1,
    );
    const u = p * p * (3 - 2 * p);
    camera.position.lerpVectors(cameraTransition.from, cameraTransition.to, u);
    controls.target.lerpVectors(
      cameraTransition.fromTarget,
      cameraTransition.toTarget,
      u,
    );
    applyScriptedView(camera, controls, camera.position, controls.target);
    if (p === 1) cameraTransition = null;
  }
  updateInteractiveView(
    controls,
    Boolean(cameraTransition) || journeys?.moving,
  );
  renderer.render(scene, camera);
  coreInterface?.render(renderer);
  positionProjectScreens();
  if (
    animate ||
    nightChanging ||
    story?.moving ||
    cameraTransition ||
    journeys?.moving ||
    state.dragging ||
    Math.abs(lidTarget - model.lid.rotation.x) > 0.001
  )
    requestFrame();
}
function positionProjectScreens() {
  const panel = $("#project-screens");
  panel.hidden =
    story?.chapter !== "projects" ||
    Boolean(journeys?.active) ||
    state.exploring;
  if (panel.hidden) return;
  const width = host.clientWidth,
    height = host.clientHeight;
  for (const [index, screen] of model.screenMeshes.entries()) {
    const points = [
      [-0.5, -0.5, 0.5],
      [-0.5, 0.5, 0.5],
      [0.5, -0.5, 0.5],
      [0.5, 0.5, 0.5],
    ].map((corner) =>
      screen.localToWorld(new THREE.Vector3(...corner)).project(camera),
    );
    const xs = points.map((point) => (point.x * 0.5 + 0.5) * width),
      ys = points.map((point) => (-0.5 * point.y + 0.5) * height);
    const button = panel.querySelector(`[data-project="${index}"]`);
    button.style.left = `${Math.min(...xs)}px`;
    button.style.top = `${Math.min(...ys)}px`;
    button.style.width = `${Math.max(44, Math.max(...xs) - Math.min(...xs))}px`;
    button.style.height = `${Math.max(44, Math.max(...ys) - Math.min(...ys))}px`;
    button.hidden = points.some((point) => point.z < -1 || point.z > 1);
  }
}
function intersect(event) {
  if (journeys?.mode === "space") {
    const planet = journeys.pick(event);
    return planet ? `planet:${planet}` : null;
  }
  if (
    journeys?.active &&
    journeys.mode !== "dish" &&
    journeys.mode !== "console"
  )
    return null;
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.set(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    (-(event.clientY - rect.top) / rect.height) * 2 + 1,
  );
  raycaster.setFromCamera(pointer, camera);
  return (
    raycaster.intersectObject(model.root, true).find((hit) => hit.object.isMesh)
      ?.object.userData.action || null
  );
}
function bindPicking() {
  const canvas = renderer.domElement;
  canvas.addEventListener(
    "pointerdown",
    (event) => {
      const action = intersect(event);
      dragStart = {
        x: event.clientX,
        y: event.clientY,
        bearing: state.bearing,
        elevation: state.elevation,
        action,
      };
      if (action === "dish") {
        event.stopImmediatePropagation();
        state.dragging = true;
        controls.enabled = false;
        cameraTransition = null;
        canvas.setPointerCapture(event.pointerId);
        canvas.classList.add("aiming");
        syncControls();
        requestFrame();
      }
    },
    true,
  );
  canvas.addEventListener("pointermove", (event) => {
    if (state.dragging && dragStart) {
      if (
        Math.hypot(event.clientX - dragStart.x, event.clientY - dragStart.y) < 4
      )
        return;
      state.scan = false;
      state.bearing = clamp(
        dragStart.bearing + (event.clientX - dragStart.x) * 0.4,
        -75,
        75,
      );
      state.elevation = clamp(
        dragStart.elevation - (event.clientY - dragStart.y) * 0.25,
        12,
        65,
      );
      syncControls();
      requestFrame();
      return;
    }
    if (event.pointerType === "touch") return;
    const action = intersect(event);
    if (action !== hovered) {
      hovered = action;
      canvas.style.cursor =
        action === "dish"
          ? "grab"
          : action === "console" ||
              action?.startsWith("education:") ||
              action?.startsWith("project:") ||
              action?.startsWith("tool:")
            ? "pointer"
            : state.exploring
              ? "grab"
              : "default";
    }
  });
  const finish = (event) => {
    if (state.dragging) {
      state.dragging = false;
      canvas.classList.remove("aiming");
      if (canvas.hasPointerCapture(event.pointerId))
        canvas.releasePointerCapture(event.pointerId);
      controls.enabled = state.exploring;
      announce(
        `Dish aimed to ${Math.round(state.bearing)} degrees bearing and ${Math.round(state.elevation)} degrees elevation.`,
      );
      if (
        Math.hypot(event.clientX - dragStart.x, event.clientY - dragStart.y) < 8
      )
        journeys?.focus("dish", $("#dish-hotspot"));
    } else if (
      dragStart?.action?.startsWith("education:") &&
      Math.hypot(event.clientX - dragStart.x, event.clientY - dragStart.y) < 8
    ) {
      educationInterface?.select(Number(dragStart.action.split(":")[1]));
    } else if (
      dragStart?.action?.startsWith("tool:") &&
      Math.hypot(event.clientX - dragStart.x, event.clientY - dragStart.y) < 8
    ) {
      coreInterface?.select(Number(dragStart.action.split(":")[1]));
    } else if (
      dragStart?.action?.startsWith("project:") &&
      Math.hypot(event.clientX - dragStart.x, event.clientY - dragStart.y) < 8
    ) {
      const index = Number(dragStart.action.split(":")[1]);
      openProject(
        story?.chapter === "projects"
          ? $(`.screen-target[data-project="${index}"]`)
          : $(".wordmark"),
        index,
      );
    } else if (
      dragStart?.action === "console" &&
      Math.hypot(event.clientX - dragStart.x, event.clientY - dragStart.y) < 8
    ) {
      showProjectDisplays();
      requestFrame();
    } else if (
      dragStart?.action?.startsWith("planet:") &&
      Math.hypot(event.clientX - dragStart.x, event.clientY - dragStart.y) < 8
    ) {
      journeys.selectPlanet(dragStart.action.slice(7));
    }
    dragStart = null;
  };
  canvas.addEventListener("pointerup", finish);
  canvas.addEventListener("pointercancel", () => {
    state.dragging = false;
    dragStart = null;
    canvas.classList.remove("aiming");
    controls.enabled = state.exploring;
  });
}
