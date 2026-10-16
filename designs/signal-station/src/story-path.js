export const clamp01 = (value) => Math.max(0, Math.min(1, value));
// Each destination holds through most of its chapter. Travel occupies the
// final part of the interval, leaving the reading surface visually still.
export function sampleStory(stops, scroll, reduced = false) {
  if (scroll <= stops[0].at) return { from: 0, to: 0, mix: 0 };
  for (let i = 1; i < stops.length; i++) {
    if (scroll <= stops[i].at) {
      const span = stops[i].at - stops[i - 1].at;
      const progress = clamp01((scroll - stops[i - 1].at) / span);
      const travel = clamp01((progress - 0.62) / 0.38);
      const mix = reduced
        ? progress < 1
          ? 0
          : 1
        : travel * travel * (3 - 2 * travel);
      return { from: i - 1, to: i, mix };
    }
  }
  const last = stops.length - 1;
  return { from: last, to: last, mix: 0 };
}
