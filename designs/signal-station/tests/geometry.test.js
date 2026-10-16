import { test } from "node:test";
import assert from "node:assert/strict";
import {
  dishGeometry,
  cliffGeometry,
  scanBearing,
  seededRandom,
  clamp,
} from "../src/geometry.js";
test("dish is a finite concave paraboloid with its rim at the requested depth", () => {
  const geometry = dishGeometry(3.7, 1.08, 18, 80),
    position = geometry.attributes.position;
  assert.equal(position.count, 19 * 81);
  assert.equal(geometry.index.count, 18 * 80 * 6);
  for (let i = 0; i < position.count; i++) {
    const r = Math.hypot(position.getX(i), position.getY(i));
    assert.ok(Number.isFinite(position.getZ(i)));
    assert.ok(Math.abs(position.getZ(i) - 1.08 * (r / 3.7) ** 2) < 0.00001);
  }
  geometry.dispose();
});
test("cliff meshes have finite normalized surface normals", () => {
  for (const seed of [2, 9, -15, 42]) {
    const geometry = cliffGeometry(seed, 8, 9);
    for (const name of ["position", "normal"])
      assert.ok([...geometry.attributes[name].array].every(Number.isFinite));
    const n = geometry.attributes.normal;
    for (let i = 0; i < n.count; i++)
      assert.ok(
        Math.abs(Math.hypot(n.getX(i), n.getY(i), n.getZ(i)) - 1) < 0.0001,
      );
    geometry.dispose();
  }
});
test("automatic bearing moves smoothly within manual travel limits", () => {
  let previous = scanBearing(0),
    changed = false;
  for (let t = 0; t < 300; t += 1 / 60) {
    const next = scanBearing(t);
    assert.ok(next >= -75 && next <= 75);
    assert.ok(Math.abs(next - previous) < 0.05);
    if (Math.abs(next - previous) > 0.001) changed = true;
    previous = next;
  }
  assert.ok(changed);
});
test("manual aiming clamps mechanical stops and seeded scenery stays repeatable", () => {
  assert.equal(clamp(110, -75, 75), 75);
  assert.equal(clamp(-110, -75, 75), -75);
  const a = seededRandom(197),
    b = seededRandom(197);
  for (let i = 0; i < 100; i++) assert.equal(a(), b());
});
