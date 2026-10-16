import * as THREE from 'three';

const colors={stone:'#667184',shadow:'#202b43',metal:'#3d5365',brick:'#665066',copper:'#8e6865',cyan:'#267e95',amber:'#b8884e'};
/** Batch dimensional architectural accents so added detail does not add a draw per part. */
export function createArchitectureDetails(root,buildings){
  const batches=new Map(),geometry={box:new THREE.BoxGeometry(1,1,1),cylinder:new THREE.CylinderGeometry(.5,.5,1,10),cone:new THREE.ConeGeometry(.5,1,10)};
  const matrix=new THREE.Matrix4(),rotation=new THREE.Quaternion();let count=0;
  function part(kind,color,position,scale,angles=[0,0,0]){
    const key=kind+'/'+color;if(!batches.has(key))batches.set(key,{kind,color,parts:[]});
    rotation.setFromEuler(new THREE.Euler(...angles));matrix.compose(new THREE.Vector3(...position),rotation,new THREE.Vector3(...scale));batches.get(key).parts.push(matrix.clone());count++;
  }
  const box=(w,h,d,x,y,z,color=colors.stone,angles)=>part('box',color,[x,y,z],[w,h,d],angles);
  function waterTower(b){const {x,z,w}=b,h=b.waterY??b.h,r=Math.min(3,w*.16),y=h+5;
    part('cylinder',colors.copper,[x-2,y,z-1],[r*2,4.4,r*2]);part('cone',colors.shadow,[x-2,y+3,z-1],[r*2.3,1.7,r*2.3]);
    for(const dy of [-1.9,-.1,1.9])part('cylinder',colors.shadow,[x-2,y+dy,z-1],[r*2+.12,.12,r*2+.12]);
    for(const dx of [-1,1])for(const dz of [-1,1])box(.18,3.1,.18,x-2+dx*r*.65,h+1.55,z-1+dz*r*.65,colors.metal);
  }
  function fireEscape(b){const {x,z,w,d}=b,h=b.roofY??b.h,inward=x>0?-1:1,edge=x+inward*(w/2+.6),levels=Math.min(12,Math.floor(h/5));
    for(let j=1;j<levels;j++){
      const y=j*5;box(1.6,.12,3.6,edge,y,z,colors.shadow);box(.08,.85,3.6,edge+inward*.72,y+.45,z,colors.metal);
      for(const dz of [-1.7,1.7])box(1.6,.08,.08,edge,y+.9,z+dz,colors.metal);
      for(const dz of [-1.6,-.8,0,.8,1.6])box(.07,.85,.07,edge+inward*.72,y+.45,z+dz,colors.metal);
      box(.12,5.1,.12,edge+inward*.3,y+2.5,z+1.15,colors.metal);box(.12,5.1,.12,edge+inward*.3,y+2.5,z+1.75,colors.metal);
      for(let rung=0;rung<10;rung++)box(.13,.07,.62,edge+inward*.3,y+rung*.5,z+1.45,colors.metal);
    }
  }
  const landmarkCounts={waterTowers:0,fireEscapes:0,crowns:0,signs:0};
  for(const b of buildings){
    const {x,z,w,d,style,index,row}=b,h=b.roofY??b.h;
    if(row>4)continue;
    // Roof equipment and varied silhouettes stay legible from the inverted camera too.
    if(style===0||style===4){waterTower(b);landmarkCounts.waterTowers++;}
    if(style===2){
      for(let tier=0;tier<3;tier++){const scale=1-tier*.2;box(w*.76*scale,2.6,d*.72*scale,x,h+1.3+tier*2.6,z,colors.stone);box(w*.79*scale,.18,d*.75*scale,x,h+2.65+tier*2.6,z,colors.shadow);}
      part('cone',colors.copper,[x,h+11,z],[w*.22,5,d*.22]);box(.1,8,.1,x,h+16,z,colors.cyan);landmarkCounts.crowns++;
    }else if(style===3){box(w*.84,.35,d*.84,x,h+.2,z,colors.metal);box(.12,9,.12,x+w*.2,h+4.7,z,colors.cyan);}
    else if(style===1||style===5){
      box(w*.35,2,d*.3,x+w*.2,h+1,z,colors.shadow);box(w*.39,.15,d*.34,x+w*.2,h+2.1,z,colors.metal);
      for(let unit=0;unit<3;unit++){box(1.4,.8,1.8,x-w*.25+unit*1.9,h+.4,z,colors.metal);for(let slat=0;slat<4;slat++)box(.95,.035,.05,x-w*.25+unit*1.9,h+.82,z-.5+slat*.3,colors.shadow);}
    }
    if(row>2)continue;
    if(style===0||style===1||style===4){
      box(w+.5,.32,d+.5,x,h-1.2,z,colors.shadow);box(w+.8,.22,d+.8,x,h-.7,z,colors.stone);
      box(w+.3,.16,d+.3,x,h*.23,z,colors.shadow);
      if(index%3!==0){fireEscape(b);landmarkCounts.fireEscapes++;}
    }
    if(style===2){
      const columns=5;
      for(let col=0;col<columns;col++){const px=x+(col/(columns-1)-.5)*w*.82;box(.18,h*.52,.38,px,h*.3,z+d*.5+.12,style===3?colors.metal:colors.stone);}
      if(style===2)for(const y of [h*.18,h*.7,h*.91])box(w*.9,.28,.6,x,y,z+d*.5+.12,colors.shadow);
    }
    // Recessed bay frames give the closest masonry/loft facades physical relief.
    if(style===0||style===1){
      const columns=style===0?3:4,step=style===0?4.8:5.8,ww=w*.68/columns;
      for(let y=7;y<h-5;y+=step)for(let col=0;col<columns;col++){
        const px=x+(col/(columns-1)-.5)*w*.72,front=z+d*.5+.1;
        box(ww,.14,.4,px,y-1.3,front,colors.stone);box(.1,2.6,.25,px-ww*.48,y,front,colors.shadow);box(.1,2.6,.25,px+ww*.48,y,front,colors.shadow);
      }
    }
    if(index%7===0){
      const c=document.createElement('canvas');c.width=512;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle='#101020';ctx.fillRect(0,0,512,256);ctx.strokeStyle=index%2?'#20d5f5':'#f32b85';ctx.lineWidth=16;ctx.strokeRect(12,12,488,232);ctx.fillStyle='#f3e7cf';ctx.font='900 92px Impact, sans-serif';ctx.textAlign='center';ctx.fillText(['MAKE','IDEAS','BUILD'][index%3],256,148);ctx.fillStyle='#ffb531';ctx.font='bold 23px monospace';ctx.fillText('A DIFFERENT PERSPECTIVE',256,202);
      const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;
      const sign=new THREE.Mesh(new THREE.PlaneGeometry(w*.66,w*.33),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}));sign.name='Original_rooftop_billboard';sign.position.set(x,h+5,z);root.add(sign);
      for(const dx of [-w*.23,w*.23])box(.18,5,.18,x+dx,h+2.5,z,colors.shadow);landmarkCounts.signs++;
    }
  }
  const detailRoot=new THREE.Group();detailRoot.name='Batched_architectural_details';root.add(detailRoot);
  for(const batch of batches.values()){
    const mesh=new THREE.InstancedMesh(geometry[batch.kind],new THREE.MeshBasicMaterial({color:batch.color}),batch.parts.length);mesh.name='Architecture_'+batch.kind+'_'+batch.color;
    batch.parts.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();detailRoot.add(mesh);
    const contour=new THREE.InstancedMesh(geometry[batch.kind],new THREE.MeshBasicMaterial({color:'#101020',side:THREE.BackSide}),batch.parts.length);
    const position=new THREE.Vector3(),scale=new THREE.Vector3(),quaternion=new THREE.Quaternion();
    batch.parts.forEach((m,i)=>{m.decompose(position,quaternion,scale);scale.multiplyScalar(1.025);matrix.compose(position,quaternion,scale);contour.setMatrixAt(i,matrix);});
    contour.instanceMatrix.needsUpdate=true;contour.computeBoundingSphere();detailRoot.add(contour);
  }
  return{root:detailRoot,partCount:count,batchCount:batches.size,landmarkCounts};
}
