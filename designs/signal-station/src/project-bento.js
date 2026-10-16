// Native adaptation of Magic UI's Bento Grid composition (MIT).
// Uses the station's existing dialog and local assets; no additional UI runtime.
import { technologyChip } from "./tech-logos.js";

function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}
let lightbox;
let imageOpener;
function enlarge(feature, src, opener) {
  if (!lightbox) {
    lightbox = node("dialog", "project-image-dialog");
    lightbox.setAttribute("aria-labelledby", "project-image-title");
    const close = node("button", "image-close", "×");
    close.setAttribute("aria-label", "Close project image");
    close.addEventListener("click", () => lightbox.close());
    const image = node("img");
    const title = node("h2");
    title.id = "project-image-title";
    const copy = node("p");
    lightbox.append(close, image, title, copy);
    lightbox.addEventListener("close", () =>
      imageOpener?.focus({ preventScroll: true }),
    );
    document.body.append(lightbox);
  }
  imageOpener = opener;
  const image = lightbox.querySelector("img");
  image.src = src;
  image.alt = feature.alt;
  lightbox.querySelector("h2").textContent = feature.title;
  lightbox.querySelector("p").textContent = feature.detail;
  lightbox.showModal();
}

export function renderProjectBento(project, mount) {
  mount.replaceChildren();
  mount.hidden = !project.bento;
  if (!project.bento) return false;
  const grid = node("div", "project-bento-grid");
  const overview = node("article", "bento-card bento-overview");
  overview.append(
    node("span", "bento-eyebrow", "FRONTEND PROTOTYPE"),
    node("h3", "", project.bento.headline),
    node("p", "", project.description),
  );
  const tags = node("div", "bento-tags");
  tags.append(
    node("span", "", "Local-first"),
    node("span", "", "Fictional demo data"),
  );
  overview.append(tags);
  const stack = node("article", "bento-card bento-stack");
  stack.append(
    node("span", "bento-eyebrow", "THE BUILD"),
    node("h3", "", "A familiar stack. A focused workflow."),
  );
  const chips = node("div", "technology-list");
  project.technologies
    .filter((label) => !["Emotion", "ApexCharts"].includes(label))
    .forEach((label) => chips.append(technologyChip(label)));
  stack.append(
    chips,
    node(
      "p",
      "bento-stack-extra",
      "Emotion · ApexCharts · React Context & hooks · localStorage",
    ),
  );
  grid.append(overview, stack);
  for (const [index, feature] of project.bento.features.entries()) {
    const button = node(
      "button",
      `bento-card bento-shot bento-shot-${index + 1} tone-${feature.tone}`,
    );
    button.setAttribute("aria-label", `Enlarge ${feature.title}`);
    const src = `assets/projects/laundrify/${feature.image}`;
    const image = node("img");
    image.src = src;
    image.alt = feature.alt;
    image.width = 1920;
    image.height = 1080;
    image.loading = index < 2 ? "eager" : "lazy";
    image.decoding = "async";
    const caption = node("span", "bento-shot-caption");
    const copy = node("span", "");
    copy.append(
      node("strong", "", feature.title),
      node("span", "", feature.caption),
    );
    const expand = node("span", "bento-expand");
    expand.dataset.icon = "arrows-out-cardinal";
    expand.setAttribute("aria-hidden", "true");
    caption.append(copy, expand);
    button.append(image, caption);
    button.addEventListener("click", () => enlarge(feature, src, button));
    grid.append(button);
  }
  const approach = node("article", "bento-card bento-approach");
  approach.append(
    node("span", "bento-eyebrow", "ENGINEERING APPROACH"),
    node("h3", "", "Built to stay understandable."),
    node("p", "", project.bento.approach),
    node("small", "", project.bento.foundation),
  );
  const scope = node("article", "bento-card bento-scope");
  scope.append(
    node("span", "bento-eyebrow", "SCOPE, CLEARLY"),
    node("h3", "", "A working frontend prototype."),
    node("p", "", project.note),
  );
  grid.append(approach, scope);
  mount.append(grid);
  return true;
}
