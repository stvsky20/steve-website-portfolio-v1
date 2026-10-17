import { emitSound } from "./audio.js";
import { setSectionMarker } from "./section-marker.js";
import { contactMark } from "./contact-icons.js";
import { UPLINK_FIRE, UPLINK_DEPARTURE } from "./uplink-timing.js";
import * as THREE from "../vendor/three.module.js";
import {
  applyScriptedView,
  captureDishPose,
  alignedDishPose,
} from "./scene-control.js";
import { clamp, radians } from "./geometry.js";
import { createSpace, destinations } from "./space.js";
import {
  transmissionPhases,
  alignmentView,
  transmissionPaths,
  TRANSMISSION_DURATION,
} from "./transmission.js";

const $ = (s) => document.querySelector(s);
const smooth = (p) => {
  p = clamp(p, 0, 1);
  return p * p * (3 - 2 * p);
};
const vector = (a) => new THREE.Vector3(...a);

function createCloudPass(scene) {
  const group = new THREE.Group();
  group.name = "Atmospheric cloud passage";
  group.visible = false;
  scene.add(group);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(64, 64, 5, 64, 64, 64);
  gradient.addColorStop(0, "rgba(220,227,224,.8)");
  gradient.addColorStop(0.45, "rgba(190,206,207,.3)");
  gradient.addColorStop(1, "rgba(163,185,192,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  for (let i = 0; i < 18; i++) {
    const side = i % 2 === 0 ? -1 : 1,
      puff = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: texture,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          fog: false,
        }),
      );
    puff.position.set(
      10 + side * (9 + ((i * 7) % 13)),
      43 + ((i * 11) % 47),
      12 + ((i * 13) % 39),
    );
    puff.scale.set(20 + (i % 4) * 5, 8 + (i % 3) * 4, 1);
    group.add(puff);
  }
  return group;
}

