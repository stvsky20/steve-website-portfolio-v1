import * as THREE from "../vendor/three.module.js";

export const projects = [
  {
    title: "Ayos!",
    label: "Citizen-reporting startup",
    description:
      "A citizen-reporting startup connecting people and local government units. As Project Manager & Full-Stack Developer, I led development and built the government-official web interface with React, TypeScript, and Tailwind CSS.",
    recognition: "Regional finalist in the Philippine Startup Challenge X.",
    note: "January–December 2025 · Project Manager & Full-Stack Developer",
    contributions: [
      "Led development of the citizen-reporting platform.",
      "Integrated Google APIs and OpenAI, and connected the system to Firestore Cloud Database.",
    ],
    technologies: [
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Google APIs",
      "OpenAI",
      "Firestore",
    ],
    placeholder: false,
  },
  {
    title: "ESQUAKE",
    label: "Earthquake preparedness game",
    description:
      "A story-based serious game designed to enhance earthquake preparedness among elementary students. As Project Manager & Game Developer, I lead a 16-member multidisciplinary capstone team across development, design, and quality assurance.",
    recognition:
      "BS Information Technology capstone · Saint Louis University · In progress",
    note: "August 2026–Present · Project Manager & Game Developer",
    contributions: [
      "Manage requirements, assignments, timelines, and stakeholders using a Water-Scrum-Fall methodology.",
      "Track delivery in ClickUp and coordinate collaborative development through GitHub.",
      "Translate Figma gameplay prototypes into playable features in Godot.",
    ],
    technologies: ["Godot", "Figma", "ClickUp", "GitHub"],
    placeholder: false,
  },
  {
    title: "Leadership",
    label: "Student organizations & delivery",
    kind: "Experience",
    description:
      "Deputy Secretary General, SLU SAMCIS KASAMA/SSC Assembly; Officer-in-Charge & First Year IT Representative, SLU Integrated Confederacy. Coordinated records, stakeholders, teams, and student events.",
    recognition:
      "40+ meetings across 5 committees and approximately 60 officers; approximately ₱6,000 in sales from a Valentine’s Day booth.",
    note: "January–July 2024 · Saint Louis University, Baguio City",
    contributions: [
      "Produced same-day meeting minutes and tracked decisions, action items, deadlines, and attendance.",
      "Organized the council’s central Google Drive repository and assumed Secretary General duties when required.",
      "Organized a Tekken tournament and coordinated basketball and volleyball teams during university intramurals.",
    ],
    technologies: ["Google Workspace"],
    placeholder: false,
  },
];

export function projectTexture(index) {
  const project = projects[index],
    canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#102e35";
  ctx.fillRect(0, 0, 768, 512);
  ctx.strokeStyle = "#52706b";
  ctx.lineWidth = 3;
  ctx.strokeRect(20, 20, 728, 472);
  ctx.fillStyle = "#f0c68b";
  ctx.font = "500 30px monospace";
  ctx.fillText(`${project.kind || "PROJECT"} / 00${index + 1}`, 48, 78);
  ctx.fillStyle = "#f4efdf";
  let titleSize = index === 0 ? 120 : 104;
  ctx.font = `500 ${titleSize}px sans-serif`;
  while (ctx.measureText(project.title).width > 668) {
    ctx.font = `500 ${--titleSize}px sans-serif`;
  }
  ctx.fillText(project.title, 44, 245);
  ctx.font = "32px sans-serif";
  ctx.fillStyle = "#baccc0";
  ctx.fillText(project.label, 48, 310);
  ctx.strokeStyle = "#52706b";
  ctx.beginPath();
  ctx.moveTo(48, 366);
  ctx.lineTo(720, 366);
  ctx.stroke();
  ctx.font = "28px monospace";
  ctx.fillStyle = "#f0c68b";
  ctx.fillText(
    project.placeholder
      ? "PREVIEW / DETAILS TO FOLLOW"
      : `OPEN ${(project.kind || "PROJECT").toUpperCase()} OVERVIEW`,
    48,
    442,
  );
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}
