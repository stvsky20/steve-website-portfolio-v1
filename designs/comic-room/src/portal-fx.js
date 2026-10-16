import * as THREE from 'three';

function drawing(paint,width=512,height=256){
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  paint(canvas.getContext('2d'),width,height);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}
function lettering(word,color){return drawing((c,w,h)=>{
  const points=[[12,132],[66,98],[42,45],[151,67],[188,12],[244,52],[337,24],[356,68],[472,52],[443,106],[502,153],[425,174],[457,224],[343,208],[291,248],[242,213],[136,237],[128,191],[24,209],[51,162]];
  c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=color;c.fill();c.lineWidth=11;c.strokeStyle='#101020';c.stroke();
  c.save();c.translate(w/2,h/2);c.rotate(-.07);c.font='900 italic 82px Arial';c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';c.lineWidth=12;c.strokeStyle='#101020';c.strokeText(word,0,8);c.fillStyle='#fff2d5';c.fillText(word,0,8);c.restore();
});}
function card(texture,width,height){return new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:texture,transparent:true,side:THREE.DoubleSide,depthWrite:false}));}

/** Spatial drawn accents plus two real alternate-camera renders at the threshold. */
export function createPortalFX({couch,world,camera}){
  const release=card(lettering('FWIP!','#f32b85'),1.65,.825);release.name='Spatial_FWIP';release.position.set(1.25,1.75,.6);couch.add(release);
  const rush=card(lettering('WHOOSH!','#ffb531'),2.3,1.15);rush.name='Spatial_WHOOSH';rush.position.set(.35,.25,-5.5);world.add(rush);
  const energy=new THREE.Group();energy.name='Drawn_portal_energy';couch.add(energy);
  // Dimensional brush strokes grow out of the rim, rather than facing the camera as cards.
  const strands=[];
  for(let i=0;i<6;i++){
    const angle=i*Math.PI/3,points=[];
    for(let j=0;j<=14;j++){
      const t=j/14,a=angle+t*.9,r=1.+Math.sin(t*Math.PI)*.13;
      points.push(new THREE.Vector3(Math.cos(a)*1.22*r,.708+Math.sin(t*Math.PI)*(.15+i%2*.08),Math.sin(a)*.415*r+.03));
    }
    const curve=new THREE.CatmullRomCurve3(points),group=new THREE.Group();
    const stroke=new THREE.Mesh(new THREE.TubeGeometry(curve,36,.012,5,false),new THREE.MeshBasicMaterial({color:['#20d5f5','#f32b85','#ffb531'][i%3],transparent:true,depthWrite:false}));
    const ink=new THREE.Mesh(new THREE.TubeGeometry(curve,36,.024,5,false),new THREE.MeshBasicMaterial({color:'#101020',transparent:true,depthWrite:false,side:THREE.BackSide}));
    stroke.renderOrder=1;
    group.add(ink,stroke);energy.add(group);strands.push({stroke,ink});
  }
  const targets=[new THREE.WebGLRenderTarget(1,1),new THREE.WebGLRenderTarget(1,1)];
  targets.forEach(t=>t.texture.colorSpace=THREE.SRGBColorSpace);
  const alternate=camera.clone(),overlay=new THREE.Scene(),screenCamera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  const material=new THREE.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,
    uniforms:{viewA:{value:targets[0].texture},viewB:{value:targets[1].texture},amount:{value:0},},
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
    fragmentShader:`varying vec2 vUv;uniform sampler2D viewA;uniform sampler2D viewB;uniform float amount;
      void main(){
        vec2 p=vUv-.5;vec2 grid=vUv*vec2(4.,3.);grid.x+=vUv.y*.85;vec2 local=fract(grid);float triangle=step(1.,local.x+local.y);float cell=floor(grid.x)+floor(grid.y)*7.+triangle*3.;
        float side=mod(cell,2.);vec2 uv=vUv+vec2(sin(cell*2.1),cos(cell*1.7))*.026*amount;
        vec3 sampled=mix(texture2D(viewA,uv).rgb,texture2D(viewB,uv).rgb,side);
        float value=sqrt(max(0.,dot(sampled,vec3(.299,.587,.114))));float band=floor(value*4.)/3.;
        vec3 paper=mix(vec3(.08,.8,.93),vec3(.96,.16,.51),side);
        vec3 color=mix(vec3(.04,.035,.13),paper,clamp(band,0.,1.));
        float hatch=step(.83,fract((gl_FragCoord.x+gl_FragCoord.y)*.1));
        float dots=step(.31,length(fract(gl_FragCoord.xy/7.)-.5));
        color*=mix(1.,mix(dots*.32+.68,1.-hatch*.28,side),step(.14,value));
        float edge=min(min(local.x,1.-local.x),min(local.y,1.-local.y));edge=min(edge,abs(local.x+local.y-1.)*.7);float seam=1.-smoothstep(0.,.018,edge);
        color=mix(color,vec3(.04,.035,.13),seam*.7);
        float mask=smoothstep(.06,.18,length(p))*mix(.65,.92,side);
        gl_FragColor=vec4(color,amount*mask);
      }`
  });
  overlay.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),material));
  const inverse=new THREE.Quaternion();
  let crossing=null,strength=0,passes=0;
  function face(mesh){mesh.parent.getWorldQuaternion(inverse);mesh.quaternion.copy(inverse.invert()).multiply(camera.quaternion);}
  function clear(){release.visible=false;rush.visible=false;energy.visible=false;strength=0;material.uniforms.amount.value=0;}
  [release,rush,energy].forEach(object=>object.traverse(mesh=>{if(mesh.isMesh)mesh.raycast=()=>{};}));
  clear();
  return{
    reset(){crossing=null;clear();},
    hide:clear,
    update(t,inside,enabled,crossingAt=null){
      if(crossingAt!==null)crossing=crossingAt;else if(inside&&crossing===null)crossing=t;
      clear();if(!enabled)return;
      release.visible=t>=260&&t<720;
      if(release.visible){const p=(t-260)/460;release.position.y=1.75+p*.25;release.scale.setScalar(.92+.08*Math.min(1,p*5));face(release);}
      energy.visible=t>=280&&t<1500;
      if(energy.visible){
        const envelope=Math.min(1,(t-280)/180,(1500-t)/260);
        strands.forEach(({stroke,ink},i)=>{const pulse=.78+.22*Math.sin(t*.006+i);stroke.material.opacity=envelope*pulse;ink.material.opacity=envelope*.7;});
      }
      if(crossing!==null){const elapsed=t-crossing;
        rush.visible=elapsed>=60&&elapsed<420;if(rush.visible)rush.quaternion.copy(camera.quaternion);
        // A single 440ms fracture, with a held middle and no repetitive flashing.
        strength=elapsed<0?0:elapsed<100?elapsed/100:elapsed<260?1:elapsed<440?1-(elapsed-260)/180:0;
        material.uniforms.amount.value=strength;
      }
    },
    render(renderer,scene){
      if(strength<=0)return;
      const size=renderer.getSize(new THREE.Vector2()),w=Math.min(768,size.x),h=Math.round(w*size.y/size.x);
      const previous=renderer.getRenderTarget(),autoClear=renderer.autoClear;
      try{
        for(let i=0;i<2;i++){
          if(targets[i].width!==w||targets[i].height!==h)targets[i].setSize(w,h);
          alternate.copy(camera);alternate.translateX(i===0?-.07:.07);alternate.rotateY(i===0?-.11:.11);alternate.updateMatrixWorld();
          renderer.setRenderTarget(targets[i]);renderer.autoClear=true;renderer.render(scene,alternate);passes++;
        }
        renderer.setRenderTarget(previous);renderer.autoClear=false;renderer.render(overlay,screenCamera);
      }finally{renderer.setRenderTarget(previous);renderer.autoClear=autoClear;}
    },
    get strength(){return strength;},get passes(){return passes;},get targetSize(){return [targets[0].width,targets[0].height];},release,rush,energy
  };
}
