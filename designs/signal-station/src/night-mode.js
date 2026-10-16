import * as THREE from "../vendor/three.module.js";
import { nightLighting } from "./night-lighting.js";

export function createNightMode({
  scene,
  model,
  environment,
  lighting,
  reduce,
  requestFrame,
}) {
  const toggle = document.querySelector("#night-toggle");
  let enabled = false;
  try {
    enabled = localStorage.getItem("signal-station-night") === "true";
  } catch {}
  let amount = enabled ? 1 : 0;
  const dayFog = new THREE.Color(0x79868a),
    nightFog = new THREE.Color(0x102538);
  const daySun = new THREE.Color(0xffd29a),
    moon = new THREE.Color(0x9bbfe4);
  const materials = new Set();
  model.root.traverse((o) => {
    if (o.isMesh && o.material?.isMeshStandardMaterial)
      materials.add(o.material);
  });
  const islands = environment.coastline.children.map((island) => ({
    material: island.material,
    day: island.material.color.clone(),
  }));
  const nightIsland = new THREE.Color().setRGB(0.012, 0.029, 0.044);
  // Wide, non-shadowed pools of warm light on the tower and front landing.
  const practicals = new THREE.Group();
  model.root.add(practicals);
  for (const [x, y, z, intensity, distance] of [
    [3.7, 6.8, 0.7, 9, 5],
    [3.7, 4.7, 0.7, 9, 5],
    [-1.3, 2.6, 3.6, 12, 6],
    [5, 1.8, 4.4, 10, 5],
  ]) {
    const light = new THREE.PointLight(0xffbb6c, 0, distance, 2);
    light.position.set(x, y, z);
    light.userData.nightIntensity = intensity;
    practicals.add(light);
  }
  function sync() {
    toggle.setAttribute("aria-pressed", String(enabled));
    toggle.setAttribute(
      "aria-label",
      enabled ? "Switch to day mode" : "Switch to night mode",
    );
    toggle.title = enabled ? "Switch to day mode" : "Switch to night mode";
    document.querySelector("#night-mode-label").textContent = enabled
      ? "Day"
      : "Night";
    document.body.dataset.night = String(enabled);
  }
  sync();
  toggle.addEventListener("click", (event) => {
    enabled = !enabled;
    if (reduce.matches || event.detail === 0) amount = enabled ? 1 : 0;
    try {
      localStorage.setItem("signal-station-night", String(enabled));
    } catch {}
    sync();
    requestFrame();
  });
  return {
    get amount() {
      return amount;
    },
    update(dt, study, lightsOn) {
      const target = enabled ? 1 : 0;
      amount = reduce.matches
        ? target
        : amount + (target - amount) * (1 - Math.exp(-dt * 8));
      if (Math.abs(amount - target) < 0.001) amount = target;
      const p = nightLighting(amount, study);
      lighting.ambient.intensity = p.ambient;
      lighting.sun.intensity = p.sun;
      lighting.rim.intensity = p.rim;
      lighting.sun.color.lerpColors(daySun, moon, amount);
      scene.fog.color.lerpColors(dayFog, nightFog, amount);
      environment.skyUniforms.night.value = amount;
      environment.seaUniforms.night.value = amount;
      for (const material of materials) material.envMapIntensity = p.reflection;
      for (const island of islands)
        island.material.color.lerpColors(island.day, nightIsland, amount);
      model.materials.lamp.emissiveIntensity = lightsOn ? p.lamp : 0;
      for (const light of practicals.children)
        light.intensity = lightsOn ? amount * light.userData.nightIntensity : 0;
      for (const light of model.lamps) light.intensity = 6 + amount * 9;
      for (const bird of environment.birds)
        bird.group.visible =
          amount <= 0.8 && environment.skyUniforms.spaceFade.value < 0.5;
      return amount !== target;
    },
  };
}
