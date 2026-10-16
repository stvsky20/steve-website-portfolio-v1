# Steven Valdez — portfolio concepts

This repository preserves all portfolio concepts in one project. **Signal Station is the active version**: an interactive Three.js coastal station with scroll-driven scenes, project displays, an exploded tech stack, education records, and contact planets.

## Portfolio versions

| Location | Concept |
| --- | --- |
| `designs/signal-station/` | Active Signal Station portfolio |
| `designs/comic-room/` | Earlier comic-room concept |
| `designs/sunflower-story/` | Earlier sunflower/studio concept |
| `designs/valley-drive/` | Earlier valley-drive concept |
| `app/`, `components/`, `lib/` | Original Next.js portfolio and shared React UI source |

Each concept remains in its own directory. Source artwork, Blender projects, vendored assets and licenses are preserved. Dependencies, build caches, temporary exports, and verification screenshots are excluded by `.gitignore`.

## Run the active Signal Station

From the repository root, serve its directory with a static HTTP server:

```sh
python -m http.server 4175 --bind 127.0.0.1 --directory designs/signal-station
```

Open http://127.0.0.1:4175/. The assets are local; no API keys are required. See `designs/signal-station/CONTENT.md` for the current content sources and `docs/station-role-flip.md` for rebuilding the bundled React title component.

```sh
node --test designs/signal-station/tests/*.test.js
```

## Deploy to Vercel

Import this GitHub repository, keep Root Directory at the repository root, and deploy `main`. The root `vercel.json` explicitly selects the Other framework preset, skips dependency installation, and builds only Signal Station with `node designs/signal-station/scripts/build-static.mjs`.

Only `designs/signal-station/dist` is published. It contains the station homepage, runtime modules, styles, assets, and licenses. The other portfolio concepts, root Next.js pages, tests, documentation, and authoring previews are not in that output. The compiled React title assets are checked in; rebuild them with `npm run build:station-role` before deployment if their source changes.

The instructions below describe the original root Next.js concept, not the active Signal Station.

## Original Next.js portfolio

A creative portfolio for a fullstack developer and project manager. Built with Next.js App Router, React, TypeScript, Tailwind CSS, Motion, locally hosted fonts, Magic UI, and a focused Aceternity UI adaptation.

## Run locally

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000. Node.js 20.9 or newer is required by Next.js.

```sh
npm run typecheck
npm run build
npm start
```

## Personalize before publishing

- Edit `lib/portfolio.ts`: name, email, biography, GitHub/LinkedIn URLs, and project case studies. Adding an email activates the contact buttons as mailto links.
- All three projects are explicitly labeled illustrative concepts. Replace them with real work, responsibilities, images, and verified outcomes. The dashboard values are mock interface content, not claims about the portfolio owner.
- Replace the custom illustrations in `components/project-art.tsx` with real project screenshots when available.
- Review the positioning copy in `app/page.tsx` and the page description in `app/layout.tsx`.
- Remove preview/sample labels when the content is real. Change `robots` in `app/layout.tsx` to enable indexing at launch; the preview deliberately uses noindex.
- Add your real employment history and résumé if desired. None has been invented.

The contact fallback explains that details are coming soon. There is no backend contact form and no message is stored or sent by the site. With a real email configured, contact opens the visitor's email client.

## Structure

- `app/page.tsx`: homepage, project filters, native case-study/contact dialogs, mobile navigation.
- `app/globals.css`: shared visual tokens, component styles, responsive breakpoints and reduced-motion behavior.
- `components/orbital.tsx`: original CSS 3D sculpture, pointer response, pause control, offscreen/background pausing.
- `components/project-art.tsx`: original HTML/CSS sample-product illustrations.
- `components/ui/blur-fade.tsx`: Magic UI Blur Fade, adapted for reduced motion and transform-based movement. Upstream source: https://magicui.design/docs/components/blur-fade. MIT license preserved in `licenses/magic-ui.txt`.
- `components/ui/3d-card.tsx`: adapted free Aceternity 3D Card container, with fine-pointer guards and restrained tilt. Source: https://ui.aceternity.com/components/3d-card-effect and https://ui.aceternity.com/registry/3d-card.json.

## Accessibility and performance

Semantic landmarks, skip link, visible focus styles, native modal focus handling/Escape dismissal, mobile navigation, filter pressed states, reduced-motion support, and an explicit decorative-animation pause button. The sculpture pauses outside the viewport and when the browser tab is hidden. Fonts are self-hosted; no external imagery or third-party analytics is requested.

Responsive behavior should also be checked on physical phones before launch, particularly Safari safe areas and touch interactions.
