// Shared section label. The signal glyph is decorative CSS, so updating the
// label never removes it or adds extra text to the accessible heading.
export function setSectionMarker(element, label = element.textContent) {
  element.classList.add("section-marker");
  element.textContent = label.trim().replace(/^\d+\s*\/\s*/, "");
  return element;
}

export function initializeSectionMarkers(root = document) {
  root.querySelectorAll(".section-kicker").forEach((element) => {
    setSectionMarker(element);
  });
}
