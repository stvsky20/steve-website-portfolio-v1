import {chromium} from '@playwright/test';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage();
await page.goto('http://127.0.0.1:5174/character.html');
const result=await page.evaluate(async()=>{
 const {GLTFLoader}=await import('/node_modules/three/examples/jsm/loaders/GLTFLoader.js');
 const {AnimationMixer,Vector3}=await import('/node_modules/three/build/three.module.js');
 const gltf=await new GLTFLoader().loadAsync('/models/steven-joe-valdez-character-v2.glb');
 const character=gltf.scene.getObjectByName('Steven_Joe_Valdez');
 let skinned;gltf.scene.traverse(o=>{if(o.isSkinnedMesh&&!skinned)skinned=o;}); if(!skinned)throw Error('Exported skin missing');
 skinned.skeleton.update(); const vertexBefore=skinned.applyBoneTransform(0,new Vector3().fromBufferAttribute(skinned.geometry.attributes.position,0)).toArray();
 const before=character.quaternion.toArray();
 const mixer=new AnimationMixer(gltf.scene);mixer.clipAction(gltf.animations[0]).play();mixer.update(1.25);
 gltf.scene.updateMatrixWorld(true);skinned.skeleton.update(); const vertexAfter=skinned.applyBoneTransform(0,new Vector3().fromBufferAttribute(skinned.geometry.attributes.position,0)).toArray(); if(JSON.stringify(vertexBefore)===JSON.stringify(vertexAfter))throw Error('Skin did not deform during animation');
 const after=character.quaternion.toArray();
 if(JSON.stringify(before)===JSON.stringify(after))throw Error('Exported animation did not change the character pose');
 return {loaded:true,animation:gltf.animations[0].name,duration:gltf.animations[0].duration,poseChanged:true,skinDeformed:true,bones:skinned.skeleton.bones.length};
});
console.log(JSON.stringify(result));await browser.close();


