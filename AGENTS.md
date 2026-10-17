# Signal Station

This repository is the standalone Signal Station portfolio, built with native JavaScript, Three.js, and a small bundled React hero-title component. It is not a Next.js application.

- Runtime source: src/, assets/, vendor/, index.html.
- Verify with npm test and npm run build.
- Rebuild the React title with npm run build:station-role when its source changes.
- Keep assets and licenses local. Preserve reduced motion, pause, keyboard navigation, and native dialog behavior.
- Use the shared asymmetric bento layout for all project overviews: uneven card widths with equal heights within each row, short image overlays, technology logos, contribution and context cards, and accessible image enlargement. Photo cards have no borders, padding, or colored mats; images fill their cards with cover sizing on desktop and retain natural proportions when stacked on mobile. Full images remain available through enlargement. Add project-specific data to the shared renderer rather than creating a separate project layout.
- Earlier concepts in designs/, the previous root app/, and .local-archive/ are local archives excluded from Git. Do not add them back to the repository.
- Vercel builds the root scripts/build-static.mjs and publishes dist/ only.
