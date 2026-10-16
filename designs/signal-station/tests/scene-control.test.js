import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as THREE from "../vendor/three.module.js";
import {
  applyScriptedView,
  updateInteractiveView,
  captureDishPose,
  alignedDishPose,
  advanceDishScan,
} from "../src/scene-control.js";
import { alignmentView } from "../src/transmission.js";

// The browser's import map resolves this bare import; use that same vendored
// module in Node so the regression exercises the actual controller.
const orbitSource = readFileSync(
  new URL("../vendor/OrbitControls.js", import.meta.url),
  "utf8",
).replace(
  "from 'three'",
  `from '${new URL("../vendor/three.module.js", import.meta.url).href}'`,
);
const { OrbitControls } = await import(
  "data:text/javascript;base64," + Buffer.from(orbitSource).toString("base64")
);

test("scripted Beyond camera is not clamped by disabled OrbitControls at entry or exit", () => {
  for (const mobile of [false, true]) {
    const camera = new THREE.PerspectiveCamera(43, 1, 0.3, 1600),
      controls = new OrbitControls(camera);
    controls.enabled = false;
    controls.maxPolarAngle = 1.38;
    const start = {
      position: new THREE.Vector3(...(mobile ? [25, 14, 36] : [15, 14.5, 17])),
      target: new THREE.Vector3(
        ...(mobile ? [4.8, 15.5, 0] : [-0.8, 11.2, 0.5]),
      ),
    };
    applyScriptedView(camera, controls, start.position, start.target);
    controls.update();
    assert.ok(
      camera.position.distanceTo(start.position) > 0.1,
      "old unconditional update reproduces the camera offset",
    );
    for (const p of [0, 0.00001, 0.03, 0.17, 0.03, 0.00001, 0]) {
      const view = alignmentView(start, p);
      applyScriptedView(camera, controls, view.position, view.target);
      updateInteractiveView(controls);
      assert.ok(camera.position.distanceTo(view.position) < 1e-10);
      const direction = camera.getWorldDirection(new THREE.Vector3());
      assert.ok(
        direction.dot(view.target.clone().sub(view.position).normalize()) >
          0.999999,
      );
    }
  }
});

test("alignment uses the visible rotating dish pose without resetting to a preset", () => {
  for (const bearing of [-27, -10, 0, 18, 38]) {
    const model = { yaw: new THREE.Group(), tilt: new THREE.Group() };
    model.yaw.rotation.y = THREE.MathUtils.degToRad(bearing);
    model.tilt.rotation.x = THREE.MathUtils.degToRad(-42);
    const entry = captureDishPose(model);
    assert.ok(Math.abs(entry.bearing - bearing) < 1e-10);
    assert.ok(Math.abs(entry.elevation - 42) < 1e-10);
    assert.deepEqual(alignedDishPose(entry, 0), entry);
    assert.ok(
      Math.abs(alignedDishPose(entry, 0.00001).bearing - entry.bearing) <
        0.00001,
    );
    assert.deepEqual(alignedDishPose(entry, 0.17), {
      bearing: 1,
      elevation: 49,
    });
    assert.deepEqual(
      alignedDishPose(entry, 0),
      entry,
      "reverse scroll recovers the captured pose",
    );
  }
});

test("dish scan phase freezes during flight and resumes without jumping to the global clock", () => {
  const before = advanceDishScan(80, 1 / 60, true);
  const afterFlight = advanceDishScan(before.time, 30, false);
  assert.deepEqual(afterFlight, before);
  const resumed = advanceDishScan(afterFlight.time, 1 / 60, true);
  assert.ok(Math.abs(resumed.bearing - before.bearing) < 0.03);
  assert.ok(resumed.time > before.time);
});
