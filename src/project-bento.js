// Native adaptation of Magic UI's Bento Grid composition (MIT).
// Uses the station's existing dialog and local assets; no additional UI runtime.
import { technologyChip } from "./tech-logos.js";
import { renderInstitutionBrands } from "./institution-brands.js";

function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}
let lightbox;
let imageOpener;
export function enlarge(feature, src, opener) {
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
  mount.hidden = false;
  const bento = project.bento || {};
  if (bento.story?.length) {
    const story = node("section", "project-story");
    story.setAttribute("aria-label", "The story behind the project");
    for (const chapter of bento.story) {
      const card = node("article", "bento-card project-story-card");
      card.append(
        node("span", "bento-eyebrow", chapter.label),
        node("h3", "", chapter.title),
        node("p", "", chapter.copy),
      );
      story.append(card);
    }
    mount.append(story);
  }
  const grid = node("div", "project-bento-grid");
  if (!bento.features?.length) grid.classList.add("bento-without-images");
  const overview = node("article", "bento-card bento-overview");
  overview.append(
    node("span", "bento-eyebrow", bento.eyebrow || "PROJECT PREVIEW"),
    node("h3", "", bento.headline || project.title),
    node("p", "", project.description),
  );
  const tags = node("div", "bento-tags");
  for (const tag of bento.tags || []) tags.append(node("span", "", tag));
  overview.append(tags);
  const stack = node("article", "bento-card bento-stack");
  stack.append(
    node("span", "bento-eyebrow", "THE BUILD"),
    node("h3", "", "The tools behind the work."),
  );
  const chips = node("div", "technology-list");
  project.technologies.forEach((label) => chips.append(technologyChip(label)));
  stack.append(chips);
  if (project.technologies.length) grid.append(overview, stack);
  else grid.append(overview);
  for (const [index, feature] of (bento.features || []).entries()) {
    const button = node(
      "button",
      `bento-card bento-shot bento-shot-${index + 1} tone-${feature.tone}`,
    );
    // Continue the same alternating 60/40 composition for any gallery length.
    button.style.setProperty("--bento-span", [3, 2, 2, 3, 3, 2][index % 6]);
    button.style.setProperty("--bento-order", index === 0 ? 1 : index + 2);
    button.setAttribute("aria-label", `Enlarge ${feature.title}`);
    const src = feature.src || `${bento.imageBase || ""}${feature.image}`;
    const image = node("img");
    image.src = src;
    image.alt = feature.alt;
    image.width = feature.width || 1920;
    image.height = feature.height || 1080;
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
    node("h3", "", bento.approachTitle || "My contribution"),
  );
  if (bento.approach) approach.append(node("p", "", bento.approach));
  else
    for (const contribution of project.contributions)
      approach.append(node("p", "bento-contribution", contribution));
  if (bento.foundation) approach.append(node("small", "", bento.foundation));
  const scope = node("article", "bento-card bento-scope");
  scope.append(
    node("span", "bento-eyebrow", "SCOPE, CLEARLY"),
    node("h3", "", bento.scopeTitle || "Details to follow."),
    node("p", "", project.recognition),
    node("p", "", project.note),
  );
  if (project.institutions?.length) {
    const brands = node("div");
    renderInstitutionBrands(brands, project.institutions);
    scope.append(brands);
  }
  if (bento.approach || project.contributions.length) grid.append(approach);
  grid.append(scope);
  mount.append(grid);
  return true;
}
