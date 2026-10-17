import * as THREE from "../vendor/three.module.js";
import { beveledBox } from "./cinematic.js";
import { institutionBrands } from "./institution-brands.js";

export const educationRecords = [
  {
    title: "BS Information Technology",
    institutions: ["slu"],
    kind: "Academic record",
    summary: "Saint Louis University · Baguio City, Benguet · 2023–2027",
    details: [
      "School · Saint Louis University, Baguio City, Benguet",
      "Degree · BS Information Technology",
      "Academic recognition · Dean’s Lister from first year to present",
      "Expected graduation · 2027",
      "Thesis · ESQUAKE: A Story-Based Serious Game for Enhancing Earthquake Preparedness Among Elementary Students",
    ],
    note: "Project Manager & Game Developer for a 16-member capstone team.",
  },
  {
    title: "Philippine Startup Challenge X",
    institutions: ["psc"],
    kind: "Recognition",
    summary: "Regional finalist.",
    details: [
      "Competition · Philippine Startup Challenge X",
      "Recognition · Regional finalist",
      "Project · AYOS! citizen-reporting startup",
      "Role · Project Manager & Full-Stack Developer · January–December 2025",
    ],
    note: "Built the government-official interface using React, TypeScript, and Tailwind CSS.",
  },
  {
    title: "University of Santo Tomas",
    kind: "Senior high school",
    summary: "Senior High School · STEM strand · 2022–2023",
    details: [
      "School · University of Santo Tomas – Senior High School",
      "Location · Sampaloc, Manila",
      "Strand · Science, Technology, Engineering, and Mathematics (STEM)",
      "Years · 2022–2023",
    ],
    note: "The academic foundation before my BS Information Technology degree.",
  },
  {
    title: "Leadership & campus experience",
    institutions: ["slu"],
    kind: "Leadership experience",
    summary: "Saint Louis University · January–July 2024",
    details: [
      "SLU SAMCIS KASAMA/SSC Assembly · Deputy Secretary General",
      "Produced same-day minutes for 40+ meetings across 5 committees and approximately 60 officers; tracked decisions, action items, deadlines, and attendance.",
      "Organized the central Google Drive repository and assumed Secretary General duties when required, coordinating records, correspondence, permits, and stakeholders.",
      "SLU Integrated Confederacy · Officer-in-Charge & First Year IT Representative",
      "Coordinated a Valentine’s Day booth that generated approximately ₱6,000 in sales, organized a Tekken tournament, and coordinated basketball and volleyball teams during university intramurals.",
    ],
    note: "Coordinating people, decisions, and delivery beyond software projects.",
  },
];

