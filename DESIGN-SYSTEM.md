# Portfolio visual foundations

## Direction

Editorial, spacious, curious, technically expressive. Lusion informs the scale and sense of play; the page has its own typography, orbital sculpture, project illustrations, and composition.

## Tokens

| Role | Value |
| --- | --- |
| Paper | `#f5f4f0` |
| Ink | `#20211f` |
| Secondary text | `#6c6d68` |
| Dividers | `#dcdcd4` |
| Accent | `#2748ed` |
| Display/body | DM Sans Variable, self-hosted |
| Editorial emphasis | Instrument Serif Italic, self-hosted |
| Motion curve | `cubic-bezier(.23, 1, .32, 1)` |

The main page uses fluid typography and 4.1% desktop / 6% mobile gutters. Section spacing is 100px desktop and 70px mobile. Card/media corners are 10–12px; interactive pills use fully rounded corners. Shadows are reserved for the sculpture, product mockups, and overlays.

## Component rules

- A single cobalt accent connects navigation, illustrated systems, and the contact section.
- Project cards show discipline, title, summary, and technologies. Preview concepts are labeled.
- Body content stays static. Hero movement is decorative, pausable, and disabled for reduced motion.
- Magic UI provides reveal motion; the Aceternity card container provides a small pointer tilt. Both inherit the site's tokens and accessibility behavior.
- Hover transforms only run for fine pointers. All primary interactions work by click, touch, and keyboard.
