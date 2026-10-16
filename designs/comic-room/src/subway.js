import * as THREE from 'three';

// Original station geometry and mural artwork, informed by subway production concepts.
export function createSubwayDestination(scene){
  const root=new THREE.Group();root.name='Graffiti_subway_station';scene.add(root);
  const ink='#101020',cyan='#20d5f5',pink='#f32b85',amber='#ffb531';
  function box(w,h,d,x,y,z,color,outline=true){
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({color}));
    mesh.position.set(x,y,z);root.add(mesh);
    if(outline)mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry),new THREE.LineBasicMaterial({color:ink})));
    return mesh;
  }
  function texture(w,h,draw){
    const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;draw(canvas.getContext('2d'),w,h);
    const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;return map;
  }
  function plane(w,h,x,y,z,map){
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map}));
    mesh.position.set(x,y,z);root.add(mesh);return mesh;
  }
  const tiles=texture(2048,768,(c,w,h)=>{
    c.fillStyle='#738f93';c.fillRect(0,0,w,h);
    c.lineWidth=4;c.strokeStyle='#203c48';
    for(let y=0;y<h;y+=72){for(let x=-64;x<w;x+=128){c.strokeRect(x+(y/72%2)*64,y,128,72);}}
    c.fillStyle='#27344645';for(let i=0;i<95;i++){const x=i*197%w,y=i*67%h;c.fillRect(x,y,24+i%40,3);}
    c.fillStyle='#10102035';for(let y=0;y<h;y+=15)for(let x=0;x<w;x+=15){c.beginPath();c.arc(x,y,1.8,0,7);c.fill();}
  });
  box(24,7,.3,0,1.6,-98.2,'#253b48');
  plane(23.8,6.8,0,1.6,-98.03,tiles);
  box(24,.35,8,0,-1.7,-95,'#334650');
  box(24,.15,1,0,-1.46,-91,amber);
  for(let x=-11.5;x<12;x+=.34)box(.05,.012,.75,x,-1.377,-91,ink,false);
  // Tracks cross the foreground, with sleepers and a second rail.
  box(24,.1,6,0,-2.13,-87.5,'#18202d');
  for(let x=-12;x<12;x+=.7)box(.27,.1,4.8,x,-2.02,-87.5,'#4c3e50');
  for(const z of [-86,-89]){
    box(24,.13,.13,0,-1.89,z,'#97bcc6');
    box(24,.035,.04,0,-1.81,z,cyan,false);
  }
  // Track mouths provide a physical offstage for the passing train.
  // Their front walls occlude the approach while the camera is still far away.
  const trackMouths=new THREE.Group();trackMouths.name='Track_tunnel_mouths';root.add(trackMouths);
  for(const side of [-1,1]){
    const shell=box(22,5.8,.28,side*17,.65,-85.86,'#182a3c');trackMouths.attach(shell);
    const roof=box(22,.28,3.7,side*17,3.69,-87.5,'#263e4d');trackMouths.attach(roof);
    const rear=box(22,5.8,.2,side*17,.65,-89.35,'#0a1020');trackMouths.attach(rear);
    const jamb=box(.32,5.8,.48,side*6,.65,-85.71,'#355566');trackMouths.attach(jamb);
    const edge=box(.07,5.5,.035,side*5.86,.65,-85.45,ink,false);trackMouths.attach(edge);
    const mark=box(.16,.8,.04,side*6,2.8,-85.44,amber,false);trackMouths.attach(mark);
  }
  for(let x=-12;x<=12;x+=2)box(.025,.012,10,x,-1.514,-94,ink,false);
  for(let z=-90;z>-100;z-=1.4)box(24,.012,.025,0,-1.514,z,ink,false);
  // Dimensional columns, steel beams, pipes and fluorescent lights.
  box(24,.22,15,0,5.1,-92,'#15283a');
  for(const x of [-9,9])for(const z of [-89.7,-95.6]){
    box(.6,6.5,.6,x,1.7,z,'#2b6570');
    box(.8,.2,.8,x,-1.37,z,ink);
    box(.67,.08,.66,x,.2,z,pink,false);
  }
  for(const z of [-88.8,-93,-97]){
    box(24,.42,.3,0,4.8,z,'#355566');
    for(const x of [-5,3]){box(3.8,.1,.3,x,4.48,z,ink);box(3.5,.025,.16,x,4.41,z,'#8ef4ec',false);}
  }
  for(const x of [-10.5,10.5])box(.13,.13,14,x,4.1,-92,amber);
  // Empty platform bench and a small discarded newspaper.
  box(4.1,.16,.8,-5.5,-.75,-94.8,'#9f345c');
  box(4.1,.8,.12,-5.5,-.23,-95.15,'#9f345c');
  for(const x of [-7,-4])box(.13,.7,.6,x,-1.13,-94.8,ink);
  const paper=box(.65,.012,.4,-3,-1.49,-90.5,'#f3e7cf');paper.rotation.y=.3;
  const mural=texture(1536,680,(c,w,h)=>{
    c.fillStyle='#192239';c.fillRect(0,0,w,h);
    const colors=[cyan,pink,amber];
    for(let i=0;i<65;i++){
      c.fillStyle=colors[i%3];c.globalAlpha=.35;
      c.beginPath();c.arc((i*211)%w,(i*131)%h,25+(i%7)*16,0,7);c.fill();
    }c.globalAlpha=1;
    c.save();c.translate(55,50);c.rotate(-.035);
    c.font='900 172px Impact, sans-serif';c.lineJoin='round';
    function word(text,x,y){
      c.lineWidth=22;c.strokeStyle=ink;c.strokeText(text,x+9,y+12);
      c.fillStyle=pink;c.fillText(text,x+10,y+8);
      c.strokeStyle=cyan;c.lineWidth=11;c.strokeText(text,x-5,y-4);
      c.fillStyle='#f3e7cf';c.fillText(text,x,y);
    }
    word('LET’S BUILD',25,225);word('SOMETHING.',25,425);
    c.font='bold 34px monospace';c.fillStyle=amber;c.fillText('IDEAS FIND THEIR PEOPLE HERE.',35,525);
    c.restore();
    c.strokeStyle=pink;c.lineWidth=8;c.beginPath();c.moveTo(100,h-45);c.bezierCurveTo(350,h-90,1000,h-20,1410,h-70);c.stroke();
    c.fillStyle='#10102066';for(let y=0;y<h;y+=16)for(let x=0;x<w;x+=16){c.beginPath();c.arc(x,y,2,0,7);c.fill();}
    c.fillStyle=cyan;c.font='italic bold 72px Impact';c.fillText('SJV',w-220,100);
  });
  plane(10.5,4.15,-4.35,1.1,-97.97,mural);
  const stationSign=texture(1600,150,(c,w,h)=>{
    c.fillStyle=ink;c.fillRect(0,0,w,h);c.fillStyle=cyan;c.fillRect(0,h-8,w,8);
    c.fillStyle=amber;c.beginPath();c.arc(70,75,42,0,7);c.fill();c.fillStyle=ink;c.font='bold 49px monospace';c.fillText('03',39,93);
    c.fillStyle='#f3e7cf';c.font='bold 45px monospace';c.fillText('FINAL STOP / CONNECTIONS',155,94);
  });
  plane(15.5,1.1,-.1,3.95,-97.96,stationSign);
  // The contact interface sits on this physical station noticeboard.
  box(7.2,4.15,.12,5,1.0,-97.83,ink);
  box(7.32,.06,.16,5,3.09,-97.75,cyan,false);
  const contactAnchor=new THREE.Object3D();contactAnchor.position.set(5,1,-97.75);root.add(contactAnchor);
  return {root,trackMouths,contactAnchor,contactWidth:7,contactHeight:3.9};
}
