# The Signal Station

A standalone local portfolio concept built with real-time Three.js geometry. The hero is not a flattened image: the building, dish, controls, antenna, rocks, and bridge are meshes, and the ocean and sky are procedural shaders. The initial AI concept image is used only while loading or as a graphics-failure backdrop.

## Run

Serve this directory with any local static HTTP server. ES modules require HTTP rather than opening `index.html` through `file://`. The current preview uses `http://127.0.0.1:4175/`.

Example: `python -m http.server 4175 --bind 127.0.0.1 --directory designs/signal-station` from the repository root.

No dependency installation, external CDNs, API keys, or hosted services are required. Three.js r180 and OrbitControls were copied from the existing comic-room project's installed runtime. Its MIT license is retained in `vendor/THREE-LICENSE.txt`. IBM Plex Sans, IBM Plex Mono, and a Phosphor Regular SVG subset are bundled locally with their licenses in `assets/brand/`. See [BRAND.md](BRAND.md) for the interface design system and asset versions.

## Interactions

The current version is a continuous scroll story: dish introduction → control deck/projects → workshop/tech stack → study desk/education → dish/space finale. `src/story.js` samples native document scroll into camera stops; the camera holds through reading intervals and retraces its path on reverse scroll. Navigation links jump to the content sections. Reduced motion switches directly between camera stops. Explicit exploration and the signal flight take over the camera until Return, Escape, or section navigation hands it back to the story.

The workshop and study are original procedural mesh annexes in `src/outbuildings.js`, connected by service walkways. The workshop has a server cabinet, monitor, tools, and rotating ventilation blades. The study has an articulated lamp, books, a notebook with a separate hinged page, a chair, and pinned notes. They share the original station materials and disappear with the rest of the station during atmospheric departure.

The Projects stop now frames the control deck's three displays close-up. Each mesh has a distinct project texture, with matching projected native buttons for keyboard/touch access and direct mesh picking. Ayos! and two labeled placeholders open individual dialogs populated from `src/projects.js`. The long project card column is retained only as the graphics-failure fallback. Mobile has separate camera framing to fit all three screens.

The workshop rack has been replaced by a service bench and a disassemblable signal core. Scroll raises the cover and sequentially separates six distinct boards: Languages, Frontend, Backend & APIs, Databases, Planning & delivery, and Dev tools. Guide lines retain their connection to the tray. Projected native selectors and mesh picking open category descriptions with honest placeholder slots. Reverse scroll rebuilds the device, and the workshop camera holds for inspection before departing. Reduced motion leaves the machine assembled and uses a stationary category grid. Three additional tests cover sequential/reversible disassembly, reduced-motion assembly, and finite transforms/action tags for all six parts (12 total tests).

Selecting a module now opens a focused inspection view: the workshop dims, labels/navigation recede, and the selected module's shared 3D geometry is enlarged in a separately lit foreground render pass with a subtle inspection ring. A native modal pairs it with a larger specification panel, module count, and Previous/Next controls. Closing or Escape restores the assembly, the original scroll position, and focus. The foreground pass only renders while entering, inspecting, or returning a module; reduced motion skips the travel. Two additional checks verify visibility restoration when cycling/exiting and preservation of renderer clearing state (14 total tests). Desktop/mobile browser checks cover selection, cycling, native keyboard access, and Escape return.

The education stop now displays information on real paper-textured objects: a framed fourth-year BSIT record, a pinned Philippine Startup Challenge X regional-finalist sheet, and a graduation notebook. Each opens a readable native dialog. School and graduation year remain labeled placeholders. Scroll reveals warm desk/board lighting, a cool fill, and softer ambient/sun light; all settings restore on departure. Mobile has separate framing and a high-contrast heading. Two new checks cover bounded/reversible lighting and stable reduced-motion state (16 total tests).

