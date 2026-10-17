import * as THREE from "../vendor/three.module.js";
import { clamp } from "./geometry.js";
import {
  UPLINK_FIRE,
  UPLINK_DEPARTURE,
  UPLINK_SCROLL_HEIGHTS,
} from "./uplink-timing.js";

const smooth = (p) => {
  p = clamp(p, 0, 1);
  return p * p * (3 - 2 * p);
};
export const TRANSMISSION_DURATION = 15000;
export function scrollTransmission(scroll, start, height) {
  return clamp(
    (scroll - start - height * 0.25) / (height * UPLINK_SCROLL_HEIGHTS),
    0,
    1,
  );
}

// Atmosphere, stars, and planets have deliberately separate visibility windows.
// Planet geometry must never be revealed while the daylight sky is still present.
export function transmissionPhases(progress) {
  // Preserve the established space journey after a longer stationary charge.
  const flight =
    0.17 +
    (Math.max(0, progress - UPLINK_DEPARTURE) * 0.83) / (1 - UPLINK_DEPARTURE);
  return {
    flight,
    alignment: smooth(progress / 0.17),
    entry: smooth(progress / 0.1),
    travel: smooth((progress - UPLINK_DEPARTURE) / (1 - UPLINK_DEPARTURE)),
    atmosphere: smooth((flight - 0.3) / 0.31),
    stars: smooth((flight - 0.64) / 0.13),
    planets: smooth((flight - 0.78) / 0.18),
    pulse: clamp((progress - UPLINK_FIRE) / (0.83 - UPLINK_FIRE), 0, 1),
    stage:
      progress < 0.1
        ? "Aligning the uplink"
        : progress < UPLINK_FIRE
          ? "Charging the dish"
          : flight < 0.22
            ? "Sending a pulse into the sky"
            : flight < 0.45
              ? "Climbing through the cloud layer"
              : flight < 0.64
                ? "Leaving the atmosphere"
                : flight < 0.78
                  ? "Crossing into deep space"
                  : "Acquiring planetary signals",
  };
}
export function transmissionPaths(start, target, destination) {
  const v = (a) => new THREE.Vector3(...a);
  return {
    points: [
      start.clone(),
      v([19, 23, 0]),
      v([13, 39, 18]),
      v([9, 80, 35]),
      v([7, 123, 47]),
      destination.position.clone(),
    ],
    targets: [
      target.clone(),
      v([6, 25, 12]),
      v([7, 60, 40]),
      v([7, 115, 82]),
      v([7, 145, 117]),
      destination.target.clone(),
    ],
  };
}

// Begin at the exact Beyond pose, then ease toward the dish before climbing.
export function alignmentView(start, progress) {
  const mobile = start.position.z > 32;
  const mix = transmissionPhases(progress).alignment;
  return {
    position: start.position
      .clone()
      .lerp(new THREE.Vector3(...(mobile ? [18, 16, 25] : [13, 16, 14])), mix),
    target: start.target.clone().lerp(new THREE.Vector3(4.8, 12.8, 0), mix),
  };
}
