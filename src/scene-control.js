import { scanBearing } from "./geometry.js";
import { transmissionPhases } from "./transmission.js";

// Scripted views own both position and look direction. OrbitControls.update()
// still enforces its limits when disabled, so it must not run on these frames.
export function applyScriptedView(camera, controls, position, target) {
  camera.position.copy(position);
  controls.target.copy(target);
  camera.lookAt(controls.target);
  camera.updateMatrixWorld();
}
export function updateInteractiveView(controls, scripted = false) {
  if (controls.enabled && !scripted) controls.update();
}
export function captureDishPose(model) {
  return {
    bearing: (model.yaw.rotation.y * 180) / Math.PI,
    elevation: (-model.tilt.rotation.x * 180) / Math.PI,
  };
}
export function advanceDishScan(time, dt, running) {
  const next = time + (running ? Math.max(0, dt) : 0);
  return { time: next, bearing: scanBearing(next) };
}

export function alignedDishPose(entry, progress) {
  const amount = transmissionPhases(progress).alignment;
  return {
    bearing: entry.bearing + (1 - entry.bearing) * amount,
    elevation: entry.elevation + (49 - entry.elevation) * amount,
  };
}
