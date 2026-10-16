import { test } from "node:test";
import assert from "node:assert/strict";
import { beveledBox } from "../src/cinematic.js";

test("bevelled models preserve unit bounds and readable front/top texture mapping", () => {
  const geometry = beveledBox();
  geometry.computeBoundingBox();
  for (const axis of ["x", "y", "z"]) {
    assert.ok(Math.abs(geometry.boundingBox.min[axis] + 0.5) < 0.00001);
    assert.ok(Math.abs(geometry.boundingBox.max[axis] - 0.5) < 0.00001);
  }
  const p = geometry.attributes.position,
    n = geometry.attributes.normal,
    uv = geometry.attributes.uv;
  let front = 0,
    top = 0;
  for (let i = 0; i < p.count; i++) {
    assert.ok(Number.isFinite(n.getX(i) + n.getY(i) + n.getZ(i)));
    if (n.getZ(i) > 0.999) {
      assert.ok(Math.abs(uv.getX(i) - (p.getX(i) + 0.5)) < 0.00001);
      assert.ok(Math.abs(uv.getY(i) - (p.getY(i) + 0.5)) < 0.00001);
      front++;
    }
    if (n.getY(i) > 0.999) {
      assert.ok(Math.abs(uv.getX(i) - (p.getX(i) + 0.5)) < 0.00001);
      assert.ok(Math.abs(uv.getY(i) - (0.5 - p.getZ(i))) < 0.00001);
      top++;
    }
  }
  assert.ok(front > 0 && top > 0);
});
