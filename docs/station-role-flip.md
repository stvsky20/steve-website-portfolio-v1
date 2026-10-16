# Signal Station role flip

The root project already has the requested setup. No shadcn initialization or Tailwind/TypeScript migration is needed:

- shadcn configuration: `components.json`, `new-york`, TypeScript enabled.
- Component aliases: `@/components` and `@/components/ui`.
- Shared utility: `lib/utils.ts` exports `cn` using clsx and tailwind-merge.
- Tailwind CSS **4.3.3**, configured through `@tailwindcss/postcss` in `postcss.config.mjs`.
- TypeScript **7.0.2**, React **19.3.0**, Motion **14.0.0**.
- Default shared styles: `app/globals.css`.

Reusable components belong in `components/ui` so the shadcn alias and imports such as `@/components/ui/layout-text-flip` resolve consistently. This folder already existed. The supplied demo is at `components/layout-text-flip-demo.tsx` and the reusable component is at `components/ui/layout-text-flip.tsx`.

## Live portfolio integration

The live Signal Station is a standalone Three.js page under `designs/signal-station`, rather than the root Next.js app. `src/hero-role.tsx` mounts the shared React component into `#hero-role`. It rotates Software Engineer → Project Manager → UI/UX Designer → Web Developer every 1.8 seconds. Steven's name remains fixed.

The standalone page keeps its existing `src/style.css`, `src/brand.css`, and `src/story.css`. The title's Tailwind source and station styling live in `src/hero-role.css`. Only Tailwind theme and utilities are included; Preflight is omitted to preserve the existing scene UI. The compiled CSS/JavaScript are saved in `assets/ui/hero-role.css` and `assets/ui/hero-role.js`, which the static server can serve without runtime package resolution or a CDN.

After changing the React component, mount, or title styles, run from the repository root:

```sh
npm run build:station-role
npm run typecheck
```

The build uses the declared esbuild and PostCSS development dependencies. Commit or copy the generated `assets/ui` files along with the standalone site. The root Next.js app can import the same component directly.

The requested blur/slide treatment uses Motion with a 280ms ease-out transition and a 220ms layout transition. The title pauses while the audio entrance is open, the tab is hidden, the visitor leaves the introduction, or Pause motion is active. Reduced motion keeps a static title. Screen readers receive the full list once instead of repeated announcements. Fixed vertical space prevents the credentials and CTA from jumping when the word width changes. The original static Software Engineer text remains available if the React bundle cannot load.

Each committed title change emits a short flip cue through the existing station audio bus. The first render stays quiet; mute and the interaction effects toggle gate playback. A short filtered-noise swish and a descending dry tick are synthesized locally, without an additional audio download.


## Role silhouettes

The reusable LayoutTextFlip accepts renderIcon(word, index), placing its returned SVG inside the same keyed Motion element as the title. The station uses Phosphor React icons in fill weight, imported individually to keep the bundle limited to the chosen icons:

- Software Engineer: CodeBlockIcon
- Project Manager: KanbanIcon
- UI/UX Designer: PenNibIcon
- Web Developer: GlobeIcon

The mapping is keyed by title text. Icons inherit the title color, use a fixed 1em footprint and a 10px gap, and are decorative for accessibility. Rotation timing, the flip sound, pause and reduced-motion behavior are unchanged.
