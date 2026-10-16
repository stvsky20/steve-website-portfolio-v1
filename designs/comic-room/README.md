# Comic Room Portfolio

Independent local Three.js / Vite prototype. Art direction: ../../docs/art-direction/ART-DICTIONARY.md.

## Run

npm install
npm run dev

Open http://127.0.0.1:5174. Build with npm run build.

## Explore

Click the PC or its label to browse sample projects; corkboard opens About; couch opens Contact. Header buttons provide keyboard-accessible alternatives. Drag within the scene to adjust the overview. Reset View returns to the original composition; Print Texture compares the surface shader with/without halftone and hatching. Escape closes the panel. Reduced-motion preferences shorten camera travel.

All projects and personal copy are explicitly placeholders. No real contact details are fabricated.

## Technical scope

Actual 3D geometry, custom surface shaders, canvas-generated original graphics, outlined objects, raycast picking, camera travel, accessible HTML content dialogs. No Blender or external model assets. This is an initial art-direction and interaction feasibility study, not final artwork.

Desktop first. Performance is measured live; it varies by viewport, pixel density, browser, and GPU. The Google Fonts request is optional; system fallbacks remain available.

## Verification — 12 October 2026

Production build passed. Headless installed Chrome at 1536 × 960 measured approximately 60 FPS in the initial local run (not a guarantee on other hardware). No browser console/page errors after the favicon fix.

Verified actual 3D monitor/corkboard picking, project category switching, sample case studies, About and Contact, Escape return, drag/reset, print-texture toggle, reduced-motion camera flow, and HTML navigation with WebGL unavailable.

Run npm run test:browser while the local development server is active. Screenshots are written under qa/.

Known limits: geometry is deliberately simplified; folds and linework need a richer art pass; lighting is stylized shader-based rather than a finished shadow pipeline; content is placeholder; mobile is not a target of this verification. Build reports a Three.js-heavy bundle warning (~548 kB minified / 143 kB gzip); defer splitting until the prototype direction is confirmed.

## Art pass 1 — workstation

The workstation now sits against the side wall to make it prominent in the overview. The corkboard has individually tilted illustrated cards, folded corners, and 3D pins. The monitor has thicker drawn casing contours and selective print-color echoes. Desk edges, scuffs, lamp arms, tower vents, notebook marks, and chair seams are authored geometry. Larger antialiased surface dots and denser shadow hatching replace the fine uniform pattern. Graphic cyan/amber wall and floor shapes establish the desk's lighting hierarchy.

Use Desk Study for a dedicated close-up; Reset View or Escape returns to the overview. The close-up deliberately locks orbit while object clicks and header navigation remain available.

Updated screenshots: qa/room-desktop.png and qa/desk-study.png. The prior overview is retained at qa/room-before-art-pass.png.

This pass improves composition and authored detail. It remains a stylized geometry prototype; sculpted fabric, painterly shading nuance, and physically occluded cast shadows are future art work.

## Character study

A separate full-screen character prototype is available at /character.html. It introduces Steven Joe Valdez as an unmasked stylized Spider-Man, with an articulated procedural model and reversible scroll-controlled leap. See CHARACTER-STUDY.md for asset paths, rig limitations, and checks. The existing room remains at /.

## Full-screen comic world

The room now fills the viewport without the top navbar, footer, or conventional hero block. Closer camera framing gives the room most of the screen. Original graphic color fields, coarse halftone, ink strokes, dimensional rings, and five floating illustrated panels populate the surroundings.

The PC pulls those panels toward its projected position during entry. They spread back outward when returning. Drift is disabled under reduced motion. The Room Map retains keyboard-accessible Projects/About/Contact links, and each section has a projected object label.

Backdrop artwork is created in code; no character or franchise media is embedded. The character study is parked as a separate experiment.

Source: src/comic-world.js, src/main.js, index.html, src/style.css. Latest overview: qa/room-desktop.png. Previous overview: qa/room-before-world.png.

## Comic motion pass

The room now includes held decorative poses at 12Hz, slowly tilting dimensional rings, drifting ink clusters, a rotating drawn ray field, static drawn object emphasis on mouse hover, and a brief 500ms speed-line accent during camera travel. The existing 850ms camera move uses a strong ease-out curve to launch quickly and settle slowly. Decorative motion has its own clock; Pause Motion freezes it without blocking navigation. Reduced-motion settings disable decorative movement and travel accents and make camera navigation immediate.

Run npm run test:motion to verify ambient movement, pause/resume, navigation while paused, hover marks, travel accents, reduced motion, and Room Map focus restoration. These effects are procedural browser interpretations, not film assets.

Production references:
- Sony Pictures Imageworks: https://www.imageworks.com/node/1371 — held poses, graphic linework, and drawn alternatives to motion blur.
- SideFX production interview: https://www.sidefx.com/community/spider-man-into-the-spider-verse/ — art-directed layered 2D/3D effects, timing experimentation, and Kirby dots.

## Usable monitor desktop

Click the PC or choose Projects from Room Map to sit at the monitor. WORLD_OS runs within the monitor surface, with Systems, Apps, UI/UX and ML folders, searchable project files, readable case studies, a Read me file, and a draggable explorer window. Minimize, close and taskbar restore work. Leave desk or Escape returns to the room and restores focus.

The active desktop uses native HTML projected onto the monitor's corners. The camera faces the screen directly while seated, allowing an accurate affine mapping and reliable browser mouse/keyboard input. Room orbit controls are disabled during desktop use. Resize reframes the monitor. A native desktop fallback works without WebGL. Existing About and Contact interactions remain available from the room.

