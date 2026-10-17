import * as THREE from "../vendor/three.module.js";
import { seededRandom } from "./geometry.js";

// A lightweight, articulated character built from geometry, not a portrait plane.
// The reference informs the swept hair, brows, warm complexion, shirt and chain.
function floralFabric() {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#e9e5d8";
  ctx.fillRect(0, 0, 512, 512);
  const random = seededRandom(85);
  for (let i = 0; i < 145; i++) {
    const x = random() * 512,
      y = random() * 512;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(random() * Math.PI * 2);
    ctx.strokeStyle = "#34434d";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, 12);
    ctx.quadraticCurveTo(8, 0, -2, -19);
    ctx.stroke();
    ctx.fillStyle = i % 3 ? "#253641" : "#5f7076";
    for (let leaf = 0; leaf < 5; leaf++) {
      const a = leaf * Math.PI * 0.78;
      ctx.beginPath();
      ctx.ellipse(
        Math.cos(a) * 7,
        -8 + Math.sin(a) * 9,
        3 + random() * 3,
        7,
        a,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.restore();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export function createOperator() {
  const root = new THREE.Group();
  root.name = "Steven — station operator";
  root.position.set(0.92, 0.92, 3.55);
  root.rotation.y = 0.32;
  // Adult proportions for the 5′9″ reference: about 6¾ heads tall. Keep the
  // station footprint while lengthening the legs and reducing the oversized head.
  root.scale.setScalar(0.93);
  const mat = (color, roughness = 0.8, extra = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness, ...extra });
  const skin = mat(0xc28e68, 0.72),
    skinShadow = mat(0xa66d50),
    lips = mat(0x9c6256),
    hair = mat(0x171c22, 0.92),
    hairSheen = mat(0x1c2229, 0.92),
    navy = mat(0x253340),
    shoe = mat(0x202b31, 0.55),
    sole = mat(0xc4c1af),
    shirt = mat(0xffffff, 0.95, { map: floralFabric() }),
    shirtEdge = mat(0xd9d6c8),
    gold = mat(0xd5ad60, 0.3, { metalness: 0.78 }),
    ivory = mat(0xe5dfcc),
    iris = mat(0x352e29, 0.4),
    black = mat(0x111b21, 0.4);
  const unitSphere = new THREE.SphereGeometry(1, 24, 18);
  const mesh = (geometry, material, position, scale, parent = root) => {
    const m = new THREE.Mesh(geometry, material);
    m.position.set(...position);
    if (scale) m.scale.set(...scale);
    m.castShadow = m.receiveShadow = true;
    parent.add(m);
    return m;
  };
  const oval = (position, scale, material, parent = root) =>
    mesh(unitSphere, material, position, scale, parent);
  const tube = (points, radius, material, parent = root) => {
    const curve = new THREE.CatmullRomCurve3(
      points.map((p) => new THREE.Vector3(...p)),
    );
    return mesh(
      new THREE.TubeGeometry(curve, 16, radius, 6, false),
      material,
      [0, 0, 0],
      null,
      parent,
    );
  };
  const limb = (a, b, top, bottom, material, parent = root) => {
    const start = new THREE.Vector3(...a),
      end = new THREE.Vector3(...b);
    const m = mesh(
      new THREE.CylinderGeometry(top, bottom, start.distanceTo(end), 16),
      material,
      start.clone().add(end).multiplyScalar(0.5).toArray(),
      null,
      parent,
    );
    m.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      start.sub(end).normalize(),
    );
    return m;
  };
  const patch = (points, material, parent) => {
    const shape = new THREE.Shape();
    points.forEach(([x, y], i) =>
      i ? shape.lineTo(x, y) : shape.moveTo(x, y),
    );
    shape.closePath();
    return mesh(
      new THREE.ShapeGeometry(shape),
      material,
      [0, 0, 0],
      null,
      parent,
    );
  };

  // Weight rests on the right leg; the other foot turns slightly outward.
  for (const [side, x, z] of [
    [-1, -0.19, 0.08],
    [1, 0.18, -0.04],
  ]) {
    const hip = [x * 0.9, 1.67, 0],
      knee = [x + side * 0.025, 0.88, z];
    limb(hip, knee, 0.147, 0.115, navy);
    limb(knee, [x + side * 0.04, 0.15, z + 0.02], 0.115, 0.082, navy);
    oval(knee, [0.115, 0.13, 0.113], navy);
    const boot = new THREE.Group();
    boot.position.set(x + side * 0.04, 0, z + 0.07);
    boot.rotation.y = side * 0.12;
    root.add(boot);
    oval([0, 0.065, 0.05], [0.119, 0.055, 0.224], sole, boot);
    oval([0, 0.12, 0.03], [0.115, 0.095, 0.205], shoe, boot);
    for (let i = 0; i < 3; i++)
      tube(
        [
          [-0.065, 0.21, 0.06 + i * 0.035],
          [0, 0.225, 0.065 + i * 0.035],
          [0.065, 0.21, 0.06 + i * 0.035],
        ],
        0.005,
        navy,
        boot,
      );
  }
  const hips = oval([0, 1.63, 0], [0.27, 0.18, 0.165], navy);
  hips.name = "Narrow tailored hips";
  const upper = new THREE.Group();
  const torsoLift = 0.45;
  upper.position.y = torsoLift;
  root.add(upper);
  upper.name = "Breathing torso";

  // Tailored shirt: a continuous elliptical lathe, rolled sleeves and open collar.
  const profile = [
    [0.255, 1.13],
    [0.275, 1.2],
    [0.285, 1.42],
    [0.345, 1.7],
    [0.42, 1.88],
    [0.355, 1.98],
    [0.14, 2.03],
  ];
  const torso = new THREE.BufferGeometry();
  const shirtDepth = 0.52;
  const positions = [],
    uvs = [],
    indices = [];
  for (const [radius, y] of profile) {
    const opening = Math.max(0, Math.min(1, (y - 1.72) / 0.31)) * 0.72;
    for (let j = 0; j <= 40; j++) {
      const angle = opening + (j / 40) * (Math.PI * 2 - opening * 2);
      positions.push(
        Math.sin(angle) * radius,
        y,
        Math.cos(angle) * radius * shirtDepth,
      );
      uvs.push(j / 40, (y - 1.13) / 0.9);
    }
  }
  for (let i = 0; i < profile.length - 1; i++)
    for (let j = 0; j < 40; j++) {
      const a = i * 41 + j,
        b = a + 41;
      indices.push(a, a + 1, b, a + 1, b + 1, b);
    }
  torso.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  torso.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  torso.setIndex(indices);
  torso.computeVertexNormals();
  const torsoMesh = mesh(torso, shirt, [0, 0, 0], null, upper);
  torsoMesh.name = "Broad shoulders and tapered waist";
  limb([0, 1.99, 0], [0, 2.11, 0], 0.08, 0.1, skin, upper);
  const chest = patch(
    [
      [-0.155, 2.04],
      [0.155, 2.04],
      [0.072, 1.82],
      [0, 1.72],
      [-0.072, 1.82],
    ],
    skin,
    upper,
  );
  const collarLeft = patch(
    [
      [-0.14, 2.055],
      [-0.27, 1.98],
      [-0.17, 1.78],
      [-0.07, 1.88],
    ],
    shirtEdge,
    upper,
  );
  const collarRight = patch(
    [
      [0.14, 2.055],
      [0.27, 1.98],
      [0.17, 1.78],
      [0.07, 1.88],
    ],
    shirtEdge,
    upper,
  );
  // Fold the neckline onto the sloping chest rather than floating flat panels.
  for (const [piece, offset] of [
    [chest, 0],
    [collarLeft, 0.012],
    [collarRight, 0.012],
  ]) {
    const vertices = piece.geometry.attributes.position;
    for (let i = 0; i < vertices.count; i++) {
      const y = vertices.getY(i);
      let radius = profile.at(-1)[0];
      for (let ring = 1; ring < profile.length; ring++) {
        if (y > profile[ring][1]) continue;
        const [r0, y0] = profile[ring - 1],
          [r1, y1] = profile[ring];
        const mix = Math.max(0, Math.min(1, (y - y0) / (y1 - y0)));
        radius = r0 + (r1 - r0) * mix;
        break;
      }
      const x = vertices.getX(i);
      vertices.setZ(
        i,
        Math.sqrt(Math.max(0, radius * radius - x * x)) * shirtDepth +
          offset -
          (piece === chest ? 0.012 : 0),
      );
    }
    piece.geometry.computeVertexNormals();
  }
  tube(
    [
      [-0.13, 2.055, 0.13],
      [-0.105, 1.99, 0.19],
      [0, 1.955, 0.208],
      [0.105, 1.99, 0.19],
      [0.13, 2.055, 0.13],
    ],
    0.009,
    gold,
    upper,
  );
  tube(
    [
      [0, 1.7, 0.185],
      [0.012, 1.45, 0.157],
      [0.015, 1.19, 0.144],
    ],
    0.007,
    shirtEdge,
    upper,
  );
  for (let i = 0; i < 3; i++)
    oval(
      [0.015, 1.62 - i * 0.17, 0.174 - i * 0.011],
      [0.015, 0.015, 0.009],
      ivory,
      upper,
    );

  // Left hand rests on the terminal frame; right hand sits at the pocket.
  for (const side of [-1, 1]) {
    const shoulder = [side * 0.39, 1.9, 0];
    const elbow = side < 0 ? [-0.6, 1.52, -0.53] : [0.59, 1.49, 0.05];
    const wrist = side < 0 ? [-0.9, 1.42, -0.94] : [0.34, 1.23, 0.24];
    oval(shoulder, [0.135, 0.085, 0.13], shirt, upper);
    const sleeveEnd = shoulder.map((v, i) => v + (elbow[i] - v) * 0.6);
    limb(shoulder, sleeveEnd, 0.135, 0.12, shirt, upper);
    limb(sleeveEnd, elbow, 0.103, 0.088, skin, upper);
    limb(
      sleeveEnd,
      sleeveEnd.map((v, i) => v + (elbow[i] - shoulder[i]) * 0.08),
      0.125,
      0.125,
      shirtEdge,
      upper,
    );
    oval(elbow, [0.088, 0.095, 0.088], skin, upper);
    limb(elbow, wrist, 0.088, 0.057, skin, upper);
    const hand = oval(
      [wrist[0], wrist[1] - 0.065, wrist[2] + 0.022],
      [0.065, 0.105, 0.04],
      skin,
      upper,
    );
    hand.rotation.z = side < 0 ? -0.3 : -0.65;
    oval(
      [wrist[0] - side * 0.057, wrist[1] - 0.025, wrist[2] + 0.045],
      [0.03, 0.06, 0.033],
      skin,
      upper,
    );
    if (side > 0) {
      limb([0.37, 1.26, 0.21], [0.4, 1.3, 0.18], 0.076, 0.076, shoe, upper);
      oval([0.405, 1.29, 0.246], [0.054, 0.05, 0.018], gold, upper);
    }
  }

  // Sculpted head with a tapered jaw, defined brows and softly hooded eyes.
  const head = new THREE.Group();
  head.position.set(0, 2.26, 0.025);
  head.scale.setScalar(0.58);
  upper.add(head);
  head.name = "Steven portrait and swept hair";
  const faceGeometry = new THREE.SphereGeometry(1, 32, 28);
  const p = faceGeometry.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i),
      x = p.getX(i),
      z = p.getZ(i);
    const jaw = y < -0.2 ? 1 - Math.min(1, (-y - 0.2) / 0.8) * 0.12 : 1;
    const front = Math.max(0, z);
    const chin =
      y < -0.55
        ? 0.023 * Math.sin(Math.min(1, (-y - 0.55) / 0.45) * Math.PI)
        : 0;
    // A softly tapered jaw and restrained cheekbone keep the portrait natural.
    const cheek =
      Math.exp(-((Math.abs(x) - 0.57) ** 2 / 0.08 + (y + 0.13) ** 2 / 0.09)) *
      0.012;
    p.setXYZ(i, x * 0.255 * jaw, y * 0.355, z * 0.224 + front * (chin + cheek));
  }
  faceGeometry.computeVertexNormals();
  mesh(faceGeometry, skin, [0, 0, 0], null, head);
  for (const side of [-1, 1]) {
    oval([side * 0.253, -0.015, -0.007], [0.049, 0.083, 0.044], skin, head);
    oval(
      [side * 0.277, -0.015, 0.013],
      [0.014, 0.045, 0.021],
      skinShadow,
      head,
    );
  }
  oval([0, -0.025, 0.213], [0.033, 0.095, 0.045], skin, head);
  oval([0, -0.1, 0.249], [0.041, 0.028, 0.036], skin, head);
  for (const side of [-1, 1])
    oval([side * 0.028, -0.108, 0.243], [0.024, 0.019, 0.025], skin, head);
  for (const side of [-1, 1])
    oval(
      [side * 0.026, -0.122, 0.269],
      [0.008, 0.004, 0.005],
      skinShadow,
      head,
    );
  tube(
    [
      [-0.071, -0.202, 0.173],
      [-0.03, -0.205, 0.193],
      [0, -0.2, 0.197],
      [0.03, -0.205, 0.193],
      [0.071, -0.198, 0.173],
    ],
    0.0055,
    lips,
    head,
  );
  oval([0, -0.218, 0.19], [0.045, 0.009, 0.01], lips, head);
  const eyes = [];
  for (const side of [-1, 1]) {
    const eye = new THREE.Group();
    eye.position.set(side * 0.108, 0.029, 0.192);
    eye.rotation.y = side * 0.2;
    eye.rotation.z = side * 0.035;
    head.add(eye);
    oval([0, 0, 0], [0.063, 0.021, 0.022], ivory, eye);
    oval([-0.005, 0.001, 0.02], [0.022, 0.021, 0.008], iris, eye);
    oval([-0.005, 0.001, 0.026], [0.01, 0.015, 0.003], black, eye);
    oval([-0.012, 0.009, 0.032], [0.005, 0.005, 0.002], ivory, eye);
    tube(
      [
        [-0.063, -0.002, 0.008],
        [-0.025, 0.021, 0.017],
        [0.025, 0.02, 0.017],
        [0.063, 0.003, 0.007],
      ],
      0.008,
      skinShadow,
      eye,
    );
    eyes.push(eye);
    tube(
      [
        [side * 0.044, 0.078, 0.207],
        [side * 0.1, 0.088, 0.201],
        [side * 0.16, 0.084, 0.169],
        [side * 0.194, 0.068, 0.138],
      ],
      0.012,
      hair,
      head,
    );
  }

  // The hair is an open cap at the hairline, with curved, tapered swept locks.
  const cap = new THREE.SphereGeometry(
    1,
    32,
    18,
    0,
    Math.PI * 2,
    0,
    Math.PI * 0.55,
  );
  // Raise the front hairline into an asymmetric fringe rather than a straight
  // helmet edge; the swept locks provide the lower strands around the temples.
  const capVertices = cap.attributes.position;
  for (let i = 0; i < capVertices.count; i++) {
    const x = capVertices.getX(i),
      y = capVertices.getY(i),
      z = capVertices.getZ(i);
    const theta = Math.acos(Math.max(-1, Math.min(1, y)));
    const radius = Math.hypot(x, z);
    if (radius < 0.00001) continue;
    const front = Math.max(0, z / radius) ** 3;
    const angle = theta * (1 - front * 0.25);
    const scale = Math.sin(angle) / radius;
    capVertices.setXYZ(i, x * scale, Math.cos(angle), z * scale);
  }
  cap.computeVertexNormals();
  mesh(cap, hair, [0, 0.13, -0.025], [0.28, 0.29, 0.25], head);
  const random = seededRandom(427);
  for (let i = 0; i < 24; i++) {
    const side = i < 12 ? -1 : 1;
    const row = (i % 12) / 11;
    // Two soft curtains sweep outward from a slightly off-center part.
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.015 + side * row * 0.025, 0.35, -0.1 + row * 0.1),
      new THREE.Vector3(
        side * (0.1 + row * 0.08),
        0.37 + Math.sin(row * Math.PI) * 0.02,
        0.1,
      ),
      new THREE.Vector3(side * (0.16 + row * 0.07), 0.2 - row * 0.025, 0.225),
      new THREE.Vector3(
        side * (0.19 + row * 0.07),
        0.07 + row * 0.06 + (side > 0 ? 0.02 : 0),
        0.18 - row * 0.02,
      ),
    ]);
    const lock = new THREE.TubeGeometry(
      curve,
      18,
      0.015 + random() * 0.009,
      6,
      false,
    );
    // Taper each strand at its tip, avoiding a blunt cylindrical fringe.
    const a = lock.attributes.position;
    for (let j = 0; j < a.count; j++) {
      const t = Math.floor(j / 7) / 18;
      const center = curve.getPointAt(t);
      const factor = 0.08 + 0.92 * Math.sin(Math.PI * (0.15 + t * 0.85));
      a.setXYZ(
        j,
        center.x + (a.getX(j) - center.x) * factor,
        center.y + (a.getY(j) - center.y) * factor,
        center.z + (a.getZ(j) - center.z) * factor,
      );
    }
    lock.computeVertexNormals();
    const strand = mesh(
      lock,
      i % 7 === 0 ? hairSheen : hair,
      [0, 0, 0],
      null,
      head,
    );
    strand.castShadow = false;
  }
  tube(
    [
      [0.012, 0.417, -0.04],
      [0.012, 0.409, 0.02],
      [0.015, 0.385, 0.09],
      [0.02, 0.344, 0.145],
    ],
    0.003,
    skinShadow,
    head,
  );
  for (let i = 0; i < 6; i++) {
    const side = i < 3 ? -1 : 1,
      row = i % 3;
    tube(
      [
        [side * 0.18, 0.28, -0.08 - row * 0.025],
        [side * 0.25, 0.17, -0.07 - row * 0.025],
        [side * 0.26, 0.02, -0.04 - row * 0.025],
      ],
      0.02,
      i % 3 ? hair : hairSheen,
      head,
    );
  }

  return {
    root,
    head,
    update(time, { reduced = false, uplink = false, dt = 1 / 60 } = {}) {
      const t = reduced ? 0 : time;
      upper.position.y = torsoLift + Math.sin(t * 1.45) * 0.008;
      upper.rotation.z = -0.025 + Math.sin(t * 0.45) * 0.006;
      const targetY = uplink ? -0.32 : 0.2;
      const targetX = uplink ? -0.3 : -0.025;
      head.rotation.y = reduced
        ? 0.2
        : THREE.MathUtils.damp(head.rotation.y, targetY, 3, dt);
      head.rotation.x = reduced
        ? -0.025
        : THREE.MathUtils.damp(head.rotation.x, targetX, 3, dt);
      const phase = t % 6.8;
      const blink =
        !reduced && phase > 6.58
          ? Math.max(0.08, 1 - Math.sin(((phase - 6.58) / 0.22) * Math.PI))
          : 1;
      for (const eye of eyes) eye.scale.y = blink;
    },
  };
}
