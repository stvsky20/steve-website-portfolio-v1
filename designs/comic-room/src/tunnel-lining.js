import * as THREE from 'three';

export function createTunnelLining(tunnel){
  const sections=[];
  // Match the narrow couch aperture, then expand into the main twelve-sided tube.
  for(let i=0;i<6;i++){
    const f=i/5;sections.push({z:-f*3,rx:1.25+(3.44-1.25)*f,ry:.425+(3.44-.425)*f,angle:0});
  }
  for(let i=1;i<=19;i++)sections.push({z:-3-i*3.1,rx:3.44,ry:3.44,angle:i*.38});
  // A widening physical exit lets the camera see the platform before leaving the shell.
  for(let i=1;i<=5;i++){const f=i/5;sections.push({z:-61.9-10.1*f,rx:3.44+2.96*f*f,ry:3.44+2.96*f*f,angle:(19+f*3.26)*.38});}
  const palette=['#173452','#292347','#492155','#243c59','#18283f','#413068'];
  const positions=[],colors=[],uvs=[];
  const vertex=(section,k)=>{
    const angle=k*Math.PI/6+section.angle;
    return new THREE.Vector3(Math.cos(angle)*section.rx,Math.sin(angle)*section.ry,section.z);
  };
  for(let j=0;j<sections.length-1;j++)for(let k=0;k<12;k++){
    const a=vertex(sections[j],k),b=vertex(sections[j],k+1),c=vertex(sections[j+1],k+1),d=vertex(sections[j+1],k);
    const base=new THREE.Color(palette[(k+Math.floor(j/5))%palette.length]);
    const coords=[[k/12,-sections[j].z/6],[(k+1)/12,-sections[j].z/6],[(k+1)/12,-sections[j+1].z/6],[k/12,-sections[j+1].z/6]];
    for(const index of [0,1,2,0,2,3]){
      positions.push(...[a,b,c,d][index].toArray());colors.push(base.r,base.g,base.b);uvs.push(...coords[index]);
    }
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
  geometry.computeVertexNormals();
  const material=new THREE.ShaderMaterial({
    vertexColors:true,side:THREE.DoubleSide,uniforms:{flow:{value:0}},
    vertexShader:'varying vec2 vUv;varying vec3 vColor;void main(){vUv=uv;vColor=color;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:[
      'varying vec2 vUv;varying vec3 vColor;uniform float flow;',
      'void main(){',
      'vec3 col=vColor;',
      'vec2 p=fract(vUv*vec2(144.,18.))-.5;',
      'float aa=max(fwidth(length(p)),.015);',
      'float dots=1.-smoothstep(.16-aa,.16+aa,length(p));',
      'float printed=step(.5,mod(floor(vUv.x*12.),3.));',
      'col*=1.-dots*.38*printed;',
      'float hatch=1.-smoothstep(.025,.075,abs(fract(vUv.x*100.+vUv.y*9.)-.5));',
      'col*=1.-hatch*.28*(1.-printed);',
      'float seam=1.-smoothstep(.012,.028,min(fract(vUv.x*12.),1.-fract(vUv.x*12.)));',
      'col=mix(col,vec3(.035,.025,.065),seam*.9);',
      // Both bands and trails use the wall UVs: they share its twist, depth and occlusion.
      'float z=vUv.y*6.;float longitudinal=vUv.x*12.;',
      'float ringDistance=abs(fract((z-3.)/3.1+.5)-.5)*3.1;',
      'float ringAA=max(fwidth(z),.012);',
      'float band=1.-smoothstep(.035,.035+ringAA,ringDistance);',
      'float pigment=1.-smoothstep(.07,.26,ringDistance);',
      'float field=1.-smoothstep(.12,.8,ringDistance);',
      'float hue=mod(floor((z-3.)/3.1+.5),3.);',
      'vec3 accent=hue<1.?vec3(.02,.52,.66):hue<2.?vec3(.68,.035,.25):vec3(.78,.4,.025);',
      'float trailCenter=.5+.09*sin(z*.38+floor(longitudinal)*1.7);',
      'float trailDistance=abs(fract(longitudinal)-trailCenter);',
      'float trailAA=max(fwidth(longitudinal),.006);',
      'float taper=.6+.4*sin(z*.52+floor(longitudinal));',
      'float trail=(1.-smoothstep(.018*taper,.018*taper+trailAA,trailDistance))*step(.5,mod(floor(longitudinal),3.));',
      // Continuous helical pigment lives on the opaque surface, never in midair.
      'float helixPhase=vUv.x*3.-z*.065;',
      'float helixDistance=abs(fract(helixPhase+.5)-.5);',
      'float helixAA=max(fwidth(helixPhase),.003);',
      'float spiral=1.-smoothstep(.045,.045+helixAA,helixDistance);',
      'float spiralWash=1.-smoothstep(.055,.16,helixDistance);',
      'float pulse=.76+.24*sin(z*.45-flow*1.7);',
      'col=mix(col,accent,field*.08);',
      'col=mix(col,accent,pigment*.24);',
      'col=mix(col,accent,band*.82);',
      'col=mix(col,mix(vColor,vec3(.025,.48,.59),.72),trail*pulse*.72);',
      'col=mix(col,accent,spiralWash*.14);',
      'col=mix(col,accent,spiral*.72);',
      'gl_FragColor=vec4(col,1.);',
      '#include <colorspace_fragment>',
      '}'
    ].join('\n')
  });
  const mesh=new THREE.Mesh(geometry,material);mesh.name='Enclosed_wormhole_shell';mesh.userData.exitZ=sections.at(-1).z;tunnel.add(mesh);
  return mesh;
}
