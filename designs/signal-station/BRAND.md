# Signal Station interface system

The interface uses a restrained instrument-panel vocabulary around the exploratory 3D station. Warm paper reading surfaces, deep blue-green controls, amber signals, and copper details connect the UI to the scene.

## Typography

- IBM Plex Sans: 400 for headings and reading copy, 500 for navigation, 600 for actions and emphasis.
- IBM Plex Mono: 400/500 for station identifiers, numbers, and technical labels.
- Body: 16–17px on desktop; 15–16px in mobile information panels. Line height 1.6–1.7 for reading copy.
- Hero: responsive 64–100px on desktop, 40px on mobile. Section titles and dialog headings scale independently.
- Technical labels use restrained uppercase and tracking. Long reading copy stays in sentence case.

## Tokens

| Role | Value |
| --- | --- |
| Ink | `#102a35` |
| Paper | `#f4efe3` |
| Cream | `#eae2d0` |
| Copper | `#a64f30` |
| Amber | `#efbe7a` |
| Dark surface | `#14343f` |
| Raised dark surface | `#1c414d` |
| Light surface | `#fbf7ee` |
| Paper text | `#193743` |
| Secondary paper text | `#53656a` |
| Secondary dark text | `#bccdce` |

Spacing follows 4, 8, 12, 16, 24, 32, 48, and 64px tokens. Radii are 6px for compact controls, 8px for panels, and 12px for large cards. The canonical CSS values are in `src/brand.css`, loaded after the scene and journey layouts.

## Components

- Navigation: compact name/role lockup, broadcast mark, clear Work/About links.
- Actions: 48px primary buttons, consistent icon sizing, visible keyboard focus.
- Station controls: solid dark surface, native ranges/checkboxes, labeled mechanical settings.
- Project and antenna panels: warm paper, generous padding, ink text, one prominent action. The antenna adjustment button opens the controls; the reading panel yields while adjustments are open.
- Space information: dark cards with readable pale text and amber accents. Planet selectors have selected/hover/focus treatment.
- Project cards and dialogs: shared paper surfaces, typography, spacing, borders, and button styles.
- Mobile panels have bounded heights and scroll when their content exceeds the available space. Scene navigation and return remain outside them.
- Decorative icons are hidden from assistive technology; native labels carry the meaning. Motion preferences and the existing ambient pause remain supported.

These are custom HTML/CSS components informed by the recommended shadcn/Carbon approach. Neither React component package is installed in this standalone preview.

## Local assets

- `@fontsource/ibm-plex-sans` **5.3.0**: Latin normal 400, 500, 600 WOFF2, SIL Open Font License.
- `@fontsource/ibm-plex-mono` **5.3.0**: Latin normal 400, 500 WOFF2, SIL Open Font License.
- `@phosphor-icons/core` **2.1.1**: 25 Regular SVG symbols, MIT license.

Exact package sources/integrity metadata and the retained licenses live in `assets/brand/`. `vendor-brand.py` reproduces the selected asset subset from version-pinned npm packages. It is a maintenance tool and is not needed to run the site. Fonts and icons make no external runtime requests.

`src/icons.js` hydrates explicit icon slots and the existing dynamic navigation symbols from the local SVG sprite, including text updated during camera journeys.