export function createJourneys({
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
  cancelCamera,
  syncControls,
  announce,
  openProject,
}) {
  const space = createSpace(scene),
    station = $("#station");
  let mode = "overview",
    transition = null,
    fade = 0,
    starReveal = 0,
    planetReveal = 0,
    saved = null,
    selected = null,
    opener = null;
  let lastAnnouncement = "",
    flightPoints = null,
    flightTargets = null;
  let scrollFlight = null,
    scrollProgress = -1;
  const ray = new THREE.Raycaster(),
    mouse = new THREE.Vector2();
  const beam = new THREE.Group();
  beam.visible = false;
  scene.add(beam);
  const chargingGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 16, 12),
    new THREE.MeshBasicMaterial({
      color: 0xffd68a,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  const chargingLight = new THREE.PointLight(0xffbf67, 0, 12, 2);
  chargingGlow.position.set(0, 0, 4.1);
  chargingLight.position.copy(chargingGlow.position);
  model.tilt.add(chargingGlow, chargingLight);
  chargingGlow.visible = false;
  const beamCore = new THREE.Mesh(
    new THREE.CylinderGeometry(0.027, 0.027, 1, 8),
    new THREE.MeshBasicMaterial({
      color: 0xffe5a7,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
      fog: false,
    }),
  );
  const beamGlow = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.13, 1, 12),
    new THREE.MeshBasicMaterial({
      color: 0xf6bd65,
      transparent: true,
      opacity: 0.1,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false,
    }),
  );
  const pulse = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 12, 8),
    new THREE.MeshBasicMaterial({ color: 0xffebba, fog: false }),
  );
  beam.add(beamGlow, beamCore, pulse);
  const planetButtons = $("#planet-buttons");
  const cloudPass = createCloudPass(scene);
  for (const d of destinations) {
    const b = document.createElement("button");
    b.className = "planet-button";
    b.dataset.destination = d.id;
    const arrow = document.createElement("i");
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "↗";
    b.append(contactMark(d.id), document.createTextNode(d.name), arrow);
    b.addEventListener("click", () => selectPlanet(d.id));
    planetButtons.appendChild(b);
    const planetLabel = $(`#world-${d.id}`);
    planetLabel.prepend(contactMark(d.id));
  }

  function atlasView() {
    return host.clientWidth < 650
      ? { position: vector([7, 153, -20]), target: vector([7, 138, 120]) }
      : { position: vector([20, 151, 32]), target: vector([20, 146, 120]) };
  }
  function componentView(which) {
    const mobile = host.clientWidth < 650;
    return which === "console"
      ? mobile
        ? {
            position: vector([4.8, 5.3, 12.8]),
            target: vector([1.8, -0.5, 3.2]),
          }
        : {
            position: vector([6.4, 4.2, 10.4]),
            target: vector([-0.8, 2.1, 3.2]),
          }
      : mobile
        ? { position: vector([14, 18, 21]), target: vector([4.8, 9.3, 0]) }
        : {
            position: vector([15, 14.5, 14]),
            target: vector([-0.5, 11.2, 0.5]),
          };
  }
  function setMode(next) {
    mode = next;
    station.dataset.view = next;
    state.exploring = false;
    controls.enabled = next === "space";
    controls.minDistance = next === "overview" ? 18 : 3;
    controls.maxDistance = next === "overview" ? 70 : 240;
    controls.minPolarAngle = next === "overview" ? 0.55 : 0.08;
    controls.maxPolarAngle = next === "overview" ? 1.38 : Math.PI - 0.08;
    station.classList.toggle("exploring", next !== "overview");
    $(".introduction").inert = next !== "overview";
    $("#explore-message").hidden = true;
    $("#hotspots").hidden = true;
    $("#journey-nav").hidden = next === "overview";
    $("#component-panel").hidden = true;
    $("#space-panel").hidden = true;
    $("#controls").open = false;
    $("#controls").hidden = true;
    $("#journey-skip").hidden = true;
    $("#space-planet-labels").hidden = next !== "space";
    if (next !== "overview" && !scrollFlight)
      window.scrollTo({ top: station.offsetTop, behavior: "instant" });
  }
  function status(text) {
    if (text === lastAnnouncement) return;
    lastAnnouncement = text;
    $("#journey-status").textContent = text;
    announce(text);
  }
  function applyCamera(position, target) {
    applyScriptedView(camera, controls, position, target);
  }
  function makeTransition(position, target, onComplete, duration = 1250) {
    $("#journey-skip").ariaLabel =
      mode === "return" ? "Skip return ↙" : "Skip approach ↗";
    cancelCamera();
    controls.enabled = false;
    controls.enableDamping = false;
    if (reduce.matches) {
      applyCamera(position, target);
      onComplete();
      requestFrame();
      return;
    }
    transition = {
      type: "focus",
      start: performance.now(),
      duration,
      from: camera.position.clone(),
      to: position,
      fromTarget: controls.target.clone(),
      toTarget: target,
      onComplete,
    };
    $("#journey-skip").hidden = false;
    requestFrame();
  }
  function capture() {
    if (!saved)
      saved = {
        bearing: state.bearing,
        elevation: state.elevation,
        scan: state.scan,
      };
  }
  function focus(which, trigger = document.activeElement) {
    if (mode === which && !transition) return;
    capture();
    opener = trigger;
    transition = null;
    cancelCamera();
    state.scan = false;
    syncControls();
    beam.visible = false;
    starReveal = planetReveal = 0;
    cloudPass.visible = false;
    setFade(0);
    setMode(which);
    $("#journey-back").setAttribute("aria-label", "Return to station");
    status(
      which === "console"
        ? "Approaching the control deck"
        : "Approaching the antenna array",
    );
    const view = componentView(which);
    makeTransition(view.position, view.target, () => {
      transition = null;
      $("#journey-skip").hidden = true;
      showComponent(which);
      status(
        which === "console"
          ? "Control deck / Selected work"
          : "Antenna array / Deep-space uplink",
      );
    });
  }
  function showComponent(which) {
    const dish = which === "dish";
    $("#component-panel").hidden = false;
    setSectionMarker(
      $("#component-kicker"),
      dish ? "Contact uplink" : "Control deck",
    );
    $("#component-title").textContent = dish
      ? "Let’s connect."
      : "A connection to your community.";
    $("#console-content").hidden = dish;
    $("#dish-content").hidden = !dish;
    $("#component-title").focus({ preventScroll: true });
    controls.enabled = false;
  }
  function setFade(value) {
    fade = clamp(value, 0, 1);
    environment.skyUniforms.spaceFade.value = fade;
    scene.fog.density = 0.008 * (1 - fade);
    model.root.visible = fade < 0.999;
    environment.sea.visible = fade < 0.999;
    environment.coastline.visible = fade < 0.999;
    for (const bird of environment.birds) bird.group.visible = fade < 0.5;
  }
  function launch() {
    if ((mode !== "dish" && mode !== "overview") || transition) return;
    if (mode === "overview") {
      capture();
      opener = document.activeElement;
      cancelCamera();
      state.scan = false;
      syncControls();
    }
    const view = atlasView();
    setMode("flight");
    status("Aligning the uplink");
    $("#journey-skip").hidden = false;
    $("#journey-skip").ariaLabel = "Skip flight ↗";
    if (reduce.matches) {
      state.bearing = 1;
      state.elevation = 49;
      applyCamera(view.position, view.target);
      arrive();
      return;
    }
    const paths = transmissionPaths(camera.position, controls.target, view);
    flightPoints = paths.points;
    flightTargets = paths.targets;
    transition = {
      type: "flight",
      start: performance.now(),
      duration: TRANSMISSION_DURATION,
      curve: new THREE.CatmullRomCurve3(flightPoints, false, "centripetal"),
      lookCurve: new THREE.CatmullRomCurve3(
        flightTargets,
        false,
        "centripetal",
      ),
      bearing: state.bearing,
      elevation: state.elevation,
      onComplete: arrive,
    };
    requestFrame();
  }
  function arrive() {
    transition = null;
    beam.visible = false;
    cloudPass.visible = false;
    starReveal = planetReveal = 1;
    setFade(1);
    setMode("space");
    controls.enableDamping = !reduce.matches;
    status("Uplink established / Contact info");
    $("#journey-back").setAttribute("aria-label", "Return to station");
    $("#journey-skip").hidden = true;
    showSpace();
    requestFrame();
  }
  function showSpace() {
    $("#space-panel").hidden = false;
    $("#space-title").textContent = "Contact info.";
    $("#space-subtitle").textContent = "Four ways to connect.";
    $("#space-description").textContent =
      "Find my work on GitHub, connect on LinkedIn, or send me an email. Instagram is coming soon.";
    $("#space-tags").textContent = "";
    $("#contact-address").hidden = true;
    $("#all-worlds").hidden = true;
    selected = null;
    syncPlanetButtons();
    if (!scrollFlight) $("#space-title").focus({ preventScroll: true });
  }
  function syncPlanetButtons() {
    for (const b of planetButtons.children) {
      const active = b.dataset.destination === selected;
      b.setAttribute("aria-pressed", String(active));
    }
  }
  function selectPlanet(id) {
    if (mode !== "space") return;
    const d = destinations.find((item) => item.id === id);
    if (!d) return;
    selected = id;
    emitSound("planet");
    syncPlanetButtons();
    $("#space-title").replaceChildren(
      contactMark(d.id),
      document.createTextNode(d.name),
    );
    $("#space-subtitle").textContent = d.subtitle;
    $("#space-description").textContent = d.description;
    $("#space-tags").textContent = d.tags.join(" / ");
    $("#contact-address").hidden = false;
    $("#contact-placeholder").textContent = d.placeholder;
    const address = $("#contact-address");
    address.querySelector("span").textContent = d.href
      ? "Connect with Steven"
      : "Profile pending";
    address.querySelector("small").textContent = d.href
      ? "Open a direct connection."
      : "Instagram details will be added later.";
    const contactLink = $("#contact-link");
    contactLink.hidden = !d.href;
    if (d.href) {
      contactLink.href = d.href;
      contactLink.replaceChildren(
        contactMark(d.id),
        document.createTextNode(
          d.id === "email" ? "Send an email ↗" : `Visit ${d.name} ↗`,
        ),
      );
      if (d.id === "email") contactLink.removeAttribute("target");
      else contactLink.target = "_blank";
    } else contactLink.removeAttribute("href");
    const phone = $("#contact-phone");
    phone.hidden = !d.phone;
    if (d.phone) {
      phone.href = d.phoneHref;
      phone.replaceChildren(
        contactMark("phone"),
        document.createTextNode(`Or call ${d.phone}`),
      );
    } else phone.removeAttribute("href");
    $("#all-worlds").hidden = false;
    const p = vector(d.position),
      mobile = host.clientWidth < 650;
    const position = p
      .clone()
      .add(mobile ? vector([0, 4, -27]) : vector([-7, 3, -19]));
    const target = p
      .clone()
      .add(mobile ? vector([0, -4.3, 0]) : vector([3, 0, 0]));
    status(`Signal received / ${d.name}`);
    makeTransition(
      position,
      target,
      () => {
        transition = null;
        controls.enabled = true;
        controls.enableDamping = !reduce.matches;
        $("#journey-skip").hidden = true;
        $("#space-title").focus({ preventScroll: true });
      },
      1000,
    );
  }
  function allWorlds() {
    const v = atlasView();
    showSpace();
    makeTransition(v.position, v.target, () => {
      transition = null;
      controls.enabled = true;
      controls.enableDamping = !reduce.matches;
      $("#journey-skip").hidden = true;
      status("Contact constellation / All worlds");
    });
  }
  function restore() {
    transition = null;
    beam.visible = false;
    cloudPass.visible = false;
    starReveal = planetReveal = 0;
    setFade(0);
    setMode("overview");
    controls.enabled = false;
    controls.enableDamping = !reduce.matches;
    if (saved) {
      state.bearing = saved.bearing;
      state.elevation = saved.elevation;
      state.scan = saved.scan;
      saved = null;
    }
    syncControls();
    $("#journey-skip").ariaLabel = "Skip approach ↗";
    announce("Station overview restored.");
    const focusTarget =
      opener && opener.isConnected && !opener.closest("[hidden]")
        ? opener
        : $(".wordmark");
    focusTarget?.focus?.({ preventScroll: true });
    opener = null;
    requestFrame();
  }
  function returnStation(instant = false) {
    emitSound("flight", { progress: 0 });
    scrollFlight = null;
    scrollProgress = -1;
    delete station.dataset.scrollFlight;
    controls.enableZoom = true;
    if (mode === "overview") return;
    cancelCamera();
    transition = null;
    const view = homeView();
    const wasSpace = fade > 0.5;
    setMode("return");
    status("Returning to the station");
    $("#journey-skip").hidden = false;
    $("#journey-skip").ariaLabel = "Skip return ↙";
    beam.visible = false;
    if (instant || reduce.matches) {
      applyCamera(view.position, view.target);
      restore();
      return;
    }
    if (wasSpace) {
      const points = [
        camera.position.clone(),
        vector([7, 123, 47]),
        vector([9, 80, 35]),
        vector([13, 39, 18]),
        vector([19, 23, 0]),
        componentView("dish").position,
        view.position,
      ];
      const targets = [
        controls.target.clone(),
        vector([7, 145, 117]),
        vector([7, 115, 82]),
        vector([7, 60, 40]),
        vector([6, 25, 12]),
        componentView("dish").target,
        view.target,
      ];
      transition = {
        type: "return",
        initialFade: fade,
        initialStars: starReveal,
        initialPlanets: planetReveal,
        start: performance.now(),
        duration: 4500,
        curve: new THREE.CatmullRomCurve3(points, false, "centripetal"),
        lookCurve: new THREE.CatmullRomCurve3(targets, false, "centripetal"),
        onComplete: restore,
      };
      requestFrame();
    } else {
      setFade(0);
      starReveal = planetReveal = 0;
      cloudPass.visible = false;
      makeTransition(view.position, view.target, restore, 1100);
    }
  }
  function skip() {
    if (!transition) return;
    const active = transition;
    transition = null;
    if (active.type === "flight") {
      const v = atlasView();
      applyCamera(v.position, v.target);
      arrive();
    } else if (active.type === "return") {
      const v = homeView();
      applyCamera(v.position, v.target);
      restore();
    } else {
      applyCamera(active.to, active.toTarget);
      $("#journey-skip").hidden = true;
      active.onComplete();
    }
    requestFrame();
  }
  function scrubFlight(progress, startView) {
    const viewport = `${host.clientWidth}x${host.clientHeight}`;
    const p = reduce.matches
      ? progress >= 0.5
        ? 1
        : 0
      : clamp(progress, 0, 1);
    if (p <= 0) {
      emitSound("flight", { progress: 0 });
      if (scrollFlight) returnStation(true);
      return;
    }
    if (!scrollFlight) {
      const pose = captureDishPose(model);
      state.bearing = pose.bearing;
      state.elevation = pose.elevation;
      capture();
      cancelCamera();
      transition = null;
      const aligned = alignmentView(startView, 0.17);
      const paths = transmissionPaths(
        aligned.position,
        aligned.target,
        atlasView(),
      );
      scrollFlight = {
        entryView: {
          position: startView.position.clone(),
          target: startView.target.clone(),
        },
        curve: new THREE.CatmullRomCurve3(paths.points, false, "centripetal"),
        lookCurve: new THREE.CatmullRomCurve3(
          paths.targets,
          false,
          "centripetal",
        ),
        bearing: state.bearing,
        elevation: state.elevation,
        viewport,
      };
      state.scan = false;
      syncControls();
      station.dataset.scrollFlight = "true";
    }
    if (scrollFlight.viewport !== viewport) {
      const aligned = alignmentView(startView, 0.17);
      const paths = transmissionPaths(
        aligned.position,
        aligned.target,
        atlasView(),
      );
      scrollFlight.curve = new THREE.CatmullRomCurve3(
        paths.points,
        false,
        "centripetal",
      );
      scrollFlight.lookCurve = new THREE.CatmullRomCurve3(
        paths.targets,
        false,
        "centripetal",
      );
      scrollFlight.entryView = {
        position: startView.position.clone(),
        target: startView.target.clone(),
      };
      scrollFlight.viewport = viewport;
      scrollProgress = -1;
    }
    controls.enabled = false;
    controls.enableZoom = false;
    if (Math.abs(p - scrollProgress) < 0.000001) return;
    transition = null;
    scrollProgress = p;
    emitSound("flight", { progress: p });
    if (p === 1) {
      applyFlight(scrollFlight, 1);
      arrive();
      controls.enabled = false;
    } else {
      if (mode !== "flight") setMode("flight");
      applyFlight(scrollFlight, p);
      $("#space-panel").hidden = true;
    }
    $("#journey-skip").hidden = true;
    $("#journey-back").setAttribute("aria-label", "Back to the dish");
    $("#journey-progress").hidden = false;
    $("#journey-progress").style.transform = `scaleX(${p})`;
    space.update(state.time, starReveal, planetReveal);
    requestFrame();
  }
  function applyFlight(current, progress) {
    const phase = transmissionPhases(progress);
    const pose = alignedDishPose(current, progress);
    state.bearing = pose.bearing;
    state.elevation = pose.elevation;
    model.yaw.rotation.y = radians(state.bearing);
    model.tilt.rotation.x = -radians(state.elevation);
    model.root.updateMatrixWorld(true);
    const charge = clamp(progress / UPLINK_FIRE, 0, 1);
    chargingGlow.visible = progress > 0 && progress < UPLINK_FIRE;
    chargingGlow.material.opacity = 0.25 + charge * 0.7;
    chargingGlow.scale.setScalar(0.7 + charge * 1.8);
    chargingLight.intensity = chargingGlow.visible ? charge * 28 : 0;
    const travel = phase.travel;
    if (current.entryView && progress <= UPLINK_DEPARTURE) {
      const aligned = alignmentView(current.entryView, progress);
      applyCamera(aligned.position, aligned.target);
    } else {
      applyCamera(
        current.curve.getPoint(travel),
        current.lookCurve.getPoint(travel),
      );
    }
    setFade(phase.atmosphere);
    starReveal = phase.stars;
    planetReveal = phase.atmosphere === 1 ? phase.planets : 0;
    status(phase.stage);
    cloudPass.visible = phase.flight > 0.19 && phase.flight < 0.65;
    for (const puff of cloudPass.children)
      puff.material.opacity =
        0.2 * Math.sin(clamp((phase.flight - 0.19) / 0.46, 0, 1) * Math.PI);
    beam.visible = progress >= UPLINK_FIRE && phase.flight < 0.93;
    if (beam.visible) {
      const length = 180 * phase.pulse;
      beamCore.material.opacity =
        0.65 * (1 - smooth((phase.flight - 0.85) / 0.1));
      beamGlow.material.opacity =
        0.1 * (1 - smooth((phase.flight - 0.85) / 0.1));
      const start = model.tilt.localToWorld(new THREE.Vector3(0, 0, 4.1));
      const direction = new THREE.Vector3(0, 0, 1).transformDirection(
        model.tilt.matrixWorld,
      );
      beam.position.copy(start);
      beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
      for (const mesh of [beamCore, beamGlow]) {
        mesh.scale.y = length;
        mesh.position.y = length / 2;
      }
      pulse.position.y = length;
    }
  }
  function update(now) {
    if (mode !== "flight") {
      chargingGlow.visible = false;
      chargingLight.intensity = 0;
    }
    const night = environment.skyUniforms.night.value;
    for (const puff of cloudPass.children)
      puff.material.color.setRGB(
        1 - night * 0.88,
        1 - night * 0.78,
        1 - night * 0.65,
      );
    if (scrollFlight) controls.enabled = false;
    if (transition) {
      const current = transition,
        progress = clamp((now - current.start) / current.duration, 0, 1);
      $("#journey-progress").style.transform = `scaleX(${progress})`;
      if (current.type === "flight") {
        applyFlight(current, progress);
      } else if (current.type === "return") {
        const travel = smooth(progress);
        applyCamera(
          current.curve.getPoint(travel),
          current.lookCurve.getPoint(travel),
        );
        planetReveal = current.initialPlanets * (1 - smooth(progress / 0.2));
        starReveal =
          current.initialStars * (1 - smooth((progress - 0.18) / 0.15));
        setFade(current.initialFade * (1 - smooth((progress - 0.36) / 0.37)));
      } else {
        const p = smooth(progress);
        applyCamera(
          current.from.clone().lerp(current.to, p),
          current.fromTarget.clone().lerp(current.toTarget, p),
        );
      }
      if (progress === 1) {
        transition = null;
        $("#journey-skip").hidden = true;
        current.onComplete();
      }
    }
    space.update(state.time, starReveal, planetReveal);
    $("#journey-progress").hidden = !transition && !scrollFlight;
    for (const world of space.worlds) {
      const button = $(`#world-${world.data.id}`);
      if (!button) continue;
      const point = world.mesh.position
        .clone()
        .add(new THREE.Vector3(0, -world.data.radius - 1.6, 0))
        .project(camera);
      const x = (point.x * 0.5 + 0.5) * host.clientWidth,
        y = (-point.y * 0.5 + 0.5) * host.clientHeight;
      button.style.transform = `translate(${Math.round(x - 45)}px,${Math.round(y)}px)`;
      button.style.visibility =
        mode === "space" &&
        point.z < 1 &&
        point.z > -1 &&
        x > 0 &&
        x < host.clientWidth &&
        y > 70 &&
        y < host.clientHeight - 80
          ? "visible"
          : "hidden";
    }
    return Boolean(transition);
  }
  function pick(event) {
    if (mode !== "space") return null;
    const rect = host.getBoundingClientRect();
    mouse.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      (-(event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    ray.setFromCamera(mouse, camera);
    return (
      ray.intersectObjects(
        space.worlds.map((w) => w.mesh),
        false,
      )[0]?.object.userData.destination || null
    );
  }
  function resize() {
    if (mode === "space") {
      const v = atlasView();
      transition = null;
      selected = null;
      applyCamera(v.position, v.target);
      showSpace();
      status("Contact constellation / All worlds");
      controls.enabled = true;
    } else if (mode === "console" || mode === "dish") {
      transition = null;
      const v = componentView(mode);
      applyCamera(v.position, v.target);
      showComponent(mode);
    }
    requestFrame();
  }
  $("#journey-back").addEventListener("click", () => {
    if (scrollFlight)
      document.dispatchEvent(new CustomEvent("station:rewind-flight"));
    else returnStation();
  });
  $("#journey-skip").addEventListener("click", skip);
  $("#all-worlds").addEventListener("click", allWorlds);
  $("#component-project").addEventListener("click", () =>
    openProject($("#component-project")),
  );
  for (const d of destinations)
    $(`#world-${d.id}`).addEventListener("click", () => selectPlanet(d.id));
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      !$("#project-dialog").open &&
      mode !== "overview"
    ) {
      event.preventDefault();
      if (scrollFlight)
        document.dispatchEvent(new CustomEvent("station:rewind-flight"));
      else returnStation(true);
    }
  });
  reduce.addEventListener("change", () => {
    if (reduce.matches && transition) skip();
    requestFrame();
  });
  for (const link of document.querySelectorAll('a[href="#station"]'))
    link.addEventListener("click", () => {
      if (mode !== "overview") returnStation(true);
    });
  station.dataset.view = "overview";
  return {
    launch,
    scrubFlight,
    get scrollDriven() {
      return Boolean(scrollFlight);
    },
    focus,
    returnStation,
    selectPlanet,
    update,
    pick,
    resize,
    skip,
    get mode() {
      return mode;
    },
    get moving() {
      return Boolean(transition);
    },
    get active() {
      return mode !== "overview";
    },
  };
}
