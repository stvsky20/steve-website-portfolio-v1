import { mkdir, writeFile, copyFile } from "node:fs/promises";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { GithubLogoIcon } from "@phosphor-icons/react/dist/csr/GithubLogo";
import { LinkedinLogoIcon } from "@phosphor-icons/react/dist/csr/LinkedinLogo";
import { InstagramLogoIcon } from "@phosphor-icons/react/dist/csr/InstagramLogo";
import { EnvelopeSimpleIcon } from "@phosphor-icons/react/dist/csr/EnvelopeSimple";
import { PhoneIcon } from "@phosphor-icons/react/dist/csr/Phone";

const folder = new URL(
  "../assets/contact/",
  import.meta.url,
);
await mkdir(folder, { recursive: true });
const icons = {
  github: GithubLogoIcon,
  linkedin: LinkedinLogoIcon,
  instagram: InstagramLogoIcon,
  email: EnvelopeSimpleIcon,
  phone: PhoneIcon,
};
for (const [name, component] of Object.entries(icons)) {
  const svg = renderToStaticMarkup(
    createElement(component, { weight: "fill", size: 256 }),
  );
  await writeFile(new URL(`${name}.svg`, folder), svg);
}
await copyFile(
  new URL("../node_modules/@phosphor-icons/react/LICENSE", import.meta.url),
  new URL("LICENSE.txt", folder),
);
await writeFile(
  new URL("sources.json", folder),
  JSON.stringify(
    {
      library: "@phosphor-icons/react",
      version: "2.1.10",
      weight: "fill",
      source: "https://github.com/phosphor-icons/react",
      icons: Object.keys(icons),
    },
    null,
    2,
  ),
);
console.log("Vendored five Phosphor contact icons.");
