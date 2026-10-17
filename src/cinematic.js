import * as THREE from "../vendor/three.module.js";
import { seededRandom } from "./geometry.js";

// One shared bevelled primitive keeps edge highlights inexpensive across the station.
let unitBox;
export function beveledBox() {
  if (unitBox) return unitBox;
  const shape = new THREE.Shape();
  shape.moveTo(-0.48, -0.48);
  shape.lineTo(0.48, -0.48);
  shape.lineTo(0.48, 0.48);
  shape.lineTo(-0.48, 0.48);
  shape.closePath();
  unitBox = new THREE.ExtrudeGeometry(shape, {
    depth: 0.96,
    steps: 1,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 2,
    curveSegments: 1,
  });
  unitBox.translate(0, 0, -0.48);
  // Extrusion UVs are world coordinates; restore the unit-box face mapping so
  // project screens and academic papers keep their full readable texture.
  const positions = unitBox.attributes.position,
    normals = unitBox.attributes.normal,
    uv = unitBox.attributes.uv;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i),
      y = positions.getY(i),
      z = positions.getZ(i);
    const nx = normals.getX(i),
      ny = normals.getY(i),
      nz = normals.getZ(i);
    if (Math.abs(nz) >= Math.abs(nx) && Math.abs(nz) >= Math.abs(ny))
      uv.setXY(i, nz > 0 ? x + 0.5 : 0.5 - x, y + 0.5);
    else if (Math.abs(nx) >= Math.abs(ny))
      uv.setXY(i, nx > 0 ? 0.5 - z : z + 0.5, y + 0.5);
    else uv.setXY(i, x + 0.5, ny > 0 ? 0.5 - z : z + 0.5);
  }
  return unitBox;
}

export function studioReflections(renderer, scene) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 0, 256);
  gradient.addColorStop(0, "#608ca5");
  gradient.addColorStop(0.46, "#c4dce0");
  gradient.addColorStop(0.55, "#edd6a6");
  gradient.addColorStop(1, "#253d40");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 256);
  const glow = ctx.createRadialGradient(110, 85, 0, 110, 85, 85);
  glow.addColorStop(0, "rgba(255,237,194,1)");
  glow.addColorStop(0.25, "rgba(255,230,173,.8)");
  glow.addColorStop(1, "rgba(255,230,173,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 512, 256);
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.mapping = THREE.EquirectangularReflectionMapping;
  const generator = new THREE.PMREMGenerator(renderer);
  const target = generator.fromEquirectangular(map);
  scene.environment = target.texture;
  generator.dispose();
  map.dispose();
  return target;
}

