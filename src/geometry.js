import * as THREE from "../vendor/three.module.js";

export const radians = (degrees) => (degrees * Math.PI) / 180;
export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
export function scanBearing(time) {
  return -10 + Math.sin(time * 0.085) * 18;
}

// The paraboloid is an actual surface, with a shallow concave face and radial panels.
export function dishGeometry(
  radius = 3.7,
  depth = 1.08,
  rings = 18,
  segments = 80,
) {
  const positions = [],
    uv = [],
    indices = [];
  for (let ring = 0; ring <= rings; ring++) {
    const r = (radius * ring) / rings;
    for (let segment = 0; segment <= segments; segment++) {
      const a = (segment / segments) * Math.PI * 2;
      positions.push(
        Math.cos(a) * r,
        Math.sin(a) * r,
        depth * (r / radius) ** 2,
      );
      uv.push(segment / segments, ring / rings);
    }
  }
  for (let ring = 0; ring < rings; ring++) {
    for (let s = 0; s < segments; s++) {
      const a = ring * (segments + 1) + s,
        b = a + segments + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}

export function cliffGeometry(seed = 1, radius = 8, height = 8) {
  const n = 36,
    positions = [],
    indices = [];
  const levels = [0, 0.16, 0.42, 0.76, 1];
  const radii = [0.72, 1, 0.95, 0.72, 0.35];
  for (let row = 0; row < levels.length; row++) {
    for (let i = 0; i <= n; i++) {
      const a = ((i % n) / n) * Math.PI * 2;
      const wobble =
        1 +
        0.14 * Math.sin((i % n) * 3.7 + seed) +
        0.07 * Math.cos((i % n) * 1.9 + row * 2 + seed);
      const r = radius * radii[row] * wobble;
      const top = row === 0 ? 0.15 * Math.sin(a * 4 + seed) : 0;
      positions.push(
        Math.cos(a) * r,
        -levels[row] * height + top,
        Math.sin(a) * r * 0.82,
      );
    }
  }
  for (let row = 0; row < levels.length - 1; row++)
    for (let i = 0; i < n; i++) {
      const a = row * (n + 1) + i,
        b = a + n + 1;
      indices.push(a, a + 1, b, b, a + 1, b + 1);
    }
  const center = positions.length / 3;
  positions.push(0, 0, 0);
  for (let i = 0; i < n; i++) indices.push(center, i + 1, i);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g.toNonIndexed();
}

export function seededRandom(seed = 104) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
