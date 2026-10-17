import { test } from "node:test";
import assert from "node:assert/strict";
import { islandGeometry } from "../src/coastline.js";

test("coastal terrain has submerged boundaries and finite normals from every view", () => {
  const geometry = islandGeometry(280, 85, 26, 1.2);
  const positions = geometry.attributes.position;
  let summit = -Infinity;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i),
      y = positions.getY(i),
      z = positions.getZ(i);
    assert.ok(Number.isFinite(x + y + z));
    summit = Math.max(summit, y);
    if (Math.abs(x) > 139.99 || Math.abs(z) > 42.49) assert.ok(y < -3.4);
  }
  assert.ok(summit > -3.4, "land must rise above the sea");
  assert.ok([...geometry.attributes.normal.array].every(Number.isFinite));
  geometry.dispose();
});
