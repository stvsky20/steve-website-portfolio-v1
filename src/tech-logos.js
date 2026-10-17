// Brand artwork is vendored locally; provenance is in assets/tech/sources.json.
// SQL, WAMP, and delivery methods use semantic symbols rather than invented logos.
const logos = {
  Java: "java",
  Python: "python",
  JavaScript: "javascript",
  TypeScript: "typescript",
  PHP: "php",
  HTML: "html5",
  CSS: "css3",
  React: "react",
  "React 19": "react",
  "React Context & hooks": "react",
  "Capacitor 8": "capacitor",
  SQLite: "sqlite",
  "Lucide React": "lucide",
  Bun: "bun",
  ESLint: "eslint",
  Prettier: "prettier",
  "Vite 7": "vitejs",
  "Vite 8": "vitejs",
  Vite: "vitejs",
  "TanStack Router": "tanstack",
  Apache: "apache",
  "Material UI 7": "materialui",
  "React Router 7": "reactrouter",
  "Tailwind CSS": "tailwindcss",
  "Tailwind CSS 4": "tailwindcss",
  WordPress: "wordpress",
  Figma: "figma",
  "Google APIs": "google",
  OpenAI: "openai",
  MySQL: "mysql",
  Supabase: "supabase",
  Firestore: "firebase",
  ClickUp: "clickup",
  Slack: "slack",
  "Google Workspace": "google",
  Git: "git",
  GitHub: "github",
  GitLab: "gitlab",
  Vercel: "vercel",
  Godot: "godot",
  "Claude AI": "claude",
  Codex: "openai",
};

export function technologyChip(label) {
  const chip = document.createElement("span");
  chip.className = "technology-chip";
  const mark = document.createElement("span");
  mark.className = "technology-mark";
  mark.setAttribute("aria-hidden", "true");
  if (logos[label]) {
    const image = document.createElement("img");
    image.src = `assets/tech/${logos[label]}.svg`;
    image.alt = "";
    image.width = image.height = 24;
    mark.append(image);
  } else {
    const paths = ["IndexedDB", "localStorage"].includes(label)
      ? '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>'
      : ["ApexCharts", "Recharts"].includes(label)
        ? '<path d="M4 3v17h17M7 15l4-6 4 3 5-8"/><circle cx="11" cy="9" r="1"/>'
        : label === "REST APIs"
          ? '<path d="M3 7h16m-4-4 4 4-4 4M21 17H5m4-4-4 4 4 4"/>'
          : label === "Emotion"
            ? '<path d="m14 3 7 7-9 9-7-7 9-9ZM5 12l-2 6 3 3 6-2M5 18l1 1"/>'
            : label === "GDScript"
              ? '<path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18"/>'
              : label === "Agile methodology"
                ? '<path d="M20 8a8 8 0 0 0-14-2L3 9m0-5v5h5M4 16a8 8 0 0 0 14 2l3-3m0 5v-5h-5"/>'
                : label === "SQL"
                  ? '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>'
                  : label === "WAMP"
                    ? '<rect x="3" y="3" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/><path d="M7 6.5h.01M7 17.5h.01M12 6.5h5M12 17.5h5"/>'
                    : '<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2" fill="currentColor"/><circle cx="16" cy="12" r="2" fill="currentColor"/><circle cx="10" cy="18" r="2" fill="currentColor"/>';
    mark.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">${paths}</svg>`;
  }
  chip.append(mark, document.createTextNode(label));
  return chip;
}
