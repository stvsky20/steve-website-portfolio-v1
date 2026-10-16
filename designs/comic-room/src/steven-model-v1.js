import * as THREE from 'three';

// Editable geometry and a transform hierarchy: not a scanned face or skinned production rig.
export function createSteven() {
  const root=new THREE.Group();root.name='Steven_Joe_Valdez';
  const palette={ink:'#101020',suit:'#192032',red:'#e83852',skin:'#bb7c59',hair:'#181824',cyan:'#20d5f5',paper:'#f3e7cf'};
  const materials={};
  for(const [name,color] of Object.entries(palette))materials[name]=new THREE.MeshStandardMaterial({color,roughness:.96,metalness:0});
  const meshParts=[];
  function mesh(geo,mat,parent,pos=[0,0,0],scale=[1,1,1],name='') {
    const m=new THREE.Mesh(geo,materials[mat]||mat);m.position.set(...pos);m.scale.set(...scale);m.name=name;parent.add(m);meshParts.push(m);
    if(mat!=='ink'&&mat!=='cyan'){
      const outline=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:palette.ink,side:THREE.BackSide}));outline.scale.setScalar(1.028);outline.name='ink_contour';outline.userData.outline=true;m.add(outline);
    }
    return m;
  }
  function ellipsoid(parent,mat,pos,scale,name=''){return mesh(new THREE.SphereGeometry(1,20,14),mat,parent,pos,scale,name);}
  function joint(name,parent,pos){const g=new THREE.Group();g.name=name;g.position.set(...pos);parent.add(g);return g;}
  function stroke(parent,points,mat='ink',radius=.012){
    const path=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
    return mesh(new THREE.TubeGeometry(path,Math.max(4,points.length*4),radius,5,false),mat,parent);
  }
  function tapered(parent,mat,y,length,top,bottom,depth,name){
    const g=new THREE.CylinderGeometry(top,bottom,length,12,1,false);const m=mesh(g,mat,parent,[0,y,0],[1,1,depth],name);return m;
  }
  const hips=joint('hips',root,[0,2.35,0]);
  ellipsoid(hips,'suit',[0,0,0],[.46,.33,.28],'pelvis');
  const spine=joint('spine',hips,[0,.17,0]);
  tapered(spine,'suit',.61,1.32,.56,.4,.56,'torso');
  ellipsoid(spine,'red',[-.51,1.1,0],[.19,.19,.31],'left_shoulder_patch');
  ellipsoid(spine,'red',[.51,1.1,0],[.19,.19,.31],'right_shoulder_patch');
  // Chest emblem: geometric abdomen plus eight drawn legs.
  ellipsoid(spine,'red',[0,.91,.344],[.07,.14,.017],'spider_body');
  ellipsoid(spine,'red',[0,1.07,.345],[.047,.047,.017],'spider_head');
  for(const s of [-1,1])for(let i=0;i<4;i++){
    const y=.98-i*.075;
    stroke(spine,[[s*.05,y,.343],[s*(.18+i*.026),y+.06,.32],[s*(.36+i*.018),y+(i<2?.3:-.29),.275]],'red',.017);
  }
  // Red side ribs and seam lines remain separate editable geometry.
  for(const s of [-1,1]){
    stroke(spine,[[s*.56,1.13,.18],[s*.43,.71,.23],[s*.34,.13,.24]],'red',.035);
    stroke(spine,[[s*.34,.14,.25],[s*.47,.63,.28],[s*.57,1.05,.23]],'cyan',.007);
  }
  const neck=joint('neck',spine,[0,1.36,0]);
  tapered(neck,'skin',.08,.23,.16,.18,.95,'neck');
  const head=joint('head',neck,[0,.55,0]);
  // Face sculpt uses a tapered chin, broad upper cheeks, and longer nose from the supplied reference.
  const face=ellipsoid(head,'skin',[0,-.01,0],[.385,.49,.33],'face');
  const p=face.geometry.attributes.position;
  for(let i=0;i<p.count;i++){const y=p.getY(i);if(y<-.1)p.setX(i,p.getX(i)*(1+y*.19));}p.needsUpdate=true;face.geometry.computeVertexNormals();
  for(const s of [-1,1]){
    ellipsoid(head,'skin',[s*.365,-.02,-.03],[.07,.125,.055],'ear');
    stroke(head,[[s*.371,.045,.025],[s*.389,-.02,.027],[s*.368,-.07,.02]],'ink',.006);
    ellipsoid(head,'paper',[s*.145,.085,.299],[.113,.052,.027],'eye_white');
    ellipsoid(head,'ink',[s*.145,.079,.326],[.04,.043,.019],'iris');
    ellipsoid(head,'paper',[s*.132,.094,.343],[.011,.012,.006],'eye_highlight');
    stroke(head,[[s*.245,.105,.31],[s*.17,.132,.329],[s*.083,.106,.328]],'ink',.01);
    stroke(head,[[s*.252,.19,.285],[s*.17,.208,.318],[s*.075,.183,.328]],'hair',.027);
    stroke(head,[[s*.25,-.095,.264],[s*.29,-.18,.23],[s*.21,-.245,.24]],'ink',.005);
  }
  const nose=mesh(new THREE.ConeGeometry(.057,.235,4),'skin',head,[0,-.013,.356],[.9,1,1.3],'nose');
  nose.rotation.x=.28;
  ellipsoid(head,'skin',[0,-.106,.387],[.053,.031,.026],'nose_tip');
  stroke(head,[[-.05,-.12,.398],[-.075,-.13,.371]],'ink',.005);
  stroke(head,[[.05,-.12,.398],[.075,-.13,.371]],'ink',.005);
  stroke(head,[[-.115,-.25,.276],[0,-.266,.3],[.105,-.249,.275]],'ink',.008);
  stroke(head,[[-.073,-.289,.269],[0,-.3,.284],[.066,-.285,.265]],'skin',.013);
  ellipsoid(head,'ink',[-.24,-.125,.271],[.008,.008,.004],'facial_mark');
  ellipsoid(head,'ink',[.075,-.11,.349],[.007,.007,.003],'facial_mark');
  // Swept dark hair cap, then pointed sculpted locks across the forehead.
  mesh(new THREE.SphereGeometry(1,22,12,0,Math.PI*2,0,1.35),'hair',head,[0,.1,-.035],[.415,.5,.37],'hair_cap');
  function lock(x,y,z,w,h,angle){
    const shape=new THREE.Shape();shape.moveTo(-w*.5,0);shape.quadraticCurveTo(-w*.58,h*.65,w*.4,h);shape.quadraticCurveTo(w*.82,h*.28,w*.2,-h*.1);shape.quadraticCurveTo(0,h*.13,-w*.5,0);
    const tuft=mesh(new THREE.ExtrudeGeometry(shape,{depth:.08,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.016,bevelThickness:.012,curveSegments:8}),'hair',head,[x,y,z]);tuft.rotation.z=angle;
    stroke(tuft,[[-w*.25,h*.1,.11],[0,h*.42,.115],[w*.32,h*.77,.1]],'suit',.007);
  }
  lock(-.26,.255,.245,.25,.23,-.65);
  lock(-.13,.31,.255,.27,.25,-.6);
  lock(.015,.38,.23,.3,.22,-.52);
  lock(.16,.425,.19,.28,.18,-.4);
  lock(.28,.295,.2,.16,.2,.25);
  // Limbs are parented at shoulders/elbows/wrists and hips/knees/ankles.
  const joints={root,hips,spine,neck,head};
  for(const [side,s] of [['L',-1],['R',1]]){
    const shoulder=joint('shoulder_'+side,spine,[s*.63,1.12,0]);joints['shoulder'+side]=shoulder;
    tapered(shoulder,'suit',-.36,.73,.16,.13,1,'upper_arm_'+side);
    const elbow=joint('elbow_'+side,shoulder,[0,-.75,0]);joints['elbow'+side]=elbow;
    ellipsoid(elbow,'red',[0,0,0],[.13,.13,.13],'elbow');
    tapered(elbow,'red',-.33,.67,.13,.09,1,'forearm_'+side);
    const wrist=joint('wrist_'+side,elbow,[0,-.68,0]);joints['wrist'+side]=wrist;
    ellipsoid(wrist,'red',[0,-.14,.012],[.12,.19,.082],'hand_'+side);
    for(let k=0;k<4;k++)ellipsoid(wrist,'red',[-.074+k*.049,-.29,.02],[.024,.11,.034],'finger');
    ellipsoid(wrist,'red',[s*.115,-.105,.025],[.047,.1,.04],'thumb');
    for(let k=0;k<5;k++)stroke(elbow,[[-.085,-.11-k*.105,.089],[0,-.09-k*.105,.129],[.085,-.11-k*.105,.089]],'ink',.005);
    const hip=joint('hip_'+side,hips,[s*.27,-.1,0]);joints['hip'+side]=hip;
    tapered(hip,'suit',-.48,.98,.23,.155,.93,'thigh_'+side);
    const knee=joint('knee_'+side,hip,[0,-.98,0]);joints['knee'+side]=knee;
    ellipsoid(knee,'red',[0,-.015,.025],[.155,.14,.16],'knee');
    tapered(knee,'suit',-.43,.88,.16,.105,1,'shin_'+side);
    const ankle=joint('ankle_'+side,knee,[0,-.88,0]);joints['ankle'+side]=ankle;
    ellipsoid(ankle,'red',[0,-.1,.13],[.13,.17,.3],'boot_'+side);
    stroke(hip,[[s*.12,-.08,.16],[s*.14,-.45,.17],[s*.075,-.92,.13]],'red',.018);
    stroke(knee,[[0,-.09,.16],[s*.035,-.48,.15],[0,-.83,.11]],'red',.022);
    for(let k=0;k<4;k++)stroke(ankle,[[-.1,-.02,.1+k*.045],[0,.01,.16+k*.045],[.1,-.02,.1+k*.045]],'ink',.005);
  }
  function pose(progress=0) {
    const t=THREE.MathUtils.clamp(progress,0,1);
    root.position.set(0,.15+Math.sin(t*Math.PI)*.55,0);root.rotation.set(-.2*t,-.2+.25*t,-.92*t);
    spine.rotation.set(-.12*t,0,.07*t);head.rotation.set(.07*t,.08,-.08*t);
    for(const [side,s] of [['L',-1],['R',1]]){
      joints['shoulder'+side].rotation.set((side==='L'?-.3:.16)*t,0,s*(.12+1.34*t));
      joints['elbow'+side].rotation.set(-.08-(side==='L'?.42:.18)*t,0,-s*.12*t);
      joints['wrist'+side].rotation.set(.14*t,0,s*.1*t);
      joints['hip'+side].rotation.set((side==='L'?.24:-.18)*t,0,s*(.025+.32*t));
      joints['knee'+side].rotation.set((side==='L'?.55:.26)*t,0,0);
    }
    root.updateMatrixWorld(true);
  }
  pose(0);
  // Transform tracks remain editable and export with the hierarchy.
  const tracks=[],times=[0,1,3];
  pose(0);const start={};for(const [name,obj] of Object.entries(joints))start[name]=obj.quaternion.toArray();
  pose(1);const end={};for(const [name,obj] of Object.entries(joints))end[name]=obj.quaternion.toArray();
  for(const [name,obj] of Object.entries(joints))tracks.push(new THREE.QuaternionKeyframeTrack(obj.name+'.quaternion',times,[...start[name],...end[name],...end[name]]));
  const clip=new THREE.AnimationClip('Leap_and_hold',3,tracks);pose(0);
  root.userData={character:'Steven Joe Valdez',reference:'User-supplied face photo',rig:'Hierarchical transform joints; no skin weights',stage:'Rough procedural likeness study'};
  return {root,joints,pose,clip,materials,meshParts};
}

