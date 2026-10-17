import * as THREE from "../vendor/three.module.js";

// A second pass isolates the real module geometry above a darkened workshop.
export function createCoreInspection(core, worldCamera, environment = null) {
  const scene = new THREE.Scene();
  scene.environment = environment;
  const camera = new THREE.PerspectiveCamera(worldCamera.fov, 1, 0.1, 30);
  const shade = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.MeshBasicMaterial({
      color: 0x06131d,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }),
  );
  shade.position.z = -7;
  scene.add(shade);
  scene.add(new THREE.HemisphereLight(0xe5f4f2, 0x384b50, 1.4));
  const light = new THREE.DirectionalLight(0xffdfaa, 4);
  light.position.set(-2, 4, 5);
  scene.add(light);
  const rim = new THREE.DirectionalLight(0x8dcbd8, 2);
  rim.position.set(3, 1, -2);
  scene.add(rim);
  const ringGeometry = new THREE.BufferGeometry().setFromPoints(
    Array.from(
      { length: 97 },
      (_, i) =>
        new THREE.Vector3(
          Math.cos((i * Math.PI) / 48),
          Math.sin((i * Math.PI) / 48),
          0,
        ),
    ),
  );
  const ring = new THREE.Line(
    ringGeometry,
    new THREE.LineBasicMaterial({
      color: 0xe5be7c,
      transparent: true,
      opacity: 0,
    }),
  );
  ring.position.z = -4.9;
  scene.add(ring);
  let persistentShade = 0;
  let mesh = null,
    index = -1,
    amount = 0,
    from = 0,
    to = 0,
    start = 0;
  const source = new THREE.Vector3(),
    sourceRotation = new THREE.Quaternion();
  let sourceScale = 1;
  const targetRotation = new THREE.Quaternion().setFromEuler(
    new THREE.Euler(Math.PI / 2, 0, -0.1),
  );
  function release() {
    if (!mesh) return;
    mesh.traverse((child) => {
      if (child.isMesh) child.material.dispose();
    });
    scene.remove(mesh);
    mesh = null;
  }
  return {
    select(next) {
      persistentShade = amount;
      release();
      core.parts.forEach((part) => (part.group.visible = true));
      index = next;
      const part = core.parts[index].group;
      part.getWorldPosition(source);
      worldCamera.worldToLocal(source);
      sourceScale = Math.min(1, 4.2 / Math.max(0.1, -source.z));
      source.multiplyScalar(sourceScale);
      source.z = -4.2;
      part.getWorldQuaternion(sourceRotation);
      sourceRotation.premultiply(worldCamera.quaternion.clone().invert());
      mesh = part.clone(true);
      mesh.traverse((child) => {
        if (child.isMesh) {
          child.material = child.material.clone();
          child.castShadow = false;
          child.receiveShadow = false;
        }
      });
      scene.add(mesh);
      amount = from = 0;
      to = 1;
      start = performance.now();
    },
    clear() {
      persistentShade = 0;
      from = amount;
      to = 0;
      start = performance.now();
    },
    update(now, reduced, aspect) {
      const progress = reduced ? 1 : Math.min(1, (now - start) / 250);
      const eased = progress * progress * (3 - 2 * progress);
      amount = from + (to - from) * eased;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      const height = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 7;
      shade.scale.set((height * aspect) / 2, height / 2, 1);
      shade.material.opacity = Math.max(amount, persistentShade) * 0.88;
      core.parts.forEach((part, i) => {
        part.group.visible = !(i === index && amount > 0.001);
      });
      if (mesh) {
        const mobile = aspect < 0.8;
        const x = mobile
          ? 0
          : -Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) *
            4.2 *
            aspect *
            0.4;
        const y = mobile ? 0.55 : 0;
        mesh.position.lerpVectors(
          source,
          new THREE.Vector3(x, y, -4.2),
          amount,
        );
        mesh.quaternion.slerpQuaternions(
          sourceRotation,
          targetRotation,
          amount,
        );
        mesh.scale.setScalar(
          THREE.MathUtils.lerp(sourceScale, mobile ? 1.05 : 1.85, amount),
        );
        ring.position.set(x, y, -4.9);
        ring.scale.setScalar(mobile ? 0.85 : 1.6);
        ring.material.opacity = amount * 0.25;
      }
      if (to === 0 && progress === 1) {
        release();
        index = -1;
      }
      return progress < 1;
    },
    render(renderer) {
      if (!mesh || amount < 0.001) return;
      const autoClear = renderer.autoClear;
      renderer.autoClear = false;
      renderer.clearDepth();
      renderer.render(scene, camera);
      renderer.autoClear = autoClear;
    },
  };
}
