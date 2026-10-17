const contacts = new Set(["github", "linkedin", "email", "instagram", "phone"]);

export function contactMark(id) {
  const mark = document.createElement("span");
  mark.className = "contact-mark";
  mark.setAttribute("aria-hidden", "true");
  if (!contacts.has(id)) return mark;
  const image = document.createElement("img");
  image.src = `assets/contact/${id}.svg`;
  image.alt = "";
  image.width = image.height = 24;
  mark.append(image);
  return mark;
}
