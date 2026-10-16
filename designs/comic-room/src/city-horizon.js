import * as THREE from 'three';

/** Dimensional, low-detail horizon; distance is handled in the same color space as the sky. */
export function createCityHorizon(scene){
 const root=new THREE.Group();root.name='Distant_city_and_Brooklyn_bridge';scene.add(root);
 const haze=new THREE.Color().setRGB(.12,.14,.25);
 const material=(color,detail=0,surface=0)=>new THREE.ShaderMaterial({
  uniforms:{base:{value:new THREE.Color(color)},haze:{value:haze},detail:{value:detail},surface:{value:surface}},
  vertexShader:`varying vec3 world;varying vec3 normalWorld;varying float distanceToEye;
   void main(){vec4 p=vec4(position,1.);
   #ifdef USE_INSTANCING
    p=instanceMatrix*p;
   #endif
   vec4 w=modelMatrix*p;world=w.xyz;normalWorld=normalize(mat3(modelMatrix)*normal);distanceToEye=length((viewMatrix*w).xyz);gl_Position=projectionMatrix*viewMatrix*w;}`,
  fragmentShader:`uniform vec3 base;uniform vec3 haze;uniform float detail;uniform float surface;varying vec3 world;varying vec3 normalWorld;varying float distanceToEye;
   void main(){vec3 col=base*(.7+.3*max(0.,normalWorld.z));
    float distance=length(world-cameraPosition);float fade=smoothstep(160.,1450.,distance);
    vec2 uv=abs(normalWorld.x)>.6?world.zy:world.xy;
    vec2 grid=fract(uv/vec2(5.,7.));vec2 aa=max(fwidth(uv/vec2(5.,7.)),vec2(.002));
    float windows=(1.-smoothstep(.18,.18+aa.x,abs(grid.x-.5)))*(1.-smoothstep(.27,.27+aa.y,abs(grid.y-.5)));
    col=mix(col,vec3(.18,.24,.35),windows*detail*(1.-fade)*(1.-step(.5,abs(normalWorld.y))));
    if(surface>.5){
     float wave=world.z*.48+sin(world.x*.027)*1.6+sin(world.x*.09)*.5;
     float line=1.-smoothstep(.045,.045+max(fwidth(wave),.015),abs(fract(wave)-.5));
     float breakup=smoothstep(.35,.7,sin(world.x*.11+world.z*.03)*.5+.5);
     col=mix(col,vec3(.13,.23,.34),line*breakup*.55);
     col*=.92+.08*sin(world.z*.065+world.x*.015);
    }
    col=mix(col,haze,fade);gl_FragColor=vec4(col,1.);
    #include <colorspace_fragment>
   }`
 });
 const random=n=>{const f=Math.sin(n*127.1+311.7)*43758.5453;return f-Math.floor(f);};
 const geometry=new THREE.BoxGeometry(1,1,1),matrix=new THREE.Matrix4();
 const layers=[];
 for(let layer=0;layer<4;layer++){
  const depth=[590,800,1070,1370][layer],count=58,parts=[];
  for(let i=0;i<count;i++){
   const x=(i-(count-1)/2)*[27,35,45,57][layer]+(random(i+layer*90)-.5)*12;
   const z=-depth-random(i+layer*91+10)*95;
   const width=13+random(i+layer*71+20)*23,height=40+random(i+layer*113+30)*130;
   parts.push({x,z,w:width,h:height,d:15+random(i+17)*18});
   // Stepped silhouettes stay readable after the facade detail fades away.
   if(i%4===0)parts.push({x,z,w:width*.62,h:height*.3,d:12,y:height+height*.15});
   if(i%13===0)parts.push({x,z,w:2,h:25,d:2,y:height+12.5});
  }
  const mesh=new THREE.InstancedMesh(geometry,material(['#343d60','#3b4367','#495174','#596080'][layer],layer===0?.55:.2),parts.length);
  mesh.name='Horizon_skyline_layer_'+layer;mesh.userData.depth=depth;mesh.userData.buildings=count;
  parts.forEach((p,i)=>{matrix.makeScale(p.w,p.h,p.d);matrix.setPosition(p.x,p.y??p.h/2,p.z);mesh.setMatrixAt(i,matrix);});
  mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();root.add(mesh);layers.push(mesh);
 }
 // A continuous river and distant ground remove the abrupt end of the original street.
 const river=new THREE.Mesh(new THREE.PlaneGeometry(2200,220),material('#293e59',0,1));river.name='East_River_horizon';river.rotation.x=-Math.PI/2;river.position.set(0,-.2,-480);root.add(river);
 const land=new THREE.Mesh(new THREE.PlaneGeometry(3100,1500),material('#343c59'));land.rotation.x=-Math.PI/2;land.position.set(0,-.4,-1150);root.add(land);
 // Continuous street markings and a waterfront junction ground the long central view.
 const street=new THREE.Group();street.name='Street_to_waterfront';root.add(street);
 const streetMaterial=new THREE.ShaderMaterial({
  vertexShader:'varying vec3 world;void main(){vec4 w=modelMatrix*vec4(position,1.);world=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
  fragmentShader:`varying vec3 world;void main(){
   float distance=length(world-cameraPosition);float fade=smoothstep(70.,1000.,distance);
   vec3 col=vec3(.022,.03,.065);float ax=abs(world.x);
   float aa=max(fwidth(world.x),.025),za=max(fwidth(world.z),.025);
   float center=1.-smoothstep(.065,.065+aa,abs(ax-.22));
   float dash=1.-smoothstep(2.,2.+za,abs(mod(world.z+4.,8.)-4.));
   float lane=1.-smoothstep(.08,.08+aa,abs(ax-7.));
   float junction=1.-smoothstep(12.,13.,abs(world.z+340.));
   float crossing=(1.-smoothstep(.55,.55+aa,abs(mod(world.x+1.1,2.2)-1.1)))*(1.-smoothstep(1.5,1.5+za,abs(abs(world.z+340.)-10.)));
   col=mix(col,vec3(.32,.25,.12),center*(1.-junction)*.8);
   col=mix(col,vec3(.22,.26,.34),max(lane*dash*(1.-junction),crossing)*.72);
   float hatch=1.-smoothstep(.03,.03+max(fwidth(world.x+world.z),.04),abs(fract((world.x+world.z)*.4)-.5));col*=1.-hatch*.1;
   col=mix(col,vec3(.12,.14,.25),fade);gl_FragColor=vec4(col,1.);
   #include <colorspace_fragment>
  }`
 });
 const road=new THREE.Mesh(new THREE.PlaneGeometry(28,460),streetMaterial);road.name='Continuous_marked_road';road.rotation.x=-Math.PI/2;road.position.set(0,.015,-140);street.add(road);
 const junction=new THREE.Mesh(new THREE.PlaneGeometry(360,26),streetMaterial);junction.name='Waterfront_cross_street';junction.rotation.x=-Math.PI/2;junction.position.set(0,.02,-340);street.add(junction);
 const parts=[];
 const part=(w,h,d,x,y,z,color)=>parts.push({w,h,d,x,y,z,color});
 for(const x of [-15.5,15.5]){
  part(3,.22,460,x,.14,-140,'#495269');part(.18,.3,460,x-Math.sign(x)*1.45,.17,-140,'#8991a0');
  for(let z=-45;z>=-320;z-=23){
   part(.15,7,.15,x,3.7,z,'#35405a');part(1.5,.12,.15,x-Math.sign(x)*.7,7.2,z,'#5c6b81');
   part(.65,.12,.35,x-Math.sign(x)*1.2,7.15,z,'#b89a69');
  }
 }
 // Tiny parked cars give scale without introducing more animation or traffic logic.
 for(let i=0;i<22;i++){
  const x=(i%2?1:-1)*11.3,z=-44-Math.floor(i/2)*25;
  part(1.8,.65,3.8,x,.62,z,['#495b78','#64506b','#6e6957'][i%3]);
  part(1.5,.45,1.9,x,1.14,z+.15,'#25374f');part(1.7,.2,.15,x,.58,z+1.9,'#919aac');
 }
 part(540,.3,12,0,.13,-364,'#59637a');part(540,1.2,.7,0,.6,-370,'#70798d');
 for(let x=-260;x<=260;x+=16)part(.24,2.1,.24,x,1.15,-369.7,'#8790a1');
 part(540,.12,.15,0,2.1,-369.7,'#8790a1');
 const streetBatches=new Map();
 for(const p of parts){if(!streetBatches.has(p.color))streetBatches.set(p.color,[]);streetBatches.get(p.color).push(p);}
 for(const [color,items] of streetBatches){
  const mesh=new THREE.InstancedMesh(geometry,new THREE.MeshBasicMaterial({color}),items.length);mesh.name='Street_details_'+color;
  items.forEach((p,i)=>{matrix.makeScale(p.w,p.h,p.d);matrix.setPosition(p.x,p.y,p.z);mesh.setMatrixAt(i,matrix);});mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();street.add(mesh);
 }
 const bridge=new THREE.Group();bridge.name='Brooklyn_Bridge_silhouette';bridge.position.set(-15,0,-495);bridge.rotation.y=-.13;root.add(bridge);
 const stone=material('#777386'),steel=material('#35435f'),cableMat=new THREE.LineBasicMaterial({color:'#9293ac'});
 const box=(w,h,d,x,y,z,mat)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);bridge.add(m);return m;};
 box(440,2,19,0,24,0,steel);box(440,1.2,1,0,27,-9,stone);box(440,1.2,1,0,27,9,stone);
 // Two pointed openings cut through each tower, rather than painted-on arch marks.
 const shape=new THREE.Shape();shape.moveTo(-18,0);shape.lineTo(18,0);shape.lineTo(18,90);shape.lineTo(-18,90);shape.closePath();
 for(const x of [-8,8]){const hole=new THREE.Path();hole.moveTo(x-5,27);hole.lineTo(x-5,64);hole.lineTo(x,77);hole.lineTo(x+5,64);hole.lineTo(x+5,27);hole.closePath();shape.holes.push(hole);}
 const towerGeometry=new THREE.ExtrudeGeometry(shape,{depth:12,bevelEnabled:false});towerGeometry.translate(0,0,-6);
 for(const x of [-72,72]){
  const tower=new THREE.Mesh(towerGeometry,stone);tower.name='Bridge_pointed_arch_tower';tower.position.x=x;bridge.add(tower);
  box(39,3,15,x,89,0,stone);box(40,6,18,x,3,0,steel);
 }
 const cablePoints=[];const segment=(a,b)=>cablePoints.push(...a,...b);
 for(const z of [-8,8]){
  // Main suspension catenary approximated by a parabola at this silhouette scale.
  for(const [a,b,outer] of [[-220,-72,true],[-72,72,false],[72,220,true]]){
   for(let i=0;i<40;i++){
    const point=t=>{const x=THREE.MathUtils.lerp(a,b,t),y=outer?(a===-220?27+60*t*t:27+60*(1-t)**2):40+47*(2*t-1)**2;return[x,y,z];};
    const p=point(i/40),q=point((i+1)/40);segment(p,q);
    if(i%2===0)segment(p,[p[0],26,z]);
   }
  }
  // Diagonal fan stays distinguishable from the thin vertical suspenders.
  for(const x of [-72,72])for(const offset of [-52,-36,-20,20,36,52])segment([x,87,z],[x+offset,26,z]);
 }
 const cables=new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(cablePoints,3)),cableMat);cables.name='Bridge_suspension_and_fan_cables';bridge.add(cables);
 // Apply the same atmospheric fade to cables; standard fog is linear-space matched.
 cableMat.fog=true;
 return{root,layers,bridge,river,street,road,junction,buildingCount:232};
}
