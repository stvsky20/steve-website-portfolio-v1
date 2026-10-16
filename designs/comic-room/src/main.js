import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './style.css';
import { createStory } from './story.js';
import { createRooftopJourney } from './rooftop.js';
import { createCouchPortal } from './couch-portal.js';
import { createBoardView } from './board-view.js';
import { createDesktop } from './desktop.js';
import { createComicMotion } from './comic-motion.js';
import { createComicWorld } from './comic-world.js';
import { refineWorkspace } from './art-pass.js';

const canvas = document.querySelector('#room');
const stage = document.querySelector('#stage');
const loading = document.querySelector('#loading');
const panel = document.querySelector('#panel');
const body = document.querySelector('#panel-body');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' }); }
catch (error) { loading.textContent = '3D needs WebGL. Open Room Map to explore Projects and About.'; }
if(renderer)renderer.localClippingEnabled=true;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 120);
const overview = new THREE.Vector3(10.7, 8.6, 13);
camera.position.copy(overview);
const focus = new THREE.Vector3(0, 1.15, -.25);
const controls = renderer ? new OrbitControls(camera, canvas) : null;
if (controls) {
  controls.target.copy(focus); controls.enableDamping = true; controls.dampingFactor = .07;
  controls.enablePan = false; controls.minDistance = 10; controls.maxDistance = 24;
  controls.minPolarAngle = .35; controls.maxPolarAngle = Math.PI / 2.35;
  controls.minAzimuthAngle = .12; controls.maxAzimuthAngle = 1.24;
}
const room = new THREE.Group(); scene.add(room);
const ink = '#101020', cyan = '#20d5f5', pink = '#f32b85', amber = '#ffb531';
const shaders = [];
function comic(color, density = 1) {
  const mat = new THREE.ShaderMaterial({
    uniforms: { base: {value:new THREE.Color(color)}, pattern: {value:density} },
    vertexShader: [
      'varying vec3 vWorld; varying vec3 vNormal;',
      'void main(){ vec4 world=modelMatrix*vec4(position,1.0); vWorld=world.xyz;',
      'vNormal=normalize(mat3(modelMatrix)*normal); gl_Position=projectionMatrix*viewMatrix*world; }'
    ].join('\n'),
    fragmentShader: [
      'uniform vec3 base; uniform float pattern; varying vec3 vWorld; varying vec3 vNormal;',
      'void main(){ vec3 n=normalize(vNormal);',
      'float light=dot(n,normalize(vec3(-0.5,1.0,0.8)));',
      'float band=light>0.65?1.0:(light>0.05?0.7:0.3);',
      'vec3 col=base*band;',
      'float warm=exp(-length(vWorld-vec3(-3.6,2.4,1.6))*0.62);',
      'float cool=exp(-length(vWorld-vec3(-4.0,2.5,0.1))*0.65);',
      'col+=vec3(0.4,0.16,0.015)*warm+vec3(0.015,0.14,0.3)*cool;',
      'vec3 an=abs(n); vec2 p=an.y>0.6?vWorld.xz:(an.x>0.6?vWorld.zy:vWorld.xy);',
      'vec2 grid=fract(p*7.0)-0.5; float radius=mix(0.055,0.34,1.0-band);',
      'float aa=max(fwidth(length(grid)),0.018); float dots=1.0-smoothstep(radius-aa,radius+aa,length(grid));',
      'float hatch=1.0-smoothstep(0.08,0.19,abs(fract((p.x+p.y)*6.0)-0.5));',
      'col=mix(col,col*0.49,dots*pattern*0.83);',
      'col=mix(col,col*0.42,hatch*pattern*step(band,0.5)*0.68);',
      'gl_FragColor=vec4(col,1.0);',
      '#include <tonemapping_fragment>',
      '#include <colorspace_fragment>',
      '}'
    ].join('\n')
  }); shaders.push(mat); return mat;
}
const mats = {
  wall:comic('#334468',.35), floor:comic('#665568',.25), dark:comic('#26324b',.6),
  wood:comic('#b67b4d',.55), metal:comic('#344360',.4), blue:comic('#3456d9',.9),
  pink:comic(pink,.9), amber:comic(amber,.7), paper:comic('#f3e7cf',.15),
  fabric:comic('#476889',1), bed:comic('#7b80a4',.7)
};
const basic = color => new THREE.MeshBasicMaterial({color});
function model(geometry, material, position, parent=room, outline=true) {
  const mesh = new THREE.Mesh(geometry, material); mesh.position.set(...position); parent.add(mesh);
  if(outline) {
    const shell = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color:ink,side:THREE.BackSide}));
    shell.scale.setScalar(1.035); mesh.add(shell);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry,35),new THREE.LineBasicMaterial({color:ink}));
    mesh.add(edges);
  }
  return mesh;
}
function box(w,h,d,x,y,z,mat=mats.dark,parent=room) { return model(new THREE.BoxGeometry(w,h,d),mat,[x,y,z],parent); }
function cylinder(rt,rb,h,x,y,z,mat=mats.dark,parent=room,segments=12) {
  return model(new THREE.CylinderGeometry(rt,rb,h,segments),mat,[x,y,z],parent);
}
function line(points,color=ink,parent=room) {
  const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p))),new THREE.LineBasicMaterial({color})); parent.add(l); return l;
}
function texture(draw,w=1024,h=512) {
  const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; return t;
}
function plane(w,h,x,y,z,map,parent=room) {
  return model(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map,side:THREE.DoubleSide}),[x,y,z],parent,false);
}
function dots(ctx,w,h,color='#101020',size=2,step=12) {
  ctx.fillStyle=color;for(let y=0;y<h;y+=step)for(let x=0;x<w;x+=step){ctx.beginPath();ctx.arc(x,y,size,0,Math.PI*2);ctx.fill();}
}
// Cutaway architecture.
box(10,.3,8,0,-.15,0,mats.dark);
box(10,4.2,.15,0,2.05,-4,mats.wall);
box(.15,4.2,8,-5,2.05,0,mats.wall);
box(10,.08,.12,0,4.2,-3.91,basic(pink));
box(.1,.08,8,-4.9,4.2,0,basic(cyan));
for(let i=0;i<20;i++) box(.48,.025,7.9,-4.75+i*.5,.015,0,i%3===0?mats.wood:mats.floor);
for(let i=0;i<18;i++) line([[-4.9+i*.55,.037,-3.8],[-4.9+i*.55,.037,3.8]],'#28283c');
for(let i=0;i<9;i++) line([[-4.8,.04,-3.6+i*.85],[4.9,.04,-3.6+i*.85]],'#4f354a');
// Designed graphic light shapes and cast shadows on floor.
const shadowShape=new THREE.Shape(); shadowShape.moveTo(-4,-3.4);shadowShape.lineTo(-.3,-2.7);shadowShape.lineTo(1,1.8);shadowShape.lineTo(-2.2,2.7);shadowShape.closePath();
const shadow = new THREE.Mesh(new THREE.ShapeGeometry(shadowShape), new THREE.MeshBasicMaterial({color:cyan,transparent:true,opacity:.12,side:THREE.DoubleSide}));
shadow.rotation.x=Math.PI/2;shadow.position.y=.045;room.add(shadow);
const rug=box(3.4,.025,2.6,2.2,.045,1.8,mats.pink);
for(let i=0;i<11;i++)line([[.7+i*.28,.065,.65],[.45+i*.28,.065,3.1]],ink);
// Desk.
const desk=new THREE.Group();room.add(desk);
box(3.9,.14,1.5,-2.55,1.5,-2.9,mats.wood,desk);
for(const x of [-4.2,-.9])for(const z of [-3.5,-2.3])box(.1,1.5,.1,x,.75,z,mats.dark,desk);
box(.75,1.25,1.2,-3.95,.65,-2.9,mats.metal,desk);
for(let i=0;i<3;i++){box(.7,.32,.025,-3.95,.3+i*.37,-2.28,mats.dark,desk);box(.22,.04,.04,-3.95,.3+i*.37,-2.25,basic(cyan),desk);}
box(.18,.54,.16,-2.15,1.81,-3.1,mats.metal,desk);box(.8,.07,.43,-2.15,1.61,-3.03,mats.dark,desk);
const monitor=box(2.16,1.26,.12,-2.15,2.35,-3.12,mats.dark,desk);
const screenTexture=texture((c,w,h)=>{
  c.fillStyle='#10182c';c.fillRect(0,0,w,h);c.fillStyle=cyan;c.fillRect(0,0,w,6);
  c.font='bold 24px monospace';c.fillText('WORLD_OS / WORK DIRECTORY',35,45);
  const names=['SYSTEMS','APPS','UI/UX','ML'];const icons=['{ }','</>','✦','◈'];
  names.forEach((name,i)=>{const x=35+i*245;c.strokeStyle=i%2?pink:cyan;c.lineWidth=5;c.strokeRect(x,110,215,270);c.fillStyle=i%2?pink:cyan;c.font='bold 65px monospace';c.fillText(icons[i],x+32,245);c.fillStyle='#f3e7cf';c.font='bold 27px monospace';c.fillText(name,x+20,335);});
  c.fillStyle='#7588a8';c.font='18px monospace';c.fillText('04 DIRECTORIES     /     CLICK TO ENTER',35,460);
});
const screen=plane(2.02,1.12,-2.15,2.35,-3.05,screenTexture,desk);
box(1.55,.065,.52,-2.35,1.61,-2.44,mats.dark,desk);
for(let row=0;row<4;row++)for(let col=0;col<15;col++)box(.075,.018,.055,-3+col*.093,1.65,-2.62+row*.095,col%4===0?basic(cyan):mats.metal,desk);
box(.15,.07,.23,-1.31,1.61,-2.4,mats.metal,desk);
box(.57,1.1,.8,-.85,2.09,-3.15,mats.dark,desk);
for(let i=0;i<3;i++){
  const ring=model(new THREE.TorusGeometry(.15,.025,6,20),basic(i===1?pink:cyan),[-.85,1.76+i*.32,-2.735],desk,false);
  cylinder(.05,.05,.3,-.85,1.98,-2.7,mats.metal,desk);
}
box(.18,.025,.7,-.55,2.68,-3.15,basic(cyan),desk);
// Desk lamp, mug, notebook.
cylinder(.21,.24,.07,-4,1.63,-2.6,mats.dark,desk);
line([[-4,1.7,-2.6],[-4.07,2.35,-2.8],[-3.72,2.7,-2.7]],amber,desk);
const lamp=cylinder(.22,.1,.26,-3.72,2.59,-2.7,mats.dark,desk);lamp.rotation.z=-.3;
cylinder(.17,.17,.018,-3.72,2.45,-2.7,basic(amber),desk);
cylinder(.12,.11,.25,-3.35,1.73,-2.4,mats.paper,desk);
box(.45,.05,.32,-3.55,1.61,-3.2,mats.pink,desk);
// Corkboard.
const board=box(3.55,1.23,.08,-2.65,3.39,-3.87,mats.wood);
const boardTexture=texture((c,w,h)=>{
  c.fillStyle='#bc8748';c.fillRect(0,0,w,h);dots(c,w,h,'#5e3b2a',1,9);
  const cards=[[25,25,230,200,'BUILD / BREAK'],[280,40,245,170,'WHO AM I?'],[565,25,190,235,'NOTES'],[790,35,200,175,'NEXT?'],[35,270,260,200,'SYSTEM MAP'],[340,255,210,230,'HELLO, WORLD'],[600,295,350,160,'ALWAYS LEARNING']];
  cards.forEach(([x,y,cw,ch,label],i)=>{
    c.fillStyle= i===1?'#f32b85':i===5?'#20d5f5':'#f3e7cf';c.fillRect(x,y,cw,ch);
    c.strokeStyle=ink;c.lineWidth=4;c.strokeRect(x,y,cw,ch);c.fillStyle=ink;c.font='bold 17px monospace';c.fillText(label,x+15,y+38);
    c.fillStyle='#d33055';c.beginPath();c.arc(x+cw/2,y+9,7,0,7);c.fill();
    c.strokeStyle='#26324b';c.lineWidth=2;
    if(i%2===0){for(let k=0;k<3;k++){c.strokeRect(x+20+k*52,y+75,35,32);if(k<2){c.beginPath();c.moveTo(x+55+k*52,y+91);c.lineTo(x+72+k*52,y+91);c.stroke();}}}
    else{for(let k=0;k<4;k++){c.beginPath();c.moveTo(x+15,y+65+k*20);c.lineTo(x+cw-25-k*11,y+65+k*20);c.stroke();}}
  });
});
const boardFront=plane(3.42,1.12,-2.65,3.39,-3.816,boardTexture); boardFront.userData.destination='about';
// Square four-pane city window centered in the vacant back-wall section.
const windowSize={width:2.5,height:2.5,x:0,y:2.78};
const windowAssembly=new THREE.Group();windowAssembly.name="Back_wall_city_window";windowAssembly.position.set(-1.6,0,-3.78);room.add(windowAssembly);
const windowFrame=box(windowSize.width+.2,windowSize.height+.2,.1,windowSize.x,windowSize.y,-.07,mats.dark,windowAssembly);windowFrame.userData.destination='rooftop';
const city=texture((c,w,h)=>{
  c.fillStyle='#3456d9';c.fillRect(0,0,w,h);dots(c,w,h,'#91b5eb',1.5,14);
  c.fillStyle='#f32b85';c.fillRect(0,h*.65,w,h*.35);
  for(let i=0;i<13;i++){const bh=120+(i*97%290),x=i*83;c.fillStyle=i%2?'#10182c':'#26324b';c.fillRect(x,h-bh,68,bh);for(let row=0;row<bh/24;row++)for(let col=0;col<3;col++){c.fillStyle=(row+col+i)%4===0?amber:cyan;c.fillRect(x+10+col*17,h-bh+15+row*24,5,8);}}
});
const windowSurface=plane(windowSize.width,windowSize.height,windowSize.x,windowSize.y,0,city,windowAssembly);windowSurface.userData.destination='rooftop';
const windowBars=[];
const windowMullion=box(.045,windowSize.height+.02,.06,windowSize.x,windowSize.y,.06,mats.dark,windowAssembly);windowMullion.userData.destination='rooftop';
windowBars.push({mesh:windowMullion,origin:windowMullion.position.clone(),axis:'x',travel:windowSize.width/2+.12});
const windowCrossbar=box(windowSize.width+.02,.045,.06,windowSize.x,windowSize.y,.06,mats.dark,windowAssembly);windowCrossbar.userData.destination='rooftop';
windowBars.push({mesh:windowCrossbar,origin:windowCrossbar.position.clone(),axis:'y',travel:windowSize.height/2+.12});
box(windowSize.width+.4,.1,.3,windowSize.x,windowSize.y-windowSize.height/2-.1,.07,mats.wood,windowAssembly);
// Bed, distinct graphic folds.
const bed=new THREE.Group();room.add(bed);
box(2.7,.35,3.6,2.6,.39,-1.97,mats.dark,bed);
box(2.72,1.2,.13,2.6,.88,-3.65,mats.wood,bed);
box(2.58,.32,3.38,2.6,.73,-1.95,mats.bed,bed);
box(2.65,.16,2.52,2.6,.97,-1.45,mats.blue,bed);
box(.55,.05,2.57,3.3,1.07,-1.44,mats.pink,bed);
box(2.67,.48,.13,2.6,.79,-.19,mats.blue,bed);
for(const x of [1.92,3.24]){const pillow=box(1.08,.22,.63,x,1.05,-3.05,mats.paper,bed);pillow.rotation.z=x<2.5?.08:-.1;pillow.rotation.y=.09;}
for(let i=0;i<7;i++)line([[1.35+i*.34,1.065,-2.4],[1.55+i*.31,1.066,-1.8],[1.39+i*.34,1.066,-.45]],i%2?ink:'#718bc9',bed);
box(.62,.72,.65,4.27,.4,-3.25,mats.wood);box(.32,.03,.3,4.27,.8,-3.25,mats.dark);cylinder(.035,.035,.45,4.27,1.03,-3.25,mats.dark);box(.36,.4,.36,4.27,1.39,-3.25,mats.amber);
// Original graphic posters.
function poster(w,h,x,y,z,label,color,rotation=0) {
  const tex=texture((c,cw,ch)=>{c.fillStyle=color;c.fillRect(0,0,cw,ch);dots(c,cw,ch,'#101020',2,15);c.fillStyle=ink;c.beginPath();c.moveTo(0,ch);c.lineTo(cw*.7,0);c.lineTo(cw,ch*.65);c.closePath();c.fill();c.strokeStyle='#f3e7cf';c.lineWidth=8;for(let i=0;i<7;i++){c.beginPath();c.moveTo(cw*.5,ch*.5);c.lineTo(i*cw/6,ch);c.stroke();}c.fillStyle='#f3e7cf';c.font='bold 65px monospace';c.fillText(label,40,100);},512,640);
  const panel=new THREE.Group();panel.position.set(x,y,z);panel.rotation.y=rotation;room.add(panel);
  box(w+.08,h+.08,.04,0,0,0,mats.dark,panel);plane(w,h,0,0,.026,tex,panel);
}
poster(1.23,1.65,2.3,2.9,-3.86,'CREATE',pink);
poster(.95,1.25,3.65,2.95,-3.86,'ITERATE',amber);
// Couch.
const couch=new THREE.Group();couch.name='Couch_portal';room.add(couch);couch.position.set(2.65,0,2.12);
box(2.7,.46,1.03,0,.43,0,mats.dark,couch);
box(2.7,.83,.22,0,1,-.43,mats.fabric,couch);
for(const x of [-1.35,1.35])box(.22,.72,1.1,x,.76,0,mats.dark,couch);
for(const x of [-.68,.68]){box(1.23,.18,.85,x,.74,.05,mats.fabric,couch);const p=box(.6,.48,.17,x,1.02,-.2,x<0?mats.pink:mats.amber,couch);p.rotation.z=x<0?.15:-.15;}
for(const x of [-1.1,1.1])for(const z of [-.35,.35])box(.09,.2,.09,x,.12,z,mats.dark,couch);
box(1.85,.09,.85,1.65,.48,3.22,mats.wood);
for(const x of [.88,2.42])for(const z of [2.92,3.5])box(.08,.46,.08,x,.25,z,mats.dark);
box(.45,.055,.32,1.4,.57,3.15,mats.paper);box(.45,.05,.32,1.46,.62,3.15,mats.pink);
cylinder(.1,.09,.19,2.08,.62,3.2,mats.dark);
// Desk chair.
const chair=new THREE.Group();chair.position.set(-2.25,0,-.95);chair.rotation.y=-.2;room.add(chair);
cylinder(.065,.065,.74,0,.52,0,mats.metal,chair);
box(.95,.17,.91,0,.97,0,mats.dark,chair);
box(.95,.88,.13,0,1.53,-.38,mats.metal,chair);
box(.78,.67,.025,0,1.55,-.30,mats.fabric,chair);
for(const x of [-.59,.59]){box(.09,.45,.09,x,1.06,0,mats.dark,chair);box(.15,.08,.65,x,1.32,0,mats.dark,chair);}
for(let i=0;i<5;i++){const a=i*Math.PI*2/5;line([[0,.18,0],[Math.cos(a)*.52,.14,Math.sin(a)*.52]],ink,chair);cylinder(.08,.08,.1,Math.cos(a)*.52,.1,Math.sin(a)*.52,mats.dark,chair);}
for(let i=0;i<6;i++)line([[-.36,1.25+i*.09,-.278],[.36,1.25+i*.09,-.278]],ink,chair);
// Guitar: extruded shaped body, neck, sound hole and drawn strings.
const guitar=new THREE.Group();guitar.position.set(4.5,.22,-.25);guitar.rotation.z=-.13;guitar.rotation.y=-.22;room.add(guitar);
const gs=new THREE.Shape();gs.moveTo(0,.05);gs.bezierCurveTo(-.55,-.04,-.67,.45,-.38,.67);gs.bezierCurveTo(-.12,.85,-.42,.95,-.25,1.14);gs.bezierCurveTo(-.1,1.28,.1,1.28,.25,1.14);gs.bezierCurveTo(.42,.95,.12,.85,.38,.67);gs.bezierCurveTo(.67,.45,.55,-.04,0,.05);
model(new THREE.ExtrudeGeometry(gs,{depth:.14,bevelEnabled:false,curveSegments:12}),mats.amber,[0,0,0],guitar);
box(.14,.97,.1,0,1.56,.09,mats.wood,guitar);box(.2,.3,.12,0,2.15,.08,mats.dark,guitar);
const hole=model(new THREE.CircleGeometry(.14,20),basic(ink),[0,.77,.155],guitar,false);
box(.32,.08,.03,0,.38,.165,mats.dark,guitar);
for(let i=0;i<6;i++)line([[-.047+i*.018,.38,.19],[-.047+i*.018,2.2,.19]],'#f3e7cf',guitar);
for(let i=0;i<8;i++)line([[-.07,1.1+i*.105,.155],[.07,1.1+i*.105,.155]],ink,guitar);
// Wall graphic on the left wall.
const leftTex=texture((c,w,h)=>{c.fillStyle=ink;c.fillRect(0,0,w,h);c.fillStyle=cyan;c.font='bold 105px monospace';c.fillText('MAKE.',35,155);c.fillStyle=pink;c.fillText('BREAK.',35,295);c.fillStyle=amber;c.fillText('REPEAT.',35,435);});
const leftPoster=plane(2.2,1.2,-4.91,2.9,.1,leftTex);leftPoster.rotation.y=Math.PI/2;leftPoster.position.z=-2.65;
// Outline print echoes on major edges.
line([[-4.86,.1,3.9],[-4.86,4.22,3.9]],cyan);
line([[-4.97,4.24,-4],[5.05,4.24,-4]],pink);
line([[5.03,.04,-4],[5.03,.04,4],[-5,.04,4]],pink);

