# Signal Station portfolio

This is Steven Valdez's standalone Three.js portfolio. The repository contains only Signal Station. Earlier concepts are kept locally in ignored folders and are not part of the current branch's files.

## Run locally

Node.js 22 or newer is recommended. No dependency installation is needed to serve the checked-in runtime assets.

```sh
npm run dev
```

Open http://127.0.0.1:4175/. Use `PORT=4176` (or `$env:PORT=4176` in PowerShell) if that port is already in use.

## Build and verify

```sh
npm run build
npm test
npm start
```

`build` creates `dist/` containing only the station homepage, modules, styles, assets, and licenses. `start` serves that production output. Tests run with Node's built-in test runner.

## React title source

The rest of the site is native JavaScript and Three.js. The rotating hero title is built from React, Motion, and Tailwind utilities. Its compiled assets are checked into `assets/ui/`.

```sh
npm ci
npm run typecheck
npm run build:station-role
```

Rebuild the title assets after editing `src/hero-role.tsx`, `src/hero-role.css`, `components/ui/layout-text-flip.tsx`, or `lib/utils.ts`.

## Deploy to Vercel

Import this repository's `main` branch with **Root Directory `./`** and **Application Preset Other**. The root `vercel.json` sets:

- Build Command: `node scripts/build-static.mjs`
- Output Directory: `dist`
- Install Command: empty (runtime assets are already bundled)

No environment variables or API keys are required. Only the `dist/` output is published.

## Content and assets

- `src/projects.js`: six project records and Laundrify gallery content.
- `assets/projects/`: project logos, screenshots, and photographs.
- `assets/leadership/`: leadership assets when supplied.
- `src/education-study.js`: education, recognition, and leadership records.
- `src/space.js`: contact destinations.
- `CONTENT.md`: editing notes; `BRAND.md`: design and asset provenance.
- `assets/brand/`, `assets/tech/`, `assets/contact/`, `vendor/`, and `licenses/` retain upstream licenses.

The original project repository history is preserved; earlier commits can still be recovered.
