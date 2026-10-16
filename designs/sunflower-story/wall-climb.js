import * as THREE from './assets/vendor/three.module.js';
import { GLTFLoader } from './assets/vendor/loaders/GLTFLoader.js';
const clamp=x=>Math.max(0,Math.min(1,x));
export function createWallClimber(scene,onReady){
 const root=new THREE.Group();root.name='IndependentWallClimber';root.position.set(2.06,-.3,.94);root.visible=false;scene.add(root);
 const key=new THREE.DirectionalLight(0xffb377,3.0);key.position.set(4,4,5);const fill=new THREE.DirectionalLight(0x617dbc,.8);fill.position.set(-3,1,4);const ambient=new THREE.AmbientLight(0x8694bf,.45);scene.add(key,fill,ambient);
 const shade=new Uint8Array([72,125,186,245]);const gradient=new THREE.DataTexture(shade,4,1,THREE.RedFormat);gradient.minFilter=gradient.magFilter=THREE.NearestFilter;gradient.needsUpdate=true;
 const mask={climbReveal:{value:1},climbMode:{value:0},climbResolution:{value:new THREE.Vector2(1,1)}};
 function clipMaterial(material,texture=false){
  material.onBeforeCompile=shader=>{
   Object.assign(shader.uniforms,mask);
   shader.fragmentShader='uniform float climbReveal;uniform float climbMode;uniform vec2 climbResolution;\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('void main() {','void main() { float cd=gl_FragCoord.x/climbResolution.x+(1.0-gl_FragCoord.y/climbResolution.y)*.12;if(climbMode>.5&&climbMode<1.5&&cd>climbReveal*1.12)discard;if(climbMode>1.5&&cd<=climbReveal*1.12)discard;');
   if(texture){shader.vertexShader='varying vec3 vHeroLocal;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvHeroLocal=position;');shader.fragmentShader='varying vec3 vHeroLocal;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <dithering_fragment>','#include <dithering_fragment>\nfloat inkMark=sin(vHeroLocal.x*97.0+vHeroLocal.z*53.0)*sin(vHeroLocal.y*71.0+vHeroLocal.z*91.0);gl_FragColor.rgb*=.96+.04*inkMark;float heroRim=pow(1.0-abs(dot(normal,normalize(vViewPosition))),3.0);gl_FragColor.rgb+=vec3(.11,.045,.012)*heroRim;');}
   if(texture&&material.userData.fabric){shader.fragmentShader=shader.fragmentShader.replace('#include <dithering_fragment>','#include <dithering_fragment>\nfloat suitPlane=clamp(dot(normal,normalize(vec3(.7,.55,.6))),0.0,1.0);float suitEdge=pow(1.0-abs(dot(normal,normalize(vViewPosition))),2.0);gl_FragColor.rgb+=mix(vec3(.026,.042,.075),vec3(.10,.055,.027),suitPlane)+suitEdge*vec3(.10,.065,.025);float suitWeave=sin(vHeroLocal.x*380.0)*sin(vHeroLocal.z*410.0);gl_FragColor.rgb*=.975+.025*suitWeave;');}
  };
  material.customProgramCacheKey=()=>`climb-mask-${texture}-${Boolean(material.userData.fabric)}`;return material;
 }
 const mark=document.createElement('canvas');mark.width=mark.height=64;const ctx=mark.getContext('2d'),g=ctx.createRadialGradient(32,32,4,32,32,31);g.addColorStop(0,'rgba(0,0,0,.6)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,64,64);const shadowTex=new THREE.CanvasTexture(mark);
 const shadowMaterials=[],shadows={};
 for(const name of ['hand_L','hand_R','foot_L','foot_R']){const material=clipMaterial(new THREE.MeshBasicMaterial({map:shadowTex,transparent:true,opacity:.3,depthWrite:false,depthTest:false}));shadowMaterials.push(material);const mesh=new THREE.Mesh(new THREE.PlaneGeometry(.2,name.startsWith('hand')?.2:.28),material);mesh.visible=false;mesh.renderOrder=3.2;scene.add(mesh);shadows[name]=mesh;}
 let model=null,mixer=null,action=null,duration=8,leadIn=0,error=null,samples=null,lastPose=null;
 fetch('assets/hero/contact-samples.json').then(r=>r.ok?r.json():null).then(data=>{samples=data;onReady();}).catch(()=>{});
 new GLTFLoader().load('assets/hero/wall-climber.glb?rig=5',gltf=>{
  model=gltf.scene;root.add(model);const originals=[];model.traverse(obj=>{if(obj.isMesh)originals.push(obj);});
  for(const mesh of originals){
   const old=mesh.material,color=old.color?.clone()??new THREE.Color(0x101629);if(color.r<.15&&color.g<.15)color.multiplyScalar(.9);
   mesh.material=clipMaterial(new THREE.MeshToonMaterial({color,map:old.map,gradientMap:gradient,side:THREE.DoubleSide,transparent:true}),true);mesh.renderOrder=3.6;mesh.frustumCulled=false;
   mesh.material.userData.fabric=Boolean(old.map)||(old.name==='Suit charcoal');
   if(mesh.isSkinnedMesh){
    const shadowMaterial=clipMaterial(new THREE.MeshBasicMaterial({color:0x070a1a,transparent:true,opacity:.18,depthWrite:false,depthTest:false}));
    const maskCompile=shadowMaterial.onBeforeCompile;shadowMaterial.onBeforeCompile=shader=>{maskCompile(shader);shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>','vec4 wallShadowWorld=modelMatrix*vec4(transformed,1.0);wallShadowWorld.xy+=vec2(-.14,-.12);wallShadowWorld.z=.352;gl_Position=projectionMatrix*viewMatrix*wallShadowWorld;');};shadowMaterial.customProgramCacheKey=()=> 'climb-projected-body-shadow';
    const castShadow=new THREE.SkinnedMesh(mesh.geometry,shadowMaterial);castShadow.position.copy(mesh.position);castShadow.quaternion.copy(mesh.quaternion);castShadow.scale.copy(mesh.scale);castShadow.bind(mesh.skeleton,mesh.bindMatrix);castShadow.renderOrder=3.1;castShadow.frustumCulled=false;mesh.parent.add(castShadow);
    const geometry=mesh.geometry.clone(),positions=geometry.attributes.position,normals=geometry.attributes.normal;
    for(let i=0;i<positions.count;i++)positions.setXYZ(i,positions.getX(i)+normals.getX(i)*.003,positions.getY(i)+normals.getY(i)*.003,positions.getZ(i)+normals.getZ(i)*.003);
    const outline=new THREE.SkinnedMesh(geometry,clipMaterial(new THREE.MeshBasicMaterial({color:0x060915,side:THREE.BackSide,transparent:true})));outline.name='InkContour';outline.position.copy(mesh.position);outline.quaternion.copy(mesh.quaternion);outline.scale.copy(mesh.scale);outline.bind(mesh.skeleton,mesh.bindMatrix);outline.renderOrder=3.5;outline.frustumCulled=false;mesh.parent.add(outline);
   }
  }
  const clip=gltf.animations.find(c=>c.tracks.some(t=>t.name.includes('root')))||gltf.animations[0];
  if(!clip){error='Climb animation clip missing';onReady();return;}
  mixer=new THREE.AnimationMixer(model);action=mixer.clipAction(clip);action.setLoop(THREE.LoopOnce,1);action.clampWhenFinished=true;action.play();leadIn=Math.max(0,clip.duration-8);duration=clip.duration-leadIn;root.userData.ready=true;onReady();
 },undefined,e=>{error=String(e.message||e);onReady();});
 function update(active,t,still,resolution){
  const entering=active===3,outgoing=active===4&&t<.13&&!still,visible=(entering||outgoing)&&root.userData.ready;
  root.visible=visible;key.visible=fill.visible=ambient.visible=visible;
  for(const s of Object.values(shadows))s.visible=visible;
  if(!visible)return;
  mask.climbResolution.value.copy(resolution);mask.climbMode.value=still?0:outgoing?2:entering&&t<.13?1:0;mask.climbReveal.value=clamp(t/.13);
  const sample=still ? .48 : outgoing ? 1 : t;
  action.enabled=true;action.paused=false;action.setEffectiveWeight(1);mixer.setTime(leadIn+sample*Math.max(0,duration-.0001));root.updateMatrixWorld(true);
  const pose={};
  for(const [name,shadow]of Object.entries(shadows)){
   const bone=model.getObjectByName(name);if(!bone)continue;const point=new THREE.Vector3();bone.getWorldPosition(point);shadow.position.set(point.x,point.y,.354);const idx=samples?Math.min(samples.length-1,Math.round(sample*(samples.length-1))):0;const planted=samples?.[idx]?.contacts[name]?.planted??true;shadow.material.opacity=planted?.38:.10;pose[name]={point:point.toArray().map(v=>Number(v.toFixed(5))),planted};
  }
  lastPose={sample:Number(sample.toFixed(5)),duration,contacts:pose};
 }
 return{update,isReady:()=>Boolean(root.userData.ready),getState:()=>({ready:Boolean(root.userData.ready),error,lastPose,bones:model?(()=>{let n=0;model.traverse(o=>{if(o.isBone)n++;});return n;})():0})};
}



