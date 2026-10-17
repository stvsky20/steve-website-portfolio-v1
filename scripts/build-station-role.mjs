import { readFile, mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { build, transform } from "esbuild";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";

const root = fileURLToPath(new URL("../", import.meta.url));
const station = root;
const output = path.join(station, "assets/ui");
await mkdir(output, { recursive: true });
await build({
  absWorkingDir: root,
  entryPoints: [path.join(station, "src/hero-role.tsx")],
  outfile: path.join(output, "hero-role.js"),
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2020",
  minify: true,
  tsconfig: path.join(root, "tsconfig.json"),
  define: { "process.env.NODE_ENV": '"production"' },
});
const source = path.join(station, "src/hero-role.css");
const css = await postcss([tailwind({ base: root })]).process(
  await readFile(source, "utf8"),
  { from: source },
);
const minified = await transform(css.css, { loader: "css", minify: true });
await writeFile(path.join(output, "hero-role.css"), minified.code);
console.log("Built the Signal Station React title and Tailwind utilities.");
