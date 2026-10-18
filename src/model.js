import * as THREE from "../vendor/three.module.js";
import { beveledBox, addStationDetails } from "./cinematic.js";
import { projects, projectTexture } from "./projects.js";
import {
  dishGeometry,
  cliffGeometry,
  radians,
  seededRandom,
} from "./geometry.js";

export function createStation(requestFrame) {
  const root = new THREE.Group();
  root.name = "Signal station";
  const random = seededRandom(197);
  const concreteTexture = surfaceTexture("concrete");
  const metalTexture = surfaceTexture("metal");
  const concreteBump = concreteTexture.clone();
  concreteBump.colorSpace = THREE.NoColorSpace;
  const metalBump = metalTexture.clone();
  metalBump.colorSpace = THREE.NoColorSpace;
  const materials = {
    concrete: new THREE.MeshStandardMaterial({
      color: 0xb5b6a0,
      map: concreteTexture,
      bumpMap: concreteBump,
      bumpScale: 0.025,
      roughness: 0.96,
    }),
    lightConcrete: new THREE.MeshStandardMaterial({
      color: 0xd2c9b2,
      map: concreteTexture,
      bumpMap: concreteBump,
      bumpScale: 0.025,
      roughness: 0.93,
    }),
    darkConcrete: new THREE.MeshStandardMaterial({
      color: 0x616a64,
      map: concreteTexture,
      bumpMap: concreteBump,
      bumpScale: 0.025,
      roughness: 1,
    }),
    rust: new THREE.MeshStandardMaterial({
      color: 0x99563c,
      map: metalTexture,
      bumpMap: metalBump,
      bumpScale: 0.012,
      roughness: 0.58,
      metalness: 0.35,
    }),
    wood: new THREE.MeshStandardMaterial({
      color: 0x8c6342,
      map: metalTexture,
      roughness: 0.78,
      bumpMap: metalBump,
      bumpScale: 0.018,
    }),
    metal: new THREE.MeshStandardMaterial({
      color: 0x354146,
      roughness: 0.48,
      metalness: 0.55,
    }),
    dark: new THREE.MeshStandardMaterial({ color: 0x1c2a2b, roughness: 0.9 }),
    dish: new THREE.MeshStandardMaterial({
      color: 0xf0dfb8,
      map: concreteTexture,
      bumpMap: concreteBump,
      bumpScale: 0.025,
      roughness: 0.48,
      metalness: 0.15,
      side: THREE.DoubleSide,
    }),
    rock: new THREE.MeshStandardMaterial({
      color: 0x52686a,
      roughness: 1,
      flatShading: true,
    }),
    screen: new THREE.MeshStandardMaterial({
      color: 0xeaa75b,
      emissive: 0xf2aa4e,
      emissiveIntensity: 1.3,
      roughness: 0.45,
    }),
    lamp: new THREE.MeshStandardMaterial({
      color: 0xffcb79,
      emissive: 0xffa742,
      emissiveIntensity: 2.0,
    }),
    glass: new THREE.MeshStandardMaterial({
      color: 0x6b8d8d,
      metalness: 0.45,
      roughness: 0.28,
    }),
    moss: new THREE.MeshStandardMaterial({ color: 0x566149, roughness: 1 }),
    label: new THREE.MeshStandardMaterial({ color: 0xd5c9ab, roughness: 0.9 }),
  };
  const boxG = beveledBox();
  const cylinderG = new THREE.CylinderGeometry(1, 1, 1, 12);
  const lamps = [],
    lightMeshes = [],
    screenMeshes = [],
    selectable = [];
  function box(x, y, z, w, h, d, mat = materials.concrete, parent = root) {
    const m = new THREE.Mesh(boxG, mat);
    m.position.set(x, y, z);
    m.scale.set(w, h, d);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  function cylinder(
    x,
    y,
    z,
    r,
    h,
    mat = materials.metal,
    parent = root,
    segments = 12,
  ) {
    const m = new THREE.Mesh(
      segments === 12
        ? cylinderG
        : new THREE.CylinderGeometry(1, 1, 1, segments),
      mat,
    );
    m.position.set(x, y, z);
    m.scale.set(r, h, r);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  function beam(a, b, r = 0.035, mat = materials.rust, parent = root) {
    const av = new THREE.Vector3(...a),
      bv = new THREE.Vector3(...b),
      v = bv.clone().sub(av);
    const m = new THREE.Mesh(cylinderG, mat);
    m.position.copy(av).add(bv).multiplyScalar(0.5);
    m.scale.set(r, v.length(), r);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.normalize());
    m.castShadow = true;
    parent.add(m);
    return m;
  }
  function rail(a, b, y = 1.9, parent = root) {
    const length = Math.hypot(b[0] - a[0], b[1] - a[1]),
      steps = Math.ceil(length / 0.9);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps,
        x = a[0] + (b[0] - a[0]) * t,
        z = a[1] + (b[1] - a[1]) * t;
      beam([x, y - 0.9, z], [x, y + 0.05, z], 0.026, materials.rust, parent);
    }
    beam([a[0], y, a[1]], [b[0], y, b[1]], 0.035, materials.rust, parent);
    beam(
      [a[0], y - 0.43, a[1]],
      [b[0], y - 0.43, b[1]],
      0.022,
      materials.rust,
      parent,
    );
  }
  function lamp(x, y, z, parent = root) {
    box(x, y, z, 0.16, 0.25, 0.13, materials.lamp, parent);
    lightMeshes.push(parent.children.at(-1));
    const light = new THREE.PointLight(0xffad4e, 6, 4, 2);
    light.position.set(x, y, z + 0.22);
    parent.add(light);
    lamps.push(light);
    box(x, y + 0.17, z, 0.3, 0.06, 0.24, materials.dark, parent);
  }

  // A layered, irregular rock foundation; no photographic background geometry.
  const cliff = new THREE.Mesh(cliffGeometry(2, 8.2, 9), materials.rock);
  cliff.position.set(0.5, -0.1, 0.2);
  cliff.castShadow = true;
  cliff.receiveShadow = true;
  root.add(cliff);
  for (let i = 0; i < 22; i++) {
    const a = random() * Math.PI * 2,
      r = 5 + random() * 4;
    const rock = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.55 + random() * 1.8, 0),
      materials.rock,
    );
    rock.position.set(
      Math.cos(a) * r,
      -1.6 - random() * 3,
      Math.sin(a) * r * 0.85,
    );
    rock.scale.set(0.7, 1.8 + random() * 2, 0.65);
    rock.rotation.set(random(), random(), random());
    rock.castShadow = true;
    root.add(rock);
  }
  for (let i = 0; i < 20; i++) {
    const a = random() * Math.PI * 2,
      r = 4 + random() * 3;
    box(
      Math.cos(a) * r,
      -0.04,
      Math.sin(a) * r * 0.8,
      0.4 + random(),
      0.06,
      0.25 + random() * 0.5,
      materials.moss,
    );
  }

  // Terraces with thickness, support columns, slab seams, and a guarded edge.
  box(0, 0.35, 1.5, 11, 0.8, 7.3);
  box(0, 0.81, 1.5, 11.15, 0.16, 7.4, materials.lightConcrete);
  for (const x of [-4.5, -1.5, 2.5, 4.7])
    box(x, -1.2, 3.8, 0.65, 3, 0.7, materials.darkConcrete);
  for (let x = -4; x < 5; x += 1.4)
    box(x, 0.903, 3.4, 0.013, 0.008, 3.3, materials.darkConcrete);
  rail([-5.5, -2.1], [-5.5, 5.1]);
  rail([-5.5, 5.1], [2.6, 5.1]);
  rail([4.2, 5.1], [5.5, 5.1]);
  rail([5.5, 5.1], [5.5, -2.1]);
  box(0.2, 2.25, -0.8, 8, 3, 4.6);
  box(0.2, 3.83, -0.8, 8.25, 0.2, 4.8, materials.lightConcrete);
  // Concrete panel joints are geometry and stay stable from every camera angle.
  for (const x of [-3.2, -1.5, 0.2, 1.9, 3.6])
    box(x, 2.3, 1.51, 0.018, 2.8, 0.012, materials.darkConcrete);
  box(2.2, 2, 1.535, 1.3, 2.25, 0.06, materials.dark);
  box(2.2, 2, 1.58, 1.1, 2.1, 0.05, materials.metal);
  box(2.58, 2.03, 1.63, 0.06, 0.07, 0.08, materials.label);
  box(2.2, 3.28, 1.59, 1.15, 0.13, 0.04, materials.label);
  // Upper tower, vents, windows, and copper service pipes.
  box(2.3, 5.5, -1.5, 3.4, 6.5, 3.6);
  box(2.3, 8.84, -1.5, 3.6, 0.18, 3.8, materials.lightConcrete);
  for (let y = 3.5; y < 8.5; y += 1.4)
    box(2.3, y, 0.315, 3.38, 0.013, 0.01, materials.darkConcrete);
  for (const y of [4.7, 6.8]) {
    box(3.7, y, 0.34, 0.25, 0.75, 0.05, materials.dark);
    box(3.7, y, 0.38, 0.11, 0.6, 0.06, materials.lamp);
    lightMeshes.push(root.children.at(-1));
  }
  for (const y of [2, 2.3, 2.6, 2.9])
    box(-3.5, y, 1.54, 0.6, 0.07, 0.06, materials.dark);
  for (const x of [4.2, 4.45]) {
    beam([x, 0.9, -1], [x, 5.2, -1], 0.055, materials.rust);
    beam([x, 5.2, -1], [x - 0.8, 5.2, -1], 0.055, materials.rust);
  }
  rail([-3.9, -3.15], [-3.9, 1.35], 4.85);
  rail([-3.9, 1.35], [0.3, 1.35], 4.85);
  rail([-3.9, -3.15], [0.5, -3.15], 4.85);
  // Access ladder and cage.
  beam([-2.7, 0.9, 1.63], [-2.7, 4.35, 1.63], 0.035, materials.metal);
  beam([-2.15, 0.9, 1.63], [-2.15, 4.35, 1.63], 0.035, materials.metal);
  for (let y = 1.1; y <= 4.3; y += 0.29)
    beam([-2.7, y, 1.63], [-2.15, y, 1.63], 0.025, materials.metal);
  lamp(1.2, 2.7, 1.65);
  lamp(-4.85, 1.65, 2.1);
  lamp(4.9, 1.7, 4.5);

  // Main rotating azimuth ring and hinged parabolic reflector.
  cylinder(1.7, 8.98, -1.45, 0.85, 0.22, materials.metal);
  cylinder(1.7, 9.2, -1.45, 0.48, 0.38, materials.rust);
  beam([1.05, 9.1, -1.45], [1.05, 10.3, -0.5], 0.11, materials.rust);
  beam([2.35, 9.1, -1.45], [2.35, 10.3, -0.5], 0.11, materials.rust);
  beam([1.05, 10.3, -0.5], [2.35, 10.3, -0.5], 0.14, materials.metal);
  const yaw = new THREE.Group();
  yaw.position.set(1.7, 10.7, 0);
  root.add(yaw);
  yaw.name = "Dish azimuth";
  const tilt = new THREE.Group();
  yaw.add(tilt);
  tilt.name = "Dish elevation";
  box(-0.65, -0.4, -0.5, 0.18, 1.6, 0.22, materials.rust, yaw);
  box(0.65, -0.4, -0.5, 0.18, 1.6, 0.22, materials.rust, yaw);
  const reflector = new THREE.Mesh(dishGeometry(), materials.dish);
  reflector.castShadow = true;
  reflector.receiveShadow = true;
  tilt.add(reflector);
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(3.7, 0.045, 6, 96),
    materials.metal,
  );
  rim.position.z = 1.08;
  tilt.add(rim);
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2,
      points = [];
    for (let j = 0; j <= 20; j++) {
      const r = (j / 20) * 3.7;
      points.push(
        new THREE.Vector3(
          Math.cos(a) * r,
          Math.sin(a) * r,
          1.08 * (r / 3.7) ** 2 + 0.015,
        ),
      );
    }
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({
        color: 0x7a8274,
        transparent: true,
        opacity: 0.46,
      }),
    );
    tilt.add(line);
    if (i % 2 === 0)
      beam(
        [Math.cos(a) * 3.65, Math.sin(a) * 3.65, 1],
        [0, 0, -0.4],
        0.025,
        materials.metal,
        tilt,
      );
  }
  for (const r of [1.25, 2.45]) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.012, 4, 72),
      materials.metal,
    );
    ring.position.z = 1.08 * (r / 3.7) ** 2 + 0.02;
    tilt.add(ring);
  }
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.5;
    beam(
      [Math.cos(a) * 3.3, Math.sin(a) * 3.3, 0.87],
      [0, 0, 3.9],
      0.045,
      materials.metal,
      tilt,
    );
  }
  const receiver = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.28, 0.5, 12),
    materials.rust,
  );
  receiver.rotation.x = Math.PI / 2;
  receiver.position.z = 3.9;
  tilt.add(receiver);
  for (const child of [reflector, rim, receiver]) {
    child.userData.action = "dish";
    selectable.push(child);
  }

  // Control desk: individually hinged terminal lid and raised emissive displays.
  const consoleGroup = new THREE.Group();
  consoleGroup.position.set(-1.3, 0.91, 3.2);
  root.add(consoleGroup);
  box(0, 0.38, 0, 2.8, 0.75, 1.05, materials.rust, consoleGroup);
  box(0, 0.8, 0.04, 2.9, 0.12, 1.25, materials.dark, consoleGroup);
  for (const x of [-1.1, 1.1])
    box(x, -0.05, 0, 0.2, 0.2, 0.7, materials.metal, consoleGroup);
  const lid = new THREE.Group();
  lid.position.set(0, 0.83, -0.48);
  consoleGroup.add(lid);
  box(0, 0.75, 0, 2.8, 1.5, 0.16, materials.rust, lid);
  for (let index = 0; index < projects.length; index++) {
    const row = Math.floor(index / 3);
    const columns = Math.min(3, projects.length - row * 3);
    const x = ((index % 3) - (columns - 1) / 2) * 0.83;
    const y = 1.1 - Math.floor(index / 3) * 0.65;
    const displayTexture = projectTexture(index, requestFrame);
    // Screens emit their own colors, independent of sunlight and night lighting.
    const displayMat = new THREE.MeshBasicMaterial({
      map: displayTexture,
      toneMapped: false,
      fog: false,
    });
    box(x, y, 0.1, 0.79, 0.59, 0.025, materials.dark, lid);
    const screen = box(x, y, 0.12, 0.73, 0.52, 0.02, displayMat, lid);
    screenMeshes.push(screen);
  }
  for (let i = 0; i < 9; i++) {
    const b = box(
      -1.1 + i * 0.27,
      0.88,
      0.2,
      0.13,
      0.06,
      0.12,
      i % 3 === 0 ? materials.lamp : materials.metal,
      consoleGroup,
    );
    if (i % 3 === 0) lightMeshes.push(b);
  }
  for (let i = 0; i < 3; i++)
    cylinder(
      0.6 + i * 0.2,
      0.88,
      0.48,
      0.04,
      0.05,
      materials.label,
      consoleGroup,
    );
  consoleGroup.traverse((o) => {
    if (o.isMesh) {
      o.userData.action = "console";
      selectable.push(o);
    }
  });
  screenMeshes.forEach((screen, index) => {
    screen.userData.action = `project:${index}`;
  });
  lamp(0, 1.2, 0.65, consoleGroup);

  // Front access bridge: actual grated slats and a shallow stepped incline.
  const bridge = new THREE.Group();
  root.add(bridge);
  const start = new THREE.Vector3(3.5, 0.87, 5.1),
    end = new THREE.Vector3(11, -0.55, 9.5),
    direction = end.clone().sub(start),
    length = direction.length();
  const bridgeFrame = new THREE.Group();
  bridgeFrame.position.copy(start);
  bridgeFrame.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    direction.clone().normalize(),
  );
  bridge.add(bridgeFrame);
  for (const x of [-0.72, 0.72])
    box(x, -0.15, length / 2, 0.16, 0.28, length, materials.rust, bridgeFrame);
  for (let z = 0.05; z < length; z += 0.22)
    box(0, 0, z, 1.65, 0.06, 0.13, materials.rust, bridgeFrame);
  for (const x of [-0.8, 0.8]) {
    for (let z = 0.1; z <= length; z += 0.85)
      beam([x, 0, z], [x, 0.95, z], 0.025, materials.rust, bridgeFrame);
    beam([x, 0.95, 0], [x, 0.95, length], 0.035, materials.rust, bridgeFrame);
    beam([x, 0.5, 0], [x, 0.5, length], 0.023, materials.rust, bridgeFrame);
  }
  const landingRock = new THREE.Mesh(cliffGeometry(9, 2.6, 7), materials.rock);
  landingRock.position.set(11, -0.7, 9.5);
  landingRock.castShadow = true;
  root.add(landingRock);

  // Service tank, cable conduit, crates, utility rooftop equipment.
  cylinder(5.05, 1.6, -0.7, 0.57, 1.7, materials.metal);
  const cap = new THREE.Mesh(
    new THREE.SphereGeometry(0.57, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    materials.metal,
  );
  cap.position.set(5.05, 2.45, -0.7);
  root.add(cap);
  for (const x of [4.65, 5.45])
    box(x, 0.95, -0.7, 0.1, 0.35, 0.4, materials.dark);
  for (let i = 0; i < 3; i++) {
    box(-4.6, 0.99 + i * 0.42, -1.25, 0.75, 0.4, 0.6, materials.rust);
    box(-4.6, 0.99 + i * 0.42, -0.93, 0.65, 0.018, 0.015, materials.label);
  }
  box(-1, 4.15, -2, 0.95, 0.55, 1.2, materials.metal);
  for (let z = -2.5; z < -1.5; z += 0.12)
    box(-1, 4.44, z, 0.8, 0.025, 0.04, materials.dark);
  // A fan with visible moving blades under its safety ring.
  const fan = new THREE.Group();
  fan.position.set(-2.65, 2.55, 1.6);
  root.add(fan);
  const guard = new THREE.Mesh(
    new THREE.TorusGeometry(0.33, 0.025, 6, 32),
    materials.metal,
  );
  guard.position.z = 0.06;
  root.add(guard);
  guard.position.copy(fan.position);
  guard.position.z += 0.08;
  cylinder(0, 0, 0, 0.07, 0.1, materials.metal, fan).rotation.x = Math.PI / 2;
  for (let i = 0; i < 4; i++) {
    const blade = box(0, 0.15, 0, 0.16, 0.28, 0.025, materials.metal, fan);
    blade.position.set(
      Math.sin((i * Math.PI) / 2) * 0.15,
      Math.cos((i * Math.PI) / 2) * 0.15,
      0,
    );
    blade.rotation.z = (-i * Math.PI) / 2;
  }

  // Relay mast, wind instrument, a rotating warning lens, and signal pennant.
  beam([4.2, 3.9, -2.7], [4.2, 10.6, -2.7], 0.055, materials.metal);
  for (const y of [5, 6.5, 8, 9.5])
    beam([3.8, y, -2.7], [4.6, y, -2.7], 0.035, materials.metal);
  for (const x of [3.9, 4.5])
    beam([x, 7.5, -2.7], [x, 10.1, -2.7], 0.022, materials.metal);
  const cups = new THREE.Group();
  cups.position.set(4.2, 10.65, -2.7);
  root.add(cups);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    beam(
      [0, 0, 0],
      [Math.cos(a) * 0.4, 0, Math.sin(a) * 0.4],
      0.015,
      materials.metal,
      cups,
    );
    const cup = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 8, 6),
      materials.metal,
    );
    cup.position.set(Math.cos(a) * 0.4, 0, Math.sin(a) * 0.4);
    cups.add(cup);
  }
  const beacon = new THREE.Group();
  beacon.position.set(2.25, 9, -3.05);
  root.add(beacon);
  cylinder(0, 0, 0, 0.12, 0.16, materials.rust, beacon);
  box(0.08, 0.12, 0, 0.07, 0.13, 0.12, materials.lamp, beacon);
  lightMeshes.push(beacon.children.at(-1));
  const flagGeometry = new THREE.PlaneGeometry(0.8, 0.42, 12, 3);
  const flag = new THREE.Mesh(
    flagGeometry,
    new THREE.MeshStandardMaterial({
      color: 0xb56b3d,
      side: THREE.DoubleSide,
      roughness: 0.9,
    }),
  );
  flag.position.set(4.6, 9.7, -2.7);
  root.add(flag);
  const flagRest = flagGeometry.attributes.position.array.slice();
  // Heavy cable spanning the service wall.
  const cableCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3.4, 3, 1.6),
    new THREE.Vector3(-2, 2.3, 1.65),
    new THREE.Vector3(-0.5, 2.9, 1.62),
    new THREE.Vector3(1, 3.1, 1.62),
  ]);
  root.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(cableCurve, 24, 0.025, 5, false),
      materials.dark,
    ),
  );
  tilt.traverse((o) => {
    if (o.isMesh) o.userData.action = "dish";
  });
  root.position.x = 3.1;
  yaw.rotation.y = radians(25);
  tilt.rotation.x = -radians(38);
  lid.rotation.x = -0.15;
  const model = {
    root,
    yaw,
    tilt,
    lid,
    fan,
    cups,
    beacon,
    flag,
    flagRest,
    lamps,
    lightMeshes,
    screenMeshes,
    selectable,
    materials,
    anchors: {
      dish: new THREE.Vector3(1.7, 13, 0.3),
      console: new THREE.Vector3(-1.3, 2.8, 3.2),
    },
  };
  addStationDetails(model);
  return model;
}

