# Sunflower Story — illustrated studio cut

A local cinematic portfolio for Steven Joe Valdez. Five detailed illustrated environments now replace the geometric prototype artwork in the active preview. The sequence preserves introduction, Ayos!, making, progress and connection beats.

## Preview and controls

Run `npm run dev` from this directory and open http://127.0.0.1:5175/.

Scroll, use the chapter buttons, scrub the slider, or press Play for the approximately 50-second story. Space activates Play/Pause. Slider Home/End and arrow keys work. Scrolling, scrubbing, navigation and hiding the tab stop autoplay. Read the portfolio skips the sequence and focuses the readable details section.

Still view stops camera movement and particles and presents complete captions. It shares the same still-state logic as OS reduced motion. An OS reduced-motion preference also disables autoplay. The manual still state was tested; OS media emulation was not independently available in this browser session.

## Art direction and production

The built-in image-generation tool produced finished 1672 × 941 illustration plates: a lived-in workspace overlooking Brooklyn, a rainy brownstone street at sunset, a detailed graffiti hideout, a vertiginous brick-wall ascent, and a snowy Manhattan rooftop. The plates use inked edges, selective print texture, worn materials, dimensional lighting and atmospheric depth.

The bedroom and fallback wall-climb plates include masked hero artwork. The active WebGL climb uses `climb-clean.png` and a separate animated character. Street, graffiti and night use environment-only plates. All final plates are under `assets/studio/`; the prompt set and production note are in `assets/studio/PROMPTS.json`.

This is AI-generated illustrated artwork, not a claim of production by a hired studio or expenditure of $100,000. No film footage or song audio is embedded. Project facts remain limited to the existing verified Ayos! description and regional-finalist context; missing contribution and technical details remain pending.

## Motion and rendering

`studio-scene.js` projects each matte painting onto an authored shallow depth surface using local Three.js. Bounded perspective cameras provide continuous dolly, lateral parallax and an upward wall shot. Paint is projected to preserve the neutral-camera image. Small depth-positioned particles provide warm dust and cool snow. Motion is tied to the same timeline as word reveals and diagonal comic wipes, so Pause and scrubbing control the whole composition.

The environments use **2.5D illustrated camera projection**. Chapter 04 adds a separate 26-bone character with an eight-second climb, planted hand/foot targets, body weight shifts, finger movement and a secondary fabric tab. Browser toon shading, ink outlines and projected contact/body shadows integrate it with the painting. Camera moves remain bounded to avoid exposing unseen sides of the artwork. The character is a procedural stylized benchmark; detailed sculpting, deformation polish and cloth simulation remain future production work.

Select **04 Climb**, then **Replay shot** to watch this eight-second benchmark in isolation. The normal Play button runs the full story. Forward/reverse scrubbing samples the same animation deterministically; Pause freezes the pose, and Still view holds a fixed pose.

The renderer caps pixel ratio, uses bounded mesh density, draws on timeline changes and stops playback in a hidden tab. Body text stays native and selectable. WebGL failure falls back to the same final artwork with simple 2D motion. `?view=flat` explicitly exercises that fallback for QA. The five full-resolution PNG plates total about 15 MB; this local art-review cut has not been packaged as a bandwidth-optimized public release.

## Blender source

Open **`blender/sunflower-studio.blend`**. It contains the five original modeled scenes plus five `STUDIO` camera-projection scenes. The final illustration plates are packed into the file. Each studio camera has a 240-frame track; the artwork, depth mesh, materials and camera remain editable. Painted lighting is carried by emissive image materials.

Rebuild the packed studio project and its five 1920 × 1080 Blender previews:

```powershell
& D:\blender.exe --background --factory-startup --python blender/studio/build_studio.py
```

The script reads the earlier `blender/sunflower-story.blend`, builds the five projected sets and saves `blender/sunflower-studio.blend`. It does not regenerate the illustration plates. Earlier prototype generators and images remain available.

## Verification

- All five illustration plates were inspected and validated at full resolution.
- Blender 5.2.2 LTS completed five 1920 × 1080 preview renders and saved the packed studio source.
- `npm run check` passed syntax checks for the story, depth renderer and server.
- Browser checks at 1440 × 900 and 390 × 844 passed for all five locations: WebGL active, all five textures loaded, captions above controls, no document overflow and no internal stage scroll.
- Manual still view froze the camera at the same coordinates while scrubbing and disabled particles/autoplay.
- Keyboard Play/Pause worked and playback reached the ending and stopped automatically.
- The explicit flat fallback loaded the final artwork without a canvas, supported chapter navigation and focused the readable-details section correctly.
- Final browser error log was empty.

Latest UI previews: `qa/studio/*-desktop.png` and `*-mobile.png`. Blender-only renders: `qa/studio/*-blender.png`. Original reference notes: `REFERENCE-STUDY.md`.

## Rigged climb benchmark

`blender/wall-climber-rig.blend` contains the editable character, skeleton, IK controllers and animation. `blender/wall-climb-benchmark.blend` combines it with the packed clean environment and camera. `assets/hero/wall-climber.glb` is the 4.57 MB browser export. The browser's toon material and projected shadows are authored separately in `wall-climb.js`; Blender previews are not pixel-identical browser renders.

The character art pass uses a unified anatomical surface across torso, shoulders, pelvis and limbs, with transferred and smoothed skin weights. Shoulder-blade contours, a tapered waist, hip volume, unequal finger lengths, shaped thumbs and curved mask eyes refine the silhouette. A woven suit atlas adds printed emblem/seams and tonal muscle detail. Layered high-top sneakers have ankle collars, laces, piping and tread. The mesh has 67,520 source vertices and retains the 26-bone rig. Browser shading adds cool fabric shadows and amber edge light. Current proof images are `qa/climb/sculpt-final-desktop.png` and `sculpt-final-mobile.png`, with separate reach/end poses; the earlier `character-refined-*` and `benchmark-*` images retain previous character versions. This remains a custom stylized web character, not a film-production asset or a cloth simulation.

The eight-second action now uses preparation, weight shift, reach, plant and upward push beats rather than a constant root ascent. Hips settle before each reach, the torso counter-rotates, the head looks toward the next hold and fingers open/close smoothly. Contacts stay independent of the body track. Keyboard focus on the transport preserves story position; viewport resizing also preserves timeline progress.

Rebuild the rig and assembled shot from this directory:

```powershell
& D:\blender.exe --background --factory-startup --python blender/studio/build_climber.py
& D:\blender.exe --background --factory-startup --python blender/studio/compose_climb_shot.py
node qa/climb/validate-export.mjs
npm run check
```

The asset validator samples all 193 exported frames, verifies 26 bones, compares hand/foot positions with authored IK targets, checks planted holds and verifies exact reverse sampling. It additionally validates the exported body track, normalized skin weights and finite deformed vertices at five poses. The latest maximum contact error was 0.000128 scene units, body-track error was 0.000000106 and reverse error was zero. The Node validator substitutes an empty texture while validating animation; embedded texture decoding is checked in the browser. Browser checks passed for Replay shot ending at progress 799 inside chapter 04, Pause pose stability, forward/reverse scrubbing, manual Still view, and desktop/mobile framing. Three assembled Blender renders are alongside the proof images.
