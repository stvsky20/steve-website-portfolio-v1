import { createSoundEngine } from "./sound-engine.js";
import { soundscapes, flightCues, journeySoundscape } from "./soundscapes.js";
import { transmissionPhases } from "./transmission.js";

export function emitSound(type, detail = {}) {
  document.dispatchEvent(
    new CustomEvent("station:sound", { detail: { type, ...detail } }),
  );
}
export function createStationAudio() {
  const button = document.querySelector("#sound-settings"),
    panel = document.querySelector("#sound-panel");
  const enable = document.querySelector("#sound-enable"),
    volume = document.querySelector("#sound-volume"),
    effects = document.querySelector("#sound-effects");
  const note = document.querySelector("#sound-status");
  const welcome = document.querySelector("#audio-welcome"),
    welcomeEnable = document.querySelector("#audio-welcome-enable"),
    welcomeMuted = document.querySelector("#audio-welcome-muted");
  let engine = null,
    enabled = false,
    selected = "harbor",
    level = 40,
    fx = true,
    previousFlight = null,
    atmosphere = 0,
    busy = false;
  try {
    const prefs = JSON.parse(localStorage.getItem("station-audio") || "{}");
    if (Number.isFinite(prefs.level))
      level = Math.max(0, Math.min(100, prefs.level));
    if (typeof prefs.fx === "boolean") fx = prefs.fx;
  } catch {}
  const choices = document.querySelector("#sound-choices");
  for (const preset of soundscapes.filter((p) => p.id !== "ocean")) {
    const label = document.createElement("div");
    label.className = "sound-choice";
    label.dataset.soundscape = preset.id;
    const copy = document.createElement("span"),
      title = document.createElement("strong"),
      description = document.createElement("small");
    title.textContent = preset.name;
    description.textContent = `${preset.id === "harbor" ? "At the station" : "Beyond the atmosphere"} · ${preset.description}`;
    copy.append(title, description);
    label.append(copy);
    choices.append(label);
  }
  function save() {
    try {
      localStorage.setItem("station-audio", JSON.stringify({ level, fx }));
    } catch {}
  }
  function sync() {
    button.dataset.playing = String(enabled);
    document.querySelector("#sound-button-label").textContent = enabled
      ? "Sound on"
      : "Sound off";
    button.setAttribute(
      "aria-label",
      enabled ? "Sound settings, audio on" : "Sound settings, muted",
    );
    enable.textContent = enabled ? "Mute sound" : "Enable sound";
    enable.setAttribute("aria-pressed", String(enabled));
    note.textContent = enabled
      ? `Playing ${soundscapes.find((p) => p.id === selected).name}.`
      : "Sound is off. Enable sound to hear the journey.";
    for (const card of choices.children)
      card.dataset.active = String(card.dataset.soundscape === selected);
    volume.value = String(level);
    document.querySelector("#sound-volume-value").value = `${level}%`;
    effects.checked = fx;
  }
  async function setAudio(value) {
    if (busy) return false;
    busy = true;
    enable.disabled = welcomeEnable.disabled = true;
    try {
      if (!engine) {
        const Context = window.AudioContext || window.webkitAudioContext;
        if (!Context) throw Error("Audio is unavailable in this browser.");
        engine = createSoundEngine(Context);
        engine.select(selected);
        engine.volume(level);
        engine.effects(fx);
        engine.environment(atmosphere);
      }
      await engine.enable(value);
      enabled = value;
      engine.flight(previousFlight ?? 0);
      sync();
      return true;
    } catch {
      enabled = false;
      sync();
      note.textContent =
        "Audio could not start. Try enabling sound again in this browser.";
      document.querySelector("#audio-welcome-note").textContent =
        "Audio couldn’t start. Try again or continue without sound.";
      return false;
    } finally {
      busy = false;
      enable.disabled = welcomeEnable.disabled = false;
    }
  }
  enable.addEventListener("click", () => setAudio(!enabled));
  welcomeEnable.addEventListener("click", async () => {
    if (await setAudio(true)) {
      if (welcome.open) welcome.close("sound");
      else await setAudio(false);
    }
  });
  welcomeMuted.addEventListener("click", () => welcome.close("muted"));
  welcome.addEventListener("close", () => {
    document.querySelector(".wordmark")?.focus({ preventScroll: true });
  });
  volume.addEventListener("input", () => {
    level = Number(volume.value);
    engine?.volume(level);
    document.querySelector("#sound-volume-value").value = `${level}%`;
    save();
  });
  effects.addEventListener("change", () => {
    fx = effects.checked;
    engine?.effects(fx);
    save();
  });
  panel.addEventListener("toggle", (event) =>
    button.setAttribute("aria-expanded", String(event.newState === "open")),
  );
  document.addEventListener("station:sound", (event) => {
    const { type, progress } = event.detail;
    if (type === "flight") {
      engine?.flight(progress);
      for (const cue of flightCues(previousFlight, progress)) engine?.cue(cue);
      previousFlight = progress;
      atmosphere = transmissionPhases(progress).atmosphere;
      engine?.environment(atmosphere);
      const next = journeySoundscape(atmosphere);
      if (next !== selected) {
        selected = next;
        engine?.select(selected);
        sync();
      }
    } else engine?.cue(type);
  });
  document.addEventListener("visibilitychange", () =>
    engine?.visibility(document.hidden).catch(() => {}),
  );
  window.addEventListener("pagehide", () =>
    engine?.visibility(true).catch(() => {}),
  );
  window.addEventListener("pageshow", () =>
    engine?.visibility(document.hidden).catch(() => {}),
  );
  sync();
  welcome.showModal();
}
