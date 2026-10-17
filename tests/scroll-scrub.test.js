import { test } from "node:test";
import assert from "node:assert/strict";
import { scrubPosition } from "../src/scroll-scrub.js";
import { scrollTransmission } from "../src/transmission.js";

test("scrub continues after input stops, decelerates, and settles exactly", () => {
  let position = 0,
    previousStep = Infinity;
  for (let i = 0; i < 180; i++) {
    const result = scrubPosition(position, 1000, 1 / 60);
    const step = result.position - position;
    assert.ok(result.position >= position && result.position <= 1000);
    if (result.moving) assert.ok(step <= previousStep + 0.000001);
    else assert.ok(step < 0.12);
    previousStep = step;
    position = result.position;
    if (i === 5) assert.ok(result.moving && position > 0 && position < 1000);
  }
  assert.equal(position, 1000);
  assert.equal(scrubPosition(position, 1000, 1 / 60).moving, false);
});

test("scrub has the same trajectory at 30, 60, and 120 frames per second", () => {
  const positions = [30, 60, 120].map((fps) => {
    let position = 0;
    for (let i = 0; i < fps / 2; i++)
      position = scrubPosition(position, 1000, 1 / fps).position;
    return position;
  });
  assert.ok(Math.max(...positions) - Math.min(...positions) < 0.00001);
  assert.ok(positions[0] > 980 && positions[0] < 1000);
});

test("reversing scroll immediately redirects without overshoot; jumps and reduced motion snap", () => {
  const forward = scrubPosition(0, 1000, 0.1);
  const reverse = scrubPosition(forward.position, 0, 1 / 60);
  assert.ok(reverse.position < forward.position && reverse.position > 0);
  assert.deepEqual(scrubPosition(reverse.position, 0, 0.016, true), {
    position: 0,
    moving: false,
  });
  assert.deepEqual(scrubPosition(null, 750, 0), {
    position: 750,
    moving: false,
  });
});

test("flight progress keeps advancing with a stationary scroll target, then holds", () => {
  let position = 1000;
  const progress = [];
  for (let i = 0; i < 180; i++) {
    position = scrubPosition(position, 5600, 1 / 60).position;
    progress.push(scrollTransmission(position, 1000, 800));
  }
  assert.ok(progress[6] > progress[0]);
  assert.ok(progress[20] > progress[6]);
  assert.equal(progress.at(-1), 1);
});
