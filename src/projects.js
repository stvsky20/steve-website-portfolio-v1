import * as THREE from "../vendor/three.module.js";
import { ayosPhotos } from "./project-documentation.js";

export const projects = [
  {
    title: "Ayos!",
    bento: {
      eyebrow: "CITIZEN-REPORTING STARTUP",
      headline: "A stronger link to the community.",
      tags: ["Project Manager", "Full-Stack Developer"],
      features: ayosPhotos.map((photo, index) => ({
        ...photo,
        caption:
          index === 0
            ? "Philippine Startup Challenge X"
            : "People behind the project.",
        tone: index === 0 ? "mint" : "cream",
      })),
      approachTitle: "From coordination to code.",
      scopeTitle: "The project, in context.",
    },
    institutions: ["psc"],
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
    bento: {
      eyebrow: "EARTHQUAKE PREPAREDNESS GAME",
      headline: "Preparedness, through play.",
      tags: ["16-member team", "Capstone in progress"],
      approachTitle: "One team. A shared direction.",
      scopeTitle: "An ongoing capstone.",
    },
    institutions: ["slu"],
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
    title: "Laundrify",
    deployment: {
      url: "https://laundry-management-system-rose.vercel.app/",
      label: "Try Laundrify",
    },
    label: "Laundry operations, simplified",
    description:
      "A responsive laundry-management frontend bringing the counter, orders, customers, machines, and reporting into one workspace. Built on the Berry React Admin Template, with Gabriel’s as a fictional demo branch.",
    recognition:
      "Functional frontend prototype · Local persistence · Fictional data",
    note: "Authentication, payments, messaging, and physical-machine integrations are not connected. Revenue charts use sample data; machine cycles are simulated.",
    contributions: [
      "Built reusable React interfaces with shared Context state and localStorage persistence.",
      "Separated pricing logic, derived metrics, immutable updates, and CSV export from presentation.",
    ],
    technologies: [
      "JavaScript",
      "React 19",
      "Vite 7",
      "Material UI 7",
      "React Router 7",
      "Emotion",
      "ApexCharts",
    ],
    placeholder: false,
    bento: {
      eyebrow: "FRONTEND PROTOTYPE",
      tags: ["Local-first", "Fictional demo data"],
      stackExtra: "Emotion · ApexCharts · React Context & hooks · localStorage",
      approachTitle: "Built to stay understandable.",
      scopeTitle: "A working frontend prototype.",
      imageBase: "assets/projects/laundrify/",
      headline: "Less busywork. More flow.",
      approach:
        "Reusable components. Shared client state. Pricing logic kept separate from the interface. Responsive layouts, derived metrics, and immutable updates throughout.",
      foundation:
        "Berry React Admin Template · ESLint · Prettier · Template source verification",
      features: [
        {
          image: "01-dashboard.webp",
          title: "Operations at a glance",
          caption: "Branch metrics, in sync.",
          detail:
            "Shared state powers branch-specific revenue, orders, pickups, and unique-customer totals. Revenue comparisons use sample time-series data.",
          tone: "blue",
          alt: "Laundrify operations dashboard in the Gabriel’s demo workspace, showing revenue, orders, customers, and charts.",
        },
        {
          image: "02-counter-pos.webp",
          title: "A smarter counter",
          caption: "Clear quotes. Every order.",
          detail:
            "A tablet-oriented POS with validated quantities, itemized pricing, service inclusions, and staff/shop allocation. Each order saves its pricing snapshot.",
          tone: "cream",
          alt: "Laundrify counter and point-of-sale interface with service choices and an itemized order quote.",
        },
        {
          image: "03-order-tracking.webp",
          title: "Every load, tracked",
          caption: "Search. Sort. Export.",
          detail:
            "Filter orders by branch, status, and search; sort and paginate results, update statuses, and export escaped CSV files.",
          tone: "mint",
          alt: "Laundrify order workspace with searchable order records, statuses, and collection details.",
        },
        {
          image: "04-customer-history.webp",
          title: "Know every customer",
          caption: "History, connected.",
          detail:
            "Customer cards derive spending, order counts, and pickup readiness from shared orders, with direct navigation into the customer’s history.",
          tone: "peach",
          alt: "Laundrify customer directory with customer cards, order totals, spending, and pickup information.",
        },
        {
          image: "05-machine-status.webp",
          title: "Machines, in motion",
          caption: "A simulated cycle view.",
          detail:
            "Rule-based controls switch machines between available, running, and maintenance states. SVG motion respects reduced motion; no equipment or live countdown is connected.",
          tone: "lavender",
          alt: "Laundrify machine-status simulation with illustrated washing machines and running, available, and maintenance states.",
        },
        {
          image: "06-business-reports.webp",
          title: "See the bigger picture",
          caption: "Insights you can export.",
          detail:
            "Sample revenue charts sit alongside service distributions derived from current orders, period comparisons, and downloadable CSV reports.",
          tone: "yellow",
          alt: "Laundrify reporting dashboard with revenue charts, service breakdowns, and CSV export.",
        },
      ],
    },
  },
  ...[4, 5, 6].map((number) => ({
    title: `Project ${String(number).padStart(3, "0")}`,
    label: "Details coming soon",
    description:
      "A reserved slot for another project. The title, summary, screenshots, and contribution will be added when the project details are supplied.",
    recognition: "Project details to be added.",
    note: "Preview slot · This is not a completed case study.",
    contributions: [],
    technologies: [],
    placeholder: true,
  })),
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
