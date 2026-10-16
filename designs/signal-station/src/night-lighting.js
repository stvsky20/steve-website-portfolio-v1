// Scene lighting stays independent of the flight's atmosphere/space fade.
export function nightLighting(amount, study = 0) {
  const n = Math.min(1, Math.max(0, amount));
  const s = Math.min(1, Math.max(0, study));
  return {
    ambient: (1.25 - s * 0.55) * (1 - n) + 0.22 * n,
    sun: (4.3 - s * 3.8) * (1 - n) + 0.24 * n,
    rim: (1.5 - s * 1.15) * (1 - n) + 0.85 * n,
    reflection: 0.45 * (1 - n) + 0.065 * n,
    lamp: 2 + n * 1.5,
  };
}
