// CPU-only structural audit. Canvas painting is stubbed; this does not measure FPS.
import { createStation } from "../src/model.js";
import { createOutbuildings } from "../src/outbuildings.js";
import { createOperator } from "../src/operator.js";
import { batchStaticMeshes } from "../src/mesh-batching.js";
const gradient = { addColorStop() {} };
const context = new Proxy(
  {},
  {
    get: (_, key) => {
      if (key === "measureText") return (text) => ({ width: text.length * 25 });
      if (key === "createLinearGradient" || key === "createRadialGradient")
        return () => gradient;
      return () => {};
    },
  },
);
globalThis.document = {
  createElement: () => ({ width: 0, height: 0, getContext: () => context }),
};
globalThis.Image = class {};
const model = createStation();
createOutbuildings(model, () => {});
const operator = createOperator();
model.root.add(operator.root);
function count(root) {
  let submissions = 0,
    triangles = 0;
  root.traverse((o) => {
    if (!o.isMesh) return;
    submissions++;
    triangles +=
      ((o.geometry.index?.count ?? o.geometry.attributes.position.count) / 3) *
      (o.isInstancedMesh ? o.count : 1);
  });
  return { meshSubmissions: submissions, triangles };
}
const before = count(model.root);
const batching = batchStaticMeshes(
  model.root,
  new Set([
    operator.root,
    model.flag,
    ...[model.fan, model.cups, model.beacon, model.lid].filter((o) => o.isMesh),
  ]),
);
console.log(
  JSON.stringify({ before, after: count(model.root), batching }, null, 2),
);
