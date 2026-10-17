# Signal Station content

Content was populated from Steven's supplied academic resume on 2026-10-16. The original PDF is unchanged.

## Editing sources

- `src/projects.js`: AYOS!, ESQUAKE, Laundrify, and three pending project records. Shared by six physical display textures and readable dialogs. Leadership is a separate education-scene record. No unverified demo/source URLs are added.
- `src/signal-core.js`: six workshop categories and confirmed tools. Includes Godot, Figma, Google APIs, OpenAI, and Firestore from project descriptions as well as the Technical Skills section. `main.js` creates matching fallback groups from this data.
- `src/tech-logos.js`: label-to-logo mapping and shared technology chip renderer. Used in workshop inspection and project records. Brand colors and shapes are retained, with consistent 24px marks, tile backgrounds, spacing, and typography. SQL, WAMP, and delivery methods use semantic icons because no distinct upstream brand mark was selected. Codex uses its OpenAI parent mark; Google Workspace and Google APIs use Google's parent mark.
- `assets/tech/`: local SVG files, pinned upstream URLs in sources.json, and Devicon/Simple Icons license files. Regenerate with `scripts/vendor-station-tech.py`. No runtime logo CDN calls.
- `src/education-study.js`: SLU degree, Dean's List recognition, 2023–2027 period and expected 2027 graduation, AYOS! regional-finalist record, and UST Senior High School STEM (2022–2023). Canvas paper art and dialogs are aligned.
- `src/space.js`: GitHub, LinkedIn, and email from the resume, plus a telephone link in the email record. Instagram remains pending because the resume does not provide a handle. Planet addresses and outbound links are rendered by journeys.js. No Earth destination.
- `index.html`: hero, section introductions, static reading fallback, and About copy. Hero credentials remain removed per Steven's earlier instruction. About contains location, leadership context, spoken languages, and personal interests.
- `src/resume-content.css`: consistent technology chips, project detail lists, and contact-link styling.

## Scene behavior

Stack navigation lands on the fully disassembled core, while wheel scrolling preserves the reveal/reassembly sequence. Inspection keeps the selected physical module in a separately lit foreground pass. Education retains the reversible local lighting reveal and selectable paper surfaces. Contact remains a continuous scroll-driven flight into space, with four contact planets.

Signal Station now lives at the repository root and is served on port 4175. Earlier portfolio concepts and the former Next.js app are local archives excluded from the current Git branch.

## Six-screen command center

The console has two rows of three physical monitors. `src/model.js` creates all six surfaces and assigns one project index per screen. `main.js` aligns six native hit targets with those surfaces; both keyboard/touch targets and scene picking open the same project. There are no project banks or bank selectors. Desktop and mobile camera framing is defined in `src/story.js`.

`src/projects.js` contains six software-project slots: AYOS!, ESQUAKE, and four explicitly pending records. Replace the pending records with actual details when supplied. Leadership lives separately in `educationRecords[3]` and is accessible from the education scene. All six projects also appear in the graphics-failure reading fallback.

## Laundrify bento case study

Project 003 is Laundrify. Its concise overview, exact supplied stack versions, six feature captions, image descriptions, engineering approach, and prototype limitations live in `src/projects.js` under `bento`. The six numbered PNG posters in `assets/projects/laundrify/` are user-provided originals; matching WebP files are the optimized runtime images. The editable machine illustration is retained but is not one of the six gallery tiles.

`src/project-bento.js` and `src/project-bento.css` adapt the supplied Magic UI Bento Grid composition into the standalone site's native dialog system. Desktop uses five columns, tablet four, and phone one. No React runtime or shadcn install is added to the station for this layout. Magic UI's MIT license is retained at `licenses/magic-ui.txt` in the repository root; source concept: https://magicui.design/docs/components/bento-grid (Dillion Verma / Magic UI).

Image tiles preserve the poster composition, show brief overlay captions, and open a nested native image dialog with the full image and a short feature explanation. Escape and close return focus to the originating tile. Reduced motion removes hover scaling. Generic project dialogs remain in use for other projects. Gabriel’s is identified as a fictional demo workspace within Laundrify. Charts use sample revenue data; machines are simulated; authentication, payments, messaging, and equipment integration are not connected.
