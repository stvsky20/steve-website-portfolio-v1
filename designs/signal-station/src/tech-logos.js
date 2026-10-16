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
  "Tailwind CSS": "tailwindcss",
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
    const paths =
      label === "SQL"
        ? '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>'
        : label === "WAMP"
          ? '<rect x="3" y="3" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/><path d="M7 6.5h.01M7 17.5h.01M12 6.5h5M12 17.5h5"/>'
          : '<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2" fill="currentColor"/><circle cx="16" cy="12" r="2" fill="currentColor"/><circle cx="10" cy="18" r="2" fill="currentColor"/>';
    mark.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">${paths}</svg>`;
  }
  chip.append(mark, document.createTextNode(label));
  return chip;
}
