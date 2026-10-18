// User-supplied artwork: preserve original proportions and brand colors.
export const institutionBrands = {
  ust: {
    name: "University of Santo Tomas — Senior High School",
    image: "assets/education/ust-shs-transparent.png",
    width: 1246,
    height: 1263,
  },
  slu: {
    name: "Saint Louis University",
    image: "assets/education/slu-transparent.png",
    width: 1011,
    height: 1556,
  },
  psc: {
    name: "Philippine Startup Challenge X",
    image: "assets/education/psc%20X.png",
    width: 599,
    height: 229,
  },
};

export function renderInstitutionBrands(mount, ids = []) {
  mount.replaceChildren();
  mount.classList.add("institution-brands");
  mount.hidden = !ids.length;
  for (const id of ids) {
    const brand = institutionBrands[id];
    if (!brand) continue;
    const figure = document.createElement("span");
    figure.className = `institution-brand institution-brand-${id}`;
    const image = document.createElement("img");
    image.src = brand.image;
    image.alt = `${brand.name} logo`;
    image.width = brand.width;
    image.height = brand.height;
    figure.append(image);
    if (id === "slu" || id === "ust") {
      const label = document.createElement("span");
      label.textContent = brand.name;
      figure.append(label);
    }
    mount.append(figure);
  }
}

export function initializeInstitutionBrands(root = document) {
  root
    .querySelectorAll("[data-institution-brands]")
    .forEach((mount) =>
      renderInstitutionBrands(
        mount,
        mount.dataset.institutionBrands.split(" ").filter(Boolean),
      ),
    );
}