Run npm run test:desktop for the direct desktop checks; the existing browser and motion checks also cover the new PC entry flow. All portfolio files remain explicitly labeled sample content.

## Whole corkboard view

Click the corkboard or choose About from Room Map to view the entire physical board in the scene. The camera rises above the monitor so it cannot cover the lower notes. The pinned cards now contain Steven Joe Valdez's name, software engineer introduction, work/design categories, and explicitly marked personal-story placeholders. There is no About dialog.

Back to room and Escape restore the room and originating keyboard focus. The view adapts after resize, supports reduced motion, and exposes a native text-board fallback without WebGL. Run npm run test:board to check these flows.

## Couch portal and contact destination

Click the couch or Pull Up a Seat to lift the seat cover, reveal its hidden wormhole, dive through a dimensional comic tunnel, and arrive in a separate city/platform scene. The approximately 4.8-second journey uses a deliberate reveal, fast travel, and a quiet contact endpoint. Contact details are user-supplied: valdez.stevenjoe@gmail.com, github.com/stvsky20, and linkedin.com/in/steven-joe-valdez-15817128a.

Skip to contact bypasses the journey. Back to room and Escape work during every phase, reset the cover and portal, and restore focus. Reduced motion and no-WebGL entry go directly to contact. Decorative pause freezes portal texture/rotation but navigation still proceeds. Run npm run test:portal for physical couch picking, lift/reveal, tunnel/arrival, URLs, interruption, skip, resize, return and fallback checks.

The user supplied the Sunflower music video as a mood reference: https://www.youtube.com/watch?v=ApXoWvfEYVU. The web tool confirmed the video's identity but did not expose its footage, so no claim of frame-by-frame reference inspection is made. The geometry and sequence are original, following the approved comic-room dictionary.

## Graffiti subway destination

The couch now exits into an original abandoned subway station instead of the abstract city platform. The station includes a tiled back wall, an original LET'S BUILD SOMETHING mural, tracks and sleepers, platform edge markings, steel columns/beams/pipes, fluorescent lights and an empty bench. The station is inspired by the production subway concepts at https://wardenlight.artstation.com/projects/oObGrB rather than claiming an exact recreation of a named New York station.

Normal travel holds the station reveal for one second before displaying contact links on a physical wall noticeboard. Native HTML follows the noticeboard projection, preserving usable email/GitHub/LinkedIn links. Skip, reduced motion and no-WebGL entry show contact immediately. The skyline/window idea remains separate future work.

## Passing train reveal

A three-car original comic subway train crosses the camera at the tunnel exit. Camera and train share normalized tunnel-glide progress. The train starts at 30% of the glide, conceals the scene cut at 65%, and clears as the camera finishes at 100%. A 300ms settling beat follows before the contact sign appears. Camera travel uses the project's strong ease-in-out curve so it keeps moving through the wipe instead of stopping before the train arrives. The cars use opaque illustrated windows, doors, route signs, cyan/magenta stripes, outlined bodies and wheel assemblies. Motion is linear across the tracks.

Skip, return, reduced motion and no-WebGL entry clear or bypass the train. The portal checks verify train visibility, simultaneous camera/train movement, hidden contact during crossing, clearance before contact, and skipping mid-pass.

## Train smear accents

The passing train now includes drawn trailing strokes and cyan/magenta contour duplicates. These illustration marks hold at 12 poses/second; the synchronized camera and train translations remain smooth. The accents disappear when the train clears, on skip/return, and when decorative motion is paused. Reduced motion bypasses the journey. Production technique reference: https://www.imageworks.com/node/1371.

## Train entry containment

The passing train now emerges from physical dark track tunnel casings instead of showing its approach in empty scene space. Foreground retaining walls, roofs, rear walls and marked jambs occlude the offstage approach. Fixed world-space clipping at x=-6 and x=6 applies to every train material, including contour echoes and speed streaks, so carriages cannot leak beyond the mouths. The main renderer enables local clipping.

The synchronized camera/train glide remains unchanged. Portal validation checks the tunnel-mouth geometry, renderer clipping and all train materials, and captures the train approach before the scene handoff.

## Continuous couch-to-wormhole entrance

The couch opening now renders a live view of the destination tunnel into a render target, using an off-axis portal camera derived from the visitor's position relative to the entrance plane. Elliptical entrance rings match the couch opening and flare into the main tunnel. A curved dive path carries the camera through the entrance; when the opening fills the view, position and orientation are mapped into tunnel coordinates rather than reset to a separate starting view.

The main tunnel glide starts at the curved entrance path's endpoint, retaining the synchronized train reveal. The extra portal render runs only while the opening is visible and the camera remains outside. Reduced motion/no-WebGL entry still skips directly to contact. npm run test:portal now also samples mapped camera poses on consecutive frames across the entrance and checks for a position/orientation discontinuity.

## Enclosed illustrated wormhole

The tunnel now has a continuous opaque twelve-sided shell from the elliptical couch aperture to the exit. Twisted blue/violet panels, dark ink seams, selective halftone and hatching preserve the dimensional-comic art direction. Cyan/magenta/amber rings remain the bright focal structure. The shell is part of the existing tunnel group, so the train wipe, skip and station reveal hide it together with the rings.

npm run test:tunnel casts 144 rays at four depths through the actual enclosure mesh to check for side-wall gaps and verifies the material is opaque. Portal continuity validation accounts for real elapsed sample time rather than assuming a fixed browser frame rate.
