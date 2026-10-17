import { TRANSMISSION_DURATION } from "./transmission.js";

// Advance the existing scroll timeline; never maintain a second camera path.
export function createContactLaunch({ button, bounds, reduce, requestFrame }) {
  let flight = null;
  function cancel() {
    flight = null;
    button.disabled = false;
    button.removeAttribute("aria-busy");
  }
  button.addEventListener("click", () => {
    const { start, end } = bounds();
    if (reduce.matches) {
      window.scrollTo({ top: end, behavior: "instant" });
      requestFrame();
      return;
    }
    const from = window.scrollY;
    const progress = Math.max(0, Math.min(1, (from - start) / (end - start)));
    flight = {
      from,
      end,
      started: performance.now(),
      duration: (TRANSMISSION_DURATION / 2) * (1 - progress),
    };
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    requestFrame();
  });
  window.addEventListener("wheel", cancel, { passive: true });
  window.addEventListener("touchstart", cancel, { passive: true });
  window.addEventListener("keydown", (event) => {
    if (
      [
        "Escape",
        "PageUp",
        "PageDown",
        "Home",
        "End",
        "ArrowUp",
        "ArrowDown",
        " ",
      ].includes(event.key)
    )
      cancel();
  });
  window.addEventListener("resize", cancel, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancel();
  });
  return {
    cancel,
    get moving() {
      return Boolean(flight);
    },
    update() {
      if (!flight) return;
      const p = Math.min(
        1,
        (performance.now() - flight.started) / Math.max(1, flight.duration),
      );
      window.scrollTo({
        top: flight.from + (flight.end - flight.from) * p,
        behavior: "instant",
      });
      if (p === 1) cancel();
    },
  };
}
