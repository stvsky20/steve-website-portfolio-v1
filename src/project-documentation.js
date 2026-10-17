import { enlarge } from "./project-bento.js";

export const ayosPhotos = [
  {
    src: "assets/projects/ayos/PSC%20X%20documentation.jpg",
    title: "AYOS! on the pitch floor",
    alt: "AYOS! team presenting at Philippine Startup Challenge X, in a photo published by DICT Cordillera Administrative Region.",
    detail:
      "Philippine Startup Challenge X · AYOS! pitch presentation. Photo: DICT Cordillera Administrative Region.",
    width: 2000,
    height: 1308,
  },
  {
    src: "assets/projects/ayos/psc%20x%20documentation-2.jpg",
    title: "The team behind AYOS!",
    alt: "AYOS! teammates posing together at the Philippine Startup Challenge event.",
    detail:
      "A moment with the AYOS! team during Philippine Startup Challenge X.",
    width: 512,
    height: 683,
  },
];

export function renderProjectDocumentation(mount, enabled) {
  mount.replaceChildren();
  mount.className = "project-documentation";
  mount.hidden = !enabled;
  if (!enabled) return;
  mount.setAttribute(
    "aria-label",
    "AYOS! and Philippine Startup Challenge X documentation",
  );
  for (const photo of ayosPhotos) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "documentation-photo";
    button.setAttribute("aria-label", `Enlarge ${photo.title}`);
    const image = document.createElement("img");
    Object.assign(image, {
      src: photo.src,
      alt: photo.alt,
      width: photo.width,
      height: photo.height,
      loading: "lazy",
      decoding: "async",
    });
    const caption = document.createElement("span");
    caption.textContent = photo.title;
    button.append(image, caption);
    button.addEventListener("click", () => enlarge(photo, photo.src, button));
    mount.append(button);
  }
}

export function initializeProjectDocumentation() {
  document
    .querySelectorAll('[data-institution-brands~="psc"]')
    .forEach((brand) => {
      const mount = document.createElement("div");
      brand.after(mount);
      renderProjectDocumentation(mount, true);
    });
}