Beyond the horizon uses open scene typography with a **Scroll to send the signal** prompt. There is no launch button in this section. A short reading hold leads into four viewport heights of scroll-controlled dish alignment, pulse emission, cloud ascent, atmospheric departure, deep space, and planetary arrival. Stopping scroll holds the flight at that point; scrolling backward retraces the same path. Planet selection remains available at the end. Back to the dish and Escape rewind the story to the ground stop. Native wheel/touch scrolling stays available in space rather than being captured for orbit zoom. Reduced motion switches directly between the ground and space views. Browser checks cover desktop/mobile arrival, reverse travel from a selected planet, and daylight clouds without planets. One new scroll-mapping test brings the total to 17.

Projects 002/003, technology names, school, and graduation year are explicitly labeled placeholders at the user's request. Edit the corresponding `#work`, `#stack`, and `#education` sections in `index.html`; see [CONTENT.md](CONTENT.md). No technology proficiency or school is inferred from this prototype's implementation.

- The dish scans slowly. Drag its surface to adjust bearing and elevation independently; this switches to manual aiming. The station-controls panel and the antenna-adjustment panel action have been removed from the visible interface.
- Explore the station enters the orbit view; drag the background and scroll/pinch to change the camera. Return to overview or Escape restores the hero camera.
- Clicking the control-console hotspot or terminal geometry moves the camera to a close-up project view. The terminal screen assembly hinges open; the readable Ayos! overview is beside the modeled console. The separate detailed overview remains available through its native button. Native navigation reaches the work section directly.
- Clicking the dish (without dragging) moves the camera to the antenna close-up. **Send a signal** aligns the dish, emits a visible stylized pulse, and follows a continuous ascending camera path into the Signal Atlas. Three selectable procedural 3D worlds reveal Systems, Interfaces, and Machine Learning interests. The worlds are original portfolio metaphors rather than astronomical objects.
- Departure lasts 11 seconds: alignment and pulse, cloud-layer ascent, atmospheric departure, a starfield interval, then planetary approach. Sky darkness, stars, and planets have separate reveal phases. No planets render while daylight remains. On return, planets and stars disappear before the daylight sky returns.
- Return to station, Skip approach/flight/return, and Escape interrupt navigation without delayed callbacks. Reduced motion goes straight to destinations. Ambient pause freezes decorative motion while deliberate navigation remains usable.
- The ventilation fan, rooftop wind instrument, warning lens, signal pennant, birds, and ocean have individual motion. Deck lights can be switched off.
- Pause motion freezes the shared ambient simulation clock, including the dish scan and ocean. Manual controls and navigation remain usable. Reduced-motion preferences stop ambient motion and camera transitions and remove camera damping.
- Hide labels removes only the floating object labels. Native controls and direct portfolio links remain available.

## Rendering and resilience

The model uses code-generated geometry, shared material and primitive resources, procedural canvas surface textures, and shader-driven ocean movement. The camera has different mobile and desktop compositions. Pixel ratio is capped; rendering stops when the station is offscreen or the page is hidden. Static paused views render on demand, including interaction updates. WebGL initialization/context errors leave a concept backdrop, an explanatory message, and usable Work/About content.

## Content

Identity: Steven, software engineer, with systems/apps/UI/ML interests from the existing art direction. Ayos! facts are limited to the supplied reporting-system description and regional-finalist recognition in the Philippine Startup Challenge. The work illustration is identified as a concept diagram. No technical stack, contribution, metrics, contact address, or project outcomes are invented.

## Verification

Run `node --test designs/signal-station/tests/*.test.js` from the repository root. Nine checks cover the dish's paraboloid geometry, finite cliff surfaces/normals, smooth bounded scanning, mechanical clamps, deterministic scenery, strict daylight/stars/planets ordering, valid continuously ascending camera paths on desktop and mobile, reading holds, bounded/reversible scroll sampling, and reduced-motion camera steps. Source modules also pass `node --check`.

