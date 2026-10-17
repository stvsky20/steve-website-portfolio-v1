import { soundscapes, volumeGain } from "./soundscapes.js";
import { chargeAmount } from "./uplink-timing.js";

// Original, locally synthesized soundscapes. Nothing streams or downloads.
// The context is created only by an explicit enable gesture.
export function createSoundEngine(Context) {
  const context = new Context();
  const master = context.createGain(),
    compressor = context.createDynamicsCompressor();
  compressor.threshold.value = -16;
  compressor.knee.value = 20;
  compressor.ratio.value = 4;
  master.gain.value = 0;
  master.connect(compressor);
  compressor.connect(context.destination);
  const ambient = context.createGain(),
    effects = context.createGain(),
    ocean = context.createGain();
  ambient.connect(master);
  effects.connect(master);
  ocean.connect(ambient);
  const waveMix = context.createGain(),
    padMix = context.createGain(),
    keyMix = context.createGain();
  waveMix.connect(ocean);
  padMix.connect(ambient);
  keyMix.connect(ambient);
  waveMix.gain.value = 1;
  padMix.gain.value = 0;
  keyMix.gain.value = 0;
  let muteTimer;
  let selected = "ocean",
    enabled = false,
    fx = true,
    volume = 40,
    step = 0,
    nextNote = 0;
  let seed = 8117;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const noise = context.createBuffer(
    2,
    context.sampleRate * 8,
    context.sampleRate,
  );
  for (let channel = 0; channel < 2; channel++) {
    const data = noise.getChannelData(channel);
    let low = 0,
      mid = 0;
    for (let i = 0; i < data.length; i++) {
      const white = random() * 2 - 1;
      low = 0.995 * low + 0.005 * white;
      mid = 0.94 * mid + 0.06 * white;
      data[i] = low * 2.6 + mid * 0.6 + white * 0.025;
    }
  }
  const waveSource = context.createBufferSource();
  waveSource.buffer = noise;
  waveSource.loop = true;
  const lowpass = context.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 1100;
  const highpass = context.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = 65;
  const swell = context.createGain();
  swell.gain.value = 0.48;
  waveSource.connect(highpass);
  highpass.connect(lowpass);
  lowpass.connect(swell);
  swell.connect(waveMix);
  waveSource.start();
  const tide = context.createOscillator(),
    tideDepth = context.createGain();
  tide.frequency.value = 0.075;
  tideDepth.gain.value = 0.3;
  tide.connect(tideDepth);
  tideDepth.connect(swell.gain);
  tide.start();
  const tideFilter = context.createOscillator(),
    filterDepth = context.createGain();
  tideFilter.frequency.value = 0.046;
  filterDepth.gain.value = 380;
  tideFilter.connect(filterDepth);
  filterDepth.connect(lowpass.frequency);
  tideFilter.start();
  // A shared, short stereo reverb creates distance without a heavy audio asset.
  const reverb = context.createConvolver(),
    wet = context.createGain();
  wet.gain.value = 0.24;
  const impulse = context.createBuffer(
    2,
    Math.floor(context.sampleRate * 2.8),
    context.sampleRate,
  );
  for (let channel = 0; channel < 2; channel++) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < data.length; i++)
      data[i] =
        (random() * 2 - 1) * Math.exp((-i / context.sampleRate) * 2.4) * 0.28;
  }
  reverb.buffer = impulse;
  reverb.connect(wet);
  wet.connect(ambient);
  const padFilter = context.createBiquadFilter();
  padFilter.type = "lowpass";
  padFilter.frequency.value = 850;
  padFilter.connect(padMix);
  for (const [i, frequency] of [146.83, 220, 293.66, 329.63].entries()) {
    const oscillator = context.createOscillator(),
      gain = context.createGain(),
      lfo = context.createOscillator(),
      depth = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    oscillator.detune.value = (i % 2 ? 1 : -1) * 4;
    gain.gain.value = 0.028;
    lfo.frequency.value = 0.025 + i * 0.008;
    depth.gain.value = 0.009;
    lfo.connect(depth);
    depth.connect(gain.gain);
    oscillator.connect(gain);
    gain.connect(padFilter);
    oscillator.start();
    lfo.start();
  }
  function ramp(param, value, duration = 0.6) {
    const now = context.currentTime;
    param.cancelScheduledValues(now);
    param.setValueAtTime(param.value, now);
    param.linearRampToValueAtTime(value, now + duration);
  }
  // Fixed, inharmonic machinery tones: build energy through pulse speed and
  // bandwidth rather than a voice-like rising fundamental.
  const chargeBus = context.createGain();
  chargeBus.gain.value = 0;
  const chargeFilter = context.createBiquadFilter();
  chargeFilter.type = "lowpass";
  chargeFilter.Q.value = 0.45;
  chargeFilter.frequency.value = 900;
  const pulseGate = context.createGain(),
    chargePulse = context.createOscillator(),
    pulseDepth = context.createGain();
  pulseGate.gain.value = 0.75;
  chargePulse.type = "square";
  chargePulse.frequency.value = 8;
  pulseDepth.gain.value = 0.22;
  chargePulse.connect(pulseDepth);
  pulseDepth.connect(pulseGate.gain);
  chargeBus.connect(chargeFilter);
  chargeFilter.connect(pulseGate);
  pulseGate.connect(effects);
  chargePulse.start();
  for (const { frequency, gain, type } of [
    { frequency: 74, gain: 0.32, type: "triangle" },
    { frequency: 421, gain: 0.16, type: "sawtooth" },
    { frequency: 1511, gain: 0.045, type: "square" },
  ]) {
    const oscillator = context.createOscillator(),
      level = context.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    level.gain.value = gain;
    oscillator.connect(level);
    level.connect(chargeBus);
    oscillator.start();
  }
  const electricalNoise = context.createBuffer(
    1,
    context.sampleRate,
    context.sampleRate,
  );
  const electricalData = electricalNoise.getChannelData(0);
  for (let i = 0; i < electricalData.length; i++)
    electricalData[i] = random() * 2 - 1;
  const chargeStatic = context.createBufferSource(),
    staticFilter = context.createBiquadFilter(),
    staticGain = context.createGain();
  chargeStatic.buffer = electricalNoise;
  chargeStatic.loop = true;
  staticFilter.type = "highpass";
  staticFilter.frequency.value = 1100;
  staticGain.gain.value = 0.16;
  chargeStatic.connect(staticFilter);
  staticFilter.connect(staticGain);
  staticGain.connect(chargeBus);
  chargeStatic.start();
  let flightProgress = 0;
  function syncCharge() {
    const amount = chargeAmount(flightProgress);
    const active = enabled && fx && amount > 0;
    ramp(chargeBus.gain, active ? 0.4 + amount * 0.6 : 0, active ? 0.08 : 0.04);
    ramp(ambient.gain, active ? 0.55 : 1, 0.35);
    ramp(chargePulse.frequency, 8 + amount * 26, 0.08);
    ramp(chargeFilter.frequency, 900 + amount * 3900, 0.08);
  }
  function note(
    frequency,
    time,
    duration,
    gainValue,
    bus,
    type = "sine",
    endFrequency = frequency,
  ) {
    const oscillator = context.createOscillator(),
      gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, time);
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(20, endFrequency),
      time + duration,
    );
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(gainValue, time + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    oscillator.connect(gain);
    gain.connect(bus);
    if (bus === keyMix) gain.connect(reverb);
    oscillator.start(time);
    oscillator.stop(time + duration + 0.05);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
  }
  function schedule() {
    if (!enabled || context.state !== "running") return;
    const now = context.currentTime;
    if (nextNote < now) nextNote = now + 0.1;
    if (nextNote > now + 0.35) return;
    const melody =
      selected === "space"
        ? [74, 81, 76, 69, 78, 81, 73, 76]
        : [62, 69, 74, 76, 69, 64, 62, 57];
    if (selected !== "ocean") {
      const frequency = 440 * 2 ** ((melody[step % melody.length] - 69) / 12);
      note(frequency, nextNote, 3.8, 0.11, keyMix, "sine");
      note(frequency * 2, nextNote, 2.0, 0.014, keyMix, "sine");
    }
    step++;
    nextNote += selected === "space" ? 6.4 : 3.8;
  }
  const timer = setInterval(schedule, 180);
  const lastCue = new Map();
  return {
    context,
    async enable(value) {
      clearTimeout(muteTimer);
      enabled = value;
      syncCharge();
      if (value) {
        await context.resume();
        nextNote = context.currentTime + 0.15;
        ramp(master.gain, volumeGain(volume), 0.35);
      } else {
        ramp(master.gain, 0, 0.15);
        muteTimer = setTimeout(() => {
          if (!enabled) context.suspend().catch(() => {});
        }, 180);
      }
    },
    select(id, duration = 2) {
      const preset = soundscapes.find((p) => p.id === id);
      if (!preset) return;
      selected = id;
      nextNote = context.currentTime + 0.2;
      step = 0;
      ramp(waveMix.gain, preset.waves, duration);
      ramp(padMix.gain, preset.pads, duration);
      ramp(keyMix.gain, preset.keys, duration);
    },
    volume(value) {
      volume = value;
      if (enabled) ramp(master.gain, volumeGain(value), 0.08);
    },
    effects(value) {
      fx = value;
      ramp(effects.gain, value ? 1 : 0, 0.08);
      syncCharge();
    },
    flight(progress) {
      if (progress === flightProgress) return;
      flightProgress = progress;
      syncCharge();
    },
    environment(atmosphere) {
      ramp(ocean.gain, 1 - atmosphere * 0.96, 0.12);
    },
    cue(type) {
      if (!enabled || !fx || context.state !== "running") return;
      const now = context.currentTime;
      const cooldown = type === "fire" ? 1.4 : type === "charge" ? 1.4 : 0.09;
      if (now - (lastCue.get(type) ?? -Infinity) < cooldown) return;
      lastCue.set(type, now);
      if (type === "flip") {
        // A brief paper-like swish and dry tick, with no musical tail.
        note(860, now, 0.055, 0.12, effects, "triangle", 460);
        const source = context.createBufferSource(),
          filter = context.createBiquadFilter(),
          gain = context.createGain();
        source.buffer = noise;
        filter.type = "bandpass";
        filter.Q.value = 0.65;
        filter.frequency.setValueAtTime(1000, now);
        filter.frequency.exponentialRampToValueAtTime(3200, now + 0.09);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(1.1, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
        source.connect(filter);
        filter.connect(gain);
        gain.connect(effects);
        source.start(now);
        source.stop(now + 0.16);
        source.onended = () => {
          source.disconnect();
          filter.disconnect();
          gain.disconnect();
        };
      }
      if (type === "open") {
        note(310, now, 0.16, 0.1, effects, "sine", 620);
        note(930, now + 0.045, 0.2, 0.035, effects);
      }
      if (type === "close") {
        note(420, now, 0.14, 0.08, effects, "sine", 210);
      }
      if (type === "planet") {
        note(660, now, 0.35, 0.075, effects);
        note(990, now + 0.09, 0.55, 0.045, effects);
      }
      if (type === "fire") {
        // A short electrical snap, laser chirp, and low recoil. No long vowel-
        // like sine glide; this is an original synthesized sci-fi discharge.
        note(2800, now, 0.14, 0.24, effects, "sawtooth", 170);
        note(1350, now + 0.018, 0.22, 0.18, effects, "square", 85);
        note(84, now, 0.36, 0.7, effects, "triangle", 34);
        note(1877, now + 0.04, 0.12, 0.055, effects, "triangle", 1423);
        const burst = context.createBufferSource(),
          filter = context.createBiquadFilter(),
          gain = context.createGain();
        burst.buffer = electricalNoise;
        filter.type = "lowpass";
        filter.Q.value = 0.5;
        filter.frequency.setValueAtTime(6400, now);
        filter.frequency.exponentialRampToValueAtTime(500, now + 0.42);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.85, now + 0.006);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);
        burst.connect(filter);
        filter.connect(gain);
        gain.connect(effects);
        burst.start(now);
        burst.stop(now + 0.7);
        burst.onended = () => {
          burst.disconnect();
          filter.disconnect();
          gain.disconnect();
        };
      }
    },
    async visibility(hidden) {
      if (hidden) await context.suspend();
      else if (enabled) await context.resume();
    },
    dispose() {
      clearTimeout(muteTimer);
      clearInterval(timer);
      context.close();
    },
  };
}
