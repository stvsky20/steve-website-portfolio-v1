import * as THREE from "../vendor/three.module.js";
import { beveledBox } from "./cinematic.js";
import { coreMotion } from "./core-motion.js";

export const coreTools = [
  {
    name: "Programming Languages",
    part: "Processor board",
    copy: "Application logic, web development, and data queries.",
    slots: ["Java", "Python", "JavaScript", "TypeScript", "SQL", "PHP"],
    groups: [{ label: "Web foundations", slots: ["HTML", "CSS"] }],
    evidence: "AYOS! & Mal-Ay: TypeScript · Trade Journal Pro: PHP & SQL.",
  },
  {
    name: "Web & UI Design",
    part: "Display module",
    copy: "Responsive interfaces, UI design, and mobile packaging.",
    slots: ["React", "Tailwind CSS", "WordPress", "Figma"],
    groups: [{ label: "Mobile packaging", slots: ["Capacitor 8"] }],
    evidence:
      "AYOS! & Laundrify: React · ESQUAKE: Figma prototypes · Mal-Ay: Android APK.",
  },
  {
    name: "Backend & Data",
    part: "Communications module",
    copy: "APIs, cloud databases, and persistent local storage.",
    slots: [
      "MySQL",
      "Supabase",
      "Firestore",
      "SQLite",
      "IndexedDB",
      "REST APIs",
      "Google APIs",
      "OpenAI",
    ],
    groups: [{ label: "Local development environment", slots: ["WAMP"] }],
    evidence:
      "Trade Journal Pro: MySQL · AYOS!: Firestore & APIs · Mal-Ay: SQLite / IndexedDB.",
  },
  {
    name: "Game Development",
    part: "Simulation module",
    copy: "From gameplay prototypes to playable earthquake-preparedness features.",
    slots: ["Godot", "GDScript"],
    evidence:
      "ESQUAKE · Project Manager & Game Developer · Capstone for CDRRMO Baguio City.",
  },
  {
    name: "Project Management",
    part: "Routing board",
    copy: "Requirements, task allocation, timelines, and stakeholder coordination.",
    slots: ["Agile project management", "Water-Scrum-Fall"],
    groups: [
      {
        label: "Tracking & collaboration",
        slots: ["ClickUp", "Slack", "Google Workspace"],
      },
    ],
    evidence:
      "ESQUAKE: leading 16 members · AYOS!: led development to PSC X regional finalist.",
  },
  {
    name: "Version Control & Deployment",
    part: "Service connector",
    copy: "Source collaboration, change tracking, and web deployment.",
    slots: ["Git", "GitHub", "GitLab", "Vercel"],
    groups: [{ label: "AI-assisted workflow", slots: ["Claude AI", "Codex"] }],
    evidence:
      "ESQUAKE: GitHub collaboration · Portfolio & Laundrify: Vercel deployment.",
  },
];

