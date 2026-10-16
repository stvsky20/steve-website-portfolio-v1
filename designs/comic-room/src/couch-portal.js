import * as THREE from 'three';
import {createPortalFX} from './portal-fx.js';
import {createTunnelLining} from './tunnel-lining.js';
import {createPassingTrain} from './passing-train.js';
import {createSubwayDestination} from './subway.js';

const journey=Object.freeze({approachEnd:1450,diveEnd:2800,glideDuration:5600,total:8400,trainStart:.62,trainPhase:.68});

export const contactDetails={
  email:'valdez.stevenjoe@gmail.com',
  github:'https://github.com/stvsky20',
  linkedin:'https://www.linkedin.com/in/steven-joe-valdez-15817128a'
};
function ease(t,x1=.23,y1=1,x2=.32,y2=1){ // Shared project easing tokens.
  t=Math.max(0,Math.min(1,t));if(t===0||t===1)return t;
  let lo=0,hi=1,u=t;for(let i=0;i<12;i++){u=(lo+hi)/2;const x=3*(1-u)**2*u*x1+3*(1-u)*u*u*x2+u**3;x<t?lo=u:hi=u;}
  return 3*(1-u)**2*u*y1+3*(1-u)*u*u*y2+u**3;
}
export function createCouchPortal({stage,couch,camera,reduced,coverMaterial,onExit,hasWebGL}){
  const lid=new THREE.Group();lid.name='Couch_cover_hinge';lid.position.set(0,.67,-.43);couch.add(lid);couch.updateMatrixWorld(true);
  const pads=couch.children.filter(o=>o.isMesh&&o.geometry.type==='BoxGeometry'&&o.geometry.parameters.height===.18);
  pads.forEach(p=>lid.attach(p));
  const cloth=new THREE.Mesh(new THREE.BoxGeometry(2.5,.035,.9),coverMaterial);cloth.position.set(0,.18,.46);lid.add(cloth);
  const seams=new THREE.LineSegments(new THREE.EdgesGeometry(cloth.geometry),new THREE.LineBasicMaterial({color:'#101020'}));cloth.add(seams);
  lid.userData.destination='contact';
  const portal=new THREE.Group();portal.name='Hidden_couch_wormhole';portal.position.set(0,.681,.03);portal.visible=false;portal.userData.destination='contact';couch.add(portal);
  const shader=new THREE.ShaderMaterial({
    uniforms:{time:{value:0},portalMap:{value:null}},
    transparent:true,
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'uniform float time;uniform sampler2D portalMap;varying vec2 vUv;void main(){vec2 p=(vUv-.5)*2.;float r=length(p);if(r>1.)discard;float a=atan(p.y,p.x);float stripe=sin(log(max(r,.03))*13.-a*5.+time*3.);vec3 ink=mix(vec3(.95,.08,.5),vec3(.08,.82,.98),step(.5,stripe));ink=mix(ink,vec3(1.,.72,.15),step(.92,stripe));vec3 interior=texture2D(portalMap,vUv).rgb;vec3 col=mix(interior,ink,smoothstep(.6,1.,r)*.85);gl_FragColor=vec4(col,1.);}'
  });
  const mouth=new THREE.Mesh(new THREE.PlaneGeometry(2.48,.83),shader);mouth.rotation.x=-Math.PI/2;portal.add(mouth);
  for(let i=0;i<3;i++){
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.91+i*.035,.018,4,48),new THREE.MeshBasicMaterial({color:['#20d5f5','#f32b85','#ffb531'][i]}));
    ring.rotation.x=-Math.PI/2;ring.scale.set(1.3,.43,1);ring.position.y=.005+i*.002;portal.add(ring);
  }
  const world=new THREE.Scene();world.background=new THREE.Color('#141328');
  const tunnel=new THREE.Group();world.add(tunnel);
  const lining=createTunnelLining(tunnel);
  const effects=createPortalFX({couch,world,camera});
  const target=new THREE.WebGLRenderTarget(1024,512);
  target.texture.colorSpace=THREE.SRGBColorSpace;shader.uniforms.portalMap.value=target.texture;
  const portalCamera=new THREE.PerspectiveCamera(camera.fov,camera.aspect,.01,130);
  const localPose=new THREE.PerspectiveCamera();
  const sourceMatrix=new THREE.Matrix4(),inverseSource=new THREE.Matrix4(),sourceRotation=new THREE.Quaternion();
  const portalEye=new THREE.Vector3(),diveRotation=new THREE.Quaternion();
  const divePath=new THREE.CubicBezierCurve3(new THREE.Vector3(2,-4,4),new THREE.Vector3(1.1,-1.8,1.9),new THREE.Vector3(0,0,.9),new THREE.Vector3(0,0,-.7));
  let inside=false;
  function refreshSource(){
    mouth.updateWorldMatrix(true,false);sourceMatrix.copy(mouth.matrixWorld);inverseSource.copy(sourceMatrix).invert();mouth.getWorldQuaternion(sourceRotation);
  }
  const subway=createSubwayDestination(world);
  const passingTrain=createPassingTrain(world);
  const element=document.createElement('section');element.id='portal-journey';element.hidden=true;element.setAttribute('aria-label','Couch portal journey');
  element.innerHTML='<div class="portal-chapter" aria-live="polite">03 / THERE’S MORE THAN MEETS THE EYE.</div><div class="portal-navigation"><button class="portal-motion" aria-pressed="false">PAUSE AMBIENT</button><button class="portal-skip">SKIP TO CONTACT ↗</button><button class="portal-return">← BACK TO ROOM</button></div><article class="portal-contact" hidden><small>CONNECTIONS / PLATFORM 03</small><h2>NEXT STOP:<br><span>LET’S TALK.</span></h2><p class="portal-name">STEVEN JOE VALDEZ / SOFTWARE ENGINEER</p><p>Have an idea, an interesting problem, or a project in mind? Let’s talk.</p><a class="contact-email" href="mailto:'+contactDetails.email+'">'+contactDetails.email+' <span>↗</span></a><div class="contact-socials"><a href="'+contactDetails.github+'" target="_blank" rel="noopener noreferrer">GITHUB / stvsky20 ↗</a><a href="'+contactDetails.linkedin+'" target="_blank" rel="noopener noreferrer">LINKEDIN ↗</a></div></article>';
  stage.append(element);element.querySelector('.portal-motion').addEventListener('click',()=>document.querySelector('#motion-toggle').click());element.querySelector('.portal-return').addEventListener('click',onExit);
  element.querySelector('.portal-skip').addEventListener('click',()=>returning?onExit({immediate:true}):arrive());
  const caption=element.querySelector('.portal-chapter'),contact=element.querySelector('.portal-contact');
  let active=false,start=0,phase='idle',motionEnabled=true,clock=0,lastTime=0,origin=null,landedAt=0;
  let preview=0,previewTarget=0,previewFrom=0,previewStart=0,openingAngle=0,openingY=.67;
  let returning=false,returnStart=0,timeline=0;
  const originRotation=new THREE.Quaternion();
  // Solve the same aperture crossing used by both directions.
  let crossingLo=journey.approachEnd,crossingHi=journey.diveEnd;
  for(let i=0;i<24;i++){const t=(crossingLo+crossingHi)/2;const z=divePath.getPoint(ease((t-journey.approachEnd)/(journey.diveEnd-journey.approachEnd),.77,0,.175,1)).z;if(z>camera.near*.9)crossingLo=t;else crossingHi=t;}
  const crossingAt=(crossingLo+crossingHi)/2;
  function applyPreview(value){lid.rotation.x=-.24*value;lid.position.y=.67+.065*value;portal.visible=value>.01;}
  const center=()=>couch.localToWorld(new THREE.Vector3(0,.68,.03));
  function setPhase(value,text){if(phase===value)return;phase=value;stage.dataset.portalPhase=value;caption.textContent=text;}
  function projectContact(){
    if(!hasWebGL)return;
    camera.updateMatrixWorld();subway.contactAnchor.updateWorldMatrix(true,false);
    const point=(x,y)=>new THREE.Vector3(x,y,.01).applyMatrix4(subway.contactAnchor.matrixWorld).project(camera);
    const pixel=p=>({x:(p.x*.5+.5)*stage.clientWidth,y:(-p.y*.5+.5)*stage.clientHeight});
    const a=pixel(point(-3.5,1.95)),b=pixel(point(3.5,1.95)),c=pixel(point(-3.5,-1.95));
    contact.style.transform='matrix('+[(b.x-a.x)/560,(b.y-a.y)/560,(c.x-a.x)/312,(c.y-a.y)/312,a.x,a.y].join(',')+')';
  }
  function revealContact(){
    setPhase('arrived','04 / IDEAS FIND THEIR PEOPLE HERE.');
    contact.hidden=false;element.querySelector('.portal-skip').hidden=true;
    projectContact();element.querySelector('.contact-email').focus({preventScroll:true});
  }
  function arrive(){
    if(!active)return;
    effects.reset();
    lid.rotation.x=-1.35;lid.position.y=1.47;portal.visible=true;inside=true;tunnel.visible=false;camera.position.set(0,1.4,-75);camera.lookAt(0,1.4,-98);
    landedAt=performance.now();
    passingTrain.reset();revealContact();
  }
  function glideCamera(progress){
    // Two turns through the heart of the passage, then an upright station approach.
    // Both directions sample this exact pose; rotation is spatial travel, not wall FX.
    const p=ease(progress,.77,0,.175,1);
    const spin=ease(Math.min(p/.82,1),.77,0,.175,1),angle=spin*Math.PI*4;
    const radius=.65*Math.sin(spin*Math.PI)**2;
    camera.position.set(Math.sin(angle)*radius,1.4*p+(Math.cos(angle)-1)*radius,-.7-74.3*p);
    camera.lookAt(0,1.4*p,camera.position.z-8);
    camera.rotateZ(-angle);portalEye.copy(camera.position);
    // Keep the shell until its last wall is safely behind the camera's near plane.
    tunnel.visible=camera.position.z>=lining.userData.exitZ-camera.near;
  }
  function samplePose(t){
    const point=center(),lift=ease((t-200)/900);
    lid.rotation.x=THREE.MathUtils.lerp(openingAngle,-1.35,lift);lid.position.y=THREE.MathUtils.lerp(openingY,1.47,lift);
    if(returning&&t<200){const previewLift=ease(t/200);lid.rotation.x=openingAngle*previewLift;lid.position.y=THREE.MathUtils.lerp(.67,openingY,previewLift);}
    portal.visible=openingAngle<-.002?t>0:t>220;
    if(t<journey.approachEnd){
      inside=false;tunnel.visible=true;
      const progress=ease(t/1050);
      camera.position.lerpVectors(origin,point.clone().add(new THREE.Vector3(2,4,4)),progress);camera.lookAt(point);
      camera.quaternion.copy(originRotation.clone().slerp(camera.quaternion,progress));
    }else if(t<journey.diveEnd){
      refreshSource();const progress=ease((t-journey.approachEnd)/(journey.diveEnd-journey.approachEnd),.77,0,.175,1);
      divePath.getPoint(progress,portalEye);localPose.position.copy(portalEye);localPose.lookAt(0,0,-1.5);
      const roomRotation=sourceRotation.clone().multiply(localPose.quaternion);
      const rotation=diveRotation.clone().slerp(roomRotation,progress);
      inside=portalEye.z<=camera.near*.9;tunnel.visible=true;
      if(inside){camera.position.copy(portalEye);camera.quaternion.copy(sourceRotation).invert().multiply(rotation);}
      else{camera.position.copy(portalEye).applyMatrix4(sourceMatrix);camera.quaternion.copy(rotation);}
    }else{inside=true;glideCamera(Math.max(0,Math.min(1,(t-journey.diveEnd)/journey.glideDuration)));}
  }
  return{
    enter(){
      returning=false;timeline=0;effects.reset();openingAngle=lid.rotation.x;openingY=lid.position.y;previewTarget=0;preview=0;
      active=true;inside=false;passingTrain.reset();tunnel.visible=true;start=performance.now();lastTime=start;origin=camera.position.clone();originRotation.copy(camera.quaternion);phase='idle';
      const approach=camera.clone();approach.position.copy(center()).add(new THREE.Vector3(2,4,4));approach.lookAt(center());diveRotation.copy(approach.quaternion);
      element.querySelector('.portal-return').disabled=false;element.querySelector('.portal-return').textContent='← BACK TO ROOM';element.querySelector('.portal-skip').textContent='SKIP TO CONTACT ↗';
      stage.classList.add('traveling-portal','subway-destination');if(!hasWebGL)stage.classList.add('subway-fallback');element.hidden=false;contact.hidden=true;element.querySelector('.portal-skip').hidden=false;
      setPhase('opening','03 / THIS ISN’T JUST A COUCH.');
      element.querySelector('.portal-skip').focus({preventScroll:true});
      if(reduced.matches||!hasWebGL)arrive();
    },
    skip(){arrive();},
    reverse(){
      if(returning)return true;
      if(!active||phase!=='arrived'||reduced.matches||!hasWebGL)return false;
      returning=true;returnStart=performance.now();timeline=journey.total;effects.reset();contact.hidden=true;
      const skip=element.querySelector('.portal-skip');skip.hidden=false;skip.textContent='SKIP TO ROOM ↗';skip.focus({preventScroll:true});
      element.querySelector('.portal-return').disabled=true;element.querySelector('.portal-return').textContent='RETURNING…';
      setPhase('returning','04 / LET’S TAKE IT BACK.');return true;
    },
    exit(){
      returning=false;
      effects.reset();preview=0;previewTarget=0;applyPreview(0);
      if(!active)return;active=false;inside=false;tunnel.visible=true;passingTrain.reset();phase='idle';element.hidden=true;contact.hidden=true;
      stage.classList.remove('traveling-portal','subway-destination','subway-fallback');delete stage.dataset.portalPhase;
      if(origin)camera.position.copy(origin);
    },
    preview(value,{immediate=false}={}){
      if(active)return;
      const next=value?1:0;if(next===previewTarget)return;
      previewFrom=preview;previewTarget=next;previewStart=performance.now();
      if(immediate||reduced.matches||!motionEnabled){preview=next;applyPreview(preview);}
    },
    update(time){
      if(!active){
        if(preview!==previewTarget){
          const p=(time-previewStart)/180;preview=reduced.matches||!motionEnabled||p>=1?previewTarget:THREE.MathUtils.lerp(previewFrom,previewTarget,ease(p));applyPreview(preview);
        }
        return;
      }
      const dt=Math.min(time-lastTime,64);lastTime=time;if(motionEnabled&&!reduced.matches)clock+=dt;
      shader.uniforms.time.value=clock*.001;lining.material.uniforms.flow.value=clock*.001;
      if(reduced.matches&&returning){onExit({immediate:true});return;}
      if(reduced.matches&&phase!=='arrived'){arrive();return;}
      if(returning){
        if(reduced.matches){onExit({immediate:true});return;}
        timeline=Math.max(0,journey.total-(time-returnStart));samplePose(timeline);
        const glide=Math.max(0,Math.min(1,(timeline-journey.diveEnd)/journey.glideDuration));
        passingTrain.update((glide-journey.trainStart)/(1-journey.trainStart),{smearEnabled:motionEnabled&&!reduced.matches});
        if(motionEnabled&&!reduced.matches)clock=Math.max(0,clock-dt*2);shader.uniforms.time.value=clock*.001;lining.material.uniforms.flow.value=clock*.001;
        if(timeline===0)onExit({completed:true});return;
      }
      const t=time-start;timeline=Math.min(t,journey.total);
      if(phase==='arrived'){passingTrain.reset();projectContact();return;}
      if(phase==='landing'){if(time-landedAt>=300)revealContact();return;}
      samplePose(timeline);
      const glide=Math.max(0,Math.min(1,(t-journey.diveEnd)/journey.glideDuration));
      passingTrain.update((glide-journey.trainStart)/(1-journey.trainStart),{smearEnabled:motionEnabled&&!reduced.matches});
      if(t<journey.approachEnd){setPhase('opening','03 / THIS ISN’T JUST A COUCH.');}
      else if(t<journey.diveEnd){setPhase('diving','03 / TAKE THE LEAP.');}
      else if(t<journey.total){setPhase(glide>=journey.trainPhase?'train':'tunnel',glide>=journey.trainPhase?'04 / THE CONNECTIONS LINE.':'BETWEEN IDEAS / BETWEEN WORLDS');}
      else{passingTrain.reset();landedAt=time;setPhase('landing','04 / NEXT STOP: THE NEXT CHAPTER.');}
    },
    updateEffects(){effects.update(timeline,inside,active&&motionEnabled&&!reduced.matches&&phase!=='arrived'&&phase!=='landing'&&phase!=='train',crossingAt);},
    renderEffects(renderer){effects.render(renderer,world);},
    renderEntrance(renderer){
      if(inside||!portal.visible||!hasWebGL)return;
      refreshSource();portalEye.copy(camera.position).applyMatrix4(inverseSource);
      const distance=Math.max(.02,portalEye.z),near=.01;
      portalCamera.position.copy(portalEye);portalCamera.quaternion.identity();
      portalCamera.projectionMatrix.makePerspective(
        (-1.24-portalEye.x)*near/distance,(1.24-portalEye.x)*near/distance,
        (.415-portalEye.y)*near/distance,(-.415-portalEye.y)*near/distance,near,130
      );
      portalCamera.projectionMatrixInverse.copy(portalCamera.projectionMatrix).invert();
      const previous=renderer.getRenderTarget();
      renderer.setRenderTarget(target);renderer.render(world,portalCamera);renderer.setRenderTarget(previous);
    },
    get inside(){return inside;},get portalEye(){return portalEye;},
    setMotionEnabled(value){motionEnabled=value;if(!value)effects.hide();const button=element.querySelector('.portal-motion');button.setAttribute('aria-pressed',String(!value));button.textContent=value?'PAUSE AMBIENT':'RESUME AMBIENT';},
    get active(){return active;},get phase(){return phase;},get returning(){return returning;},get timeline(){return timeline;},
    get renderScene(){return active&&(inside||phase==='tunnel'||phase==='train'||phase==='landing'||phase==='arrived')?world:null;},
    timings:journey,crossingAt,lid,portal,contactDetails,subway,passingTrain,lining,effects
  };
}
