// Exponential damping is time based: identical catch-up at any display refresh rate.
// About 95% of the distance is covered in 0.36s; the tail settles exactly to target.
export function scrubPosition(current, target, dt, immediate = false) {
  if (immediate || current === null) return { position: target, moving: false };
  const position =
    target + (current - target) * Math.exp(-Math.max(0, dt) / 0.12);
  if (Math.abs(target - position) < 0.1)
    return { position: target, moving: false };
  return { position, moving: true };
}