function paperTexture(type, requestFrame) {
  const canvas = document.createElement("canvas");
  canvas.width = type === 1 ? 1152 : 768;
  canvas.height = type === 0 ? 960 : 768;
  const ctx = canvas.getContext("2d"),
    w = canvas.width,
    h = canvas.height;
  ctx.fillStyle = type === 2 ? "#eee4cd" : "#f4eedc";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "#bca780";
  ctx.lineWidth = 3;
  ctx.strokeRect(30, 30, w - 60, h - 60);
  ctx.fillStyle = "#58351f";
  ctx.font = "600 36px monospace";
  ctx.fillText(
    type === 0
      ? "ACADEMIC RECORD"
      : type === 1
        ? "A MILESTONE ALONG THE WAY"
        : "SENIOR HIGH SCHOOL",
    64,
    100,
  );
  ctx.fillStyle = "#092028";
  if (type === 0) {
    // Keep the degree beside the larger crest, with a clear shared baseline.
    ctx.font = "600 44px sans-serif";
    ctx.fillText("BS", 64, 245);
    ctx.font = "600 64px sans-serif";
    ctx.fillText("Information", 64, 325);
    ctx.fillText("Technology", 64, 405);
    ctx.font = "600 46px sans-serif";
    ctx.fillText("Saint Louis University", 64, 530);
    ctx.fillText("Baguio City, Benguet", 64, 584);
    ctx.strokeStyle = "#bca780";
    ctx.beginPath();
    ctx.moveTo(64, 650);
    ctx.lineTo(w - 64, 650);
    ctx.stroke();
    ctx.font = "600 56px monospace";
    ctx.fillStyle = "#58351f";
    ctx.fillText("2023 — 2027", 64, 765);
    ctx.font = "600 40px sans-serif";
    ctx.fillStyle = "#183039";
    ctx.fillText("Dean’s Lister", 64, 840);
    ctx.font = "500 34px sans-serif";
    ctx.fillText("1st year to present", 64, 890);
  } else if (type === 1) {
    ctx.font = "600 96px sans-serif";
    ctx.fillText("Philippine Startup", 64, 285);
    ctx.fillText("Challenge X", 64, 385);
    ctx.strokeStyle = "#bca780";
    ctx.beginPath();
    ctx.moveTo(64, 460);
    ctx.lineTo(w - 64, 460);
    ctx.stroke();
    ctx.font = "600 64px monospace";
    ctx.fillStyle = "#58351f";
    ctx.fillText("REGIONAL FINALIST", 64, 625);
    ctx.font = "600 48px sans-serif";
    ctx.fillStyle = "#183039";
    ctx.fillText("AYOS!", 64, 680);
    ctx.font = "500 40px sans-serif";
    ctx.fillText("Project Manager & Full-Stack Developer", 64, 730);
  } else {
    ctx.font = "600 64px sans-serif";
    ctx.fillText("University of", 64, 265);
    ctx.fillText("Santo Tomas", 64, 345);
    ctx.font = "600 40px sans-serif";
    ctx.fillStyle = "#183039";
    ctx.fillText("STEM / Sampaloc, Manila", 64, 490);
    ctx.font = "600 58px monospace";
    ctx.fillStyle = "#58351f";
    ctx.fillText("2022 — 2023", 64, 585);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  if (type < 2) {
    const image = new Image();
    image.onload = () => {
      if (type === 0) {
        const logoWidth = 200;
        ctx.drawImage(
          image,
          500,
          145,
          logoWidth,
          (logoWidth * image.height) / image.width,
        );
      } else {
        // Replace the temporary text heading with the full competition banner.
        ctx.fillStyle = "#f4eedc";
        ctx.fillRect(60, 128, w - 120, 430);
        ctx.drawImage(
          image,
          64,
          150,
          w - 128,
          ((w - 128) * image.height) / image.width,
        );
      }
      texture.needsUpdate = true;
      requestFrame?.();
    };
    image.src = institutionBrands[type === 0 ? "slu" : "psc"].image;
  }
  return texture;
}

export function createEducationStudy(study, m, page, bulb, requestFrame) {
  const boxGeometry = beveledBox();
  function box(x, y, z, w, h, d, mat) {
    const mesh = new THREE.Mesh(boxGeometry, mat);
    mesh.position.set(x, y, z);
    mesh.scale.set(w, h, d);
    mesh.castShadow = mesh.receiveShadow = true;
    study.add(mesh);
    return mesh;
  }
  function paper(index) {
    const map = paperTexture(index, requestFrame);
    return new THREE.MeshStandardMaterial({
      map,
      color: 0xb8b8b8,
      roughness: 1,
      metalness: 0,
      envMapIntensity: 0.1,
      // The printed texture supplies the fill light too, preserving dark ink.
      // A uniform emissive tint or heavy spotlight lifts the black lettering.
      emissiveMap: map,
      emissive: 0xffffff,
      emissiveIntensity: 0.45,
      toneMapped: false,
      fog: false,
    });
  }
  box(-1.65, 3.25, -2.4, 1.65, 2.05, 0.14, m.metal);
  const degree = box(-1.65, 3.25, -2.31, 1.45, 1.84, 0.025, paper(0));
  box(0.9, 3.25, -2.4, 2.75, 1.95, 0.14, m.rust);
  const recognition = box(0.9, 3.25, -2.31, 2.52, 1.72, 0.025, paper(1));
  for (const x of [-0.24, 2.04])
    for (const y of [2.49, 4.01]) box(x, y, -2.27, 0.07, 0.07, 0.05, m.label);
  const notebook = new THREE.Mesh(boxGeometry, paper(2));
  notebook.position.set(0.55, 0.025, 0);
  notebook.scale.set(1.02, 0.012, 0.76);
  page.add(notebook);
  // Each paper surface is a real selectable object with a matching native target.
  const records = [degree, recognition, notebook];
  records.forEach(
    (mesh, index) => (mesh.userData.action = `education:${index}`),
  );
  bulb.material = bulb.material.clone();
  const deskLight = new THREE.PointLight(0xffbb6e, 0, 4, 1.5);
  deskLight.position.set(-0.9, 2.48, -0.1);
  study.add(deskLight);
  const boardLight = new THREE.SpotLight(0xffeed4, 0, 10, 0.85, 0.9, 1);
  boardLight.position.set(0, 4.55, 1.2);
  boardLight.target.position.set(0, 3.2, -2.4);
  study.add(boardLight, boardLight.target);
  const fill = new THREE.PointLight(0x8ec6cf, 0, 6, 1.5);
  fill.position.set(1.8, 2.7, 1.3);
  study.add(fill);
  const fixture = box(0, 4.48, 1.2, 0.7, 0.06, 0.12, m.metal);
  fixture.userData.dynamic = true;
  return {
    records,
    night: 0,
    update(amount) {
      amount = Math.max(amount, this.night * 0.8);
      deskLight.intensity = amount * 10;
      boardLight.intensity = amount * 7;
      fill.intensity = amount * 3;
      bulb.material.emissiveIntensity = 0.12 + amount * 3.2;
      bulb.material.color.setRGB(
        0.42 + amount * 0.58,
        0.32 + amount * 0.48,
        0.2 + amount * 0.27,
      );
      fixture.visible = amount > 0.01;
    },
  };
}
