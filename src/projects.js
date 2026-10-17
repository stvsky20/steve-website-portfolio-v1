import * as THREE from "../vendor/three.module.js";
import { ayosPhotos } from "./project-documentation.js";
import { malAyGallery } from "./mal-ay-gallery.js";
import { tradeJournalGallery } from "./trade-journal-gallery.js";

export const projects = [
  {
    title: "Ayos!",
    headerFacts: [
      {
        label: "Proponent / client",
        value: "Baguio LGU",
        icon: "client",
        logo: "assets/projects/ayos/lgu-baguio.png",
        logoAlt: "Baguio City government logo",
      },
      {
        label: "My role",
        value: "Project Manager & Full-Stack Developer",
        icon: "role",
      },
      {
        label: "Project context",
        value: "Philippine Startup Challenge X",
        icon: "recognition",
      },
    ],
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
    headerFacts: [
      {
        label: "Client",
        value: "CDRRMO Baguio City",
        icon: "client",
        logo: "assets/projects/esquake/cdrmmo-logo.jfif",
        logoAlt:
          "City Disaster Risk Reduction and Management Office, Baguio City logo",
      },
      {
        label: "My role",
        value: "Project Manager & Game Developer",
        icon: "role",
      },
      {
        label: "Project context",
        value: "University capstone requirement",
        icon: "capstone",
      },
    ],
    bento: {
      eyebrow: "EARTHQUAKE PREPAREDNESS GAME",
      imageBase:
        "assets/projects/esquake/QuakeScape-Marketing-Screenshots/screenshots/",
      features: [
        {
          image: "01_emergency_go_bag.png",
          title: "Pack for the Unexpected",
          caption: "Collect emergency essentials.",
          detail:
            "Search a detailed pixel-art home for emergency essentials. Build your go-bag, track your checklist, and discover which everyday items matter when disaster strikes.",
          alt: "Emergency go-bag gameplay in QuakeScape",
          width: 1280,
          height: 720,
          tone: "cream",
        },
        {
          image: "02_home_hazard_inspection.png",
          title: "Spot the Hidden Hazards",
          caption: "Identify hazards before moving.",
          detail:
            "See a familiar home through new eyes after an earthquake. Identify broken objects, fallen furniture, and household hazards before choosing your next move.",
          alt: "Home hazard inspection gameplay in QuakeScape",
          width: 1280,
          height: 720,
          tone: "cream",
        },
        {
          image: "03_neighborhood_evacuation.png",
          title: "Navigate a Changed Neighborhood",
          caption: "Find a safer route through the streets.",
          detail:
            "Make your way through streets transformed by the quake. Watch for falling debris and environmental dangers as you work toward a safer route.",
          alt: "Neighborhood evacuation gameplay in QuakeScape",
          width: 1280,
          height: 720,
          tone: "cream",
        },
        {
          image: "04_first_aid.png",
          title: "Put Your Emergency Kit to Work",
          caption: "Turn preparation into practical action.",
          detail:
            "Emergency supplies become interactive tools. Use the first-aid sequence to clean and dress an injury, connecting preparation with practical action.",
          alt: "First aid gameplay in QuakeScape",
          width: 1280,
          height: 720,
          tone: "cream",
        },
        {
          image: "05_duck_cover_hold.png",
          title: "Duck, Cover, and Hold",
          caption: "Find sturdy cover and hold on.",
          detail:
            "When the classroom starts shaking, every decision counts. Find sturdy cover, protect your head, and hold on through an interactive earthquake response challenge.",
          alt: "Classroom cover gameplay in QuakeScape",
          width: 1280,
          height: 720,
          tone: "cream",
        },
        {
          image: "06_flashlight.png",
          title: "Bring Light to the Blackout",
          caption: "Assemble a flashlight during a blackout.",
          detail:
            "A sudden blackout turns a familiar classroom into a new challenge. Prepare your flashlight by placing its batteries in an interactive drag-and-drop activity.",
          alt: "Flashlight preparation gameplay in QuakeScape",
          width: 1280,
          height: 720,
          tone: "cream",
        },
        {
          image: "07_head_protection.png",
          title: "Protect Yourself on the Way Out",
          caption: "Protect your head while evacuating.",
          detail:
            "Getting to the exit takes more than moving quickly. Practice protecting your head as Tantan leaves the damaged classroom, with prompts that reinforce safer evacuation habits.",
          alt: "Head protection gameplay in QuakeScape",
          width: 1280,
          height: 720,
          tone: "cream",
        },
        {
          image: "08_landslide_awareness.png",
          title: "Recognize Landslide Danger",
          caption: "Learn about danger beyond the classroom.",
          detail:
            "Earthquake risks continue beyond the classroom. Follow the class through the school grounds and learn to recognize unstable slopes and landslide danger along the evacuation route.",
          alt: "Landslide awareness gameplay in QuakeScape",
          width: 1280,
          height: 720,
          tone: "cream",
        },
        {
          image: "09_stay_with_group.png",
          title: "Stay Together, Stay Focused",
          caption: "Keep pace with your classmates.",
          detail:
            "Evacuation is a team effort. Keep pace with your classmates, maintain your place in the group, and respond to warnings when you drift away from the formation.",
          alt: "Group evacuation gameplay in QuakeScape",
          width: 1280,
          height: 720,
          tone: "cream",
        },
        {
          image: "10_safe_crossing.png",
          title: "Wait for the Signal",
          caption: "Listen, wait, then cross safely.",
          detail:
            "Reaching the road brings one more decision. Stay with the class, listen to the teacher, and wait for the signal before crossing toward safety.",
          alt: "Safe crossing gameplay in QuakeScape",
          width: 1280,
          height: 720,
          tone: "cream",
        },
      ],
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
    technologies: [
      "Godot",
      "GDScript",
      "Figma",
      "ClickUp",
      "GitHub",
      "Agile methodology",
    ],
    placeholder: false,
  },
  {
    title: "Laundrify",
    headerFacts: [
      {
        label: "Demo workspace",
        value: "Gabriel’s · Fictional branch",
        icon: "client",
      },
      { label: "My role", value: "Frontend Developer", icon: "role" },
      {
        label: "Project context",
        value: "Functional frontend prototype",
        icon: "prototype",
      },
    ],
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
      "React Context & hooks",
      "localStorage",
      "ESLint",
      "Prettier",
    ],
    placeholder: false,
    bento: {
      eyebrow: "FRONTEND PROTOTYPE",
      tags: ["Local-first", "Fictional demo data"],
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
  {
    title: "Mal-Ay Store Assistant",
    label: "Lightweight Android POS & inventory",
    headerFacts: [
      {
        label: "Proponent / client",
        value: "Mal-Ay Store · Baguio City",
        icon: "client",
      },
      {
        label: "Project context",
        value: "Lightweight Android APK",
        icon: "prototype",
      },
    ],
    description:
      "Built around the client’s aging 2015 Samsung Galaxy tablet. When the browser-based app wasn’t working well for her, we made the application lightweight and packaged it as an Android APK—adapting the software to the device she already owned.",
    recognition: "Proponent · Mal-Ay Store, Baguio City",
    note: "Screenshots use an isolated demo store with sample records. GCash is a recorded payment workflow: its QR screen uses a placeholder and payments are not automatically verified.",
    contributions: [],
    technologies: [
      "React 19",
      "TypeScript",
      "Vite 8",
      "Tailwind CSS 4",
      "Lucide React",
      "Capacitor 8",
      "SQLite",
      "IndexedDB",
      "ESLint",
      "Bun",
    ],
    placeholder: false,
    bento: {
      eyebrow: "DESIGNED AROUND A REAL CONSTRAINT",
      headline: "Built for the tablet she already owns.",
      tags: ["2015 Samsung Galaxy tablet", "Lightweight Android app"],
      story: [
        {
          label: "The constraint",
          title: "An old tablet. A working store.",
          copy: "Mal-Ay Store’s owner uses a 2015 Samsung Galaxy tablet. The device is slow, and the web app wasn’t working well enough for her daily store operations.",
        },
        {
          label: "The response",
          title: "Make the essentials lighter.",
          copy: "We made the application lightweight around the work she needed to do: checkout, inventory, and store reporting. The existing hardware shaped the engineering decisions.",
        },
        {
          label: "The delivery",
          title: "A familiar device. An installed app.",
          copy: "We packaged the web application as an Android APK through Capacitor, giving her an installable app for the tablet she already had.",
        },
      ],
      imageBase:
        "assets/projects/mal-ay-store-pos/mal-ay-marketing-screenshots/screenshots/",
      features: malAyGallery,
      approachTitle: "One interface. Platform-aware storage.",
      approach:
        "Typed domain operations sit behind shared React state and repository adapters. Integer-centavo arithmetic keeps currency calculations precise. Storage selects IndexedDB in browsers or SQLite on native platforms, with an in-memory fallback. Transactional stock records, role checks, and local PIN authentication support store operations.",
      foundation:
        "Repository tooling · TypeScript checking · ESLint · Bun tests covering domain operations, authentication, reporting, media lifecycle, and backups. App checks were not rerun for this portfolio update.",
      scopeTitle: "A store workflow, documented.",
    },
  },
  {
    title: "Trade Journal Pro",
    label: "Full-stack trading journal & analytics",
    headerFacts: [
      { label: "My role", value: "Full-Stack Developer", icon: "role" },
      {
        label: "Project context",
        value: "Futures & CFD trade journaling",
        icon: "prototype",
      },
    ],
    description:
      "A full-stack web application for recording, reviewing, and analyzing futures and CFD trades. Structured reviews connect risk, trading psychology, and execution history to analytics calculated from persisted records.",
    recognition: "React & TypeScript frontend · PHP REST API · MySQL database",
    note: "Runs on Apache/WAMP. Account-based PIN authentication uses server-side sessions. Verification scripts cover timezone handling, trade CRUD, and CSV imports; those application checks were not rerun for this portfolio update.",
    contributions: [
      "Built trade management, structured reviews, authentication, import workflows, and performance analytics across the frontend and backend.",
    ],
    technologies: [
      "React",
      "TypeScript",
      "TanStack Router",
      "Tailwind CSS",
      "Recharts",
      "PHP",
      "MySQL",
      "REST APIs",
      "Vite",
      "Apache",
      "WAMP",
      "Git",
    ],
    placeholder: false,
    bento: {
      eyebrow: "FULL-STACK JOURNAL & ANALYTICS",
      headline: "Record the trade. Understand the decisions.",
      tags: [
        "Futures & CFDs",
        "Structured trade reviews",
        "TradingView CSV imports",
      ],
      imageBase: "assets/projects/trade-journal-pro/screenshots/",
      features: tradeJournalGallery,
      approachTitle: "Consistent records. Consistent calculations.",
      approach:
        "Frontend service modules separate UI components from API communication. PHP centralizes financial calculations. A staged CSV import reconstructs executions with FIFO matching, handles partial closes and reversals, and detects duplicates with trade fingerprints. UTC storage and IANA timezone conversion keep filters and session analysis aligned.",
      foundation:
        "Verification tooling · Timezone handling · Trade CRUD · CSV import behavior",
      scopeTitle: "From execution to review.",
    },
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
  ctx.strokeStyle = "#547b7b";
  ctx.lineWidth = 3;
  ctx.strokeRect(20, 20, 728, 472);
  ctx.fillStyle = "#f0c68b";
  ctx.font = "600 34px monospace";
  ctx.fillText(`Project ${String(index + 1).padStart(3, "0")}`, 48, 78);
  ctx.fillStyle = "#f4efdf";
  // Wrap long names instead of shrinking the most important text on the panel.
  ctx.font = "600 94px sans-serif";
  const lines = [""];
  for (const word of project.title.split(" ")) {
    const last = lines.length - 1;
    const next = lines[last] ? `${lines[last]} ${word}` : word;
    if (ctx.measureText(next).width > 676 && lines[last]) lines.push(word);
    else lines[last] = next;
  }
  if (lines.length === 1) ctx.font = "600 112px sans-serif";
  lines.forEach((line, row) =>
    ctx.fillText(line, 44, lines.length === 1 ? 237 : 185 + row * 105),
  );
  ctx.font = "500 38px sans-serif";
  ctx.fillStyle = "#d3e3dd";
  const screenLabels = [
    "Citizen reporting",
    "Earthquake preparedness",
    "Laundry operations",
    "Lightweight Android POS",
    "Trading journal & analytics",
    "Details coming soon",
  ];
  ctx.fillText(screenLabels[index] || project.label, 48, 350);
  ctx.strokeStyle = "#52706b";
  ctx.beginPath();
  ctx.moveTo(48, 384);
  ctx.lineTo(720, 384);
  ctx.stroke();
  ctx.font = "600 34px monospace";
  ctx.fillStyle = "#f0c68b";
  ctx.fillText(
    project.placeholder ? "DETAILS SOON" : "OPEN PROJECT  →",
    48,
    442,
  );
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}
