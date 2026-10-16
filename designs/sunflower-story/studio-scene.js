import * as THREE from './assets/vendor/three.module.js';
import { createWallClimber } from './wall-climb.js?rig=4';
const names=['bedroom','street','graffiti','climb','night'];
const ART_ASPECT=1672/941, NEUTRAL_Z=8, FOV=36;
const H=2*NEUTRAL_Z*Math.tan(FOV*Math.PI/360), W=H*ART_ASPECT;
const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
const gaussian=(u,v,x,y,sx,sy)=>Math.exp(-((u-x)**2/sx**2+(v-y)**2/sy**2));
export function paintedDepth(name,u,v){
 const floor=smooth((.48-v)/.48);
 if(name==='bedroom')return .1+.5*floor+.22*gaussian(u,v,.2,.45,.35,.4)+.15*gaussian(u,v,.75,.38,.2,.32);
 if(name==='street')return .06+.72*floor+.12*(Math.abs(u-.5)*2)**2;
 if(name==='graffiti')return .18+.52*floor+.2*gaussian(u,v,.18,.2,.3,.22);
 if(name==='climb')return .2+.32*(1-u)+.14*gaussian(u,v,.72,.5,.12,.35);
 return .03+.66*floor+.28*gaussian(u,v,.11,.64,.16,.4);
}
export function createStudioScene(host,onReady){
 let renderer;
 try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch{return null;}
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(0x100e20,0);renderer.domElement.className='studio-canvas';host.prepend(renderer.domElement);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(FOV,1,.1,40),meshes=[];
 const climber=createWallClimber(scene,onReady);
 const textureLoader=new THREE.TextureLoader();let width=0,height=0,contextAvailable=true,lastState=null;
 const segments=innerWidth<700?72:144;
 for(const name of names){
  const geometry=new THREE.PlaneGeometry(W,H,segments,Math.round(segments/ART_ASPECT));
  const pos=geometry.attributes.position,uv=geometry.attributes.uv;
  for(let i=0;i<pos.count;i++){
   const z=paintedDepth(name,uv.getX(i),uv.getY(i))*.75;
   pos.setXYZ(i,pos.getX(i)*(NEUTRAL_Z-z)/NEUTRAL_Z*1.07,pos.getY(i)*(NEUTRAL_Z-z)/NEUTRAL_Z*1.07,z);
  }
  geometry.computeBoundingSphere();
  const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:false,uniforms:{plate:{value:null},reveal:{value:1},resolution:{value:new THREE.Vector2(1,1)}},
   vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
   fragmentShader:'uniform sampler2D plate;uniform float reveal;uniform vec2 resolution;varying vec2 vUv;void main(){float diagonal=gl_FragCoord.x/resolution.x+(1.0-gl_FragCoord.y/resolution.y)*0.12;if(diagonal>reveal*1.12)discard;gl_FragColor=texture2D(plate,vUv);\n#include <colorspace_fragment>\n}'});
  const mesh=new THREE.Mesh(geometry,material);mesh.visible=false;mesh.renderOrder=names.indexOf(name);scene.add(mesh);meshes.push(mesh);
  textureLoader.load(`assets/studio/${name==='climb'?'climb-clean.png':name+'-plate.png'}`,tex=>{tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());material.uniforms.plate.value=tex;mesh.userData.loaded=true;onReady();},undefined,()=>{mesh.userData.failed=true;onReady();});
 }
 // Small authored dust/snow marks are code-native effects, not raster asset edits.
 const mark=document.createElement('canvas');mark.width=mark.height=32;const ctx=mark.getContext('2d');
 const glow=ctx.createRadialGradient(16,16,1,16,16,15);glow.addColorStop(0,'rgba(255,255,255,1)');glow.addColorStop(.3,'rgba(255,255,255,.75)');glow.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,32,32);
 const particleGeometry=new THREE.BufferGeometry(),positions=new Float32Array(80*3),seeds=[];
 for(let i=0;i<80;i++)seeds.push({x:((i*73.17)%100)/100,y:((i*39.61)%100)/100,z:((i*13.31)%100)/100});
 particleGeometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
 const particles=new THREE.Points(particleGeometry,new THREE.PointsMaterial({map:new THREE.CanvasTexture(mark),color:0xe9f2ff,size:.025,transparent:true,opacity:.45,depthTest:false,depthWrite:false}));particles.renderOrder=9;scene.add(particles);
 renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();contextAvailable=false;host.closest('#stage').dataset.renderer='fallback';});
 renderer.domElement.addEventListener('webglcontextrestored',()=>{contextAvailable=true;onReady();});
 function resize(){const box=host.getBoundingClientRect();if(width===box.width&&height===box.height)return;width=Math.max(1,box.width);height=Math.max(1,box.height);renderer.setPixelRatio(Math.min(devicePixelRatio,width<700?1.25:1.5));renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();for(const mesh of meshes)mesh.material.uniforms.resolution.value.set(renderer.domElement.width,renderer.domElement.height);}
 function render(active,local,progress,still){
  lastState={active,local,progress,still};if(!contextAvailable||!meshes[active].userData.loaded)return false;
  const rect=host.getBoundingClientRect();if(rect.bottom<0||rect.top>innerHeight||document.hidden)return true;
  resize();const t=still ? .45 : local,cover=NEUTRAL_Z*Math.min(1,ART_ASPECT/camera.aspect);
  const focus=[.63,.6,.56,.78,.58][active];const crop=Math.max(0,W-H*camera.aspect);
  const framing=(focus-.5)*crop;
  const motion=still?0:1;
  camera.position.set(framing+motion*(t-.5)*[.16,.3,.23,.12,.26][active],motion*(t-.5)*(active===3?.46:.05),cover-motion*t*.14);
  camera.lookAt(framing,0,.1);camera.rotateZ(motion*(t-.5)*(active===3?.022:.003));
  for(let i=0;i<meshes.length;i++){
   meshes[i].visible=meshes[i].userData.loaded&&(i===active||(!still&&i===active-1&&local<.13));
   meshes[i].material.uniforms.reveal.value=i===active&&!still&&active>0?clamp(local/.13):1;
  }
  particles.visible=!still;particles.material.opacity=active===4?.6:active===0?.2:active===2?.24:.08;particles.material.color.set(active===4?0xc8e7ff:0xffdb91);particles.material.size=active===4?.033:.016;
  for(let i=0;i<seeds.length;i++){
   const s=seeds[i],cycle=(s.y+progress*(active===4?4:1.15))%1;
   positions[i*3]=framing+(s.x-.5)*W*.85+Math.sin(progress*9+i)*.04;
   positions[i*3+1]=(cycle-.5)*H*(active===4?-1:1);
   positions[i*3+2]=1.2+s.z*2.3;
  }
  particleGeometry.attributes.position.needsUpdate=true;climber.update(active,local,still,new THREE.Vector2(renderer.domElement.width,renderer.domElement.height));renderer.render(scene,camera);renderer.domElement.dataset.camera=camera.position.toArray().map(v=>v.toFixed(4)).join(',');renderer.domElement.dataset.location=names[active];renderer.domElement.dataset.still=String(still);renderer.domElement.dataset.ready=String(meshes.filter(m=>m.userData.loaded).length);renderer.domElement.dataset.particles=String(particles.visible);const rigState=climber.getState();renderer.domElement.dataset.rigReady=String(rigState.ready);renderer.domElement.dataset.rigBones=String(rigState.bones);renderer.domElement.dataset.rigPose=JSON.stringify(rigState.lastPose);if(rigState.error)renderer.domElement.dataset.rigError=rigState.error;return true;
 }
 return {render,getState:()=>({contextAvailable,loaded:meshes.filter(m=>m.userData.loaded).length,lastState,renderer:'webgl',vertices:meshes.reduce((sum,m)=>sum+m.geometry.attributes.position.count,0)}),dispose(){renderer.dispose();for(const m of meshes){m.geometry.dispose();m.material.uniforms.plate.value?.dispose();m.material.dispose();}particleGeometry.dispose();particles.material.map.dispose();particles.material.dispose();renderer.domElement.remove();}};
}


