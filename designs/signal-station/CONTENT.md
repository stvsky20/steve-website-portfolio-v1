# Signal Station content

Content was populated from Steven's supplied academic resume on 2026-10-16. The original PDF is unchanged.

## Editing sources

- `src/projects.js`: AYOS!, ESQUAKE, and the student leadership experience record. Shared by physical display textures and readable dialogs. The third display is explicitly experience, not an invented third software project. Contributions and technologies are included; no unverified demo/source URLs are added.
- `src/signal-core.js`: six workshop categories and confirmed tools. Includes Godot, Figma, Google APIs, OpenAI, and Firestore from project descriptions as well as the Technical Skills section. `main.js` creates matching fallback groups from this data.
- `src/tech-logos.js`: label-to-logo mapping and shared technology chip renderer. Used in workshop inspection and project records. Brand colors and shapes are retained, with consistent 24px marks, tile backgrounds, spacing, and typography. SQL, WAMP, and delivery methods use semantic icons because no distinct upstream brand mark was selected. Codex uses its OpenAI parent mark; Google Workspace and Google APIs use Google's parent mark.
- `assets/tech/`: local SVG files, pinned upstream URLs in sources.json, and Devicon/Simple Icons license files. Regenerate with `scripts/vendor-station-tech.py`. No runtime logo CDN calls.
- `src/education-study.js`: SLU degree, Dean's List recognition, 2023–2027 period and expected 2027 graduation, AYOS! regional-finalist record, and UST Senior High School STEM (2022–2023). Canvas paper art and dialogs are aligned.
- `src/space.js`: GitHub, LinkedIn, and email from the resume, plus a telephone link in the email record. Instagram remains pending because the resume does not provide a handle. Planet addresses and outbound links are rendered by journeys.js. No Earth destination.
- `index.html`: hero, section introductions, static reading fallback, and About copy. Hero credentials remain removed per Steven's earlier instruction. About contains location, leadership context, spoken languages, and personal interests.
- `src/resume-content.css`: consistent technology chips, project detail lists, and contact-link styling.

## Scene behavior

Stack navigation lands on the fully disassembled core, while wheel scrolling preserves the reveal/reassembly sequence. Inspection keeps the selected physical module in a separately lit foreground pass. Education retains the reversible local lighting reveal and selectable paper surfaces. Contact remains a continuous scroll-driven flight into space, with four contact planets.

The standalone experience is served on port 4175. The root Next.js app is a separate implementation.
