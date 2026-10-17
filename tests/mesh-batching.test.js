import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "../vendor/three.module.js";
import { batchStaticMeshes } from "../src/mesh-batching.js";

test("batching preserves transforms, bounds, picking actions, materials and shadows", () => {
  const root = new THREE.Group();
  const moving = new THREE.Group();
  moving.position.set(3, 2, -1);
  root.add(moving);
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshStandardMaterial();
  const matrices = [];
  for (let i = 0; i < 12; i++) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(i * 0.5, i % 3, -i);
    mesh.rotation.z = i * 0.1;
    mesh.scale.set(0.2, 0.5 + i * 0.1, 0.4);
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.userData.action = "dish";
    mesh.updateMatrix();
    matrices.push(mesh.matrix.clone());
    moving.add(mesh);
  }
  root.updateMatrixWorld(true);
  const before = new THREE.Box3().setFromObject(root);
  assert.deepEqual(batchStaticMeshes(root), {
    originals: 12,
    batches: 1,
    saved: 11,
  });
  const batch = moving.children[0];
  assert.ok(batch.isInstancedMesh);
  assert.equal(batch.material, material);
  assert.equal(batch.userData.action, "dish");
  assert.ok(batch.castShadow && batch.receiveShadow);
  const actual = new THREE.Matrix4();
  matrices.forEach((matrix, i) => {
    batch.getMatrixAt(i, actual);
    actual.elements.forEach((v, j) =>
      assert.ok(Math.abs(v - matrix.elements[j]) < 1e-6),
    );
  });
  root.updateMatrixWorld(true);
  const after = new THREE.Box3().setFromObject(root);
  assert.ok(before.min.distanceTo(after.min) < 1e-6);
  assert.ok(before.max.distanceTo(after.max) < 1e-6);
  moving.rotation.y = 0.8;
  root.updateMatrixWorld(true);
  assert.ok(!new THREE.Box3().setFromObject(root).equals(before));
});

test("dynamic, transparent, excluded and differently interactive meshes stay separate", () => {
  const root = new THREE.Group();
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial();
  const excluded = new Set();
  for (let i = 0; i < 12; i++) {
    const mesh = new THREE.Mesh(geometry, material);
    root.add(mesh);
    if (i < 4) mesh.userData.dynamic = true;
    else if (i < 8) excluded.add(mesh);
    else mesh.userData.action = `project:${i}`;
  }
  assert.equal(batchStaticMeshes(root, excluded).saved, 0);
  assert.equal(root.children.length, 12);
  const transparent = material.clone();
  transparent.transparent = true;
  for (let i = 0; i < 5; i++) root.add(new THREE.Mesh(geometry, transparent));
  assert.equal(batchStaticMeshes(root, excluded).saved, 0);
});
