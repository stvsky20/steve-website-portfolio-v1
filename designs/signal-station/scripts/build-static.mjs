import { cp, mkdir, rm, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const station = fileURLToPath(new URL("../", import.meta.url));
const output = path.resolve(station, "dist");
// Clean only this concept's explicit generated output directory.
if (path.dirname(output) !== path.resolve(station) || path.basename(output) !== "dist") {
  throw new Error("Unexpected static output path");
}
await access(path.join(station, "assets/ui/hero-role.js"));
await access(path.join(station, "assets/ui/hero-role.css"));
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(path.join(station, "index.html"), path.join(output, "index.html"));
for (const directory of ["src", "assets", "vendor"]) {
  await cp(path.join(station, directory), path.join(output, directory), {
    recursive: true,
    filter: (source) => {
      // Keep runtime modules and styles; exclude authoring-only React sources.
      if (directory === "src" && /\.(tsx?|map)$/.test(source)) return false;
      return true;
    },
  });
}
await cp(new URL("../../../licenses/", import.meta.url), path.join(output, "licenses"), {recursive:true});
console.log(`Built Signal Station only: ${output}`);
