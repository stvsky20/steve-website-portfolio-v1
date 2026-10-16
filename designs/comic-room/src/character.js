import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import {createSteven} from './steven-model.js';
import './character.css';
import { clone as cloneRig } from 'three/addons/utils/SkeletonUtils.js';

const canvas=document.querySelector('#character'),stage=document.querySelector('#character-stage'),status=document.querySelector('#load-status');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));}
catch(e){status.textContent='WebGL is unavailable. This character study needs a browser with 3D enabled.';}
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(38,1,.1,70);
const hero=createSteven();scene.add(hero.root);
const display=new THREE.Group();scene.add(display);display.add(hero.root);
display.position.x=1.05;
scene.add(new THREE.HemisphereLight('#a7dfff','#21102c',2.1));
const key=new THREE.DirectionalLight('#ffe3ba',3);key.position.set(-3,7,6);scene.add(key);
const rim=new THREE.DirectionalLight('#20d5f5',2.6);rim.position.set(5,4,-3);scene.add(rim);
const magenta=new THREE.DirectionalLight('#f32b85',1.4);magenta.position.set(-4,2,-2);scene.add(magenta);
// Quantized color planes and stable halftone are renderer-only look development.
// Export retains standard materials; custom onBeforeCompile shading is not baked into the GLB.
for(const [name,material] of Object.entries(hero.materials)){
  if(name==='ink'||name==='paper'||name==='cyan'||name==='lip'||name==='hair')continue;
  material.customProgramCacheKey=()=> 'steven-graphic-'+name;
  material.onBeforeCompile=shader=>{
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 characterLocal;');
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ncharacterLocal=position;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 characterLocal;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',[
      'float graphicLuma=dot(outgoingLight,vec3(.2126,.7152,.0722));',
      'float graphicBand=graphicLuma>.55?1.0:(graphicLuma>.19?.72:.45);',
      'outgoingLight=mix(outgoingLight,diffuseColor.rgb*graphicBand,.38);',
      'vec2 printGrid=fract(characterLocal.xy*29.0)-.5;',
      'float printRadius=mix(.055,.28,1.0-graphicBand);',
      'float printAA=max(fwidth(length(printGrid)),.02);',
      'float printDot=1.0-smoothstep(printRadius-printAA,printRadius+printAA,length(printGrid));',
      name==='skin'?'outgoingLight*=1.0-printDot*.035;':'outgoingLight*=1.0-printDot*.13;',
      '#include <opaque_fragment>'
    ].join('\n'));
  };
}
// Dimensional ring and city fragments sit behind the character.
const world=new THREE.Group();world.position.z=-3;scene.add(world);
for(let i=0;i<4;i++){
  const ring=new THREE.Mesh(new THREE.TorusGeometry(3.3+i*.68,.015+i*.004,4,70),new THREE.MeshBasicMaterial({color:i%2?'#20d5f5':'#ffb531',transparent:true,opacity:.5}));
  ring.position.set(.8,2.8,-i*.8);ring.rotation.set(.2,-.2,i*.17);world.add(ring);
}
for(let i=0;i<15;i++){
  const height=.6+(i*7%11)*.19;
  const fragment=new THREE.Mesh(new THREE.BoxGeometry(.38,height,.32),new THREE.MeshBasicMaterial({color:['#342c65','#773777','#245d85'][i%3]}));
  fragment.position.set(-5+i*.75,.2+Math.sin(i)*.6,-.5+(i%3)*.3);fragment.rotation.z=(i-7)*.04;world.add(fragment);
  const edges=new THREE.LineSegments(new THREE.EdgesGeometry(fragment.geometry),new THREE.LineBasicMaterial({color:i%2?'#20d5f5':'#f32b85'}));fragment.add(edges);
}
let mode='story',progress=0;
const titles=['LET’S START<br>WITH A NAME.','TAKE<br>THE LEAP.','HOLD<br>THAT THOUGHT.','WHAT WILL<br>YOU BUILD?'];
const labels=['01 / MEET STEVEN','02 / FROM IDEA TO ACTION','03 / THE SUSPENDED MOMENT','04 / TO BE CONTINUED'];
const copy=['Steven Joe Valdez.<br>Software engineer. Curious by default.','A pose and camera study.<br>Scroll controls the movement.','Fast becomes slow.<br>The moment stretches across the page.','The character is the start.<br>The full portfolio story comes next.'];
function updateScroll(){
  progress=THREE.MathUtils.clamp(scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight),0,1);
  document.querySelector('#story-progress').style.transform='scaleX('+progress+')';
}
addEventListener('scroll',updateScroll,{passive:true});
function setMode(next){
  mode=next;for(const id of ['story-mode','standing','leap','portrait'])document.querySelector('#'+id).setAttribute('aria-pressed',String(({ 'story-mode':'story',standing:'standing',leap:'leap',portrait:'portrait'}[id])===mode));
  document.querySelector('#scroll-cue').textContent=mode==='story'?'SCROLL TO TURN THE PAGE ↓':'POSE STUDY / SELECT SCROLL STORY TO RESUME';
}
document.querySelector('#story-mode').onclick=()=>setMode('story');
for(const id of ['standing','leap','portrait'])document.querySelector('#'+id).onclick=()=>setMode(id);
async function exportModel(){
  const savedMode=mode;mode='export';hero.pose(0);
  const model=cloneRig(hero.root);const contours=[];model.traverse(o=>{if(o.userData.outline)contours.push(o);});contours.forEach(o=>o.removeFromParent());
  const exporter=new GLTFExporter();
  try {return await exporter.parseAsync(model,{binary:true,animations:[hero.clip],onlyVisible:true});}
  finally{mode=savedMode;}
}
document.querySelector('#download').onclick=async()=>{
  const button=document.querySelector('#download');button.disabled=true;button.textContent='EXPORTING…';
  try{const result=await exportModel();const url=URL.createObjectURL(new Blob([result],{type:'model/gltf-binary'}));const link=document.createElement('a');link.href=url;link.download='steven-joe-valdez-character-v2.glb';link.click();setTimeout(()=>URL.revokeObjectURL(url),30000);button.textContent='EXPORT GLB ↗';}
  catch(e){status.hidden=false;status.textContent='Model export failed. Please try again.';console.error(e);button.textContent='RETRY EXPORT ↗';}
  finally{button.disabled=false;}
};
function resize(){if(!renderer)return;renderer.setSize(stage.clientWidth,stage.clientHeight,false);camera.aspect=stage.clientWidth/stage.clientHeight;camera.updateProjectionMatrix();}
addEventListener('resize',resize);resize();updateScroll();
let frames=0,last=performance.now(),fps=0,lastChapter=-1;
function render(time){
  requestAnimationFrame(render);if(!renderer)return;
  if(mode==='export')return;
  let pose=0,chapter=0;
  if(mode==='story'){
    chapter=progress<.18?0:progress<.34?1:progress<.86?2:3;
    // Acceleration spans 16% of the scroll; the final 15% of pose motion spans 52%.
    pose=progress<.18?0:progress<.34?(progress-.18)/.16*.85:progress<.86?.85+(progress-.34)/.52*.15:1;
  }else if(mode==='leap'){pose=1;chapter=2;}
  const effective=reduced.matches&&mode==='story'?0:pose;
  hero.pose(effective);
  if(mode==='portrait'){
    display.position.set(.85,0,0);camera.position.set(1.55,4.62,2.35);camera.lookAt(.8,4.47,0);
  }else{
    display.position.set(1.05-effective*1.25,0,0);
    camera.position.set(1.8+effective*.5,3.45+effective*.5,9.4+effective*.3);
    camera.lookAt(1.0+effective*.65,2.6,0);
  }
  if(chapter!==lastChapter||mode!=='story'){
    document.querySelector('#chapter-title').innerHTML=mode==='portrait'?'THE FACE<br>BEHIND IT.':titles[chapter];
    document.querySelector('#chapter-label').textContent=mode==='portrait'?'LIKENESS / EARLY STUDY':labels[chapter];
    document.querySelector('#chapter-copy').innerHTML=mode==='portrait'?'Swept hair. Uncovered face.<br>A stylized starting point, not a scan.':copy[chapter];lastChapter=chapter;
  }
  world.rotation.z=reduced.matches?0:-pose*.08;
  renderer.render(scene,camera);frames++;if(time-last>1000){fps=Math.round(frames*1000/(time-last));frames=0;last=time;}
}
if(renderer){status.hidden=true;requestAnimationFrame(render);}
window.__characterDebug={hero,scene,camera,renderer,exportModel,setMode,get progress(){return progress;},get mode(){return mode;},get fps(){return fps;}};


