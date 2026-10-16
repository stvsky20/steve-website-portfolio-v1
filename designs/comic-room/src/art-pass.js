import * as THREE from 'three';
import {boardNotes} from './board-view.js';

export function refineWorkspace({room,desk,chair,board,boardFront,screen,monitor,mats,comic,texture,model,box,plane,cylinder}) {
  const ink='#101020',cyan='#20d5f5',pink='#f32b85',amber='#ffb531';
  const solid=c=>new THREE.MeshBasicMaterial({color:c});
  function stroke(points,color=ink,radius=.012,parent=desk) {
    const path=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
    const mesh=new THREE.Mesh(new THREE.TubeGeometry(path,Math.max(2,points.length*3),radius,4,false),solid(color));
    parent.add(mesh);return mesh;
  }
  // Move the entire authored workstation to the side wall.
  const station=new THREE.Group();station.rotation.y=Math.PI/2;station.position.set(-.95,0,-2.1);
  room.add(station);station.add(desk,chair);
  const boardGroup=new THREE.Group();boardGroup.userData.destination='about';station.add(boardGroup);boardGroup.add(board,boardFront);
  boardFront.material.map=texture((c,w,h)=>{
    c.fillStyle='#936031';c.fillRect(0,0,w,h);
    c.fillStyle='#47303d';for(let y=0;y<h;y+=24)for(let x=0;x<w;x+=24){c.beginPath();c.arc(x,y,3,0,7);c.fill();}
    c.strokeStyle='#e0a955';c.lineWidth=12;c.strokeRect(12,12,w-24,h-24);
  });
  board.rotation.z=-.013;boardFront.rotation.z=-.013;
  // Individually rotated paper cards, curled corners, graphic diagrams, and actual pins.
  const cards=[
    [-3.83,3.58,.66,.7,-.08,'BUILD / BREAK',amber],
    [-3.02,3.54,.75,.68,.055,'WHO AM I?',pink],
    [-2.2,3.58,.57,.67,-.05,'NOTES','#f3e7cf'],
    [-1.49,3.53,.63,.72,.075,'SYSTEM MAP',cyan],
    [-3.62,3.03,.86,.34,.04,'ALWAYS LEARNING','#f3e7cf'],
    [-2.48,3.02,.92,.36,-.04,'HELLO, WORLD',amber],
    [-1.48,3.04,.65,.28,-.07,'TRY AGAIN',pink]
  ];
  for(let i=0;i<cards.length;i++){
    const [x,y,w,h,angle,title,color]=cards[i];
    const paperMap=texture((c,cw,ch)=>{
      c.fillStyle=color;c.fillRect(0,0,cw,ch);c.strokeStyle=ink;c.lineWidth=10;c.strokeRect(5,5,cw-10,ch-10);
      c.fillStyle=ink;c.font='bold 43px monospace';c.fillText(boardNotes[i].title,25,76);
      c.lineWidth=6;
      const note=boardNotes[i];
      if(i===3){
        for(let k=0;k<3;k++){const bx=30+k*200,by=190+(k%2)*60;c.strokeRect(bx,by,170,95);c.beginPath();c.moveTo(bx+170,by+48);c.lineTo(bx+200,by+48);c.stroke();c.font='bold 27px monospace';c.fillText(note.lines[k],bx+10,by+58);}
      }else if(h>.4){
        c.fillStyle=ink;
        note.lines.forEach((text,k)=>{c.font=(i===1?'bold 58px':'bold 39px')+' monospace';c.fillText(text,25,180+k*95);});
      }else{
        c.fillStyle=ink;c.font='bold 35px monospace';c.fillText(note.lines[0],25,255);
      }
      c.fillStyle='#10102044';for(let py=ch*.65;py<ch;py+=20)for(let px=0;px<cw;px+=20){c.beginPath();c.arc(px,py,2.5,0,7);c.fill();}
    },640,512);
    const paper=plane(w,h,x,y,-3.74-i*.004,paperMap,boardGroup);paper.rotation.z=angle;
    const fold=new THREE.Shape();fold.moveTo(0,0);fold.lineTo(.12,0);fold.lineTo(.12,-.1);fold.closePath();
    const corner=new THREE.Mesh(new THREE.ShapeGeometry(fold),solid('#c1b1ab'));corner.position.set(w/2-.12,h/2,-.002);paper.add(corner);
    const pin=new THREE.Mesh(new THREE.SphereGeometry(.025,8,6),solid(i%2?cyan:pink));pin.position.set(x,y+h*.43,-3.7-i*.004);boardGroup.add(pin);
  }
  // Chunkier screen silhouette, print echoes restricted to the casing.
  const corners=[[-3.25,2.99,-3.035],[-1.03,3.02,-3.035],[-1.01,1.7,-3.035],[-3.27,1.71,-3.035],[-3.25,2.99,-3.035]];
  stroke(corners,ink,.025);
  stroke([[-3.24,3.018,-3.026],[-1.02,3.043,-3.026],[-.99,2.74,-3.026]],cyan,.016);
  stroke([[-3.29,2.96,-3.02],[-3.31,1.68,-3.02],[-2.76,1.67,-3.02]],pink,.012);
  for(let k=0;k<3;k++)stroke([[-1.16+k*.045,1.76,-3.016],[-1.14+k*.045,1.82,-3.016]],cyan,.006);
  // Desk's uneven ink edge, scuffs, seams, structural braces.
  stroke([[-4.52,1.58,-2.13],[-3.9,1.574,-2.15],[-2.5,1.59,-2.13],[-.59,1.578,-2.12]],ink,.022);
  stroke([[-4.49,1.602,-3.64],[-3.3,1.6,-3.62],[-1.6,1.6,-3.64],[-.59,1.6,-3.61]],amber,.012);
  for(let k=0;k<7;k++)stroke([[-4.18+k*.085,1.577,-2.21],[-4.09+k*.085,1.58,-2.34]],ink,.006);
  for(const x of [-4.2,-.9])stroke([[x,.15,-3.4],[x,1.42,-2.35]],ink,.023);
  // Lamp now has a drawn, dimensional articulated arm.
  stroke([[-4,1.7,-2.6],[-4.09,2.35,-2.8],[-3.72,2.7,-2.7]],ink,.034);
  stroke([[-3.965,1.73,-2.58],[-4.05,2.35,-2.78],[-3.70,2.69,-2.68]],amber,.01);
  // Tower vents, screws and a cut-paper sticker.
  for(let k=0;k<5;k++)stroke([[-.55,1.9+k*.105,-3.45],[-.55,1.9+k*.105,-3.12]],ink,.01);
  const sticker=plane(.26,.18,-.84,2.47,-2.721,texture((c,w,h)=>{c.fillStyle=amber;c.fillRect(0,0,w,h);c.fillStyle=ink;c.font='bold 180px monospace';c.fillText('BUILD',25,300);}),desk);sticker.rotation.z=-.1;
  // Hand-drawn notebook band and mug handle.
  stroke([[-3.76,1.65,-3.34],[-3.31,1.65,-3.32]],cyan,.014);
  const handle=new THREE.Mesh(new THREE.TorusGeometry(.095,.022,4,12),solid(ink));handle.position.set(-3.2,1.76,-2.4);desk.add(handle);
  // Chair's tapered planes, upholstery seams and thicker arm contours.
  const chairMeshes=chair.children.filter(o=>o.isMesh&&o.geometry.type==='BoxGeometry');
  for(const mesh of chairMeshes){if(mesh.geometry.parameters.height>.6&&mesh.geometry.parameters.width>.7){const pos=mesh.geometry.attributes.position;for(let i=0;i<pos.count;i++){if(pos.getY(i)>0)pos.setX(i,pos.getX(i)*.85);}mesh.geometry.computeVertexNormals();pos.needsUpdate=true;}}
  for(const x of [-.59,.59])stroke([[x,1.35,-.29],[x,1.35,.27]],ink,.025,chair);
  stroke([[-.36,1.25,-.267],[-.32,1.81,-.267],[.3,1.81,-.267],[.36,1.25,-.267]],cyan,.01,chair);
  // Designed monitor/lamp light wedges and dark leg shadows.
  function floorPatch(points,color,opacity,y=.059){
    const shape=new THREE.Shape();points.forEach((p,i)=>i?shape.lineTo(p[0],p[1]):shape.moveTo(p[0],p[1]));shape.closePath();
    const mesh=new THREE.Mesh(new THREE.ShapeGeometry(shape),new THREE.MeshBasicMaterial({color,transparent:true,opacity,side:THREE.DoubleSide,depthWrite:false}));mesh.rotation.x=-Math.PI/2;mesh.position.y=y;room.add(mesh);
  }
  floorPatch([[-4.6,-.7],[-3.3,-1.2],[-.7,-.8],[-.1,2.8],[-2.3,3.2]],cyan,.25);
  floorPatch([[-4.6,1.4],[-3.5,.8],[-1.4,3.1],[-4.3,3.4]],amber,.21,.061);
  floorPatch([[-4.2,1.9],[-3.6,1.8],[-1.6,3.4],[-2.4,3.4]],ink,.65,.064);
  floorPatch([[-3.5,-1.5],[-3.2,-1.4],[-1.2,.4],[-1.5,.6]],ink,.65,.064);
  // Surface patches follow the side wall; their coarse print pattern reads in the overview.
  const lightMap=texture((c,w,h)=>{
    c.fillStyle='#202946';c.fillRect(0,0,w,h);
    c.fillStyle='#db952d';c.beginPath();c.moveTo(0,h);c.lineTo(0,h*.12);c.lineTo(w*.58,h*.38);c.lineTo(w*.8,h);c.fill();
    c.fillStyle='#20d5f5';c.beginPath();c.moveTo(w*.48,h);c.lineTo(w*.63,h*.42);c.lineTo(w,h*.15);c.lineTo(w,h);c.fill();
    c.fillStyle='#10102077';for(let y=0;y<h;y+=26)for(let x=0;x<w;x+=26){c.beginPath();c.arc(x,y,3+(y/h)*3,0,7);c.fill();}
    c.strokeStyle='#10102088';c.lineWidth=3;for(let x=0;x<w;x+=55){c.beginPath();c.moveTo(x,h);c.lineTo(x+80,h*.65);c.stroke();}
  });
  const wallPatch=plane(4.75,3.03,-4.895,1.57,.42,lightMap);wallPatch.rotation.y=Math.PI/2;
  // Highlight edges vary in length; no global chromatic aberration.
  stroke([[-4.875,3.95,2.34],[-4.875,3.93,1.3],[-4.875,3.97,.95]],cyan,.013,room);
  room.updateMatrixWorld(true);
  return station;
}
