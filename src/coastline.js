import * as THREE from "../vendor/three.module.js";

// A low coastal landmass, with every boundary beneath the waterline. Unlike a
// silhouette strip this remains solid as the story camera moves and ascends.
export function islandGeometry(width, depth, height, phase = 0) {
  const geometry = new THREE.PlaneGeometry(width, depth, 100, 24);
  geometry.rotateX(-Math.PI / 2);
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i) / (width / 2);
    const z = positions.getZ(i) / (depth / 2);
    const envelope =
      Math.max(0, 1 - x * x) ** 1.5 * Math.max(0, 1 - z * z) ** 1.3;
    const peaks =
      0.58 +
      0.22 * Math.sin(x * 8 + phase) +
      0.12 * Math.sin(x * 19 - z * 3 + phase) +
      0.08 * Math.cos(x * 37 + z * 5);
    positions.setY(i, -7 + height * envelope * peaks);
  }
  geometry.computeVertexNormals();
  return geometry;
}

export function createCoastline() {
  const coast = new THREE.Group();
  coast.name = "Layered coastal islands";
  for (const [x, z, width, depth, height, color, phase] of [
    [-145, -350, 420, 100, 35, 0xa5aaa4, 2.1],
    [190, -375, 400, 95, 30, 0xa5aaa4, 4.2],
    [-170, -225, 280, 85, 26, 0x788d8c, 1.2],
    [135, -245, 310, 95, 32, 0x7f9190, 3.7],
    [335, -155, 175, 75, 20, 0x718788, 5.1],
  ]) {
    const island = new THREE.Mesh(
      islandGeometry(width, depth, height, phase),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(color).convertLinearToSRGB(),
        fog: false,
      }),
    );
    island.position.set(x, 0, z);
    coast.add(island);
  }
  return coast;
}
