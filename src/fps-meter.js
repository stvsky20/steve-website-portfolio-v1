// Opt-in diagnostics only: open /?fps=1. No timer or UI on ordinary visits.
export function createFpsMeter(renderer, setVariant = () => {}) {
  const panel = document.createElement("aside");
  panel.setAttribute("aria-label", "Frame rate diagnostics");
  panel.style.cssText =
    "position:fixed;bottom:12px;left:12px;z-index:10000;width:min(360px,calc(100vw - 24px));padding:14px;background:#071923f2;color:#fff;font:12px/1.6 monospace;border:1px solid #efbe7a80;border-radius:12px;box-shadow:0 8px 24px #0005";
  const button = document.createElement("button");
  button.textContent = "Measure FPS (12 seconds)";
  button.style.cssText =
    "padding:8px 12px;background:#efbe7a;color:#102a35;border:0;border-radius:6px;cursor:pointer;font:inherit";
  const output = document.createElement("output");
  const label = document.createElement("label");
  label.textContent = "Render isolation ";
  const variant = document.createElement("select");
  variant.style.cssText =
    "display:block;width:100%;margin:6px 0 10px;padding:6px;color:#102a35;background:#fff;border-radius:4px";
  for (const [value, title] of [
    ["full", "Full scene (normal)"],
    ["procedural", "Previous procedural sky + ocean"],
    ["freeze-shadows", "Freeze shadow redraws"],
    ["no-sky", "Hide sky shader"],
    ["no-ocean", "Hide ocean shader"],
    ["no-local-lights", "Disable local lights"],
  ]) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = title;
    variant.append(option);
  }
  label.append(variant);
  variant.addEventListener("change", async () => {
    button.disabled = variant.disabled = true;
    try {
      await setVariant(variant.value);
    } finally {
      button.disabled = variant.disabled = false;
    }
  });
  let gpu = "Unavailable";
  const gl = renderer.getContext();
  const gpuTimingRequested = new URLSearchParams(location.search).has("gpu");
  const timer = gpuTimingRequested
    ? gl.getExtension("EXT_disjoint_timer_query_webgl2")
    : null;
  let activeQuery = null,
    pending = [],
    gpuTimes = [],
    cpuTimes = [],
    frameTimes = [],
    queryCount = 0;
  function pollTimers() {
    if (!timer) return;
    const disjoint = gl.getParameter(timer.GPU_DISJOINT_EXT);
    if (disjoint) {
      for (const query of pending) gl.deleteQuery(query);
      pending = [];
      return;
    }
    pending = pending.filter((query) => {
      if (!gl.getQueryParameter(query, gl.QUERY_RESULT_AVAILABLE)) return true;
      if (!disjoint)
        gpuTimes.push(gl.getQueryParameter(query, gl.QUERY_RESULT) / 1e6);
      gl.deleteQuery(query);
      return false;
    });
  }
  try {
    const debug = gl.getExtension("WEBGL_debug_renderer_info");
    if (debug) gpu = gl.getParameter(debug.UNMASKED_RENDERER_WEBGL);
  } catch {}
  output.style.cssText = "display:block;margin-top:8px;white-space:pre-wrap";
  output.textContent =
    "2-second warm-up + 10-second sample.\nNavigate to a scene, then measure.";
  panel.append(label, button, output);
  document.body.append(panel);
  let start = 0,
    end = 0,
    frames = 0,
    last = 0,
    intervals = [],
    calls = 0,
    invalid = false,
    running = false;
  document.addEventListener("visibilitychange", () => {
    if (running && document.hidden) invalid = true;
  });
  button.addEventListener("click", () => {
    button.disabled = true;
    variant.disabled = true;
    output.textContent =
      "Measuring… Keep this tab visible and leave the scene still.";
    start = performance.now() + 2000;
    end = start + 10000;
    frames = calls = last = 0;
    intervals = [];
    gpuTimes = [];
    cpuTimes = [];
    frameTimes = [];
    queryCount = 0;
    for (const query of pending) gl.deleteQuery(query);
    pending = [];
    invalid = document.hidden;
    running = true;
    setTimeout(() => {
      pollTimers();
      running = false;
      button.disabled = false;
      variant.disabled = false;
      intervals.sort((a, b) => a - b);
      const p95 = intervals.length
        ? intervals[Math.ceil(intervals.length * 0.95) - 1]
        : null;
      const result = {
        fps: Math.round((frames / 10) * 10) / 10,
        p95FrameMs: p95 === null ? null : Math.round(p95 * 10) / 10,
        frames,
        averageDrawCalls: frames ? Math.round(calls / frames) : 0,
        width: renderer.domElement.clientWidth,
        height: renderer.domElement.clientHeight,
        pixelRatio: renderer.getPixelRatio(),
        hiddenDuringSample: invalid,
        chapter:
          document.querySelector("#station")?.dataset.chapter || "introduction",
        modal: Boolean(document.querySelector("dialog[open]")),
        variant: variant.value,
        gpu,
        cpuRenderMs: cpuTimes.length
          ? Math.round(
              (cpuTimes.reduce((a, b) => a + b, 0) / cpuTimes.length) * 100,
            ) / 100
          : null,
        gpuRenderMs: gpuTimes.length
          ? Math.round(
              (gpuTimes.reduce((a, b) => a + b, 0) / gpuTimes.length) * 100,
            ) / 100
          : null,
        gpuSamples: gpuTimes.length,
        gpuTimingEnabled: Boolean(timer),
        cpuFrameMs: frameTimes.length
          ? Math.round(
              (frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length) * 100,
            ) / 100
          : null,
      };
      output.value = `${result.fps} FPS · p95 ${result.p95FrameMs ?? "—"} ms\nCPU render ${result.cpuRenderMs ?? "—"} ms · GPU ${result.gpuRenderMs ?? (gpuTimingRequested ? "unavailable" : "off")}\n${result.averageDrawCalls} average draw calls\n${result.width} × ${result.height} · DPR ${result.pixelRatio}\n${invalid ? "INVALID: tab was hidden" : "Tab visible throughout sample"}`;
      panel.dataset.result = JSON.stringify(result);
    }, 12000);
  });
  return {
    begin(now) {
      if (!running || now < start || now >= end || !timer) return;
      pollTimers();
      if (++queryCount % 4 === 0 && pending.length < 4) {
        activeQuery = gl.createQuery();
        gl.beginQuery(timer.TIME_ELAPSED_EXT, activeQuery);
      }
    },
    record(now, cpuMs, frameMs) {
      if (activeQuery) {
        gl.endQuery(timer.TIME_ELAPSED_EXT);
        pending.push(activeQuery);
        activeQuery = null;
      }
      if (!running || now < start || now >= end) return;
      cpuTimes.push(cpuMs);
      frameTimes.push(frameMs);
      if (last) intervals.push(now - last);
      last = now;
      frames++;
      calls += renderer.info.render.calls;
    },
  };
}
