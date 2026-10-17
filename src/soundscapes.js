import { UPLINK_FIRE } from "./uplink-timing.js";

export const soundscapes = [
  {
    id: "ocean",
    name: "Ocean Drift",
    description: "Soft surf, coastal air, and room to breathe.",
    waves: 1,
    pads: 0,
    keys: 0,
  },
  {
    id: "harbor",
    name: "Harbor Keys",
    description: "Gentle waves with slow, warm keyboard notes.",
    waves: 0.5,
    pads: 0.2,
    keys: 1,
  },
  {
    id: "space",
    name: "Deep Space",
    description: "Airy chords and distant, bell-like signals.",
    waves: 0.15,
    pads: 1,
    keys: 0.35,
  },
];

// Only forward crossings make a cue. Jumping straight to space stays quiet;
// reversing below the thresholds naturally rearms them for the next ascent.
export function flightCues(previous, progress) {
  const before = previous ?? 0;
  if (progress <= before) return [];
  if (before < UPLINK_FIRE && progress >= UPLINK_FIRE && progress < 0.5)
    return ["fire"];
  return [];
}
export function volumeGain(percent) {
  return (Math.max(0, Math.min(100, percent)) / 100) ** 2;
}

// Match the visual boundary: keep the coastal score until the sky is gone.
export function journeySoundscape(atmosphere) {
  return atmosphere >= 1 ? "space" : "harbor";
}
