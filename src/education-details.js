// Shared visual record cards for every selectable education object.
const paths = {
  calendar: "M5 5h14v16H5z M8 2v6m8-6v6M5 10h14",
  pin: "M12 22s7-8 7-13A7 7 0 0 0 5 9c0 5 7 13 7 13z M12 6a3 3 0 1 0 0 6 3 3 0 0 0 0-6",
  award: "M12 3l3 3 4 1-1 5 1 4-4 1-3 3-3-3-4-1 1-4-1-5 4-1z M10 10l2 2 4-4",
  team: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M2 22v-4a7 7 0 0 1 14 0v4 M17 4a4 4 0 0 1 0 8m2 3a6 6 0 0 1 3 5v2",
  book: "M3 4h7l2 2 2-2h7v16h-7l-2 2-2-2H3z M12 6v16",
  code: "M8 6l-6 6 6 6m8-12 6 6-6 6m-3-15-2 18",
};
const records = [
  {
    badges: [
      ["calendar", "2023–2027"],
      ["pin", "Baguio City, Benguet"],
    ],
    highlight: ["award", "Dean’s Lister", "First year to present"],
    cards: [
      ["calendar", "Expected graduation", "2027"],
      [
        "team",
        "Capstone role",
        "Project Manager / Supervisor & Game Developer",
        "16-member team",
      ],
      [
        "book",
        "Thesis · ESQUAKE",
        "Earthquake preparedness through play.",
        "A story-based serious game for elementary students.",
      ],
    ],
  },
  {
    badges: [["calendar", "January–December 2025"]],
    highlight: ["award", "Regional finalist", "Philippine Startup Challenge X"],
    cards: [
      [
        "code",
        "The project",
        "AYOS!",
        "Citizen reporting connecting communities and local government.",
      ],
      ["team", "My role", "Project Manager & Full-Stack Developer"],
      [
        "code",
        "Built for officials",
        "Government-official interface",
        "React · TypeScript · Tailwind CSS",
      ],
    ],
  },
  {
    badges: [
      ["calendar", "2022–2023"],
      ["pin", "Sampaloc, Manila"],
    ],
    highlight: ["book", "STEM", "Senior High School"],
    cards: [
      [
        "book",
        "Academic strand",
        "Science, Technology, Engineering & Mathematics",
      ],
    ],
  },
  {
    badges: [["calendar", "January–July 2024"]],
    highlight: [
      "team",
      "People. Decisions. Delivery.",
      "Saint Louis University",
    ],
    cards: [
      [
        "team",
        "SAMCIS KASAMA / SSC Assembly",
        "Deputy Secretary General",
        "Same-day minutes for 40+ meetings across 5 committees and approximately 60 officers. Tracked decisions, deadlines, action items, and attendance.",
      ],
      [
        "book",
        "Records & coordination",
        "One organized source of truth.",
        "Maintained the central Google Drive repository and covered Secretary General duties, correspondence, permits, and stakeholder coordination.",
      ],
      [
        "team",
        "SLU Integrated Confederacy",
        "Officer-in-Charge & First Year IT Representative",
        "Coordinated a Valentine’s booth with approximately ₱6,000 in sales, a Tekken tournament, and basketball and volleyball teams for intramurals.",
      ],
    ],
  },
];
function symbol(name) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.innerHTML = `<path d="${paths[name]}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`;
  return svg;
}
function text(tag, value) {
  const node = document.createElement(tag);
  node.textContent = value;
  return node;
}
export function renderEducationDetails(dialog, index) {
  const record = records[index];
  const summary = dialog.querySelector("#education-dialog-summary");
  summary.replaceChildren();
  for (const [icon, value] of record.badges) {
    const badge = document.createElement("span");
    badge.append(symbol(icon), text("span", value));
    summary.append(badge);
  }
  const mount = dialog.querySelector("#education-dialog-details");
  mount.replaceChildren();
  const [icon, title, subtitle] = record.highlight;
  const highlight = document.createElement("div");
  highlight.className = "education-highlight";
  const copy = document.createElement("div");
  copy.append(text("strong", title), text("span", subtitle));
  highlight.append(symbol(icon), copy);
  mount.append(highlight);
  const grid = document.createElement("div");
  grid.className = "education-detail-grid";
  for (const [icon, label, value, detail] of record.cards) {
    const card = document.createElement("article");
    const heading = document.createElement("div");
    heading.className = "education-detail-label";
    heading.append(symbol(icon), text("span", label));
    card.append(heading, text("h3", value));
    if (detail) card.append(text("p", detail));
    grid.append(card);
  }
  mount.append(grid);
  dialog.querySelector("#education-dialog-note").hidden = true;
}
