# Valley drive — motion study

## Three hero prototypes

Open `heroes.html` on the same static server (`http://127.0.0.1:4174/heroes.html`). The original motion study remains in `index.html`.

1. **Sky Letters**: identity-led, large CSS perspective lettering with layered extrusion shadows over the moving valley. Most expressive; typography occupies more of the scenery.
2. **Travel Journal**: scenery-led, with an editorial paper introduction at the bottom. Calm and readable; identity is lower on the screen.
3. **Coastal Line**: supplied coastal train reference displayed upright using CSS rotation, with station signage and a project ticket. Distinct setting; train artwork is a still, not an animated train.

The bottom picker switches instantly. Number keys 1–3 or arrow keys switch; R replays. Selection persists in `?v=`. Pause applies to both valley studies, and reduced-motion preferences suppress decorative movement. The picker is copied from the prototype skill specification. All prototypes are isolated from the main portfolio.

Hero content hierarchy: name, software-engineer title, a clear work action, then a compact Ayos! preview. The shared work section uses only supplied Ayos! facts, with a functioning native project-overview dialog and a short About section. Fonts are bundled locally from the project's existing font packages. The train reference is copied as supplied, retaining its visible attribution mark; no new art was generated for these heroes.

Checked all three at desktop 1440×900 and narrow 375×812 plus the default preview panel. Verified image loading, absence of horizontal document overflow in the narrow Sky layout, project navigation, dialog opening/closing and focus restoration, pause state, and no browser warnings/errors. Reduced-motion rules are implemented; OS-level preference switching has not been manually exercised.

A separate visual preview based on the user's uploaded alpine landscape. Open `index.html` through a local static server. The main Next.js portfolio is unchanged.

The background stays still while the yellow car travels right to left across the horizontal foreground road. CSS transform animations provide a 24-second linear crossing and a subtle 800ms suspension cycle. Pause freezes both animations; reduced motion shows a stationary car. Tap the scene or press Escape to restore hidden controls.

## Assets and generation

Generated using the built-in imagegen tool, from the user's supplied reference. These are repainted reference-based assets rather than pixel-identical source extractions.

- `assets/valley.png`: Upright clean landscape plate.
- `assets/car.png`: Transparent side-on car sprite.

Background prompt: Rotate the supplied sideways image 90 degrees counterclockwise into an upright landscape. Preserve the landscape, composition, painted style, colors, buildings, utility pole, wires, sky and flowers closely. Remove only the yellow car, luggage and dust, seamlessly repainting the road behind it. No text, UI, new objects or redesign.

Car prompt: Extract and recreate only the small mustard-yellow compact vintage hatchback with roof luggage from the reference. Upright strict side view, front pointing left; hand-painted cel animation aesthetic matching the original yellow paint, charcoal tires, silver hubs, windows and red/olive roof luggage. Transparent background, tightly framed, no ground, landscape, text, shadow or dust.

## Checks

Visually checked in the Codex in-app browser. Both images loaded and the car aligned with the foreground road. Pause toggled to Resume and froze the movement. Reduced-motion styling is implemented; OS-level preference switching was not manually tested. Wheel rotation is not yet separated from the painted sprite.
