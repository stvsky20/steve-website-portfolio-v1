import * as THREE from 'three';

export function createComicWorld(scene,camera,{reduced}){
 const backdrop=new THREE.Group();backdrop.name='Comic_surroundings';scene.add(backdrop);
 const objects=[];
 function art(kind,color){
  const c=document.createElement('canvas');c.width=700;c.height=500;const ctx=c.getContext('2d');
  ctx.fillStyle=color;ctx.fillRect(0,0,700,500);
  ctx.fillStyle='#10102025';for(let y=0;y<500;y+=16)for(let x=0;x<700;x+=16){ctx.beginPath();ctx.arc(x,y,2,0,7);ctx.fill();}
  ctx.strokeStyle='#64718c';ctx.lineWidth=12;ctx.strokeRect(8,8,684,484);
  ctx.fillStyle='#64718c';ctx.font='bold 27px monospace';ctx.fillText({systems:'IDEAS / CONNECTIONS',ui:'SKETCH / TEST / REPEAT',music:'OFF THE CLOCK',code:'MAKE SOMETHING',notes:'THINGS IN PROGRESS'}[kind],30,57);
  ctx.lineWidth=5;
  if(kind==='systems'){
   const nodes=[[65,145],[270,120],[450,240],[200,315]];
   nodes.forEach(([x,y],i)=>{ctx.strokeRect(x,y,130,82);ctx.font='bold 20px monospace';ctx.fillText(['INPUT','BUILD','OUTPUT','LEARN'][i],x+13,y+48);});
   for(const [a,b]of [[0,1],[1,2],[2,3],[3,0]]){ctx.beginPath();ctx.moveTo(nodes[a][0]+65,nodes[a][1]+40);ctx.lineTo(nodes[b][0]+65,nodes[b][1]+40);ctx.stroke();}
  }else if(kind==='ui'){
   for(let i=0;i<3;i++){const x=40+i*210;ctx.strokeRect(x,110,170,285);ctx.strokeRect(x+12,126,146,90);ctx.fillStyle='#64718c';for(let r=0;r<3;r++)ctx.fillRect(x+13,245+r*38,115-r*18,5);}
  }else if(kind==='code'){
   ctx.font='bold 36px monospace';ctx.fillText('const idea = {',45,170);ctx.fillText('  curiosity: true,',45,233);ctx.fillText('  keepBuilding: true',45,295);ctx.fillText('};',45,359);
  }else if(kind==='music'){
   ctx.beginPath();ctx.moveTo(30,265);for(let x=30;x<670;x+=8)ctx.lineTo(x,265+Math.sin(x*.049)*Math.sin(x*.011)*90);ctx.stroke();ctx.font='bold 74px monospace';ctx.fillText('PLAY / PAUSE',35,430);
  }else{
   ctx.save();ctx.translate(150,235);ctx.rotate(-.12);ctx.fillStyle='#59627b';ctx.fillRect(-90,-100,235,230);ctx.strokeRect(-90,-100,235,230);ctx.fillStyle='#64718c';ctx.font='bold 25px monospace';ctx.fillText('WHAT IF?',-65,-40);ctx.restore();
   ctx.font='bold 95px monospace';ctx.fillStyle='#64718c';ctx.fillText('?',440,310);
  }
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;
 }
 function card(kind,color,anchor,width,angle){
  const g=new THREE.Group();const m=new THREE.Mesh(new THREE.PlaneGeometry(width,width*5/7),new THREE.MeshBasicMaterial({map:art(kind,color),transparent:true,opacity:.28,depthWrite:false}));
  const echo=new THREE.Mesh(new THREE.PlaneGeometry(width*1.02,width*5/7*1.02),new THREE.MeshBasicMaterial({color:kind==='systems'?'#20d5f5':'#f32b85',transparent:true,opacity:.12,depthWrite:false}));
  echo.position.set(.1,-.1,-.06);g.add(echo,m);backdrop.add(g);objects.push({group:g,anchor:new THREE.Vector2(...anchor),width,angle,material:m.material});
 }
 card('systems','#22243c',[-.79,.16],4.7,-.17);
 card('ui','#142839',[.81,.49],4.25,.18);
 card('music','#291d37',[.8,-.47],3.8,-.14);
 card('code','#222638',[-.65,-.57],3.9,.15);
 card('notes','#291e39',[-.28,.86],3.35,-.12);
 const rings=[];
 for(let i=0;i<3;i++){
  const g=new THREE.Mesh(new THREE.TorusGeometry(8.3+i*1.4,.017+(i===0?.008:0),4,110),new THREE.MeshBasicMaterial({color:['#20d5f5','#ffb531','#f32b85'][i],transparent:true,opacity:.1,depthWrite:false}));
  backdrop.add(g);rings.push(g);
 }
 // Sparse Kirby-inspired ink clusters, arranged outside the room silhouette.
 const particles=[];
 const dotGeometry=new THREE.CircleGeometry(1,12);
 const dotMaterials=['#101020','#f32b85','#20d5f5'].map(color=>new THREE.MeshBasicMaterial({color,transparent:true,opacity:.16,depthWrite:false}));
 for(let i=0;i<30;i++){
  const mesh=new THREE.Mesh(dotGeometry,dotMaterials[i%3]);
  backdrop.add(mesh);
  particles.push({mesh,x:(i%2?1:-1)*(.8+(i%5)*.045),y:-.82+(i*37%160)/100,size:.045+(i%4)*.024,phase:i*1.7});
 }
 let destination=null,strength=0,enabled=true,clock=0,lastTime=null;

 function positionAt(x,y,distance){
  return new THREE.Vector3(x,y,.5).unproject(camera).sub(camera.position).normalize().multiplyScalar(distance).add(camera.position);
 }
 function update(time,screen){
  const delta=lastTime===null?0:Math.min(time-lastTime,64);lastTime=time;
  if(enabled&&!reduced.matches)clock+=delta;
  // Hold decorative poses at 12Hz; camera and interactions still render smoothly.
  const pose=reduced.matches?0:Math.floor(clock/ (1000/12))*(1000/12);
  const goal=destination==='pc'?1:0;
  strength=reduced.matches?goal:THREE.MathUtils.lerp(strength,goal,.075);
  const projected=screen.getWorldPosition(new THREE.Vector3()).project(camera);
  for(let i=0;i<objects.length;i++){
   const o=objects[i],drift=reduced.matches?0:Math.sin(pose*.00065+i)*.035;
   const x=THREE.MathUtils.lerp(o.anchor.x,projected.x,strength*.58),y=THREE.MathUtils.lerp(o.anchor.y+drift,projected.y,strength*.58);
   o.group.position.copy(positionAt(x,y,29));
   o.group.quaternion.copy(camera.quaternion);o.group.rotateZ(o.angle+(reduced.matches?0:Math.sin(pose*.00045+i)*.035));
   o.group.scale.setScalar(1-strength*.3);o.material.opacity=.28-strength*.12;
  }
  for(let i=0;i<rings.length;i++){
   rings[i].position.copy(positionAt(.05,0,33+i));rings[i].quaternion.copy(camera.quaternion);rings[i].rotateY(.4-i*.12+(reduced.matches?0:Math.sin(pose*.0002+i)*.12));rings[i].rotateX(.15+i*.07+(reduced.matches?0:Math.cos(pose*.00016+i)*.08));rings[i].rotateZ(reduced.matches?0:pose*.000035*(i%2?-1:1));
  }
  for(const o of particles){
   const drift=reduced.matches?0:Math.sin(pose*.00065+o.phase)*.035;
   o.mesh.position.copy(positionAt(o.x,o.y+drift,31));
   o.mesh.quaternion.copy(camera.quaternion);
   o.mesh.scale.setScalar(o.size*(reduced.matches?1:1+Math.sin(pose*.0008+o.phase)*.14));
  }
 }
 return {update,setEnabled(value){enabled=value;},get motionClock(){return clock;},setDestination(value){destination=value;},get focusStrength(){return strength;},objects};
}
