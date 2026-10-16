import * as THREE from 'three';
import {createArchitectureDetails} from './city-architecture.js';
import {createCityHorizon} from './city-horizon.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

const ink='#101020',cyan='#20d5f5',pink='#f32b85',amber='#ffb531';
function ease(t){t=THREE.MathUtils.clamp(t,0,1);let lo=0,hi=1,u=t;for(let i=0;i<14;i++){u=(lo+hi)/2;const x=3*(1-u)**2*u*.23+3*(1-u)*u*u*.32+u**3;x<t?lo=u:hi=u;}return t===0?0:t===1?1:3*(1-u)**2*u+3*(1-u)*u*u+u**3;}
function smooth(t){return t*t*(3-2*t);}
function cityMaterial(color,style=-1,seed=0){
  const spacing=[[2.8,4.8],[3.6,5.8],[2.1,3.5],[2.5,3.2],[3.4,4.2],[2.6,3.7]][Math.max(0,style)];
  return new THREE.ShaderMaterial({
    uniforms:{base:{value:new THREE.Color(color)},style:{value:style},spacing:{value:new THREE.Vector2(...spacing)},seed:{value:seed}},
    vertexShader:'varying vec3 vWorld;varying vec3 vN;varying float vDepth;void main(){vec4 w=modelMatrix*vec4(position,1.);vWorld=w.xyz;vN=normalize(mat3(modelMatrix)*normal);vec4 view=viewMatrix*w;vDepth=length(view.xyz);gl_Position=projectionMatrix*view;}',
    fragmentShader:`uniform vec3 base;uniform float style;uniform vec2 spacing;uniform float seed;varying vec3 vWorld;varying vec3 vN;varying float vDepth;
    void main(){
      vec3 n=normalize(vN);vec2 p=abs(n.x)>.6?vWorld.zy:vWorld.xy;
      vec2 q=p/spacing+vec2(seed*.17,0.);vec2 cell=fract(q),id=floor(q),aa=max(fwidth(q),vec2(.002));
      float noise=fract(sin(dot(id+seed,vec2(12.9898,78.233)))*43758.5453);
      float width=style<.5?.25:style<1.5?.36:style<2.5?.16:style<3.5?.43:style<4.5?.28:.24;
      float height=style<1.5?.3:style<2.5?.37:style<3.5?.42:.28;
      vec2 distance=abs(cell-.5);
      float window=(1.-smoothstep(width-aa.x,width+aa.x,distance.x))*(1.-smoothstep(height-aa.y,height+aa.y,distance.y));
      if(style>=0.&&style<.5){float arch=length(vec2((cell.x-.5)/width,(cell.y-.63)/.22));window*=cell.y<.63?1.:1.-smoothstep(.97,1.03,arch);}
      window*=1.-step(.5,abs(n.y));if(style<0.)window=0.;
      float light=n.x>.3?.46:n.z>.3?.7:1.;vec3 color=base*light;
      float recess=(1.-smoothstep(width+.01,width+.065,distance.x))*(1.-smoothstep(height+.01,height+.065,distance.y));
      if(style>=0.)color=mix(color,vec3(.025,.035,.07),recess*.72*(1.-step(.5,abs(n.y))));
      vec3 lit=mix(vec3(.035,.26,.38),vec3(.47,.29,.17),step(.75,noise));lit=mix(lit,vec3(.4,.12,.29),step(.93,noise));
      vec3 glass=mix(vec3(.025,.055,.12),lit,step(.46,noise));
      if(style>2.5&&style<3.5){glass=mix(vec3(.06,.16,.23),vec3(.17,.24,.31),step(.5,fract(id.x*.17+id.y*.045+seed)));}
      color=mix(color,glass,window);
      float mullion=1.-smoothstep(.007,.007+aa.x,abs(cell.x-.5));
      float crossbar=1.-smoothstep(.01,.01+aa.y,abs(cell.y-.48));
      if(style>0.5&&style<1.5)color=mix(color,base*.4,(mullion+crossbar)*window*.82);
      if(style>2.5&&style<3.5)color=mix(color,vec3(.15,.23,.3),(mullion*.4+crossbar*.2)*window);
      if((style>=0.&&style<1.5)||(style>3.5&&style<4.5)){
        vec2 brick=fract(vec2(p.x*.9+mod(floor(p.y*2.),2.)*.5,p.y*2.));vec2 baa=max(fwidth(vec2(p.x*.9,p.y*2.)),vec2(.008));
        float mortar=(1.-smoothstep(.015,.015+baa.y,min(brick.y,1.-brick.y)))+(1.-smoothstep(.012,.012+baa.x,min(brick.x,1.-brick.x)));
        color*=1.-min(1.,mortar)*.14*(1.-window);
      }
      if(style>1.5&&style<2.5){float rib=1.-smoothstep(.08,.13,abs(fract(q.x)-.06));color=mix(color,base*1.15,rib*.5);}
      float hatch=1.-smoothstep(.05,.13,abs(fract((p.x+p.y)*1.7)-.5));color*=1.-hatch*.075;
      float dots=1.-smoothstep(.1,.2,length(fract(p*1.8)-.5));color*=1.-dots*.12;
      color=mix(color,vec3(.12,.14,.25),smoothstep(70.,1000.,vDepth));gl_FragColor=vec4(color,1.);
      #include <colorspace_fragment>
    }`
  });
}
function createCity(){
  const scene=new THREE.Scene();scene.fog=new THREE.Fog(new THREE.Color().setRGB(.12,.14,.25),70,1000);scene.background=new THREE.Color('#11142e');
  const sky=new THREE.Mesh(new THREE.SphereGeometry(2400,32,16),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,vertexShader:'varying float height;void main(){height=(modelMatrix*vec4(position,1.)).y;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying float height;void main(){vec3 horizon=vec3(.12,.14,.25),zenith=vec3(.012,.017,.05);vec3 color=mix(horizon,zenith,smoothstep(70.,400.,height));gl_FragColor=vec4(color,1.);\n#include <colorspace_fragment>\n}'}));sky.position.y=100;scene.add(sky);
  const root=new THREE.Group();root.name='Leap_of_faith_city';scene.add(root);
  const horizon=createCityHorizon(scene);
  const material=colors=>new THREE.MeshBasicMaterial({color:colors});
  const stone=cityMaterial('#39435e'),dark=material(ink);
  function box(w,h,d,x,y,z,mat=stone,outline=true){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);mesh.position.set(x,y,z);root.add(mesh);if(outline)mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry),new THREE.LineBasicMaterial({color:ink})));return mesh;}
  // Hero tower and a real ledge: geometry, not a skybox image.
  box(18,96,18,0,48,0,cityMaterial('#39435e',2));box(20,.7,20,0,96,0,dark);box(19,.3,19,0,96.5,0,material('#54657c'));
  for(const x of [-9.3,9.3])box(.4,1.3,18.8,x,97.2,0);
  box(19,1.3,.4,0,97.2,9.3);for(const x of [-6.5,6.5])box(5.7,1.3,.4,x,97.2,-9.3);
  box(6,4,5,-4,98.65,5);box(1.1,2.6,.08,-4,98,2.44,dark);
  const antenna=box(.07,9,.07,-4,105,5,material(cyan),false);
  for(let i=0;i<5;i++)box(19.8,.16,19.8,0,94.4-i*.5,0,i%2?stone:dark);
  // Sculptural gargoyle at the leap ledge, built as a readable stone silhouette.
  const gargoyle=new THREE.Group();gargoyle.name='Rooftop_gargoyle';gargoyle.position.set(0,97,-9.25);root.add(gargoyle);
  const sculpture=(g,pos,scale)=>{const m=new THREE.Mesh(g,stone);m.position.set(...pos);m.scale.set(...scale);gargoyle.add(m);m.add(new THREE.LineSegments(new THREE.EdgesGeometry(g),new THREE.LineBasicMaterial({color:ink})));return m;};
  sculpture(new THREE.BoxGeometry(1,1,1),[0,-.1,0],[1.35,.3,1.3]);sculpture(new THREE.IcosahedronGeometry(1,0),[0,.65,-.45],[.48,.63,.85]);sculpture(new THREE.IcosahedronGeometry(1,0),[0,1.25,-.9],[.43,.35,.5]);
  for(const side of [-1,1]){const wing=sculpture(new THREE.ConeGeometry(.6,1.7,3),[side*.85,.85,-.3],[1,1,.2]);wing.rotation.z=side*-.8;sculpture(new THREE.ConeGeometry(.12,.35,3),[side*.22,1.6,-.75],[1,1,1]);}
  // Narrow dark street canyon leaves a breathing corridor, like the shot reference.
  box(320,.1,460,0,-.1,-140,material('#1a2038'),false);
  for(const x of [-14,14])box(.12,.02,380,x,.02,-120,material('#495985'),false);
  const palette=['#4d3947','#314052','#3e3a56','#24445b','#433c4a','#303953'];
  const modelNames=['building-skyscraper-a','building-skyscraper-b','building-skyscraper-c','building-g','building-skyscraper-d','building-skyscraper-e','building-a','building-b','building-d','building-h','building-k','building-n'];
  const random=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
  const placements=[];let imported=0,assetError=null,architecture=null;
  const loader=new GLTFLoader();
  const assetReady=Promise.all(modelNames.map(name=>loader.loadAsync('/models/city/'+name+'.glb'))).then(assets=>{
    for(let i=0;i<96;i++){
      const side=i%2?-1:1,lane=Math.floor(i/2)%4,row=Math.floor(i/8),style=row===0?[3,2,0,1,5,4,2,3][i]:Math.floor(random(i+17)*6);
      const x=side*(25+lane*29+(random(i+91)-.5)*6),z=-29-row*35+(random(i+52)-.5)*8;
      const heights=[[32,56],[42,61],[96,65],[86,55],[28,42],[66,61]][style];
      const height=i===1?138:heights[0]+random(i+37)*heights[1],width=12+random(i+111)*9,depth=14+random(i+132)*8;
      const options=[[6,7,8,11],[8,9,10,11],[0,4,5],[1,2],[3,6,9],[0,4,8]][style];
      const model=options[Math.floor(random(i+73)*options.length)],building=assets[model].scene.clone(true);building.name='Kenney_city_building_'+i;
      building.userData.architecture=['masonry','loft','art-deco','glass','industrial','setback'][style];building.userData.source=modelNames[model];
      const bounds=new THREE.Box3().setFromObject(building),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
      building.scale.set(width/size.x,height/size.y,depth/size.z);building.position.set(x-center.x*building.scale.x,-bounds.min.y*building.scale.y,z-center.z*building.scale.z);
      const facade=cityMaterial(palette[style],style,random(i+200)*10);
      building.traverse(o=>{if(o.isMesh){o.material=facade;o.add(new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry,35),new THREE.LineBasicMaterial({color:ink})));}});
      root.add(building);building.updateWorldMatrix(true,true);
      const roofRay=new THREE.Raycaster(),roofSamples=[];
      for(const [dx,dz] of [[-width*.18,-depth*.13],[width*.18,depth*.13],[-2,-1]]){
        roofRay.set(new THREE.Vector3(x+dx,height+30,z+dz),new THREE.Vector3(0,-1,0));
        const hit=roofRay.intersectObject(building,true).find(hit=>hit.object.isMesh);roofSamples.push(hit?.point.y??height);
      }
      const roofY=[...roofSamples].sort((a,b)=>a-b)[1];
      imported++;placements.push({x,z,h:height,roofY,waterY:roofSamples[2],w:width,d:depth,style,index:i,row});
      if(i%9===0)box(.04,height,.04,x-width*.5,height*.5,z+depth*.5+.03,material(i%2?cyan:pink),false);
    }
    architecture=createArchitectureDetails(root,placements);
  }).catch(error=>{assetError=error.message;for(let i=0;i<44;i++){const side=i%2?1:-1,h=40+i*17%70;box(16,h,17,side*(26+Math.floor(i/2)%3*27),h*.5,-30-Math.floor(i/6)*38,cityMaterial(palette[i%6],i%6));}});
  // Fine rain is held on twos, while all camera movement remains continuous.
  const rainPositions=[];for(let i=0;i<140;i++){const x=(i*41%180)-90,y=70+i*13%70,z=-10-i*23%250;rainPositions.push(x,y,z,x+.035,y-.7,z);}
  const rain=new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(rainPositions,3)),new THREE.LineBasicMaterial({color:'#89a6cd',transparent:true,opacity:.22,depthWrite:false}));root.add(rain);
  return{scene,root,horizon,rain,antenna,assetReady,get imported(){return imported;},get assetError(){return assetError;},get architecture(){return architecture;},placements};
}

