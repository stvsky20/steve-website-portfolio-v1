import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "../vendor/three.module.js";
import { coreMotion } from "../src/core-motion.js";
import { createSignalCore, coreTools } from "../src/signal-core.js";
import { createCoreInspection } from "../src/core-inspection.js";

test("core disassembly is bounded, sequential, and returns exactly to assembly", () => {
  assert.deepEqual(coreMotion(0), { cover: 0, modules: [0, 0, 0, 0, 0, 0] });
  assert.deepEqual(coreMotion(1), { cover: 1, modules: [1, 1, 1, 1, 1, 1] });
  for (let i = 0; i <= 100; i++) {
    const pose = coreMotion(i / 100);
    assert.ok(pose.cover >= 0 && pose.cover <= 1);
    pose.modules.forEach((amount, index) => {
      assert.ok(Number.isFinite(amount) && amount >= 0 && amount <= 1);
      assert.ok(index === 0 || amount <= pose.modules[index - 1]);
    });
  }
  assert.ok(coreMotion(0.18).cover > 0);
  assert.ok(coreMotion(0.18).modules.every((amount) => amount === 0));
  const forward = [0, 0.2, 0.5, 0.9, 1].map((p) => coreMotion(p));
  const backward = [1, 0.9, 0.5, 0.2, 0].map((p) => coreMotion(p)).reverse();
  assert.deepEqual(forward, backward);
});
test("reduced motion keeps the machine assembled at every scroll position", () => {
  for (const p of [-1, 0, 0.2, 0.8, 1, 2, NaN])
    assert.deepEqual(coreMotion(p, true), {
      cover: 0,
      modules: [0, 0, 0, 0, 0, 0],
    });
});
test("all six selectable mesh assemblies retain finite transforms through travel", () => {
  const material = new THREE.MeshStandardMaterial();
  const materials = Object.fromEntries(
    ["metal", "rust", "label", "dark", "screen", "lamp"].map((key) => [
      key,
      material,
    ]),
  );
  const core = createSignalCore(new THREE.Group(), materials);
  assert.equal(core.parts.length, coreTools.length);
  assert.equal(new Set(core.parts.map((part) => part.group)).size, 6);
  for (const p of [0, 0.1, 0.35, 0.65, 1, 0.35, 0]) {
    core.update(p, 4, false);
    core.root.updateMatrixWorld(true);
    core.parts.forEach((part, index) => {
      assert.ok(part.group.matrixWorld.elements.every(Number.isFinite));
      assert.equal(part.board.userData.action, `tool:${index}`);
      if (p === 0) assert.ok(part.group.position.equals(part.assembled));
      if (p === 1)
        assert.ok(part.group.position.distanceTo(part.exploded) < 1e-9);
    });
  }
});

test("inspection cycling and exit always restore the original module visibility", () => {
  const material = new THREE.MeshStandardMaterial();
  const materials = Object.fromEntries(
    ["metal", "rust", "label", "dark", "screen", "lamp"].map((key) => [
      key,
      material,
    ]),
  );
  const core = createSignalCore(new THREE.Group(), materials);
  const camera = new THREE.PerspectiveCamera(43, 1.5, 0.1, 100);
  camera.position.set(0, 4, 10);
  camera.lookAt(0, 3, 0);
  camera.updateMatrixWorld(true);
  core.update(1, -1, false);
  core.root.updateMatrixWorld(true);
  const inspection = createCoreInspection(core, camera);
  inspection.select(0);
  inspection.update(performance.now(), true, 1.5);
  assert.equal(core.parts[0].group.visible, false);
  inspection.select(4);
  inspection.update(performance.now(), true, 1.5);
  assert.equal(core.parts[0].group.visible, true);
  assert.equal(core.parts[4].group.visible, false);
  inspection.clear();
  inspection.update(performance.now(), true, 1.5);
  assert.ok(core.parts.every((part) => part.group.visible));
});

test("the inspection pass preserves renderer clearing state and stops after exit", () => {
  const material = new THREE.MeshStandardMaterial();
  const materials = Object.fromEntries(
    ["metal", "rust", "label", "dark", "screen", "lamp"].map((key) => [
      key,
      material,
    ]),
  );
  const core = createSignalCore(new THREE.Group(), materials);
  const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 100);
  camera.position.z = 10;
  camera.updateMatrixWorld(true);
  const inspection = createCoreInspection(core, camera);
  let passes = 0,
    clears = 0;
  const renderer = {
    autoClear: true,
    clearDepth() {
      clears++;
    },
    render() {
      passes++;
    },
  };
  inspection.select(1);
  inspection.update(performance.now(), true, 1);
  inspection.render(renderer);
  assert.equal(renderer.autoClear, true);
  assert.equal(passes, 1);
  assert.equal(clears, 1);
  inspection.clear();
  inspection.update(performance.now(), true, 1);
  inspection.render(renderer);
  assert.equal(passes, 1);
});
