import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "../vendor/three.module.js";
import { createNightMode } from "../src/night-mode.js";

test("unchanged lighting avoids material rewrites while night, lamps and space visibility still update", () => {
  let click;
  const toggle = {
    setAttribute() {},
    addEventListener(type, fn) {
      if (type === "click") click = fn;
    },
  };
  const previousDocument = globalThis.document;
  globalThis.document = {
    body: { dataset: {} },
    querySelector: (selector) =>
      selector === "#night-toggle" ? toggle : { textContent: "" },
  };
  try {
    const material = new THREE.MeshStandardMaterial();
    let writes = 0,
      reflection = material.envMapIntensity;
    Object.defineProperty(material, "envMapIntensity", {
      get: () => reflection,
      set(value) {
        reflection = value;
        writes++;
      },
    });
    const root = new THREE.Group();
    root.add(new THREE.Mesh(new THREE.BoxGeometry(), material));
    const model = {
      root,
      materials: { lamp: material },
      lamps: [new THREE.PointLight()],
    };
    const bird = { group: new THREE.Group() };
    const environment = {
      coastline: { children: [] },
      skyUniforms: { night: { value: 0 }, spaceFade: { value: 0 } },
      seaUniforms: { night: { value: 0 } },
      birds: [bird],
    };
    const lighting = {
      ambient: new THREE.HemisphereLight(),
      sun: new THREE.DirectionalLight(),
      rim: new THREE.DirectionalLight(),
    };
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2();
    const night = createNightMode({
      scene,
      model,
      environment,
      lighting,
      reduce: { matches: false },
      requestFrame() {},
    });
    night.update(0, 0, true);
    const firstWrites = writes;
    for (let i = 0; i < 60; i++) night.update(1 / 60, 0, true);
    assert.equal(writes, firstWrites);
    environment.skyUniforms.spaceFade.value = 1;
    night.update(1 / 60, 0, true);
    assert.equal(bird.group.visible, false);
    environment.skyUniforms.spaceFade.value = 0;
    night.update(1 / 60, 0, true);
    assert.equal(bird.group.visible, true);
    click({ detail: 1 });
    for (let i = 0; i < 120; i++) night.update(1 / 60, 0, true);
    assert.equal(night.amount, 1);
    assert.equal(material.emissiveIntensity, 3.5);
    assert.equal(reflection, 0.065);
    night.update(1 / 60, 0, false);
    assert.equal(material.emissiveIntensity, 0);
  } finally {
    globalThis.document = previousDocument;
  }
});
