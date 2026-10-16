import { test } from "node:test";
import assert from "node:assert/strict";
import * as THREE from "../vendor/three.module.js";
import { createOperator } from "../src/operator.js";

test("operator is solid finite geometry grounded beside the console", () => {
  const operator = createOperator();
  operator.root.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(operator.root);
  assert.ok(bounds.min.y >= 0.92 && bounds.min.y < 0.95);
  assert.ok(bounds.max.y > 3.5 && bounds.max.y < 4);
  let meshes = 0,
    shadowCasters = 0;
  operator.root.traverse((object) => {
    if (!object.isMesh) return;
    meshes++;
    if (object.castShadow) shadowCasters++;
    assert.ok(object.receiveShadow);
    assert.ok(
      [...object.geometry.attributes.position.array].every(Number.isFinite),
    );
    assert.ok(
      [...object.geometry.attributes.normal.array].every(Number.isFinite),
    );
  });
  assert.ok(meshes > 50 && meshes < 150);
  assert.ok(shadowCasters > meshes * 0.7);
});

test("adult silhouette keeps long legs and a lean shoulder-to-hip taper", () => {
  const operator = createOperator();
  operator.root.rotation.y = 0;
  operator.root.updateMatrixWorld(true);
  const size = (object) =>
    new THREE.Box3().setFromObject(object).getSize(new THREE.Vector3());
  const full = new THREE.Box3().setFromObject(operator.root);
  const height = size(operator.root).y;
  const headRatio = height / size(operator.head).y;
  assert.ok(headRatio >= 6.5 && headRatio <= 7.25);
  const hips = operator.root.getObjectByName("Narrow tailored hips");
  const shoulders = operator.root.getObjectByName(
    "Broad shoulders and tapered waist",
  );
  const taper = size(shoulders).x / size(hips).x;
  assert.ok(taper > 1.5 && taper < 1.65);
  assert.ok(size(shoulders).z / size(shoulders).x < 0.53);
  const hipHeight = hips.getWorldPosition(new THREE.Vector3()).y - full.min.y;
  assert.ok(hipHeight / height > 0.5 && hipHeight / height < 0.56);
});

test("operator motion keeps feet grounded, allocates no new meshes, and settles for reduced motion", () => {
  const operator = createOperator();
  const origin = operator.root.position.clone();
  const objects = [];
  operator.root.traverse((object) => objects.push(object));
  for (let i = 0; i < 600; i++)
    operator.update(i / 60, { uplink: i > 300, dt: 1 / 60 });
  assert.ok(operator.head.rotation.x < -0.29);
  assert.ok(operator.root.position.equals(origin));
  const after = [];
  operator.root.traverse((object) => after.push(object));
  assert.deepEqual(after, objects);
  operator.update(10, { reduced: true });
  operator.root.updateMatrixWorld(true);
  const pose = objects.map((object) => object.matrixWorld.toArray());
  operator.update(200, { reduced: true, uplink: true });
  operator.root.updateMatrixWorld(true);
  assert.deepEqual(
    objects.map((object) => object.matrixWorld.toArray()),
    pose,
  );
});
