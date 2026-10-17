# Signal Station

This repository is the standalone Signal Station portfolio, built with native JavaScript, Three.js, and a small bundled React hero-title component. It is not a Next.js application.

- Runtime source: src/, assets/, vendor/, index.html.
- Verify with npm test and npm run build.
- Rebuild the React title with npm run build:station-role when its source changes.
- Keep assets and licenses local. Preserve reduced motion, pause, keyboard navigation, and native dialog behavior.
- Use the shared asymmetric bento layout for all project overviews: uneven card widths with equal heights within each row, short image overlays, technology logos, contribution and context cards, and accessible image enlargement. Photo cards have no borders, padding, or colored mats; images fill their cards with cover sizing on desktop and retain natural proportions when stacked on mobile. Full images remain available through enlargement. Add project-specific data to the shared renderer rather than creating a separate project layout.
- Laundrify is the standard for every project container. Use `src/project-overview.js` for the shared header, top-right pressable public-deployment CTA, and bento renderer. Supply deployment URLs through project data; hide the CTA when no real URL is supplied. Captions use a dark fade overlay, never opaque boxes. Keep new galleries on the same alternating-width grid, including galleries with more than six images.
- Every technology in a project's tools card must use the shared large icon capsule. Keep the full stack in `technologies`; do not move secondary technologies into a plain-text row. Use local brand artwork where available and relevant semantic icons otherwise.
- Use the shared rem-based tokens in `src/type-scale.css` for interface text. Body copy is 18px at default browser settings; supporting copy, captions, and controls use 14–18px, and small nonessential labels have a 12px floor. Avoid reintroducing 8–11px UI text. Check wrapping and mobile navigation when adjusting typography.
- Earlier concepts in designs/, the previous root app/, and .local-archive/ are local archives excluded from Git. Do not add them back to the repository.
- Vercel builds the root scripts/build-static.mjs and publishes dist/ only.
