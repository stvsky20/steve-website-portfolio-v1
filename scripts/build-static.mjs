import { cp, mkdir, rm, access, readFile, writeFile } from "node:fs/promises";
import { build, transform } from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";

const station = fileURLToPath(new URL("../", import.meta.url));
const output = path.resolve(station, "dist");
// Clean only this concept's explicit generated output directory.
if (
  path.dirname(output) !== path.resolve(station) ||
  path.basename(output) !== "dist"
) {
  throw new Error("Unexpected static output path");
}
await access(path.join(station, "assets/ui/hero-role.js"));
await access(path.join(station, "assets/ui/hero-role.css"));
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
let html = await readFile(path.join(station, "index.html"), "utf8");
for (const directory of ["src", "assets"]) {
  await cp(path.join(station, directory), path.join(output, directory), {
    recursive: true,
    filter: (source) => {
      // Runtime JS is bundled below. Preserve original artwork locally, but
      // don't publish duplicate authoring PNGs or unused concept source art.
      if (
        directory === "src" &&
        path.extname(source) &&
        !source.endsWith(".css")
      )
        return false;
      const relative = path.relative(station, source).replaceAll("\\", "/");
      if (
        relative === "assets/concept.png" ||
        /^assets\/projects\/laundrify\/.*\.png$/.test(relative)
      )
        return false;
      return true;
    },
  });
}
const result = await build({
  absWorkingDir: station,
  entryPoints: { station: path.join(station, "src/main.js") },
  tsconfig: path.join(station, "tsconfig.json"),
  alias: { three: path.join(station, "vendor/three.module.js") },
  outdir: path.join(output, "assets/runtime"),
  entryNames: "[name]-[hash]",
  chunkNames: "chunk-[hash]",
  bundle: true,
  splitting: true,
  format: "esm",
  target: "es2020",
  minify: true,
  legalComments: "eof",
  metafile: true,
});
const entry = Object.entries(result.metafile.outputs).find(
  ([, info]) => info.entryPoint === "src/main.js",
)[0];
const entryUrl = path
  .relative(output, path.resolve(station, entry))
  .replaceAll("\\", "/");
html = html.replace(/src="src\/main\.js[^\"]*"/, `src="${entryUrl}"`);
html = html.replace(/\s*<script type="importmap">[\s\S]*?<\/script>/, "");
await writeFile(path.join(output, "index.html"), html);
for (const match of html.matchAll(/href="(src\/[^\"]+\.css)"/g)) {
  const file = path.join(output, match[1]);
  const css = await transform(await readFile(file, "utf8"), {
    loader: "css",
    minify: true,
  });
  await writeFile(file, css.code);
}
await mkdir(path.join(output, "vendor"), { recursive: true });
await cp(
  path.join(station, "vendor/THREE-LICENSE.txt"),
  path.join(output, "vendor/THREE-LICENSE.txt"),
);
await cp(
  new URL("../licenses/", import.meta.url),
  path.join(output, "licenses"),
  { recursive: true },
);
console.log(`Built Signal Station only: ${output}`);