export function addStationDetails(model) {
  const m = model.materials,
    root = model.root;
  const geometry = beveledBox();
  function box(parent, xyz, size, material) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...xyz);
    mesh.scale.set(...size);
    mesh.castShadow = mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  function tube(parent, points, radius, material) {
    const mesh = new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))),
        24,
        radius,
        6,
        false,
      ),
      material,
    );
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  }
  function fasteners(parent, positions, radius = 0.045) {
    const mesh = new THREE.InstancedMesh(
      new THREE.SphereGeometry(radius, 8, 6),
      m.metal,
      positions.length,
    );
    const transform = new THREE.Object3D();
    positions.forEach((p, i) => {
      transform.position.set(...p);
      transform.scale.set(1, 1, 0.45);
      transform.updateMatrix();
      mesh.setMatrixAt(i, transform.matrix);
    });
    parent.add(mesh);
    return mesh;
  }
  // Reflector backside trusses, rim rivets, and receiver cooling collars.
  fasteners(
    model.tilt,
    Array.from({ length: 48 }, (_, i) => {
      const a = (i / 48) * Math.PI * 2;
      return [Math.cos(a) * 3.62, Math.sin(a) * 3.62, 1.06];
    }),
    0.035,
  );
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const points = Array.from({ length: 13 }, (_, j) => {
      const r = 0.4 + (j / 12) * 3.22;
      return [Math.cos(a) * r, Math.sin(a) * r, 1.08 * (r / 3.7) ** 2 - 0.11];
    });
    tube(model.tilt, points, 0.035, m.lightConcrete);
  }
  for (const z of [3.7, 3.8, 3.9, 4.0]) {
    const collar = new THREE.Mesh(
      new THREE.TorusGeometry(0.215, 0.026, 6, 24),
      m.metal,
    );
    collar.position.z = z;
    model.tilt.add(collar);
  }
  tube(
    model.yaw,
    [
      [-0.65, -0.3, -0.5],
      [-0.85, -1.1, -0.7],
      [0.25, -1.3, -0.65],
      [0.6, -0.5, -0.5],
    ],
    0.045,
    m.dark,
  );
  fasteners(
    root,
    Array.from({ length: 16 }, (_, i) => {
      const a = (i / 16) * Math.PI * 2;
      return [1.7 + Math.cos(a) * 0.72, 9.12, -1.45 + Math.sin(a) * 0.72];
    }),
    0.055,
  );
  // Parapet coping, window trim, drainpipes, roof seams, and service plates.
  for (const x of [0.58, 4.02])
    box(root, [x, 8.96, -1.5], [0.1, 0.12, 3.85], m.label);
  for (const z of [-3.36, 0.36])
    box(root, [2.3, 8.96, z], [3.5, 0.12, 0.1], m.label);
  for (const y of [4.7, 6.8]) {
    box(root, [3.7, y - 0.43, 0.43], [0.43, 0.1, 0.22], m.lightConcrete);
    box(root, [3.7, y + 0.43, 0.43], [0.43, 0.08, 0.16], m.lightConcrete);
  }
  tube(
    root,
    [
      [4.08, 8.85, -3.2],
      [4.2, 8.6, -3.3],
      [4.2, 1.15, -3.3],
      [4.5, 0.9, -3.3],
    ],
    0.065,
    m.rust,
  );
  for (const y of [2, 4, 6, 8])
    box(root, [4.2, y, -3.3], [0.19, 0.08, 0.18], m.metal);
  box(root, [2.2, 3.25, 1.64], [0.62, 0.1, 0.03], m.label);
  for (let z = -3; z < 1.5; z += 0.4)
    box(root, [-1.1, 3.95, z], [5.6, 0.022, 0.025], m.darkConcrete);
  for (const x of [-3.72, 0.45]) {
    box(root, [x, 3.4, 1.56], [0.22, 0.35, 0.035], m.metal);
    fasteners(
      root,
      [
        [x, 3.51, 1.59],
        [x, 3.29, 1.59],
      ],
      0.025,
    );
  }
  // Pressure gauge, tank bands, and a shut-off wheel.
  for (const y of [1.1, 2.1]) {
    const band = new THREE.Mesh(
      new THREE.TorusGeometry(0.575, 0.035, 6, 32),
      m.rust,
    );
    band.rotation.x = Math.PI / 2;
    band.position.set(5.05, y, -0.7);
    root.add(band);
  }
  const gauge = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.15, 0.08, 24),
    m.label,
  );
  gauge.rotation.x = Math.PI / 2;
  gauge.position.set(5.05, 2, -0.1);
  root.add(gauge);
  box(root, [5.05, 2.02, -0.045], [0.016, 0.12, 0.014], m.dark).rotation.z =
    -0.5;
  // A few hardy coastal grasses soften the hard engineering silhouette.
  const grass = new THREE.MeshStandardMaterial({
    color: 0x70865b,
    roughness: 1,
    side: THREE.DoubleSide,
  });
  const random = seededRandom(612);
  const blades = new THREE.InstancedMesh(
    new THREE.PlaneGeometry(1, 1),
    grass,
    100,
  );
  const tr = new THREE.Object3D();
  for (let i = 0; i < 100; i++) {
    const a = random() * Math.PI * 2,
      r = 5.7 + random() * 1.8;
    tr.position.set(
      Math.cos(a) * r,
      -0.15 + random() * 0.2,
      Math.sin(a) * r * 0.8,
    );
    tr.rotation.set(-0.2 + random() * 0.4, a + random(), -0.2 + random() * 0.4);
    tr.scale.set(0.045 + random() * 0.055, 0.18 + random() * 0.28, 1);
    tr.updateMatrix();
    blades.setMatrixAt(i, tr.matrix);
  }
  root.add(blades);
  const foliage = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(1, 1),
    new THREE.MeshStandardMaterial({ color: 0x57765a, roughness: 1 }),
    64,
  );
  const flowers = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(0.035, 0),
    m.label,
    32,
  );
  for (let i = 0; i < 64; i++) {
    const a = (i / 64) * Math.PI * 2,
      r = 6.5 + random() * 1.2;
    tr.position.set(
      Math.cos(a) * r,
      -0.7 + random() * 0.4,
      Math.sin(a) * r * 0.8,
    );
    tr.rotation.set(random(), a, random());
    tr.scale.set(
      0.18 + random() * 0.22,
      0.25 + random() * 0.35,
      0.18 + random() * 0.25,
    );
    tr.updateMatrix();
    foliage.setMatrixAt(i, tr.matrix);
    if (i < 32) {
      tr.position.y += 0.35;
      tr.scale.set(1, 1, 1);
      tr.updateMatrix();
      flowers.setMatrixAt(i, tr.matrix);
    }
  }
  foliage.castShadow = foliage.receiveShadow = true;
  root.add(foliage, flowers);
  // Terminal hinge fasteners, monitor bezels and a small physical keyboard.
  fasteners(
    model.lid,
    [-1.28, -0.45, 0.45, 1.28].flatMap((x) => [
      [x, 0.1, 0.1],
      [x, 0.72, 0.1],
    ]),
    0.025,
  );
  const keyboard = new THREE.InstancedMesh(beveledBox(), m.label, 24);
  let keyIndex = 0;
  for (let row = 0; row < 3; row++)
    for (let col = 0; col < 8; col++) {
      tr.position.set(-2.3 + col * 0.14, 1.785, 2.99 + row * 0.08);
      tr.rotation.set(0, 0, 0);
      tr.scale.set(0.09, 0.022, 0.06);
      tr.updateMatrix();
      keyboard.setMatrixAt(keyIndex++, tr.matrix);
    }
  root.add(keyboard);
  // A small additive halo gives the practical bulbs a photographic falloff.
  const glowCanvas = document.createElement("canvas");
  glowCanvas.width = glowCanvas.height = 64;
  const glowContext = glowCanvas.getContext("2d");
  const glowGradient = glowContext.createRadialGradient(32, 32, 0, 32, 32, 32);
  glowGradient.addColorStop(0, "rgba(255,225,166,.8)");
  glowGradient.addColorStop(0.2, "rgba(255,198,110,.22)");
  glowGradient.addColorStop(1, "rgba(255,198,110,0)");
  glowContext.fillStyle = glowGradient;
  glowContext.fillRect(0, 0, 64, 64);
  const glowMap = new THREE.CanvasTexture(glowCanvas);
  glowMap.colorSpace = THREE.SRGBColorSpace;
  const glowMaterial = new THREE.SpriteMaterial({
    map: glowMap,
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  model.lamps.forEach((light) => {
    const glow = new THREE.Sprite(glowMaterial);
    glow.scale.set(0.75, 0.75, 1);
    light.add(glow);
  });
  // All added dish pieces participate in aiming without intercepting other actions.
  model.tilt.traverse((o) => {
    if (o.isMesh) o.userData.action = "dish";
  });
}

export function detailAnnex(group, m, kind) {
  function box(xyz, size, mat = m.metal) {
    const mesh = new THREE.Mesh(beveledBox(), mat);
    mesh.position.set(...xyz);
    mesh.scale.set(...size);
    mesh.castShadow = mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  }
  // Raised standing seams and continuous fascia make the roof read as sheet metal.
  for (let x = -3; x <= 3; x += 0.32)
    box([x, 4.97, -0.2], [0.035, 0.06, 5.6], m.rust);
  for (const z of [-3, 2.6]) box([0, 4.82, z], [6.5, 0.18, 0.12], m.rust);
  for (const x of [-2.75, 2.75]) {
    box([x, 0.76, 2.45], [0.32, 0.08, 0.32]);
    box([x, 4.66, 2.45], [0.28, 0.2, 0.28]);
  }
  for (let x = -2.6; x < 2.7; x += 1.1)
    box([x, 1.05, -2.43], [0.012, 0.65, 0.018], m.darkConcrete);
  // Under-eave practical illumination supports the camera's close-up views.
  const practical = new THREE.PointLight(0xffcc8d, 9, 7, 2);
  practical.position.set(0, 4.35, 0.3);
  group.add(practical);
  // Conduits connect the fixture to a real wall-mounted junction box.
  box([2.4, 2.6, -2.38], [0.4, 0.55, 0.13]);
  box([2.4, 3.6, -2.4], [0.035, 1.6, 0.04], m.rust);
  box([1.2, 4.4, -2.4], [2.4, 0.035, 0.04], m.rust);
  for (const z of [-0.65, -0.3, 0.05, 0.4, 0.75])
    box(
      [0, 1.747, z],
      [kind === "workshop" ? 4.65 : 3.95, 0.008, 0.008],
      m.darkConcrete,
    );
  // Bench drawers and foot braces, away from the interactive surfaces.
  box([0, 1.35, -0.55], [3.6, 0.4, 0.18], m.metal);
  for (const x of [-1.2, 0, 1.2])
    box([x, 1.36, -0.43], [0.35, 0.04, 0.04], m.label);
  box([0, 0.85, -0.55], [3.8, 0.1, 0.1], m.rust);
  if (kind === "workshop") {
    // Small hand tools on the left, coiled cable and ceramic insulators to the right.
    for (let i = 0; i < 3; i++) {
      box(
        [-2.3 + i * 0.16, 1.79, 0.5],
        [0.055, 0.05, 0.65],
        i % 2 ? m.rust : m.metal,
      );
      box([-2.3 + i * 0.16, 1.8, 0.23], [0.11, 0.07, 0.16], m.label);
    }
    for (let i = 0; i < 4; i++) {
      const coil = new THREE.Mesh(
        new THREE.TorusGeometry(0.22 + i * 0.018, 0.022, 6, 32),
        m.dark,
      );
      coil.rotation.x = Math.PI / 2;
      coil.position.set(1.98, 1.79 + i * 0.025, -0.25);
      group.add(coil);
    }
    box([0, 3.35, -2.4], [2.4, 0.8, 0.08], m.darkConcrete);
    for (let i = 0; i < 7; i++)
      box([-0.9 + i * 0.3, 3.35, -2.31], [0.04, 0.35, 0.06], m.label);
  } else {
    // A ceramic mug, pencil cup, notebook page edges, and chair cross braces.
    const ceramic = new THREE.MeshStandardMaterial({
      color: 0x8fada7,
      roughness: 0.33,
    });
    const mug = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.11, 0.25, 20, 1, true),
      ceramic,
    );
    mug.position.set(1.55, 1.85, 0.55);
    mug.castShadow = true;
    group.add(mug);
    const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.115, 20), m.dark);
    coffee.rotation.x = -Math.PI / 2;
    coffee.position.set(1.55, 1.95, 0.55);
    group.add(coffee);
    const handle = new THREE.Mesh(
      new THREE.TorusGeometry(0.085, 0.025, 6, 20),
      ceramic,
    );
    handle.position.set(1.7, 1.87, 0.55);
    group.add(handle);
    for (let i = 0; i < 4; i++)
      box([-0.45, 1.75 + i * 0.012, 0.4], [1.05, 0.006, 0.72], m.label);
    for (let i = 0; i < 3; i++)
      box(
        [1.75 + i * 0.08, 2.0, -0.55],
        [0.025, 0.48, 0.025],
        i % 2 ? m.rust : m.label,
      ).rotation.z = 0.1 - i * 0.1;
    box([-1.65, 0.75, 1.65], [0.95, 0.06, 0.06]);
  }
  return practical;
}
