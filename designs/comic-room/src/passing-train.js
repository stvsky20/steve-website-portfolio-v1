import * as THREE from 'three';

export function createPassingTrain(scene){
  const train=new THREE.Group();train.name='Passing_subway_train';train.position.set(-38,0,-87.5);train.visible=false;scene.add(train);
  const ink='#101020';
  const canvas=document.createElement('canvas');canvas.width=1600;canvas.height=800;
  const c=canvas.getContext('2d');
  c.fillStyle='#b7c8ca';c.fillRect(0,0,1600,800);
  c.fillStyle='#10102028';for(let y=0;y<800;y+=14)for(let x=0;x<1600;x+=14){c.beginPath();c.arc(x,y,1.8,0,7);c.fill();}
  c.fillStyle='#20d5f5';c.fillRect(0,530,1600,30);c.fillStyle='#f32b85';c.fillRect(0,564,1600,10);
  // Flat, opaque windows keep the destination concealed during the wipe.
  for(const x of [65,405,1060,1340]){
    c.fillStyle=ink;c.fillRect(x,165,220,280);c.fillStyle='#233f57';c.fillRect(x+12,177,196,255);
    c.fillStyle='#20d5f544';c.beginPath();c.moveTo(x+30,180);c.lineTo(x+160,180);c.lineTo(x+210,300);c.lineTo(x+80,300);c.fill();
    c.strokeStyle='#ffb531';c.lineWidth=4;c.beginPath();c.moveTo(x+120,190);c.lineTo(x+120,410);c.stroke();
  }
  c.fillStyle='#8a9fa9';c.fillRect(700,95,280,580);c.strokeStyle=ink;c.lineWidth=8;c.strokeRect(700,95,280,580);
  c.beginPath();c.moveTo(840,95);c.lineTo(840,675);c.stroke();
  for(const x of [725,855]){c.fillStyle=ink;c.fillRect(x,170,100,255);c.fillStyle='#294654';c.fillRect(x+9,179,82,237);}
  c.fillStyle=ink;c.fillRect(66,40,540,68);c.fillStyle='#ffb531';c.font='bold 42px monospace';c.fillText('03 / NEXT CHAPTER',90,89);
  c.fillStyle=ink;c.font='bold 33px monospace';c.fillText('SJV / CONNECTIONS LINE',1035,92);
  c.lineWidth=3;c.strokeStyle='#10102066';for(let y=625;y<760;y+=30){c.beginPath();c.moveTo(20,y);c.lineTo(1580,y);c.stroke();}
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;
  const panelMaterial=new THREE.MeshBasicMaterial({map});
  function box(parent,w,h,d,x,y,z,color){
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({color}));m.position.set(x,y,z);parent.add(m);
    m.add(new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry),new THREE.LineBasicMaterial({color:ink})));return m;
  }
  for(let i=0;i<3;i++){
    const car=new THREE.Group();car.name='Train_car_'+(i+1);car.position.x=(i-1)*9.25;train.add(car);
    box(car,9,4.7,2.5,0,.65,0,'#98acb7');
    box(car,9.04,.13,2.54,0,3.02,0,ink);
    const face=new THREE.Mesh(new THREE.PlaneGeometry(8.98,4.65),panelMaterial);face.position.set(0,.65,1.26);car.add(face);
    for(const x of [-3,3]){
      box(car,1.4,.45,2.1,x,-1.64,0,ink);
      for(const z of [-.96,.96]){
        const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.36,.36,.18,12),new THREE.MeshBasicMaterial({color:ink}));
        wheel.rotation.x=Math.PI/2;wheel.position.set(x,-1.64,z);car.add(wheel);
      }
    }
    if(i<2)box(car,.28,2.8,1.65,4.63,.35,0,ink);
  }
  // Authored smear marks: hard graphic echoes instead of a blurred image.
  const smears=new THREE.Group();smears.name='Train_drawn_smear_frames';train.add(smears);
  const echoLayers=[];
  for(let layer=0;layer<2;layer++){
    const points=[];
    for(let car=0;car<3;car++){
      const x=(car-1)*9.25;
      for(const [left,right,bottom,top]of [[-4.5,4.5,-1.7,3],[-3.8,-2.55,.3,1.95],[-1.9,-.65,.3,1.95],[1.65,2.9,.3,1.95]]){
        for(const [a,b]of [[[left,bottom],[left,top]],[[left,top],[right,top]],[[right,top],[right,bottom]]]){
          points.push(new THREE.Vector3(x+a[0],a[1],1.28+layer*.01),new THREE.Vector3(x+b[0],b[1],1.28+layer*.01));
        }
      }
    }
    const echo=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:layer?'#f32b85':'#20d5f5',transparent:true,opacity:.52,depthWrite:false}));
    smears.add(echo);echoLayers.push(echo);
  }
  const strokes=[];
  for(let i=0;i<15;i++){
    const y=-1.4+i*.3,x=-13.8-(i%3)*.25,length=1.4+(i%5)*.75;
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x-length,y,1.3),new THREE.Vector3(x,y+.03*(i%2?1:-1),1.3)
    ]),new THREE.LineBasicMaterial({color:['#f3e7cf','#20d5f5','#f32b85'][i%3],transparent:true,opacity:.8,depthWrite:false}));
    smears.add(line);strokes.push(line);
  }
  // Clip against fixed station-space boundaries, not the moving car transforms.
  // This includes opaque faces, contour echoes and trailing lines.
  const trackClipping=[
    new THREE.Plane(new THREE.Vector3(1,0,0),6),
    new THREE.Plane(new THREE.Vector3(-1,0,0),6)
  ];
  train.traverse(object=>{
    if(!object.material)return;
    const materials=Array.isArray(object.material)?object.material:[object.material];
    materials.forEach(material=>{material.clippingPlanes=trackClipping;material.needsUpdate=true;});
  });
  let smearPose=0;
  return{
    group:train,
    update(progress,{smearEnabled=true}={}){
      train.visible=progress>=0&&progress<1;
      train.position.x=-38+76*Math.max(0,Math.min(1,progress));
      // Only illustration poses are held on twos; camera and train travel stay in sync.
      smearPose=Math.floor(Math.max(0,progress)*1.82*12);
      smears.visible=train.visible&&smearEnabled;
      echoLayers.forEach((echo,i)=>{echo.position.x=-(.3+i*.5+(smearPose%3)*.12);});
      strokes.forEach((line,i)=>{line.position.x=-(smearPose%3)*.15;line.visible=(i+smearPose)%4!==0;});
    },
    get smearPose(){return smearPose;},smears,trackClipping,
    reset(){train.visible=false;smears.visible=false;train.position.x=-38;}
  };
}