export function createSignalCore(parent, materials) {
  const root = new THREE.Group();
  root.name = "Disassemblable signal core";
  root.position.set(0, 1.96, 0.1);
  parent.add(root);
  const boxGeometry = beveledBox(),
    cylinderGeometry = new THREE.CylinderGeometry(1, 1, 1, 12);
  const boardMaterial = new THREE.MeshStandardMaterial({
    color: 0x325a50,
    roughness: 0.65,
    metalness: 0.3,
  });
  const copper = new THREE.MeshStandardMaterial({
    color: 0xc98b4f,
    metalness: 0.6,
    roughness: 0.5,
  });
  const glass = new THREE.MeshStandardMaterial({
    color: 0x83b9b3,
    emissive: 0x264e55,
    emissiveIntensity: 0.3,
    roughness: 0.3,
  });
  function box(group, xyz, size, mat) {
    const mesh = new THREE.Mesh(boxGeometry, mat);
    mesh.position.set(...xyz);
    mesh.scale.set(...size);
    mesh.castShadow = mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  }
  function pin(group, x, z) {
    const mesh = new THREE.Mesh(cylinderGeometry, copper);
    mesh.position.set(x, 0.14, z);
    mesh.scale.set(0.035, 0.13, 0.035);
    group.add(mesh);
  }
  // Heavy case, open tray, separate lid, and exposed mounting posts.
  box(root, [0, -0.12, 0], [3.2, 0.24, 1.85], materials.metal);
  box(root, [0, 0.04, -0.9], [3.2, 0.32, 0.1], materials.rust);
  for (const x of [-1.55, 1.55])
    box(root, [x, 0.04, 0], [0.1, 0.32, 1.85], materials.rust);
  box(root, [0, 0.04, 0.9], [3.2, 0.32, 0.1], materials.rust);
  for (const x of [-1.35, 1.35])
    for (const z of [-0.7, 0.7])
      box(root, [x, 0.23, z], [0.08, 0.45, 0.08], copper);
  for (let i = 0; i < 7; i++)
    box(
      root,
      [-0.7 + i * 0.23, -0.1, 0.96],
      [0.12, 0.07, 0.06],
      i % 2 ? materials.dark : copper,
    );
  const cover = new THREE.Group();
  root.add(cover);
  box(cover, [0, 0, 0], [3.25, 0.14, 1.9], materials.rust);
  box(cover, [0, 0.08, 0], [1.5, 0.02, 0.58], materials.metal);
  for (let i = 0; i < 6; i++)
    box(cover, [-0.5 + i * 0.2, 0.1, 0], [0.07, 0.02, 0.32], materials.label);
  for (const x of [-1.35, 1.35])
    box(cover, [x, 0.1, 0.72], [0.12, 0.09, 0.12], copper);
  const parts = coreTools.map((tool, index) => {
    const group = new THREE.Group();
    group.name = tool.part;
    root.add(group);
    const column = index % 2,
      row = Math.floor(index / 2);
    const assembled = new THREE.Vector3(
      column ? 0.64 : -0.64,
      0.12 + row * 0.19,
      0,
    );
    const exploded = new THREE.Vector3(
      column ? 1.4 : -1.4,
      2.15 - row * 0.9,
      0.65,
    );
    const board = box(
      group,
      [0, 0, 0],
      [1.05, 0.1, 0.65],
      boardMaterial.clone(),
    );
    // Each assembly has a recognizable silhouette, built from separate meshes.
    if (index === 0) {
      box(group, [0, 0.13, 0], [0.48, 0.18, 0.4], materials.dark);
      for (const x of [-0.36, 0.36])
        for (let j = 0; j < 5; j++) pin(group, x, -0.23 + j * 0.115);
      for (let i = 0; i < 5; i++)
        box(
          group,
          [-0.16 + i * 0.08, 0.25, 0],
          [0.025, 0.06, 0.32],
          materials.metal,
        );
    } else if (index === 1) {
      box(group, [0, 0.12, 0], [0.8, 0.13, 0.5], materials.dark);
      box(group, [0, 0.2, 0], [0.7, 0.025, 0.39], glass);
      for (let i = 0; i < 3; i++)
        box(
          group,
          [-0.22 + i * 0.22, 0.22, 0],
          [0.12, 0.02, 0.16],
          materials.screen,
        );
    } else if (index === 2) {
      for (const x of [-0.28, 0.05, 0.35])
        box(group, [x, 0.15, 0], [0.2, 0.2, 0.38], materials.metal);
      for (const x of [-0.28, 0.05, 0.35])
        box(group, [x, 0.27, 0.1], [0.1, 0.02, 0.14], copper);
      for (let i = 0; i < 4; i++)
        box(
          group,
          [-0.35 + i * 0.22, 0.13, -0.24],
          [0.08, 0.14, 0.06],
          materials.lamp,
        );
    } else if (index === 3) {
      box(group, [0, 0.16, 0], [0.85, 0.22, 0.5], materials.metal);
      for (let i = 0; i < 3; i++)
        box(
          group,
          [-0.25 + i * 0.25, 0.29, 0],
          [0.18, 0.025, 0.35],
          materials.dark,
        );
      box(group, [0.4, 0.16, 0.28], [0.12, 0.12, 0.08], copper);
    } else if (index === 4) {
      for (const [x, z] of [
        [-0.3, -0.18],
        [0, 0],
        [0.3, 0.18],
      ]) {
        box(group, [x, 0.11, z], [0.2, 0.12, 0.17], materials.label);
        box(group, [x, 0.18, z], [0.1, 0.02, 0.06], copper);
      }
      box(group, [0, 0.07, 0], [0.8, 0.02, 0.035], copper).rotation.y = -0.45;
    } else {
      box(group, [0, 0.14, 0], [0.8, 0.17, 0.38], materials.metal);
      for (let i = 0; i < 4; i++) {
        box(
          group,
          [-0.3 + i * 0.2, 0.24, 0],
          [0.12, 0.04, 0.22],
          materials.dark,
        );
        pin(group, -0.3 + i * 0.2, 0.25);
      }
    }
    for (let i = 0; i < 4; i++)
      box(group, [-0.38 + i * 0.25, 0.065, -0.27], [0.13, 0.02, 0.025], copper);
    // Copper traces, solder pads, micro-components, and four mounting screws.
    for (let j = 0; j < 5; j++) {
      const x = -0.4 + j * 0.19;
      box(group, [x, 0.056, 0.23], [0.012, 0.008, 0.15], copper);
      box(group, [x + 0.04, 0.056, 0.15], [0.09, 0.008, 0.012], copper);
      box(
        group,
        [x, 0.069, -0.2],
        [0.075, 0.035, 0.035],
        j % 2 ? materials.dark : copper,
      );
    }
    for (const x of [-0.46, 0.46])
      for (const z of [-0.27, 0.27]) {
        const screw = new THREE.Mesh(
          new THREE.CylinderGeometry(0.025, 0.025, 0.025, 8),
          materials.label,
        );
        screw.position.set(x, 0.065, z);
        group.add(screw);
      }
    const marker = new THREE.Object3D();
    marker.position.set(0, 0.42, 0);
    group.add(marker);
    group.traverse((object) => {
      if (object.isMesh) object.userData.action = `tool:${index}`;
    });
    return { group, board, marker, assembled, exploded };
  });
  // Guide rods give the movement a service/maintenance character.
  for (const x of [-1.35, 1.35])
    box(root, [x, 1.0, -0.7], [0.025, 2, 0.025], copper);
  const lineGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(),
    new THREE.Vector3(),
  ]);
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xc9b581,
    transparent: true,
    opacity: 0.4,
  });
  const guides = parts.map(() => {
    const line = new THREE.Line(lineGeometry.clone(), lineMaterial);
    line.frustumCulled = false;
    root.add(line);
    return line;
  });
  let previousPose = "";
  return {
    parts,
    root,
    update(progress, selected, reduced) {
      const pose = `${progress}/${selected}/${reduced}`;
      if (pose === previousPose) return;
      previousPose = pose;
      const motion = coreMotion(progress, reduced);
      cover.position.set(0, 0.8 + motion.cover * 1.6, -motion.cover * 0.55);
      cover.rotation.x = motion.cover * -0.1;
      parts.forEach((part, index) => {
        const amount = motion.modules[index];
        part.group.position.lerpVectors(part.assembled, part.exploded, amount);
        part.group.rotation.x = amount * Math.PI * 0.36;
        part.board.material.emissive.set(
          index === selected ? 0x6c471d : 0x000000,
        );
        part.board.material.emissiveIntensity = 0.65;
        const positions = guides[index].geometry.attributes.position;
        positions.setXYZ(
          0,
          part.assembled.x,
          part.assembled.y,
          part.assembled.z,
        );
        positions.setXYZ(
          1,
          part.group.position.x,
          part.group.position.y,
          part.group.position.z,
        );
        positions.needsUpdate = true;
        guides[index].visible = amount > 0.05 && !reduced;
      });
    },
  };
}
