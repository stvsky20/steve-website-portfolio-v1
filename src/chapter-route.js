export function chapterRouteStates(active, count) {
  const current = Math.max(
    0,
    Math.min(count - 1, Number.isFinite(active) ? active : 0),
  );
  return Array.from({ length: count }, (_, i) =>
    i < current ? "complete" : i === current ? "current" : "upcoming",
  );
}

// Enhance the existing anchors, retaining their identities, destinations and
// keyboard navigation. The story owns scroll; this component owns its display.
export function createChapterRoute(element) {
  const links = [...element.querySelectorAll("a")];
  const pause = element.querySelector("button");
  const title = document.createElement("div");
  title.className = "signal-route-title";
  title.textContent = "THE SIGNAL ROUTE";
  title.setAttribute("aria-hidden", "true");
  const list = document.createElement("ol");
  list.className = "signal-route-list";
  const stops = links.map((link, index) => {
    const number =
      link.querySelector("span")?.textContent.trim() ||
      String(index + 1).padStart(2, "0");
    const label = [...link.childNodes]
      .filter((node) => node.nodeType === 3)
      .map((node) => node.textContent)
      .join("")
      .trim();
    const item = document.createElement("li");
    item.className = "signal-route-stop";
    const node = document.createElement("span");
    node.className = "signal-route-node";
    node.textContent = number;
    node.setAttribute("aria-hidden", "true");
    const name = document.createElement("span");
    name.className = "signal-route-label";
    name.textContent = label;
    link.replaceChildren(node, name);
    item.append(link);
    list.append(item);
    return item;
  });
  const pauseLabel = document.createElement("span");
  pauseLabel.className = "signal-route-pause-label";
  pauseLabel.textContent = "Pause motion";
  pause.append(pauseLabel);
  element.classList.add("signal-route");
  element.replaceChildren(title, list, pause);
  let previous = "";
  return {
    links,
    pause,
    update(active, paused, reduced) {
      const key = `${active}/${paused}/${reduced}`;
      if (key === previous) return;
      previous = key;
      chapterRouteStates(active, stops.length).forEach((state, index) => {
        stops[index].dataset.state = state;
        if (state === "current")
          links[index].setAttribute("aria-current", "step");
        else links[index].removeAttribute("aria-current");
      });
      pause.setAttribute("aria-pressed", String(paused || reduced));
      pause.setAttribute(
        "aria-label",
        reduced
          ? "Reduced motion enabled"
          : paused
            ? "Resume ambient motion"
            : "Pause ambient motion",
      );
      pause.disabled = reduced;
      pauseLabel.textContent = reduced
        ? "Motion reduced"
        : paused
          ? "Resume motion"
          : "Pause motion";
    },
  };
}
