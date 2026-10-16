import { test } from "node:test";
import assert from "node:assert/strict";
import * as THREE from "../vendor/three.module.js";
import {
  transmissionPhases,
  alignmentView,
  transmissionPaths,
  TRANSMISSION_DURATION,
  scrollTransmission,
} from "../src/transmission.js";

test("scroll flight is bounded, reversible, and tied only to scroll distance", () => {
  const start = 1000,
    height = 800;
  assert.equal(scrollTransmission(1000, start, height), 0);
  assert.equal(scrollTransmission(1200, start, height), 0);
  assert.equal(scrollTransmission(3400, start, height), 0.5);
  assert.equal(scrollTransmission(5600, start, height), 1);
  assert.equal(scrollTransmission(9000, start, height), 1);
  const positions = [0, 1200, 1700, 3400, 4000, 5600, 6000];
  const forward = positions.map((scroll) =>
    scrollTransmission(scroll, start, height),
  );
  assert.deepEqual(
    [...positions]
      .reverse()
      .map((scroll) => scrollTransmission(scroll, start, height))
      .reverse(),
    forward,
  );
  for (const value of forward)
    assert.ok(Number.isFinite(value) && value >= 0 && value <= 1);
  const first = transmissionPhases(scrollTransmission(3400, start, height));
  assert.deepEqual(
    transmissionPhases(scrollTransmission(3400, start, height)),
    first,
  );
});

test("planet and star reveals occur only after the daylight sky is fully gone", () => {
  let firstStar = null,
    firstPlanet = null;
  for (let i = 0; i <= 11000; i++) {
    const p = i / 11000,
      phase = transmissionPhases(p);
    for (const key of ["travel", "atmosphere", "stars", "planets", "pulse"])
      assert.ok(phase[key] >= 0 && phase[key] <= 1);
    if (phase.stars > 0) {
      assert.equal(phase.atmosphere, 1);
      firstStar ??= p;
    }
    if (phase.planets > 0) {
      assert.equal(phase.atmosphere, 1);
      assert.equal(phase.stars, 1);
      firstPlanet ??= p;
    }
  }
  assert.ok((firstPlanet - firstStar) * TRANSMISSION_DURATION > 1400);
  assert.equal(transmissionPhases(0.5).planets, 0);
  assert.equal(transmissionPhases(1).planets, 1);
});
test("desktop and mobile flights climb continuously and never lose a valid look direction", () => {
  for (const mobile of [false, true]) {
    const start = new THREE.Vector3(15, 14.5, 14),
      target = new THREE.Vector3(-0.5, 11.2, 0.5);
    const view = {
      position: new THREE.Vector3(
        mobile ? 7 : 20,
        mobile ? 153 : 151,
        mobile ? -20 : 32,
      ),
      target: new THREE.Vector3(mobile ? 7 : 20, mobile ? 138 : 146, 120),
    };
    const paths = transmissionPaths(start, target, view),
      path = new THREE.CatmullRomCurve3(paths.points, false, "centripetal"),
      look = new THREE.CatmullRomCurve3(paths.targets, false, "centripetal");
    assert.ok(path.getPoint(0).distanceTo(start) < 0.00001);
    assert.ok(path.getPoint(1).distanceTo(view.position) < 0.00001);
    let previous = path.getPoint(0),
      previousDirection = null;
    for (let i = 1; i <= 1000; i++) {
      const p = i / 1000,
        position = path.getPoint(p),
        direction = look.getPoint(p).sub(position);
      assert.ok(
        [...position.toArray(), ...direction.toArray()].every(Number.isFinite),
      );
      assert.ok(direction.length() > 4);
      assert.ok(
        position.y >= previous.y - 0.025,
        "The flight should climb rather than dive back through Earth.",
      );
      direction.normalize();
      if (previousDirection)
        assert.ok(
          direction.dot(previousDirection) > 0.98,
          "No abrupt camera turns.",
        );
      previous = position;
      previousDirection = direction;
    }
  }
});

test("Beyond alignment starts at the exact chapter pose and joins the climb without a cut", () => {
  for (const mobile of [false, true]) {
    const start = {
      position: new THREE.Vector3(...(mobile ? [25, 15, 39] : [23, 16, 28])),
      target: new THREE.Vector3(...(mobile ? [3, 10.5, 0] : [-3, 4.5, 1])),
    };
    const initial = alignmentView(start, 0),
      aligned = alignmentView(start, 0.17);
    assert.ok(initial.position.distanceTo(start.position) < 1e-10);
    assert.ok(initial.target.distanceTo(start.target) < 1e-10);
    const paths = transmissionPaths(aligned.position, aligned.target, {
      position: new THREE.Vector3(20, 151, 32),
      target: new THREE.Vector3(20, 146, 120),
    });
    const path = new THREE.CatmullRomCurve3(paths.points, false, "centripetal"),
      look = new THREE.CatmullRomCurve3(paths.targets, false, "centripetal");
    const before = alignmentView(start, 0.34 - 1e-5);
    const after = transmissionPhases(0.34 + 1e-5).travel;
    assert.ok(before.position.distanceTo(path.getPoint(after)) < 0.001);
    assert.ok(before.target.distanceTo(look.getPoint(after)) < 0.001);
    assert.ok(
      alignmentView(start, 1e-5).position.distanceTo(start.position) < 0.001,
    );
    assert.ok(
      alignmentView(start, 0.085).position.distanceTo(start.position) > 0.1,
    );
    assert.ok(
      start.position.equals(initial.position),
      "the boundary pose must not be mutated",
    );
  }
});

test("the Beyond copy and flight controls crossfade continuously", () => {
  assert.equal(transmissionPhases(0).entry, 0);
  assert.equal(transmissionPhases(0.1).entry, 1);
  assert.ok(Math.abs(transmissionPhases(0.05).entry - 0.5) < 1e-10);
  const samples = Array.from(
    { length: 101 },
    (_, i) => transmissionPhases(i / 1000).entry,
  );
  assert.ok(samples.every((v, i) => i === 0 || v >= samples[i - 1]));
  assert.ok(
    samples.every((value, i) => i === 0 || value - samples[i - 1] < 0.016),
  );
});

test("dish holds its aligned camera for a longer charge before beam and departure", () => {
  for (const p of [0.18, 0.23, 0.3, 0.319]) {
    const phase = transmissionPhases(p);
    assert.equal(phase.stage, "Charging the dish");
    assert.equal(phase.alignment, 1);
    assert.equal(phase.travel, 0);
    assert.equal(phase.pulse, 0);
  }
  assert.equal(transmissionPhases(0.32).stage, "Sending a pulse into the sky");
  assert.equal(transmissionPhases(0.34).travel, 0);
  assert.ok(transmissionPhases(0.35).travel > 0);
});
