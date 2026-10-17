import { test } from "node:test";
import assert from "node:assert/strict";
import { nightLighting } from "../src/night-lighting.js";

test("night lighting lowers daylight and strengthens practical illumination", () => {
  const day = nightLighting(0),
    night = nightLighting(1);
  assert.ok(night.ambient < day.ambient);
  assert.ok(night.sun < day.sun);
  assert.ok(night.reflection < day.reflection);
  assert.ok(night.lamp > day.lamp);
  assert.ok(night.rim > 0 && night.ambient > 0);
  assert.deepEqual(nightLighting(-1), day);
  assert.deepEqual(nightLighting(2), night);
});

test("study remains lit and changing chapter cannot bring daylight back at night", () => {
  assert.deepEqual(nightLighting(1, 0), nightLighting(1, 1));
  for (let n = 0; n <= 1; n += 0.05)
    for (const s of [0, 0.5, 1]) {
      for (const value of Object.values(nightLighting(n, s)))
        assert.ok(Number.isFinite(value) && value > 0);
    }
  assert.ok(nightLighting(0, 1).sun < nightLighting(0, 0).sun);
});