refineWorkspace({room,desk,chair,board,boardFront,screen,monitor,mats,comic,texture,model,box,plane,cylinder});
screen.userData.destination='pc';monitor.userData.destination='pc';board.userData.destination='about';
couch.children.forEach(x=>{if(x.isMesh)x.userData.destination='contact';});
const comicWorld=createComicWorld(scene,camera,{reduced});
const comicMotion=createComicMotion(stage,camera,{reduced});
const motionTargets={pc:screen,about:boardFront,contact:couch,rooftop:windowSurface};
const finePointer=matchMedia('(hover: hover) and (pointer: fine)');
const raycaster=new THREE.Raycaster(), pointer=new THREE.Vector2();
let hovered=null, down=null, transition=null, pending=null, lastTrigger=null, desktop=null;
const boardView=createBoardView({stage,onExit:returnRoom,hasWebGL:!!renderer});
const rooftop=createRooftopJourney({stage,camera,windowSurface,windowBars,reduced,onExit:returnRoom,hasWebGL:!!renderer});
const couchPortal=createCouchPortal({stage,couch,camera,reduced,coverMaterial:mats.fabric,onExit:returnRoom,hasWebGL:!!renderer});
let couchPointer=false,couchFocused=false;
function updateCouchHint(immediate=false){
  const available=!panel.open&&!transition&&!desktop?.active&&!boardView.active&&!couchPortal.active&&!rooftop.active&&!stage.classList.contains('studying');
  couchPortal.preview(available&&(couchPointer||couchFocused),{immediate});
}
function hit(event) {
  const rect=canvas.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);
  raycaster.setFromCamera(pointer,camera);
  const hits=raycaster.intersectObjects(room.children,true).filter(h=>h.object.isMesh);
  let object=hits[0]?.object;
  while(object){if(object.userData.destination)return object.userData.destination;object=object.parent;}
  return null;
}
const names={pc:'OPEN THE WORK DIRECTORY ↗',about:'MEET THE PERSON BEHIND IT ↗',contact:'PULL UP A SEAT ↗',rooftop:'TAKE A LEAP OF FAITH ↗'};
canvas.addEventListener('pointermove',e=>{
  if(panel.open||transition||(desktop?.active||boardView.active||couchPortal.active||rooftop.active))return;
  hovered=hit(e);couchPointer=finePointer.matches&&hovered==='contact';updateCouchHint();comicMotion.hover(finePointer.matches?motionTargets[hovered]:null);canvas.style.cursor=hovered?'pointer':'grab';
  const tip=document.querySelector('#tooltip');tip.style.display=hovered?'block':'none';
  if(hovered){tip.textContent=names[hovered];tip.style.left=e.clientX+16+'px';tip.style.top=e.clientY-stage.getBoundingClientRect().top-35+'px';}
});
canvas.addEventListener('pointerleave',()=>{couchPointer=false;updateCouchHint();comicMotion.hover(null);document.querySelector('#tooltip').style.display='none';});
canvas.addEventListener('pointerdown',e=>{if((desktop?.active||boardView.active||couchPortal.active||rooftop.active)||transition)return;down={x:e.clientX,y:e.clientY};});
canvas.addEventListener('pointerup',e=>{if((desktop?.active||boardView.active||couchPortal.active||rooftop.active)||transition){down=null;return;}if(down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)<6){const destination=hit(e);if(destination)open(destination,canvas);}down=null;});
function moveTo(position,target,onComplete) {
  if(!renderer){onComplete?.();return;}
  if(controls)controls.enabled=false;
  transition={start:performance.now(),duration:reduced.matches?0:850,from:camera.position.clone(),to:position.clone(),targetFrom:controls.target.clone(),targetTo:target.clone(),done:onComplete};
}
let story;
function open(destination,trigger,{instant=false}={}) {
  stage.classList.remove('studying');document.querySelector('#desk-study').setAttribute('aria-pressed','false');
  story?.show(destination);
  rooftop.exit();couchPointer=false;couchFocused=false;desktop?.exit();boardView.exit();if(destination!=='contact'||couchPortal.active||rooftop.active)couchPortal.exit();panel.close();lastTrigger=trigger===canvas?document.querySelector('.object-label[data-open="'+destination+'"]'):trigger;document.querySelector('#tooltip').style.display='none';
  comicMotion.travel();pending=destination;comicWorld.setDestination(destination);document.querySelector('.room-map').open=false;
  if(destination==='rooftop'){transition=null;if(controls)controls.enabled=false;rooftop.enter();return;}
  if(destination==='contact'){transition=null;if(controls)controls.enabled=false;couchPortal.enter();if(instant)couchPortal.skip();return;}
  const positions={pc:new THREE.Vector3(1.4,3.7,4.6),about:new THREE.Vector3(.7,4.1,4),contact:new THREE.Vector3(7,5.5,8)};
  const targets={pc:screen.getWorldPosition(new THREE.Vector3()),about:boardFront.getWorldPosition(new THREE.Vector3()),contact:new THREE.Vector3(2.6,.9,2.1)};
  if(destination==='pc'||destination==='about'){
    const surface=destination==='pc'?screen:boardFront;
    const w=destination==='pc'?2.02:3.55,h=destination==='pc'?1.12:1.23;
    const normal=new THREE.Vector3(0,0,1).applyQuaternion(surface.getWorldQuaternion(new THREE.Quaternion()));
    const distance=Math.max(h/.72,w/(camera.aspect*.84))/(2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2)));
    positions[destination]=targets[destination].clone().addScaledVector(normal,distance);
    if(destination==='about')positions.about.y+=distance*.45;
  }
  moveTo(positions[destination],targets[destination],()=>{if(pending!==destination)return;if(destination==='pc'){desktop.enter();return;}if(destination==='about'){boardView.enter();return;}});
}
document.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>open(b.dataset.open,b,{instant:b.dataset.open==='contact'&&!!b.closest('.room-map')})));
function returnRoom({immediate=false,completed=false}={}) {
  if(!immediate&&!completed&&couchPortal.reverse())return;
  story?.show('room');
  rooftop.exit();
  desktop?.exit();boardView.exit();couchPortal.exit();comicMotion.clear();pending=null;comicWorld.setDestination(null);stage.classList.remove('studying');document.querySelector('#desk-study').setAttribute('aria-pressed','false');panel.close();moveTo(overview,focus,()=>{if(controls)controls.enabled=true;requestAnimationFrame(()=>{const restore=lastTrigger?.closest?.('.room-map')||!lastTrigger||getComputedStyle(lastTrigger).visibility==='hidden'||lastTrigger.closest('.story-layer')?document.querySelector('.room-map summary'):lastTrigger;restore?.focus?.();});});
}
document.querySelector('#close-panel').addEventListener('click',returnRoom);
panel.addEventListener('cancel',e=>{e.preventDefault();returnRoom();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.open&&(transition||(desktop?.active||boardView.active||couchPortal.active||rooftop.active)||stage.classList.contains('studying')))returnRoom({immediate:true});});
document.querySelector('#reset').addEventListener('click',()=>{story?.show('room');rooftop.exit();desktop?.exit();boardView.exit();couchPortal.exit();comicMotion.clear();pending=null;comicWorld.setDestination(null);stage.classList.remove('studying');document.querySelector('#desk-study').setAttribute('aria-pressed','false');moveTo(overview,focus,()=>{if(controls)controls.enabled=true;});});
document.querySelector('#desk-study').addEventListener('click',()=>{story?.show('room');rooftop.exit();desktop?.exit();boardView.exit();couchPortal.exit();comicMotion.travel();comicWorld.setDestination(null);pending=null;stage.classList.add('studying');document.querySelector('#desk-study').setAttribute('aria-pressed','true');moveTo(new THREE.Vector3(1.8,4.3,4.4),new THREE.Vector3(-3.55,2.25,.4));});
document.querySelectorAll('.object-label').forEach(label=>{
  label.addEventListener('pointerenter',()=>{if(finePointer.matches){comicMotion.hover(motionTargets[label.dataset.open]);if(label.dataset.open==='contact'){couchPointer=true;updateCouchHint();}}});
  label.addEventListener('pointerleave',()=>{comicMotion.hover(null);if(label.dataset.open==='contact'){couchPointer=false;updateCouchHint();}});
});
document.querySelectorAll('[data-open="contact"]').forEach(trigger=>{
  trigger.addEventListener('focus',()=>{couchFocused=true;updateCouchHint(true);});
  trigger.addEventListener('blur',()=>{couchFocused=false;updateCouchHint(true);});
});
finePointer.addEventListener('change',()=>{couchPointer=false;updateCouchHint();});
document.querySelector('.scene-settings').addEventListener('click',event=>{if(event.composedPath().some(node=>node?.tagName==='BUTTON')){const settings=event.currentTarget;settings.open=false;settings.querySelector('summary').focus({preventScroll:true});}});
let labelsEnabled=true;
const labelsButton=document.querySelector('#labels-toggle');
labelsButton.addEventListener('click',()=>{
  labelsEnabled=!labelsEnabled;
  labelsButton.setAttribute('aria-pressed',String(labelsEnabled));
  labelsButton.title=labelsEnabled?'Hide component labels':'Show component labels';
  labelsButton.innerHTML='▣ <span>'+(labelsEnabled?'HIDE LABELS':'SHOW LABELS')+'</span>';
  if(!labelsEnabled)document.querySelectorAll('.object-label').forEach(label=>label.style.visibility='hidden');
});
let motionEnabled=true;
const motionButton=document.querySelector('#motion-toggle');
motionButton.addEventListener('click',()=>{
  motionEnabled=!motionEnabled;comicWorld.setEnabled(motionEnabled);comicMotion.setEnabled(motionEnabled);couchPortal.setMotionEnabled(motionEnabled);rooftop.setMotionEnabled(motionEnabled);
  stage.classList.toggle('motion-paused',!motionEnabled);
  motionButton.setAttribute('aria-pressed',String(!motionEnabled));
  motionButton.innerHTML=motionEnabled?'Ⅱ <span>PAUSE AMBIENT</span>':'▶ <span>RESUME AMBIENT</span>';
});
reduced.addEventListener('change',()=>comicMotion.clear());
let printEnabled=true;
document.querySelector('#ink-toggle').addEventListener('click',e=>{printEnabled=!printEnabled;shaders.forEach(m=>{m.uniforms.pattern.value=printEnabled?(m.userData.density??1):0;});e.currentTarget.setAttribute('aria-pressed',String(printEnabled));});
shaders.forEach(m=>m.userData.density=m.uniforms.pattern.value);

