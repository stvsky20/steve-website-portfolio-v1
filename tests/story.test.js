import test from "node:test";
import assert from "node:assert/strict";
import { sampleStory } from "../src/story-path.js";

const stops = [{ at: 0 }, { at: 100 }, { at: 350 }, { at: 600 }];
test("scroll story holds for reading and reaches each exact destination", () => {
  assert.deepEqual(sampleStory(stops, -10), { from: 0, to: 0, mix: 0 });
  assert.equal(sampleStory(stops, 50).mix, 0);
  assert.equal(sampleStory(stops, 100).mix, 1);
  assert.equal(sampleStory(stops, 200).mix, 0);
  assert.equal(sampleStory(stops, 350).mix, 1);
  assert.deepEqual(sampleStory(stops, 900), { from: 3, to: 3, mix: 0 });
});
test("scroll sampling is bounded, continuous at stops, and reversible", () => {
  function value(y) {
    const p = sampleStory(stops, y);
    return p.from + (p.to - p.from) * p.mix;
  }
  let previous = 0;
  for (let y = 0; y <= 650; y += 0.5) {
    const p = sampleStory(stops, y);
    assert.ok(Number.isFinite(p.mix) && p.mix >= 0 && p.mix <= 1);
    assert.ok(value(y) >= previous);
    previous = value(y);
  }
  for (const stop of stops.slice(1))
    assert.ok(
      Math.abs(value(stop.at - 0.001) - value(stop.at + 0.001)) < 0.00001,
    );
  const positions = [0, 50, 90, 200, 340, 500, 600];
  const forward = positions.map(value);
  assert.deepEqual([...positions].reverse().map(value).reverse(), forward);
});
test("reduced motion uses discrete views without intermediate travel", () => {
  for (let y = 0; y < 600; y++)
    assert.ok([0, 1].includes(sampleStory(stops, y, true).mix));
  assert.equal(sampleStory(stops, 99, true).mix, 0);
  assert.equal(sampleStory(stops, 100, true).mix, 1);
});
