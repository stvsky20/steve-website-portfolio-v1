import * as THREE from 'three';

export function createSteven(){
 const root=new THREE.Group();root.name='Steven_Joe_Valdez';
 const materials={};const meshParts=[];
 const palette={ink:'#171322',suit:'#111624',red:'#da2445',skin:'#ca9877',hair:'#171b26',cyan:'#20d5f5',paper:'#e9dfcc',lip:'#a46c60'};
 for(const [name,color] of Object.entries(palette))materials[name]=new THREE.MeshStandardMaterial({color,roughness:.87,metalness:0});
 function canvasMap(draw,w=1024,h=1024){
  const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);
  const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;return map;
 }
 const chestMap=canvasMap((c,w,h)=>{
  c.fillStyle='#131725';c.fillRect(0,0,w,h);
  // Subtle woven fabric: variation in the material, not chunky armor.
  c.fillStyle='#384050';for(let y=0;y<h;y+=12)for(let x=0;x<w;x+=12)c.fillRect(x,y,1,3);
  c.strokeStyle='#4c293b';c.lineWidth=2;for(let i=0;i<15;i++){c.beginPath();c.moveTo(i*w/15,0);c.lineTo(i*w/15+w*.02,h);c.stroke();}
  c.fillStyle='#dd2948';
  c.beginPath();c.moveTo(0,0);c.lineTo(w*.16,0);c.lineTo(w*.13,h*.12);c.lineTo(w*.035,h*.19);c.lineTo(0,h*.17);c.fill();
  c.beginPath();c.moveTo(w*.36,0);c.lineTo(w*.5,0);c.lineTo(w*.5,h*.17);c.lineTo(w*.455,h*.19);c.lineTo(w*.37,h*.12);c.fill();
  const x=w*.25,y=h*.31;
  c.beginPath();c.ellipse(x,y,14,56,0,0,7);c.fill();c.beginPath();c.ellipse(x,y-57,11,13,0,0,7);c.fill();
  c.lineWidth=8;c.lineJoin='miter';
  for(const s of [-1,1])for(let i=0;i<4;i++){c.beginPath();c.moveTo(x+s*9,y-29+i*18);c.lineTo(x+s*(40+i*7),y-47+i*21);c.lineTo(x+s*(69+i*5),y+(i<2?-120:128));c.strokeStyle='#e72948';c.stroke();}
  // Tailored side panel seams.
  c.strokeStyle='#ba2742';c.lineWidth=5;for(const s of [-1,1]){c.beginPath();c.moveTo(x+s*126,h*.18);c.lineTo(x+s*100,h*.48);c.lineTo(x+s*114,h*.81);c.stroke();}
 });
 materials.chest=materials.suit.clone();materials.chest.color.set('#ffffff');materials.chest.map=chestMap;
 materials.glove=materials.red.clone();materials.glove.map=canvasMap((c,w,h)=>{
  c.fillStyle='#ce2744';c.fillRect(0,0,w,h);c.strokeStyle='#461d31';c.lineWidth=3;
  for(let x=0;x<w;x+=w/8){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke();}
  for(let y=0;y<h;y+=h/9){c.beginPath();c.moveTo(0,y);for(let x=0;x<=w;x+=w/16)c.lineTo(x,y+Math.sin(x/w*16*Math.PI)*10);c.stroke();}
 });
 materials.glove.color.set('#ffffff');
 function mesh(geo,mat,parent,pos=[0,0,0],scale=[1,1,1],name=''){
  const m=new THREE.Mesh(geo,materials[mat]||mat);m.position.set(...pos);m.scale.set(...scale);m.name=name;parent.add(m);meshParts.push(m);
  if(['face','hair_cap'].includes(name)){
   const contour=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:palette.ink,side:THREE.BackSide}));contour.scale.setScalar(1.013);contour.userData.outline=true;m.add(contour);
  }return m;
 }
 function ellipsoid(parent,mat,pos,scale,name=''){return mesh(new THREE.SphereGeometry(1,32,20),mat,parent,pos,scale,name);}
 function stroke(parent,points,mat='ink',radius=.005){
  return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),Math.max(8,points.length*5),radius,6,false),mat,parent);
 }
 const bones=[];
 function bone(name,parent,pos){const b=new THREE.Bone();b.name=name;b.position.set(...pos);parent.add(b);bones.push(b);return b;}
 const hips=bone('hips',root,[0,2.35,0]),spine=bone('spine',hips,[0,.17,0]),neck=bone('neck',spine,[0,1.32,0]),head=bone('head',neck,[0,.48,0]);
 const joints={root,hips,spine,neck,head};
 for(const [side,s] of [['L',-1],['R',1]]){
  const sh=bone('shoulder_'+side,spine,[s*.52,1.12,0]);
  const el=bone('elbow_'+side,sh,[0,-.76,0]);
  const wr=bone('wrist_'+side,el,[0,-.67,0]);
  const hi=bone('hip_'+side,hips,[s*.245,-.1,0]);
  const kn=bone('knee_'+side,hi,[0,-1.01,0]);
  const an=bone('ankle_'+side,kn,[0,-.87,0]);
  Object.assign(joints,{['shoulder'+side]:sh,['elbow'+side]:el,['wrist'+side]:wr,['hip'+side]:hi,['knee'+side]:kn,['ankle'+side]:an});
 }
 root.updateMatrixWorld(true);const skeleton=new THREE.Skeleton(bones);
 // Elliptical anatomical sections, with blend weights around the joints.
 function bodySurface(name,parent,sections,mat,child=null,blendStart=-.55,blendEnd=-.76){
  const positions=[],uv=[],index=[],skinIndex=[],skinWeight=[],segments=32;
  for(let r=0;r<sections.length;r++){
   const [y,width,depth,offset=0]=sections[r];
   for(let i=0;i<=segments;i++){
    const a=i/segments*Math.PI*2;const v=new THREE.Vector3(Math.cos(a)*width,y,Math.sin(a)*depth+offset).applyMatrix4(parent.matrixWorld);
    positions.push(v.x,v.y,v.z);uv.push(i/segments,r/(sections.length-1));
    const w=child?THREE.MathUtils.clamp((y-blendStart)/(blendEnd-blendStart),0,1)*.8:0;
    skinIndex.push(bones.indexOf(parent),child?bones.indexOf(child):bones.indexOf(parent),0,0);skinWeight.push(1-w,w,0,0);
    if(r<sections.length-1&&i<segments){const p=r*(segments+1)+i;if(sections[1][0]>sections[0][0])index.push(p,p+segments+1,p+1,p+1,p+segments+1,p+segments+2);else index.push(p,p+1,p+segments+1,p+1,p+segments+2,p+segments+1);}
   }
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(skinIndex,4));g.setAttribute('skinWeight',new THREE.Float32BufferAttribute(skinWeight,4));g.setIndex(index);g.computeVertexNormals();
  const m=new THREE.SkinnedMesh(g,materials[mat]);m.name=name;root.add(m);m.bind(skeleton);meshParts.push(m);
  const edgeMat=new THREE.MeshBasicMaterial({color:palette.ink,side:THREE.BackSide});
  edgeMat.onBeforeCompile=s=>s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed += normal * 0.009;');
  const shell=new THREE.SkinnedMesh(g,edgeMat);shell.name='ink_contour';shell.userData.outline=true;root.add(shell);shell.bind(skeleton);
  return m;
 }
 bodySurface('fitted_torso',spine,[[-.19,.35,.235],[0,.405,.25],[.24,.35,.238],[.48,.365,.245],[.7,.465,.29],[.92,.545,.30],[1.12,.565,.275],[1.24,.43,.215],[1.34,.16,.137]],'chest');
 bodySurface('pelvis',hips,[[-.34,.32,.20],[-.19,.39,.25],[0,.405,.25],[.17,.35,.238]],'suit');
 // Short neck and an actual connected facial surface.
 const neckMesh=mesh(new THREE.CylinderGeometry(.125,.16,.24,28),'skin',neck,[0,.08,0]);
 function gaussian(x,y,cx,cy,sx,sy){return Math.exp(-((x-cx)**2/(sx*sx)+(y-cy)**2/(sy*sy)));}
 function facialDepth(x,y){
  const base=.31*Math.sqrt(Math.max(.012,1-x*x/(.365*.365)-y*y/(.49*.49)));
  const bridge=.065*gaussian(x,y,0,.025,.045,.15);
  const tip=.09*gaussian(x,y,0,-.105,.047,.047);
  const wings=.025*(gaussian(x,y,-.05,-.115,.025,.03)+gaussian(x,y,.05,-.115,.025,.03));
  const sockets=-.022*(gaussian(x,y,-.137,.073,.085,.045)+gaussian(x,y,.137,.073,.085,.045));
  const cheeks=.012*(gaussian(x,y,-.20,-.065,.095,.11)+gaussian(x,y,.20,-.065,.095,.11));
  const lips=.015*gaussian(x,y,0,-.233,.11,.033);
  return base+bridge+tip+wings+sockets+cheeks+lips;
 }
 const faceG=new THREE.SphereGeometry(1,72,56);const fp=faceG.attributes.position;
 for(let i=0;i<fp.count;i++){
  let x=fp.getX(i)*.365,y=fp.getY(i)*.49,z=fp.getZ(i)*.31;
  const taper=y<-.12?1+(y+.12)*.55:1;x*=taper;
  if(z>0){const analytic=facialDepth(x,y);z+= (analytic-.31*Math.sqrt(Math.max(.012,1-x*x/(.365*.365)-y*y/(.49*.49))))*Math.min(1,z/.12);}
  fp.setXYZ(i,x,y,z);
 }faceG.computeVertexNormals();mesh(faceG,'skin',head,[0,0,0],[1,1,1],'face');
 for(const s of [-1,1]){
  ellipsoid(head,'skin',[s*.346,-.005,-.015],[.051,.095,.035],'ear');
  stroke(head,[[s*.36,.038,.013],[s*.369,-.004,.018],[s*.35,-.046,.01]],'lip',.004);
 }
 function onFace(x,y,extra=.006){return [x,y,facialDepth(x,y)+extra];}
 // Almond patches conform to the face; irises are drawn inside them, not stuck-on spheres.
 const eyeTexture=canvasMap((c,w,h)=>{
  c.fillStyle='#dcd6c9';c.fillRect(0,0,w,h);
  c.fillStyle='#45392e';c.beginPath();c.ellipse(w*.49,h*.46,w*.18,h*.6,0,0,7);c.fill();
  c.fillStyle='#131725';c.beginPath();c.ellipse(w*.49,h*.46,w*.105,h*.48,0,0,7);c.fill();
  c.fillStyle='#f3e7cf';c.beginPath();c.ellipse(w*.445,h*.30,w*.025,h*.075,0,0,7);c.fill();
 },512,256);
 const eyeMat=new THREE.MeshStandardMaterial({map:eyeTexture,roughness:.65});
 for(const s of [-1,1]){
  const positions=[],uv=[],indices=[],upper=[],lower=[],center=s*.142;
  for(let i=0;i<=30;i++){
   const t=i/30,x=center+(t-.5)*.18,arch=Math.sin(Math.PI*t);
   const top=.075+arch*.028+(t-.5)*s*.012,bottom=.075-arch*.017+(t-.5)*s*.012;
   upper.push(onFace(x,top,.009));lower.push(onFace(x,bottom,.008));
   for(let r=0;r<2;r++){const y=r?top:bottom;positions.push(...onFace(x,y,.008));uv.push(t,r);}
   if(i<30){const k=i*2;indices.push(k,k+2,k+1,k+1,k+2,k+3);}
  }
  const eg=new THREE.BufferGeometry();eg.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));eg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));eg.setIndex(indices);eg.computeVertexNormals();mesh(eg,eyeMat,head,[0,0,0],[1,1,1],'almond_eye');
  stroke(head,upper,'ink',.0043);stroke(head,lower,'lip',.0025);
  const brow=[onFace(center-s*.079,.164),onFace(center-s*.03,.183),onFace(center+s*.067,.175)];
  stroke(head,brow,'hair',.014);
  stroke(head,[onFace(center-s*.068,.13),onFace(center,.14),onFace(center+s*.07,.132)],'lip',.002);
 }
 // Nose plane transitions are sculpted into the head; only restrained nostril marks remain.
 for(const s of [-1,1])stroke(head,[onFace(s*.041,-.13),onFace(s*.058,-.127),onFace(s*.061,-.12)],'ink',.0026);
 const upperLip=[onFace(-.108,-.237,.006),onFace(-.047,-.23,.009),onFace(0,-.235,.01),onFace(.046,-.229,.009),onFace(.105,-.233,.006)];
 stroke(head,upperLip,'lip',.009);
 stroke(head,[onFace(-.106,-.239,.018),onFace(0,-.244,.023),onFace(.105,-.236,.018)],'ink',.003);
 stroke(head,[onFace(-.067,-.258,.008),onFace(0,-.269,.009),onFace(.068,-.257,.008)],'lip',.007);
 ellipsoid(head,'ink',onFace(-.205,-.096,.008),[.004,.004,.002],'facial_mark');
 // Swept sculpted hair volumes: thinner locks, no slab-shaped fringe.
 const capG=new THREE.SphereGeometry(1,40,24,0,Math.PI*2,0,1.7);const cp=capG.attributes.position;
 for(let i=0;i<cp.count;i++){let x=cp.getX(i)*.385,y=cp.getY(i)*.40+.13,z=cp.getZ(i)*.326-.025;if(z>0)y=Math.max(y,.195+x*.06);cp.setXYZ(i,x,y,z);}capG.computeVertexNormals();
 mesh(capG,'hair',head,[0,0,0],[1,1,1],'hair_cap');
 function hairLock(x,y,z,w,h,angle){
  const sh=new THREE.Shape();sh.moveTo(-w*.5,0);sh.bezierCurveTo(-w*.4,h*.5,0,h,w*.48,h*.85);sh.quadraticCurveTo(w*.37,h*.2,w*.28,-h*.13);sh.quadraticCurveTo(0,h*.05,-w*.5,0);
  const tuft=mesh(new THREE.ExtrudeGeometry(sh,{depth:.025,bevelEnabled:true,bevelSize:.018,bevelThickness:.017,bevelSegments:2,curveSegments:14}),'hair',head,[x,y,z]);
  tuft.rotation.z=angle;
  stroke(tuft,[[-w*.32,h*.04,.047],[-w*.08,h*.31,.057],[w*.34,h*.71,.037]],'suit',.0035);
 }
 hairLock(-.275,.185,.252,.18,.21,-.6);
 hairLock(-.17,.265,.294,.23,.24,-.72);
 hairLock(-.035,.35,.255,.245,.20,-.7);
 hairLock(.11,.395,.206,.24,.16,-.45);
 hairLock(.265,.275,.19,.125,.16,.23);
 // Anatomically varied limb sections, blended at elbows/knees rather than round pads.
 for(const [side,s] of [['L',-1],['R',1]]){
  const shoulder=joints['shoulder'+side],elbow=joints['elbow'+side],wrist=joints['wrist'+side],hip=joints['hip'+side],knee=joints['knee'+side],ankle=joints['ankle'+side];
  bodySurface('upper_arm_'+side,shoulder,[[.12,.10,.12],[0,.175,.18],[-.17,.178,.16],[-.39,.155,.146],[-.62,.12,.118],[-.79,.116,.113]],'suit',elbow,-.56,-.79);
  bodySurface('forearm_'+side,elbow,[[.025,.116,.113],[-.12,.135,.13],[-.30,.121,.118],[-.5,.095,.091],[-.7,.078,.075]],'glove',wrist,-.49,-.7);
  ellipsoid(wrist,'glove',[0,-.135,.012],[.093,.16,.062],'hand_'+side);
  for(let k=0;k<4;k++){const finger=ellipsoid(wrist,'glove',[-.06+k*.04,-.265,.021],[.017,.077-(k===0||k===3?.015:0),.023],'finger');finger.rotation.z=(k-1.5)*.07;}
  const thumb=ellipsoid(wrist,'glove',[s*.087,-.116,.03],[.029,.07,.027],'thumb');thumb.rotation.z=s*.3;
  bodySurface('thigh_'+side,hip,[[.07,.215,.225],[-.1,.228,.229],[-.37,.209,.204],[-.66,.162,.174],[-.91,.129,.137],[-1.035,.125,.128]],'suit',knee,-.8,-1.035);
  bodySurface('shin_'+side,knee,[[.025,.125,.128],[-.13,.134,.138],[-.32,.149,.147],[-.53,.126,.126],[-.72,.10,.102],[-.89,.085,.095]],'suit',ankle,-.68,-.89);
  ellipsoid(ankle,'glove',[0,-.095,.12],[.115,.139,.23],'boot_'+side);
  // Narrow red panels lie close to the suit surface, not raised tubes.
  stroke(shoulder,[[s*.125,-.1,.127],[s*.106,-.35,.111],[s*.075,-.61,.105]],'red',.009);
  stroke(hip,[[s*.11,-.08,.204],[s*.095,-.45,.18],[s*.05,-.86,.121]],'red',.01);
  stroke(knee,[[s*.04,-.12,.136],[s*.065,-.34,.135],[s*.035,-.65,.104]],'red',.009);
 }
 function pose(progress=0){
  const t=THREE.MathUtils.clamp(progress,0,1);
  root.position.set(0,.15+Math.sin(t*Math.PI)*.55,0);root.rotation.set(-.2*t,-.2+.25*t,-.92*t);
  spine.rotation.set(-.12*t,0,.07*t);head.rotation.set(.07*t,.08,-.08*t);
  for(const [side,s] of [['L',-1],['R',1]]){
   joints['shoulder'+side].rotation.set((side==='L'?-.3:.16)*t,0,s*(.12+1.34*t));
   joints['elbow'+side].rotation.set(-.08-(side==='L'?.42:.18)*t,0,-s*.12*t);
   joints['wrist'+side].rotation.set(.14*t,0,s*.1*t);
   joints['hip'+side].rotation.set((side==='L'?.24:-.18)*t,0,s*(.025+.32*t));
   joints['knee'+side].rotation.set((side==='L'?.55:.26)*t,0,0);
  }root.updateMatrixWorld(true);
 }
 const tracks=[],times=[0,1,3];pose(0);const start={};for(const [n,o] of Object.entries(joints))start[n]=o.quaternion.toArray();
 pose(1);const end={};for(const [n,o] of Object.entries(joints))end[n]=o.quaternion.toArray();
 for(const [n,o] of Object.entries(joints))tracks.push(new THREE.QuaternionKeyframeTrack(o.name+'.quaternion',times,[...start[n],...end[n],...end[n]]));
 const clip=new THREE.AnimationClip('Leap_and_hold',3,tracks);pose(0);
 root.userData={character:'Steven Joe Valdez',reference:'User-supplied photo',rig:'16 bones with weighted suit surfaces',stage:'Procedural sculpt study 02; likeness still requires review'};
 return {root,joints,pose,clip,materials,meshParts,skeleton};
}