const projects = {
  Systems:[{name:'Event-driven pipeline',mark:'{ FLOW }',stack:'QUEUES / OBSERVABILITY / RESILIENCE',description:'A sample case study about moving events reliably between services.',decision:'Compare delivery guarantees, backpressure, failure recovery, and operational visibility.'},{name:'Distributed cache',mark:'[ CACHE ]',stack:'CONSISTENCY / PERFORMANCE / STORAGE',description:'A sample exploration of fast access and predictable invalidation.',decision:'Explain consistency choices, eviction policy, measurements, and trade-offs.'}],
  Apps:[{name:'Ayos!',mark:'USER → LGU',stack:'CIVIC TECH / REPORTING SYSTEM',description:'A reporting system that connects users and local government units (LGUs).',decision:'Project details and technical decisions will be added to this case study.',featured:true,achievement:'Regional finalist — Philippine Startup Challenge'},{name:'Focus workspace',mark:'FOCUS_',stack:'WEB APP / STATE / PRODUCT',description:'A sample app bringing tasks, notes, and daily planning into one place.',decision:'Show the user journey, architecture, state model, and implementation decisions.'},{name:'Developer dashboard',mark:'DEV / OS',stack:'API / INTEGRATION / INTERFACE',description:'A sample dashboard for understanding activity across development tools.',decision:'Discuss data aggregation, loading states, and error recovery.'}],
  'UI/UX':[{name:'Designing for clarity',mark:'Aa / 01',stack:'RESEARCH / PROTOTYPE / DESIGN SYSTEM',description:'A sample redesign study focused on reducing friction in a complex workflow.',decision:'Present research questions, wireframes, interaction choices, and validation.'},{name:'Component language',mark:'[ UI ]',stack:'TOKENS / COMPONENTS / ACCESSIBILITY',description:'A sample interface system with clear visual and interaction foundations.',decision:'Explain token roles, component states, keyboard use, and design consistency.'}],
  ML:[{name:'Pattern recognition',mark:'∑ / MODEL',stack:'DATA / TRAINING / EVALUATION',description:'A sample machine learning experiment with an explicit evaluation process.',decision:'Describe dataset boundaries, baseline, evaluation metrics, and failure cases.'},{name:'Semantic explorer',mark:'VECTOR_',stack:'EMBEDDINGS / RETRIEVAL / EXPERIMENTS',description:'A sample search experiment using semantic representations.',decision:'Compare retrieval approaches, relevance evaluation, and practical limitations.'}]
};
desktop=createDesktop({stage,screen,camera,projects,onExit:returnRoom,hasWebGL:!!renderer});
story=createStory({stage,onNavigate:open,onRoom:()=>returnRoom({immediate:true}),onBrowse:()=>desktop.browse()});
function resize() {
  desktop?.resize();if(!renderer)return;const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));camera.aspect=w/h;camera.updateProjectionMatrix();
  if((desktop?.active||boardView.active)){
    const surface=boardView.active?boardFront:screen;
    const w=boardView.active?3.55:2.02,h=boardView.active?1.23:1.12;
    const target=surface.getWorldPosition(new THREE.Vector3());
    const normal=new THREE.Vector3(0,0,1).applyQuaternion(surface.getWorldQuaternion(new THREE.Quaternion()));
    const distance=Math.max(h/.72,w/(camera.aspect*.84))/(2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2)));
    camera.position.copy(target).addScaledVector(normal,distance);if(boardView.active)camera.position.y+=distance*.45;camera.lookAt(target);desktop.update();
  }
}
window.addEventListener('resize',resize);resize();
function projectLabel(id,position) {
  const b=document.querySelector(id);if(!labelsEnabled||panel.open||transition||(desktop?.active||boardView.active||couchPortal.active||rooftop.active)||stage.classList.contains('studying')){b.style.visibility='hidden';return;}
  const p=position.clone().project(camera);b.style.left=(p.x*.5+.5)*stage.clientWidth+'px';b.style.top=(-p.y*.5+.5)*stage.clientHeight+'px';b.style.visibility=p.z<1?'visible':'hidden';
}
function cinematicEase(t) {
  let lo=0,hi=1,u=t;
  for(let i=0;i<12;i++){u=(lo+hi)/2;const x=3*(1-u)*(1-u)*u*.23+3*(1-u)*u*u*.32+u*u*u;if(x<t)lo=u;else hi=u;}
  return t===0?0:t===1?1:3*(1-u)*(1-u)*u+3*(1-u)*u*u+u*u*u;
}
let frames=0,stamp=performance.now(), fps=0;
function frame(time) {
  requestAnimationFrame(frame);if(!renderer)return;
  if(transition){const t=transition.duration===0?1:Math.min((time-transition.start)/transition.duration,1);const eased=cinematicEase(t);camera.position.lerpVectors(transition.from,transition.to,eased);controls.target.lerpVectors(transition.targetFrom,transition.targetTo,eased);camera.lookAt(controls.target);if(t===1){const done=transition.done;transition=null;done?.();}}
  else if(controls.enabled)controls.update();
  comicWorld.update(time,screen);comicMotion.update();
  rooftop.update(time);rooftop.renderWindow(renderer);couchPortal.update(time);stage.classList.toggle('portal-inside',couchPortal.active&&couchPortal.inside);couchPortal.updateEffects();couchPortal.renderEntrance(renderer);renderer.render(rooftop.renderScene||couchPortal.renderScene||scene,camera);couchPortal.renderEffects(renderer);desktop?.update();
  story?.update({contactPhase:couchPortal.phase});
  projectLabel('#window-label',windowSurface.localToWorld(new THREE.Vector3(0,windowSize.height/2+.32,0)));
  projectLabel('#pc-label',screen.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(.2,.82,0)));
  projectLabel('#about-label',boardFront.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,.87,-.65)));
  projectLabel('#contact-label',couch.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,1.65,.2)));
  frames++;if(time-stamp>1500){fps=Math.round(frames*1000/(time-stamp));frames=0;stamp=time;document.querySelector('#performance').textContent='REALTIME 3D / '+fps+' FPS';}
}
if(renderer){loading.hidden=true;requestAnimationFrame(frame);}
window.__roomDebug={scene,camera,renderer,comicWorld,comicMotion,desktop,boardView,couchPortal,rooftop,projects,open,returnRoom,get fps(){return fps;},get meshCount(){let n=0;scene.traverse(o=>{if(o.isMesh)n++;});return n;}};






