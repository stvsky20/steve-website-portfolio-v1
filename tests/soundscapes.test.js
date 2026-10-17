import { test } from "node:test";
import assert from "node:assert/strict";
import { soundscapes, flightCues, volumeGain } from "../src/soundscapes.js";
import { chargeAmount, UPLINK_FIRE } from "../src/uplink-timing.js";
import { journeySoundscape } from "../src/soundscapes.js";
import { transmissionPhases } from "../src/transmission.js";

test("the journey keeps Harbor Keys through the atmosphere and switches in space, including reverse scroll", () => {
  const checkpoints = [0, 0.16, 0.32, 0.5, 0.7, 0.8, 1, 0.8, 0.7, 0.5, 0];
  assert.deepEqual(
    checkpoints.map((p) => journeySoundscape(transmissionPhases(p).atmosphere)),
    [
      "harbor",
      "harbor",
      "harbor",
      "harbor",
      "space",
      "space",
      "space",
      "space",
      "space",
      "harbor",
      "harbor",
    ],
  );
  assert.equal(journeySoundscape(0.9999), "harbor");
  assert.equal(journeySoundscape(1), "space");
});

test("three different soundscapes have usable bounded layer mixes", () => {
  assert.equal(new Set(soundscapes.map((p) => p.id)).size, 3);
  for (const preset of soundscapes) {
    assert.ok(preset.name && preset.description);
    for (const layer of ["waves", "pads", "keys"])
      assert.ok(preset[layer] >= 0 && preset[layer] <= 1);
  }
  assert.equal(soundscapes[0].pads + soundscapes[0].keys, 0);
  assert.ok(soundscapes[1].keys > soundscapes[2].keys);
  assert.ok(soundscapes[2].pads > soundscapes[1].pads);
});

test("dish cues play once per forward threshold crossing, not on every scroll frame", () => {
  let previous = 0;
  const cues = [];
  for (let i = 1; i <= 100; i++) {
    const p = i / 100;
    cues.push(...flightCues(previous, p));
    previous = p;
  }
  assert.deepEqual(cues, ["fire"]);
  assert.deepEqual(flightCues(0.15, 0.15), []);
  assert.deepEqual(flightCues(0.2, 0.05), []);
  assert.deepEqual(flightCues(0, 1), []);
  assert.deepEqual(flightCues(0.31, 0.33), ["fire"]);
  assert.deepEqual(flightCues(null, 0.01), []);
});

test("volume has a quiet default and remains bounded including mute", () => {
  assert.equal(volumeGain(0), 0);
  assert.equal(volumeGain(100), 1);
  assert.equal(volumeGain(-10), 0);
  assert.equal(volumeGain(200), 1);
  assert.ok(volumeGain(40) < 0.2);
  assert.ok(volumeGain(60) > volumeGain(40));
});

test("charging sustains at a held scroll position and unwinds before firing", () => {
  assert.equal(chargeAmount(0), 0);
  assert.equal(chargeAmount(0.16), 0.5);
  assert.equal(chargeAmount(0.16), 0.5);
  assert.ok(chargeAmount(0.3) > chargeAmount(0.16));
  assert.equal(chargeAmount(UPLINK_FIRE), 0);
  assert.equal(chargeAmount(1), 0);
  assert.deepEqual(flightCues(0.11, 0.13), []);
  assert.deepEqual(flightCues(0.3, UPLINK_FIRE), ["fire"]);
  assert.deepEqual(flightCues(0.33, 0.3), []);
  assert.deepEqual(flightCues(0.3, 0.33), ["fire"]);
});
