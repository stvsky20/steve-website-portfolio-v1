import { test } from "node:test";
import assert from "node:assert/strict";
import { chapterRouteStates } from "../src/chapter-route.js";

test("chapter route marks a single current stop and reverses completed segments", () => {
  assert.deepEqual(chapterRouteStates(0, 5), [
    "current",
    "upcoming",
    "upcoming",
    "upcoming",
    "upcoming",
  ]);
  assert.deepEqual(chapterRouteStates(3, 5), [
    "complete",
    "complete",
    "complete",
    "current",
    "upcoming",
  ]);
  assert.deepEqual(chapterRouteStates(1, 5), [
    "complete",
    "current",
    "upcoming",
    "upcoming",
    "upcoming",
  ]);
  assert.deepEqual(chapterRouteStates(99, 3), [
    "complete",
    "complete",
    "current",
  ]);
  assert.deepEqual(chapterRouteStates(-1, 2), ["current", "upcoming"]);
  assert.deepEqual(chapterRouteStates(NaN, 2), ["current", "upcoming"]);
  assert.deepEqual(chapterRouteStates(0, 0), []);
});