function surfaceTexture(kind) {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const ctx = c.getContext("2d");
  const rand = seededRandom(kind === "metal" ? 33 : 42);
  ctx.fillStyle = kind === "metal" ? "#d0b8a0" : "#e2ded0";
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 22000; i++) {
    const x = rand() * 512,
      y = rand() * 512,
      a = rand() * 0.055;
    ctx.fillStyle = `rgba(25,35,32,${a})`;
    ctx.fillRect(x, y, rand() * 2 + 0.3, rand() * 2 + 0.3);
  }
  for (let i = 0; i < 24; i++) {
    ctx.strokeStyle = `rgba(53,46,31,${0.015 + rand() * 0.035})`;
    ctx.lineWidth = 0.5 + rand() * 1.8;
    ctx.beginPath();
    const x = rand() * 512,
      y = rand() * 512;
    ctx.moveTo(x, y);
    ctx.lineTo(x + rand() * 4 - 2, y + 10 + rand() * 90);
    ctx.stroke();
  }
  // Broad, translucent washes suggest salt weathering instead of uniform grit.
  for (let i = 0; i < 18; i++) {
    const x = rand() * 512,
      y = rand() * 512,
      r = 35 + rand() * 100;
    const wash = ctx.createRadialGradient(x, y, 0, x, y, r);
    wash.addColorStop(
      0,
      kind === "metal" ? "rgba(110,62,32,.10)" : "rgba(98,110,87,.07)",
    );
    wash.addColorStop(1, "rgba(98,110,87,0)");
    ctx.fillStyle = wash;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}