Browser checks used the Codex in-app browser at a 1440×960 desktop viewport and a 390×844 mobile viewport. Confirmed WebGL rendering without console errors, physical dish dragging (bearing/elevation changed and scan stopped), keyboard range control, lighting and pause state, orbit dragging, the console hotspot's native dialog, and mobile layout. Reduced-motion handling and graphics-failure fallback are implemented but have not been tested by changing OS settings or forcing context loss. Real-device mobile performance has not been measured.

The component-navigation pass was also checked in the browser: console/dish close-ups, project details and return, natural signal-flight completion, the cloud-stage view with no planets, Signal Atlas arrival, and planet selection on desktop and mobile. Cinematic actions remain skippable.

The scroll-story pass was checked at 1440×960 and 390×844: dish opening, workshop/study compositions, direct chapter navigation, readable placeholder cards, finale launch/skip/atlas arrival, and return to the opening. Fixed navigation sits above the reading cards. Browser emulation is not a real-device performance measurement; the reduced-motion sampling is unit-tested, while OS preference switching has not been exercised in-browser.

## Interaction references

- [NASA Deep Space Network Now](https://www.jpl.nasa.gov/deep-space-network-now/): ground antennas as links to distant spacecraft.
- [NASA Eyes](https://science.nasa.gov/eyes/): destination-focused exploration in a 3D space environment.
- [Google 100,000 Stars](https://experiments.withgoogle.com/100000-stars): exploring information through a spatial starfield.

The implementation takes the communication-to-destination idea from these references. It uses original procedural planets and static portfolio-interest descriptions; it does not load NASA telemetry or claim scientific scale or accuracy.

## Art direction / limits

The visual reference is the earlier Signal Station concept, retained at `assets/concept.png`. The current geometry is a procedural interaction prototype, with deliberately simpler topology, surface detail, atmosphere, and lighting than that painted concept. It establishes the movable assemblies and exploration behavior. A later asset pass can replace individual mesh groups with authored glTF models without flattening the scene or changing the native content controls.

The existing Next.js home page, comic-room variant, and valley prototypes are unchanged. This concept remains local and has not been deployed.

### Cinematic model and lighting pass

The station uses a warm directional key, a cool rim light, hemisphere fill, and a generated PMREM reflection environment. Existing education lighting still takes over during the study chapter. Metal, concrete, and the reflector have restrained surface wear and small bump relief; the ocean and sky use a cooler coastal palette.

`src/cinematic.js` provides a shared beveled unit box (including corrected front/top UVs), reflection setup, and station/annex detailing. Detail includes reflector rivets and rear trusses, receiver collars, roof seams and fascia, conduit, structural feet, tank bands and gauge, terminal fasteners/keys, wooden bench planks, tools, mug, grasses, and shrubs. Repeated fasteners, keys, and vegetation use instancing. The six tool modules include traces, solder pads, components, and mounting screws; their inspection pass shares the reflection environment. Contact planets retain their four identities with finer surface/atmosphere shading.

Verification: 19 Node tests pass, including beveled geometry bounds and texture coordinates. Browser checks cover desktop hero, project textures and modal, exploded core and inspection, education paper readability, and mobile hero. No console rendering errors observed.

### Day / night mode
The header moon/sun button toggles a persistent, reversible night state. `src/night-mode.js` blends the global lights, fog, mountain colors, reflections, and the sky/ocean shaders while local window, deck, and annex lights illuminate the station. The night sky includes stars and a moon with an ocean reflection. The mode preserves chapter lighting and the independent space-flight fade; cloud-passage sprites also take the night tint. Preferences are stored locally, with storage failure handled. Keyboard toggles and reduced-motion preferences apply immediately; pointer toggles blend using the existing frame loop, including while ambient motion is paused. Mobile navigation reserves a separate row for the four section links so the toggle does not cover the hero.

Validation: 21 Node checks pass, including night light bounds and independence from study chapter changes. Browser checks cover day/night reversal, reload persistence, mobile header/hero, and scrolling from night into the contact constellation.

### Smooth scroll scrubbing
The browser keeps native scrolling. `src/scroll-scrub.js` applies frame-rate-independent exponential damping to a separate visual scroll position (0.12s time constant, approximately 95% catch-up in 0.36s). `src/story.js` samples that same position for camera travel, the signal core, study lighting, chapter state, and the flight into space. The renderer keeps drawing until the tail settles even when ambient motion is paused. Reversing input redirects immediately without overshooting. Explicit navigation, rewind actions, resize measurements, keyboard scrolling, and reduced motion snap to avoid trailing an intentional destination change. No scroll interception or animation dependency was added.

Validation: 25 Node tests pass, including settling after input stops, refresh-rate equivalence, immediate reversal, reduced-motion snapping, and shared flight progress. Live checks cover paused ambient motion, tool disassembly and inspection, contact planet arrival after input stops, reversal from a planet approach, Back to dish, and mobile scrolling.

### Beyond-to-uplink handoff
The first tenth of flight progress now crossfades the Beyond composition into flight navigation and shading. During alignment, the camera eases from the exact final chapter pose toward a closer dish view, then joins the ascending flight curve at progress 0.17 with matching position and look target. Mobile has its own dish approach. Scroll-flight mode changes no longer issue a scroll reposition. The handoff uses the same damped progress in both directions; reduced motion retains immediate changes, and partly faded controls become inert. Added tests cover exact chapter entry, continuous alignment-to-climb joins, and fade bounds (27 passing tests).

### Live dish pose and camera ownership
Scroll flight captures the last rendered dish yaw/elevation rather than relying on a default pose. The scan phase has its own clock that advances only during automatic scanning; flight and manual aiming pause it. Reverse scroll therefore returns to the captured angle and normal scanning resumes from that phase, without jumping to the ambient clock's current angle.

`src/scene-control.js` applies scripted position/look targets directly and allows OrbitControls updates only during interactive camera control. Disabled OrbitControls still clamps positions when its update method runs; the former unconditional call changed the Beyond pose before the flight boundary, producing a downward step. The narrative and flight now share exact, unclamped views and updated camera matrices. Tests reproduce that former offset with the actual vendored OrbitControls and confirm continuity for both desktop/mobile poses, arbitrary live dish angles, and scan resumption (30 passing checks). Browser verification covers desktop and mobile boundary crossings and reverse scrolling, with no rendering errors.

The Beyond establishing view now pulls back and aims lower to include the terraces and rocky island base while retaining the dish as the main focal object. Desktop uses position [23,16,28] / target [-3,4.5,1]; mobile uses [25,15,39] / [3,10.5,0]. The hero view is unchanged. The alignment approach still starts at that exact establishing view and moves toward the dish; its mobile view selection accounts for the wider desktop distance. Desktop/day and mobile framing and the alignment handoff were visually checked; all 30 tests pass.

### Station Radio / sound design
The header speaker button opens native sound settings with three original, locally synthesized soundscapes: Ocean Drift (filtered, slowly swelling stereo surf), Harbor Keys (soft surf and sparse keyboard tones), and Deep Space (slow harmonic pads and distant bell tones). Web Audio starts only after Enable sound; reload always starts muted. The selected soundscape, volume, and effects preference are remembered. Preset changes crossfade, mute fades and suspends the context, and hidden pages suspend audio. Ocean ambience recedes with atmospheric flight progress.

Subtle open/close tones accompany project, skill, and education dialogs. Planet selection uses a bell signal; forward scroll crossings trigger a dish charging rise and a firing pulse. `soundscapes.js` gates threshold crossings, while the sound engine applies cooldowns so scroll updates do not repeat cues every frame. Visitors can independently disable effects and adjust overall volume. No external audio service, music download, or sound library is required.

Validation: 33 Node checks pass, including three distinct bounded mixes, one-shot forward firing thresholds, reverse/jump handling, and quiet bounded gain. Live browser checks cover explicit enable, all three choices, volume, effect toggles, project open/close, dish firing, mute, muted reload, and mobile sound settings. No playback exceptions observed. Audio is left muted after testing.

### Longer dish charge and stronger launch audio

The scroll flight now spans 5.5 viewport heights, with Beyond extended to 800svh. The dish aligns, holds its close camera while charging, fires at 32% progress, and departs at 34%. Clouds, atmospheric fade, stars, and contact planets retain their separate reveal order. The legacy timed flight is 15 seconds.

Charging uses sustained midrange harmonics whose pitch and gain follow scroll progress, including a held pose and reverse scrolling. Ambient layers duck to 55% while charging. Muting or disabling effects fades the charge, and firing releases it. The launch has a stronger harmonic impact and a longer 1.6-second noise tail. A warm receiver glow grows with charge progress. Background presets and volume defaults remain as before.

Validation: 35 Node checks pass. Live browser traversal confirmed Charging → Sending a pulse → Contact constellation, with no console or audio playback errors. Speaker loudness still depends on the visitor’s device and selected volume.

### Automatic journey soundtrack

Harbor Keys is now the fixed Earth soundtrack. Once the atmosphere fade reaches 1, the sound engine crossfades to Deep Space over two seconds. Reverse scrolling or returning to the dish crossfades back to Harbor Keys. The soundtrack follows location even while muted, so enabling sound in space starts the appropriate preset. Previous manual preset preferences are ignored; volume and effects preferences remain remembered. The sound panel shows the two-part journey and highlights its current soundtrack instead of presenting radio choices.

Validation: 36 Node checks pass. Browser checks confirmed Playing Harbor Keys on Earth, Playing Deep Space in space, and Harbor Keys again on reverse scroll, with no console errors. Preview left muted.

### Audio entrance

Every page load opens a full-screen native dialog over the live scene, with a dark blue overlay, 10px backdrop blur, an amber headphone icon, and Better with audio copy. Enter with sound starts the existing journey soundtrack from a user gesture, then reveals the site. Continue without sound and Escape reveal the page muted. The header retains sound controls. Native modal focus handling keeps the underlying page inert; dismissing returns focus to the home link without scrolling. The body cannot scroll while the entrance is open. Audio failures keep the prompt visible with retry guidance and the muted option available.

Validation: all 36 existing Node checks pass. Browser checks cover sound-on entry, muted entry, Escape, keyboard focus, and the 390px phone layout.

### Steven, the station operator

A solid, articulated Three.js character now stands beside the control console. The supplied photo informs the stylized portrait: swept dark hair with an asymmetric part, defined brows, warm complexion, a cream-and-navy botanical shirt, open collar and gold chain. The relaxed pose rests one hand at the end of the console, with the other near a pocket and a wristwatch. All features are actual lit geometry; the botanical fabric is a deterministic canvas texture. The source photo is not copied into public assets.

Breathing, occasional blinks and an eased head turn toward the uplink share the existing scene clock. Pause freezes motion; reduced motion uses a stable pose. Existing station lights and shadows illuminate the model in both day and night. The operator stays clear of all three project screens. The mobile hero aims lower to show the operator above the status panel. Desktop camera framing is unchanged.

The separate operator-preview.html turntable provides a close view with orbit controls. Validation: 38 Node checks pass, including finite character geometry and normals, grounded bounds, stable scene graph across animation, uplink reaction and reduced-motion stability. Browser checks cover the desktop hero, project console, night illumination and the 390px phone hero.

### Adult operator proportions and facial refinement

Refined against Steven’s stated 5′9″ stature and broad-shouldered, narrow-hipped build. The character now uses a roughly 6.5-head adult silhouette with longer legs, tapered trousers, smaller shoes and head, a narrower pelvis, and a fitted V-shaped torso. The neck is slimmer and shorter, shoulder caps sit lower, and the relaxed hand rests at the terminal frame. Overall station scale remains close to the earlier character.

The face has broader jaw planes, subtle integrated cheekbones, narrower almond-shaped eyes, restrained lips and nose details, and a lifted curved hairline. Hair strands no longer cast harsh striping onto the face; the cap still casts the hairstyle’s silhouette shadow. The shirt has an actual geometric V opening with collars fitted to its surface. The turntable now includes Full figure and Portrait views for review.

Validation: 39 Node checks pass, including adult head/body ratio, shoulder/hip taper, leg proportion, finite geometry, grounding, and stable reduced-motion poses. Browser inspection covers the full figure, portrait camera and live hero.

### Leaner idol-inspired styling

Reduced chest width and depth, rounded shoulder bulk, upper-arm and forearm thickness, and sleeve volume while retaining the long legs and narrow hips. The shirt now follows a gentler shoulder-to-waist taper; its collar, chain, placket and buttons fit the slimmer torso. The face retains the reference complexion and identity cues with a softer tapered jaw, straighter brows and a slightly gentler eye line. The hairstyle uses two outward-sweeping curtains around a subtle off-center part.

Validation: 39 Node checks pass. The silhouette check now bounds the lean shoulder/hip taper and chest depth while retaining the adult head/body and leg proportions. Browser review covers the full figure, portrait and live station hero.

### React role flip in the hero

The hero now cycles Software Engineer, Project Manager, UI/UX Designer and Web Developer using the shared LayoutTextFlip React component from components/ui/layout-text-flip.tsx. The supplied demo is at components/layout-text-flip-demo.tsx. The root already has shadcn aliases, Tailwind CSS v4 and TypeScript. See docs/station-role-flip.md for verified versions, style paths and integration details.

Run npm run build:station-role from the repository root after editing the component, hero mount or its styles. The standalone page loads the generated assets/ui/hero-role.js and hero-role.css. TypeScript validation and the production component build pass. Browser checks cover title rotation, fixed content position, Pause motion and a 390px phone viewport; no browser errors observed. Reduced motion uses a static role, and assistive technology receives the complete title list without recurring announcements.

### Larger hero greeting and DM Sans

The hero now says Hey! I’m in sentence case, with a 19–23px greeting instead of the previous 10–11px uppercase label. The name uses locally hosted DM Sans, with a slightly larger responsive size (up to 110px desktop and 60px mobile). The font and license are copied from the existing root dependency; no external font request or new package is needed. Existing navigation and body typography remain IBM Plex. Browser review confirms the greeting and single-line name fit the 390px phone layout and the desktop hero.

### Faster title flip with sound

The hero rotates titles every 1.8 seconds with a 280ms slide/blur transition and a 220ms width transition. LayoutTextFlip now exposes onWordChange, called once after a committed title change; the first render stays quiet. The station mount emits a flip cue through the existing audio bus. The effect combines a short filtered-noise swish with a dry descending tick and cleans up its audio nodes after playback. Existing sound enable, volume, effects, reduced-motion and title-pause behavior apply.

Validation: the standalone component build, TypeScript validation and all 39 existing Node checks pass. Live browser checks cover title rotation with audio enabled, the effects toggle and playback without console errors.

### Connected chapter route

The chapter navigator is enhanced by a reusable native ChapterRoute component (src/chapter-route.js, styled by src/chapter-route.css). Its ordered list retains the original anchor identities, labels, destinations and keyboard behavior. Numbered circular nodes are joined by solid amber completed segments and dotted current/upcoming segments, within a compact dark station panel. The current link uses a cream highlight and aria-current=step. The pause control includes a visible desktop label and follows the existing ambient motion state.

The route becomes a horizontal numbered rail at the bottom of phone layouts. The existing hero/inspection/flight visibility behavior remains controlled by story.js. Updates are cached so static route markup is not mutated every render frame. Validation: 40 Node checks pass, including chapter progression, reverse navigation and bounded route states; live browser checks cover desktop and 390px mobile layout, chapter links and pause/resume.
