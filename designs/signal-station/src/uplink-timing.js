export const UPLINK_FIRE = 0.32;
export const UPLINK_DEPARTURE = 0.34;
export const UPLINK_SCROLL_HEIGHTS = 5.5;

// A sustained charge follows scroll in either direction, including a held pose.
export function chargeAmount(progress) {
  return progress > 0 && progress < UPLINK_FIRE
    ? Math.min(1, progress / UPLINK_FIRE)
    : 0;
}
