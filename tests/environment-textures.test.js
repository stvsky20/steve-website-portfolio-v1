import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "../vendor/three.module.js";
import { createEnvironment } from "../src/environment.js";

test("environment maps load as repeating linear data and wake a paused scene; comparison preserves uniforms", async () => {
  const originalLoad = THREE.TextureLoader.prototype.load;
  const pending = [];
  THREE.TextureLoader.prototype.load = function (url, loaded) {
    pending.push({ url, loaded });
  };
  let wakes = 0;
  try {
    const environment = createEnvironment(new THREE.Scene(), () => wakes++);
    assert.equal(pending.length, 2);
    const uniforms = [
      environment.skyUniforms.cloudMap,
      environment.seaUniforms.waterMap,
    ];
    for (const [index, request] of pending.entries()) {
      assert.match(request.url, /^assets\/environment\/.+\.png$/);
      let disposed = false;
      uniforms[index].value.addEventListener(
        "dispose",
        () => (disposed = true),
      );
      const map = new THREE.Texture();
      request.loaded(map);
      assert.equal(uniforms[index].value, map);
      assert.equal(map.colorSpace, THREE.NoColorSpace);
      assert.equal(map.wrapS, THREE.RepeatWrapping);
      assert.equal(map.wrapT, THREE.RepeatWrapping);
      assert.equal(map.minFilter, THREE.LinearMipmapLinearFilter);
      assert.equal(disposed, true);
    }
    assert.equal(wakes, 2);
    environment.skyUniforms.night.value = 0.7;
    environment.skyUniforms.spaceFade.value = 0.4;
    environment.seaUniforms.time.value = 123;
    const sky = environment.sky.material.fragmentShader;
    const sea = environment.sea.material.fragmentShader;
    await environment.setShaderMode("procedural");
    assert.notEqual(environment.sky.material.fragmentShader, sky);
    await environment.setShaderMode("textured");
    assert.equal(environment.sky.material.fragmentShader, sky);
    assert.equal(environment.sea.material.fragmentShader, sea);
    assert.equal(environment.skyUniforms.night.value, 0.7);
    assert.equal(environment.skyUniforms.spaceFade.value, 0.4);
    assert.equal(environment.seaUniforms.time.value, 123);
  } finally {
    THREE.TextureLoader.prototype.load = originalLoad;
  }
});
