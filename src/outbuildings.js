import * as THREE from "../vendor/three.module.js";
import { beveledBox, detailAnnex } from "./cinematic.js";
import { createSignalCore } from "./signal-core.js";
import { createEducationStudy } from "./education-study.js";

// Open-front annexes share the station's materials and primitive geometry.
export function createOutbuildings(model, requestFrame) {
  const m = model.materials;
  const boxGeometry = beveledBox();
  const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 1, 12);
  const root = new THREE.Group();
  root.name = "Workshop and study annexes";
  model.root.add(root);
  function box(parent, xyz, size, material) {
    const mesh = new THREE.Mesh(boxGeometry, material);
    mesh.position.set(...xyz);
    mesh.scale.set(...size);
    mesh.castShadow = mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  function bar(parent, a, b, radius, material) {
    const start = new THREE.Vector3(...a),
      end = new THREE.Vector3(...b);
    const direction = end.clone().sub(start);
    const mesh = new THREE.Mesh(cylinderGeometry, material);
    mesh.position.copy(start).add(end).multiplyScalar(0.5);
    mesh.scale.set(radius, direction.length(), radius);
    mesh.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.normalize(),
    );
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  }
  function annex(x, name) {
    const group = new THREE.Group();
    group.name = name;
    group.position.set(x, 0, -1);
    root.add(group);
    box(group, [0, 0.52, 0], [6, 0.35, 5.4], m.lightConcrete);
    box(group, [0, -1.1, 0], [5.5, 2.9, 4.8], m.darkConcrete);
    box(group, [0, 2.7, -2.55], [6, 4.1, 0.18], m.concrete);
    box(group, [0, 4.85, -0.2], [6.4, 0.2, 5.6], m.rust);
    for (const x of [-2.75, 2.75]) {
      // An open cutaway keeps the equipment visible from the front.
      bar(group, [x, 0.7, 2.45], [x, 4.8, 2.45], 0.07, m.rust);
    }
    for (const x of [-2.5, 2.5]) {
      bar(group, [x, 0.75, 2.6], [x, 1.6, 2.6], 0.035, m.rust);
      bar(group, [x, 1.6, 2.6], [x, 1.6, 1.8], 0.035, m.rust);
    }
    box(group, [0, 4.5, -2.4], [2.7, 0.16, 0.1], m.lamp);
    return group;
  }
  // Service walkways physically connect both annexes to the original deck.
  for (const [x, width] of [
    [-6.5, 2],
    [-14.5, 3],
  ]) {
    box(root, [x, 0.52, -1], [width, 0.22, 1.8], m.metal);
    for (const z of [-1.85, -0.15]) {
      bar(
        root,
        [x - width / 2, 1.5, z],
        [x + width / 2, 1.5, z],
        0.035,
        m.rust,
      );
      for (const end of [-1, 1])
        bar(
          root,
          [x + (end * width) / 2, 0.65, z],
          [x + (end * width) / 2, 1.5, z],
          0.03,
          m.rust,
        );
    }
  }
  const workshop = annex(-10, "Technology workshop");
  // A service bench supports the disassemblable communications device.
  box(workshop, [0, 1.65, 0.1], [4.7, 0.18, 2.1], m.wood);
  for (const x of [-2, 2])
    for (const z of [-0.7, 0.9])
      box(workshop, [x, 1.08, z], [0.12, 1.0, 0.12], m.metal);
  const workshopLight = detailAnnex(workshop, m, "workshop");
  const core = createSignalCore(workshop, m);
  // A fan is a real rotating assembly, not a texture.
  const fan = new THREE.Group();
  fan.position.set(1.9, 3.8, -2.34);
  workshop.add(fan);
  for (let i = 0; i < 4; i++) {
    const blade = box(fan, [0, 0, 0], [0.65, 0.12, 0.08], m.metal);
    blade.rotation.z = (i * Math.PI) / 2;
    blade.position.set(
      Math.cos((i * Math.PI) / 2) * 0.26,
      Math.sin((i * Math.PI) / 2) * 0.26,
      0,
    );
  }
  const study = annex(-19, "Learning desk");
  box(study, [0, 1.6, 0.1], [4, 0.18, 1.8], m.wood);
  for (const x of [-1.6, 1.6])
    for (const z of [-0.5, 0.7])
      box(study, [x, 1.04, z], [0.12, 1, 0.12], m.metal);
  // Open notebook with a separately hinged paper cover.
  box(study, [0, 1.73, 0.35], [1.1, 0.07, 0.8], m.label);
  const page = new THREE.Group();
  page.position.set(-0.55, 1.78, 0.35);
  study.add(page);
  box(page, [0.55, 0, 0], [1.1, 0.018, 0.8], m.dish);
  bar(study, [0.85, 1.73, 0.55], [1.45, 1.73, 0.2], 0.025, m.dark);
  // Articulated lamp and shade.
  box(study, [-1.25, 1.76, -0.2], [0.4, 0.08, 0.4], m.metal);
  bar(study, [-1.25, 1.8, -0.2], [-1.5, 2.55, -0.3], 0.04, m.metal);
  bar(study, [-1.5, 2.55, -0.3], [-0.9, 2.9, -0.2], 0.04, m.rust);
  const shade = new THREE.Mesh(
    new THREE.ConeGeometry(0.32, 0.4, 16, 1, true),
    m.metal,
  );
  shade.position.set(-0.9, 2.76, -0.2);
  study.add(shade);
  const bulb = box(study, [-0.9, 2.56, -0.2], [0.25, 0.04, 0.25], m.lamp);
  for (let i = 0; i < 4; i++)
    box(
      study,
      [1.25, 1.8 + i * 0.14, -0.15],
      [0.85, 0.12, 0.65],
      i % 2 ? m.label : m.glass,
    );
  const studyLight = detailAnnex(study, m, "study");
  const education = createEducationStudy(study, m, page, bulb, requestFrame);
  box(study, [-1.65, 1.1, 1.55], [1, 0.17, 0.85], m.dark);
  box(study, [-1.65, 1.75, 1.95], [1, 1.15, 0.13], m.glass);
  return {
    core,
    education,
    update(time, chapter, reduced, night = 0) {
      workshopLight.intensity = (chapter === "stack" ? 12 : 5) + night * 13;
      studyLight.intensity = (chapter === "education" ? 2 : 5) + night * 9;
      education.night = night;
      fan.rotation.z = reduced ? 0 : time * 1.5;
      page.rotation.z = chapter === "education" ? -0.16 : -0.025;
    },
  };
}
