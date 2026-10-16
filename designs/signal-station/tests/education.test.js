import test from "node:test";
import assert from "node:assert/strict";
import { educationReveal } from "../src/education-motion.js";

test("study lighting stays bounded, reveals on arrival, and restores on departure", () => {
  const start = 1000,
    end = 2600,
    height = 1000;
  assert.equal(educationReveal(900, start, end, height), 0);
  assert.equal(educationReveal(start, start, end, height), 0);
  assert.equal(educationReveal(1400, start, end, height), 1);
  assert.equal(educationReveal(end, start, end, height), 0);
  assert.equal(educationReveal(3000, start, end, height), 0);
  for (let scroll = 0; scroll <= 3500; scroll += 5) {
    const value = educationReveal(scroll, start, end, height);
    assert.ok(Number.isFinite(value) && value >= 0 && value <= 1);
  }
  const path = [800, 1100, 1350, 1800, 2300, 2600];
  assert.deepEqual(
    path.map((s) => educationReveal(s, start, end, height)),
    [...path]
      .reverse()
      .map((s) => educationReveal(s, start, end, height))
      .reverse(),
  );
});
test("reduced-motion study lighting uses a stable section state", () => {
  for (const scroll of [0, 999, 1000, 1100, 2500, 2600, 3000])
    assert.equal(
      educationReveal(scroll, 1000, 2600, 1000, true),
      scroll >= 1000 && scroll < 2600 ? 1 : 0,
    );
});
