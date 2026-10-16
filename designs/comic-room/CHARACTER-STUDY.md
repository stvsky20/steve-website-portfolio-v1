# Steven Joe Valdez — Character Study 02

Preview: http://127.0.0.1:5174/character.html

## Revision

The head is now a shaped continuous surface with eye-socket depressions, cheek and jaw shaping, integrated nasal bridge/tip/wings, and a restrained mouth. Almond-shaped eye surfaces conform to the head rather than using protruding white spheres. Eyelid margins and eyebrows define expression. Hair locks are thinner and swept; face texture is reduced.

The fitted suit uses varying elliptical anatomical sections instead of uniform cylinders and round pads. Fabric and web-pattern maps, a surface-based red chest emblem, smaller hands, and narrower boots replace the raised tube decoration. A 16-bone skeleton drives weighted torso/limb surfaces. Shoulder/elbow/wrist and hip/knee/ankle joints are preserved.

Source: src/steven-model.js.
Scene and exporter: src/character.js.
Current model: public/models/steven-joe-valdez-character-v2.glb.
Previous blockout: public/models/steven-joe-valdez-character-v1.glb.
Archived source: src/steven-model-v1.js.

## Research references

- [Proko: nose anatomy and structure](https://www.proko.com/course-lesson/how-to-draw-a-nose-anatomy-and-structure): major planes and connected bridge, tip, and wings. Applied by replacing the separate cone and ball with deformations of the facial surface.
- [Proko: eye structure](https://www.youtube.com/watch?v=u6-bCgRmcko): eye socket, brow, and eyelids as a construction framework. Applied through recessed regions and thin almond-shaped eye patches.
- [Sony Pictures Imageworks: Into the Spider-Verse](https://www.imageworks.com/node/1371): artist-directed shapes and facial linework, expressive geometry curves, stylized rendering, halftone/hatching. Applied as selective lid/brow linework and restrained graphic shading.
- [Blender Studio: Blenderella](https://studio.blender.org/training/blenderella/): indexed overview recommends anatomical fundamentals before detailed character modeling. Full training could not be accessed; no technique claims here rely on unseen lessons.

These principles guide this procedural implementation. The model is not copied from a reference mesh or a scanned likeness.

## Inspect

Standing, Face Study, and The Leap select views. Scroll Story controls acceleration and a prolonged hold, reversibly. Reduced-motion keeps the story character still. Export GLB downloads the current version. Room Study returns to the room.

## Export

63 mesh parts, 16 bones, 17 transform animation channels including the root, one three-second Leap_and_hold clip. Standard materials, embedded illustrated texture maps, skin weights, and animation are exported.

Browser-only halftone and custom graphic shading are not baked into the GLB. Outline shells are omitted from export. The rig is cloned with SkeletonUtils so skin bone references remain correct.

## Verification

Build and browser checks passed: pose selection, forward/backward scroll pacing, reduced motion, model download, GLB parsing, reloading, animation playback, and skin deformation. Headless desktop Chrome runs measured around 59–60 FPS at 1536 × 960, with no console/page errors.

Run npm run test:character and node tests/model-export.mjs while the local server is active.

## Limits

Likeness remains an interpretation of one supplied photo. Facial expressions have no blend-shape rig yet. Body sections are separate skinned surfaces, not a single watertight production mesh; extreme poses can expose seams. Weighting is procedural and needs manual refinement. Hands, hair, proportions, and suit construction are still art studies.