export function createRooftopJourney({stage,camera,windowSurface,windowBars,reduced,onExit,hasWebGL}){
  const city=createCity(),scene=city.scene;
  const element=document.createElement('section');element.id='rooftop-journey';element.hidden=true;element.setAttribute('aria-label','Leap of faith rooftop');
  element.innerHTML='<div class="roof-chapter" aria-live="polite">04 / A DIFFERENT PERSPECTIVE.</div><div class="roof-navigation"><button class="roof-motion">PAUSE AMBIENT</button><button class="roof-skip">SKIP TO ROOFTOP ↗</button><button class="roof-return">← BACK TO ROOM</button></div><div class="roof-caption"><small>STEVEN JOE VALDEZ / ABOVE THE ORDINARY</small><h2>ONE STEP.<br>A WHOLE NEW VIEW.</h2><p>Take a breath. Then take the leap.</p><button class="roof-leap">TAKE THE LEAP ↓</button><button class="roof-replay" hidden>↺ BACK TO THE LEDGE</button></div>';
  stage.append(element);
  const chapter=element.querySelector('.roof-chapter'),caption=element.querySelector('.roof-caption'),leap=element.querySelector('.roof-leap'),replay=element.querySelector('.roof-replay');
  let active=false,inside=false,phase='idle',start=0,leapStart=0,motionEnabled=true,origin=null,originRotation=null,originalFar=camera.far,originalFov=camera.fov;
  const entry=new THREE.Vector3(0,80,-11),ledge=new THREE.Vector3(2,99.5,-3.5),view=new THREE.Vector3(0,94,-95);
  const ascent=new THREE.CatmullRomCurve3([entry,new THREE.Vector3(2,105,-20),new THREE.Vector3(0,105,-12),ledge]);
  const halfWidth=windowSurface.geometry.parameters.width/2,halfHeight=windowSurface.geometry.parameters.height/2;
  const portalTarget=new THREE.WebGLRenderTarget(1024,Math.round(1024*halfHeight/halfWidth));portalTarget.texture.colorSpace=THREE.SRGBColorSpace;
  const portalCamera=new THREE.PerspectiveCamera(35,1,.01,3000),sourceMatrix=new THREE.Matrix4(),inverse=new THREE.Matrix4(),eye=new THREE.Vector3();
  // Keep the actual exterior on the glass throughout the room lifecycle.
  if(hasWebGL)windowSurface.material.map=portalTarget.texture;
  const windowFrustum=new THREE.Frustum(),viewProjection=new THREE.Matrix4(),lastEye=new THREE.Vector3(Infinity,Infinity,Infinity);
  let windowDirty=true,lastRainPose=-1,windowPasses=0;
  city.assetReady.then(()=>{windowDirty=true;});
  function setPhase(value,text){phase=value;stage.dataset.roofPhase=value;chapter.textContent=text;}
  function pose(position,target,roll=0){camera.position.copy(position);camera.up.set(0,1,0);camera.lookAt(target);camera.rotateZ(roll);}
  function arrive(){inside=true;pose(ledge,view);camera.fov=48;camera.updateProjectionMatrix();setPhase('rooftop','04 / EVERY LEAP STARTS WITH A LEDGE.');caption.hidden=false;leap.hidden=false;replay.hidden=true;element.querySelector('.roof-skip').hidden=true;leap.focus({preventScroll:true});}
  function beginLeap(){if(!active)return;if(reduced.matches||!hasWebGL){finish();return;}leapStart=performance.now();caption.hidden=true;setPhase('leaping','04 / TAKE THE LEAP.');element.querySelector('.roof-skip').hidden=false;element.querySelector('.roof-skip').textContent='SKIP THE FALL ↗';element.querySelector('.roof-skip').focus({preventScroll:true});}
  function finish(){inside=true;pose(new THREE.Vector3(0,81,-28),new THREE.Vector3(0,98,-120),Math.PI);setPhase('suspended','04 / FALLING. OR RISING?');caption.hidden=false;caption.querySelector('h2').innerHTML='CHANGE YOUR<br>PERSPECTIVE.';caption.querySelector('p').textContent='Systems. Apps. Interfaces. Machine learning. Different views of the same curiosity.';leap.hidden=true;replay.hidden=false;element.querySelector('.roof-skip').hidden=true;replay.focus({preventScroll:true});}
  leap.addEventListener('click',beginLeap);replay.addEventListener('click',()=>{caption.querySelector('h2').innerHTML='ONE STEP.<br>A WHOLE NEW VIEW.';caption.querySelector('p').textContent='Take a breath. Then take the leap.';arrive();});
  element.querySelector('.roof-skip').addEventListener('click',()=>phase==='leaping'?finish():arrive());element.querySelector('.roof-return').addEventListener('click',()=>onExit({immediate:true}));element.querySelector('.roof-motion').addEventListener('click',()=>document.querySelector('#motion-toggle').click());
  return{
    enter(){active=true;inside=false;origin=camera.position.clone();originRotation=camera.quaternion.clone();originalFar=camera.far;originalFov=camera.fov;camera.far=3000;camera.updateProjectionMatrix();start=performance.now();stage.classList.add('visiting-rooftop');if(!hasWebGL)stage.classList.add('roof-fallback');element.hidden=false;caption.hidden=true;caption.querySelector('h2').innerHTML='ONE STEP.<br>A WHOLE NEW VIEW.';caption.querySelector('p').textContent='Take a breath. Then take the leap.';element.querySelector('.roof-skip').hidden=false;element.querySelector('.roof-skip').textContent='SKIP TO ROOFTOP ↗';setPhase('window','04 / THERE’S A WORLD OUTSIDE.');element.querySelector('.roof-skip').focus({preventScroll:true});windowSurface.material.map=portalTarget.texture;if(reduced.matches||!hasWebGL)arrive();},
    exit(){if(!active)return;active=false;inside=false;camera.up.set(0,1,0);camera.far=originalFar;camera.fov=originalFov;camera.updateProjectionMatrix();if(origin){camera.position.copy(origin);camera.quaternion.copy(originRotation);}windowDirty=true;windowBars.forEach(bar=>bar.mesh.position.copy(bar.origin));element.hidden=true;stage.classList.remove('visiting-rooftop','roof-fallback');delete stage.dataset.roofPhase;phase='idle';},
    update(time){
      const rainPose=motionEnabled&&!reduced.matches?Math.floor(time/(1000/12))%36:0;
      if(rainPose!==lastRainPose){windowDirty=true;lastRainPose=rainPose;}
      city.rain.position.y=-rainPose*.15;city.rain.visible=motionEnabled&&!reduced.matches;
      if(!active)return;if(reduced.matches&&phase!=='rooftop'&&phase!=='suspended'){arrive();return;}
      if(phase==='window'){
        const t=Math.min(1,(time-start)/1400),p=ease(t);windowBars.forEach(bar=>{bar.mesh.position.copy(bar.origin);bar.mesh.position[bar.axis]+=bar.travel*ease(t*3);});const center=windowSurface.getWorldPosition(new THREE.Vector3()),normal=new THREE.Vector3(0,0,1).transformDirection(windowSurface.matrixWorld);camera.position.lerpVectors(origin,center.clone().addScaledVector(normal,.17),p);camera.lookAt(center);camera.quaternion.copy(originRotation.clone().slerp(camera.quaternion,p));
        if(t===1){inside=true;pose(entry,new THREE.Vector3(0,94,-95));setPhase('ascending','04 / ABOVE THE NOISE.');}
      }else if(phase==='ascending'){
        const t=THREE.MathUtils.clamp((time-start-1400)/1800,0,1),p=smooth(t);camera.fov=THREE.MathUtils.lerp(originalFov,48,p);camera.updateProjectionMatrix();pose(ascent.getPoint(p),new THREE.Vector3(0,THREE.MathUtils.lerp(94,98,p),-95));if(t===1)arrive();
      }else if(phase==='leaping'){
        const t=time-leapStart;
        if(t<900){const p=smooth(t/900);pose(ledge.clone().lerp(new THREE.Vector3(0,88,-24),p).add(new THREE.Vector3(0,Math.sin(p*Math.PI)*6,0)),new THREE.Vector3(0,98,-120),Math.PI*.25*p);}
        else if(t<2500){const p=smooth((t-900)/1600);pose(new THREE.Vector3(0,88-p*7,-24-p*4),new THREE.Vector3(0,98,-120),Math.PI*(.25+.75*p));}
        else finish();
      }
    },
    renderWindow(renderer){if(inside||!hasWebGL)return;
      camera.updateMatrixWorld();windowSurface.updateWorldMatrix(true,false);
      viewProjection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);windowFrustum.setFromProjectionMatrix(viewProjection);
      if(!windowFrustum.intersectsObject(windowSurface))return;
      sourceMatrix.copy(windowSurface.matrixWorld);inverse.copy(sourceMatrix).invert();eye.copy(camera.position).applyMatrix4(inverse);
      if(eye.z<=0)return;
      if(!active&&!windowDirty&&lastEye.distanceToSquared(eye)<1e-10)return;
      // Direct one-to-one mapping from the room eye to the exterior window plane.
      const d=Math.max(.02,eye.z),n=d;
      portalCamera.position.copy(entry).add(eye);portalCamera.quaternion.identity();
      // Clip at the opening so the host tower cannot block its own window.
      portalCamera.projectionMatrix.makePerspective(-halfWidth-eye.x,halfWidth-eye.x,halfHeight-eye.y,-halfHeight-eye.y,n,3000);portalCamera.projectionMatrixInverse.copy(portalCamera.projectionMatrix).invert();
      const target=renderer.getRenderTarget();renderer.setRenderTarget(portalTarget);renderer.render(scene,portalCamera);renderer.setRenderTarget(target);
      lastEye.copy(eye);windowDirty=false;windowPasses++;
    },
    setMotionEnabled(value){motionEnabled=value;windowDirty=true;const b=element.querySelector('.roof-motion');b.textContent=value?'PAUSE AMBIENT':'RESUME AMBIENT';b.setAttribute('aria-pressed',String(!value));},
    get active(){return active;},get phase(){return phase;},get renderScene(){return active&&inside?scene:null;},get windowPasses(){return windowPasses;},windowTarget:portalTarget,city,windowSurface
  };
}
