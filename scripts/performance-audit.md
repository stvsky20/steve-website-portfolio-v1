# Rendering and performance notes

## Performance audit — October 17, 2026

- `node scripts/audit-scene.mjs` measures structural scene complexity, not FPS. Static sibling instancing reduces station mesh submissions from 911 to 334 while retaining all 105,543 triangles. Animated parents, picking actions, materials, shadow settings, and independently controlled objects are preserved.
- Rendering pauses behind the audio welcome, project/education records, and image viewer. Closing a dialog resumes it. Live 3D tool inspection remains animated.
- Icon hydration processes changed subtrees instead of rescanning the whole document. Unchanged workshop poses no longer rewrite geometry buffers every frame.
- The loading backdrop uses a 302 KB WebP instead of its 2.52 MB PNG. Full-resolution project authoring PNGs and source art remain local, but duplicate Laundrify PNGs and the old backdrop PNG are excluded from deployment. These unused project sources were not part of the initial page transfer; excluding them primarily reduces deployment size.
- Production bundles only used Three.js exports and station code, avoiding the native-module request chain. Only content-hashed runtime bundles receive immutable caching; other assets remain updateable.
- Rendering resolution, shadow quality, model geometry, and lighting remain intact. The later texture-based environment pass below replaces the cloud/water detail calculations. Actual FPS and mobile thermal behavior still need checking on the target device.

### FPS sampling

Open `/?fps=1` to enable an opt-in frame-rate panel. Navigate to a scene and click **Measure FPS (12 seconds)**: a two-second warm-up is followed by a ten-second sample of actual rendered animation frames. It reports average FPS, the 95th-percentile frame interval, renderer draw-call counts, viewport, and canvas pixel ratio. A sample is flagged invalid if the tab becomes hidden. The panel and its timer are absent on ordinary visits.

Local in-app browser measurements on October 17, 2026, with a visible 423 × 672 CSS-pixel viewport at DPR 1, audio muted, and no device emulation:

| Scene | Average FPS | p95 frame interval |
| --- | ---: | ---: |
| Hero, first sample | 31.2 | 50.0 ms |
| Hero, warm repeat | 25.0 | 66.7 ms |
| Hero, final repeat | 29.5 | 50.0 ms |
| Workshop | 27.6 | 50.1 ms |
| Space | 39.5 | 49.9 ms |
| Behind open project dialog | 0 background 3D frames | N/A |

Each row is one ten-second sample; the hero was sampled three times. These are browser render-loop measurements, not physical-device mobile benchmarks, presented-frame telemetry, or proof of 60 FPS. Hardware/GPU acceleration was not independently characterized. Repeat on the intended device and browser before claiming a performance target. The dialog result verifies intentional idle rendering; it does not measure the dialog's own scrolling or animation FPS.

### Follow-up rendering audit

The diagnostics now include isolation controls, average CPU submission time, whole-tick CPU time, and asynchronous GPU timer queries where supported. Isolation settings exist only under `?fps=1`; normal visitors always receive the full scene. GPU probes are disabled by default; add `&gpu=1` to enable them. GPU timing is sampled every fourth rendered frame, queried asynchronously, and discarded on a disjoint GPU clock event. Profiling overhead may affect results, especially on older hardware.

The browser identified an NVIDIA GeForce GT 730 via ANGLE/Direct3D11. At 1265 × 720 and DPR 1, initial samples were 38.4 FPS for the full scene, 52.5 with sky hidden, and 48.6 with ocean hidden. A later unchanged full-scene control fell to 24.6 FPS. This drift means these single-run isolation values cannot establish causal speedups. Smaller-viewport control samples also varied from 39 to 60 FPS in this session.

Changes retained:

- Daytime sky/water shaders skip unused nighttime calculations; the fully completed space fade skips the earth-sky calculations. Blended transitions retain the original calculations.
- Unchanged lighting no longer rewrites material properties every frame. Chapter attributes update only on chapter changes. Project hit areas are projected again only when the camera, projection, lid angle or viewport changes.
- The full-resolution sky-cache prototype was removed after same-build samples showed no consistent improvement. Shadow freezing and light removal remain diagnostic controls, not production compromises.
- The focused-ocean prototype (32,768 triangles instead of 64,800) was also removed: the reduced vertex count did not establish a frame-rate benefit. The original ocean geometry and wave tessellation remain in production. A final lightweight-meter sequence returned 14.4 FPS for the prototype followed by 25.1 FPS for the original ocean; these sequential samples are affected by the observed drift and are not a controlled speedup claim.

The final desktop-sized hero sample was 22.6 FPS, with 5.65 ms average CPU tick time (4.93 ms inside rendering) and 13.62 ms average GPU render time across 55 valid GPU timer samples. This does **not** establish an FPS improvement or explain all frame-pacing overhead. Test in a normal browser on the target device before claiming 60 FPS; only the in-app browser was available to this audit. Raw measurements, including the rejected cache prototype, are stored in `scripts/performance-audit-2026-10-17.json` and are excluded from the deployed static site.

### Texture-based environment (option 2)

Cloud density now uses one repeating data-map lookup instead of five layers of procedural noise. Ocean surface normals and chop use two scrolling data-map lookups instead of fragment-level noise and cosine calculations. Geometry waves, shoreline foam, Fresnel reflections, sun/moon highlights, atmospheric haze, day/night blending, and the scroll flight remain active. The maps change the exact cloud formations and surface ripple pattern while retaining the existing palette and lighting. Texture motion uses the existing scene clock, so pause and reduced-motion behavior are preserved.

The two project-authored PNGs in `assets/environment/` total 825,350 bytes. They use linear non-color data, repeat wrapping, and mipmap filtering. Neutral fallback maps keep rendering valid while they load; completed loads wake even a paused renderer. Regenerate deterministically with Python, NumPy, and Pillow: `python scripts/generate-environment-textures.py`. No external texture license is required.

For direct comparison, select **Previous procedural sky + ocean** in `/?fps=1&gpu=1`. This lazy-loads the old shaders only when explicitly requested; normal visits use textures. A same-tab hero A–B–A sequence at 1265 × 720 / DPR 1 on the reported GT 730 returned:

| Rendering | FPS | Average GPU render time |
| --- | ---: | ---: |
| Textured, first | 60 | 10.30 ms |
| Previous procedural | 60 | 11.16 ms |
| Textured, repeat | 60 | 10.37 ms |

This sequence shows about 7% lower GPU render time, with both paths at the 60 FPS ceiling. It is a modest GPU-cost improvement, not evidence of a large FPS increase or a cross-device guarantee; earlier frame-pacing drift remains relevant. Moving objects can slightly vary draw calls. Raw results: `scripts/texture-performance-audit-2026-10-17.json`. Day/night and the flight into space were checked in the production preview without shader errors.
