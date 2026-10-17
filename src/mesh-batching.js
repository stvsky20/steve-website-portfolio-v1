import * as THREE from "../vendor/three.module.js";

// Batch only static siblings: their parent's movement, original material,
// picking action, lighting and shadow settings stay intact.
export function batchStaticMeshes(root, excluded = new Set()) {
  let originals = 0,
    batches = 0;
  function visit(parent) {
    if (excluded.has(parent)) return;
    const groups = new Map();
    for (const mesh of [...parent.children]) {
      visit(mesh);
      if (
        !mesh.isMesh ||
        mesh.isInstancedMesh ||
        mesh.children.length ||
        excluded.has(mesh) ||
        mesh.userData.dynamic ||
        !mesh.visible ||
        Array.isArray(mesh.material) ||
        mesh.material.transparent ||
        mesh.scale.x * mesh.scale.y * mesh.scale.z <= 0
      )
        continue;
      const key = [
        mesh.geometry.uuid,
        mesh.material.uuid,
        mesh.castShadow,
        mesh.receiveShadow,
        mesh.userData.action || "",
        mesh.renderOrder,
        mesh.layers.mask,
      ].join("/");
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(mesh);
    }
    for (const meshes of groups.values()) {
      if (meshes.length < 4) continue;
      const first = meshes[0];
      const batch = new THREE.InstancedMesh(
        first.geometry,
        first.material,
        meshes.length,
      );
      batch.name = "Shared static details";
      batch.castShadow = first.castShadow;
      batch.receiveShadow = first.receiveShadow;
      batch.userData.action = first.userData.action;
      batch.renderOrder = first.renderOrder;
      batch.layers.mask = first.layers.mask;
      meshes.forEach((mesh, index) => {
        mesh.updateMatrix();
        batch.setMatrixAt(index, mesh.matrix);
        parent.remove(mesh);
      });
      batch.instanceMatrix.needsUpdate = true;
      batch.computeBoundingSphere();
      parent.add(batch);
      originals += meshes.length;
      batches++;
    }
  }
  visit(root);
  return { originals, batches, saved: originals - batches };
}
