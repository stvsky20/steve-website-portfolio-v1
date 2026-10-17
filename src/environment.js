import * as THREE from "../vendor/three.module.js";
import { cliffGeometry } from "./geometry.js";

import { createCoastline } from "./coastline.js";

export function createEnvironment(scene, requestFrame = () => {}) {
  const loadDataMap = (path, uniform) => {
    const fallback = new THREE.DataTexture(
      new Uint8Array([128, 128, 128, 255]),
      1,
      1,
    );
    fallback.needsUpdate = true;
    uniform.value = fallback;
    new THREE.TextureLoader().load(
      path,
      (texture) => {
        texture.colorSpace = THREE.NoColorSpace;
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        uniform.value = texture;
        fallback.dispose();
        requestFrame();
      },
      undefined,
      () => console.warn(`Environment data map unavailable: ${path}`),
    );
  };
  const skyUniforms = {
    cloudMap: { value: null },
    time: { value: 0 },
    spaceFade: { value: 0 },
    night: { value: 0 },
  };
  loadDataMap("assets/environment/cloud-density.png", skyUniforms.cloudMap);
  const skyMaterial = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: skyUniforms,
    vertexShader: `varying vec3 vDirection;void main(){vDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `
      precision highp float;varying vec3 vDirection;uniform float time;uniform float spaceFade;uniform float night;uniform sampler2D cloudMap;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){if(spaceFade>=1.){gl_FragColor=vec4(.003,.006,.016,1.);}else{vec3 d=normalize(vDirection);float y=max(d.y,0.);vec3 horizon=vec3(.66,.76,.77);vec3 top=vec3(.12,.32,.49);vec3 color=mix(horizon,top,pow(y,.44));
      vec3 sun=normalize(vec3(-.8,.09,-1.7));float dist=length(d-sun);color+=vec3(.45,.26,.10)*exp(-dist*5.);color+=vec3(.6,.4,.18)*exp(-dist*34.);
      vec2 p=d.xz/max(d.y+.23,.12)*1.45;float clouds=texture2D(cloudMap,(p+vec2(time*.0015,0.))/32.).r;float mask=smoothstep(.43,.72,clouds)*smoothstep(0.,.10,d.y);vec3 cloudColor=mix(vec3(.36,.49,.56),vec3(.91,.87,.75),smoothstep(.45,.8,clouds));color=mix(color,cloudColor,mask*.72);
      float disk=1.-smoothstep(.012,.022,dist);color=mix(color,vec3(1.,.83,.55),disk*.75);if(night>0.){vec3 nightColor=mix(vec3(.025,.055,.09),vec3(.004,.009,.025),pow(y,.4));
      vec2 stars=vec2(atan(d.z,d.x),asin(clamp(d.y,-1.,1.)))*410.;vec2 cell=floor(stars);float star=step(.997,hash(cell))*(1.-smoothstep(.02,.16,length(fract(stars)-.5)))*smoothstep(.02,.12,d.y);
      nightColor+=vec3(.6,.75,.95)*star*(1.-mask*.85);
      vec3 moonDir=normalize(vec3(-.65,.14,-1.4));float moonDist=length(d-moonDir);nightColor+=vec3(.08,.13,.22)*exp(-moonDist*13.);nightColor=mix(nightColor,vec3(.72,.81,.9),1.-smoothstep(.026,.029,moonDist));
      nightColor=mix(nightColor,vec3(.035,.065,.10),mask*.35);
      color=mix(color,nightColor,night);}color=mix(color,vec3(.003,.006,.016),spaceFade);gl_FragColor=vec4(color,1.);}
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      }`,
  });
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(800, 32, 16),
    skyMaterial,
  );
  scene.add(sky);
  const seaUniforms = {
    waterMap: { value: null },
    time: { value: 0 },
    eye: { value: new THREE.Vector3() },
    night: { value: 0 },
  };
  loadDataMap("assets/environment/water-detail.png", seaUniforms.waterMap);
  const seaMaterial = new THREE.ShaderMaterial({
    uniforms: seaUniforms,
    side: THREE.FrontSide,
    vertexShader: `uniform float time;varying vec3 vWorld;varying float vWave;void main(){vec3 p=position;float t=time;float waves=sin(p.x*.51+t*.7)*.10+sin(p.y*.31-t*.65)*.11+sin((p.x+p.y)*.83+t*.41)*.045; p.z=waves;vWave=waves;vec4 world=modelMatrix*vec4(p,1.);vWorld=world.xyz;gl_Position=projectionMatrix*viewMatrix*world;}`,
    fragmentShader: `precision highp float;uniform float time;uniform float night;uniform vec3 eye;uniform sampler2D waterMap;varying vec3 vWorld;varying float vWave;
      void main(){vec2 p=vWorld.xz;float t=time;vec3 detailA=texture2D(waterMap,p/64.+vec2(t*.004,-t*.003)).rgb;vec3 detailB=texture2D(waterMap,p.yx/27.-vec2(t*.003,t*.002)).rgb;vec2 slope=(detailA.rg*2.-1.)*.17+(detailB.rg*2.-1.)*.03;vec3 n=normalize(vec3(slope.x,1.,slope.y));
      vec3 viewDir=normalize(eye-vWorld);float fresnel=pow(1.-max(dot(n,viewDir),0.),3.);vec3 water=mix(vec3(.055,.21,.25),vec3(.31,.51,.56),fresnel*.8);water+=vWave*.1;
      vec3 sun=normalize(vec3(-.8,.18,-1.7));float spec=pow(max(dot(reflect(-sun,n),viewDir),0.),150.);water+=vec3(.85,.57,.29)*spec*.9;
      float chop=(detailA.b*.65+detailB.b*.35);float crest=smoothstep(.14,.21,vWave)*smoothstep(.52,.8,chop);water+=vec3(.24,.29,.29)*crest*.28;
      float dist=length((p-vec2(3.6,0.))*vec2(1.,1.17));float surf=exp(-abs(dist-8.2-chop*.6)*1.5);float ripple=pow(max(0.,sin(dist*6.-time*1.2+chop*4.)),5.);water=mix(water,vec3(.59,.64,.60),surf*ripple*.7);
      float distanceToEye=length(eye.xz-p);float fog=1.-exp(-distanceToEye*.004);water=mix(water,vec3(.42,.59,.61),fog*.7);float horizonHaze=smoothstep(190.,560.,distanceToEye);vec3 horizonColor=vec3(.66,.76,.77);vec3 horizonSun=normalize(vec3(-.8,.09,-1.7));float horizonDist=length(normalize(vec3(p.x-eye.x,0.,p.y-eye.z))-horizonSun);horizonColor+=vec3(.45,.26,.10)*exp(-horizonDist*5.);water=mix(water,horizonColor,horizonHaze);
      if(night>0.){vec3 nightWater=mix(vec3(.004,.016,.026),vec3(.025,.065,.095),fresnel);float moonSpec=pow(max(dot(reflect(-normalize(vec3(-.65,.14,-1.4)),n),viewDir),0.),90.);nightWater+=vec3(.25,.40,.56)*moonSpec*.65;nightWater+=vec3(.035,.055,.065)*surf*ripple;nightWater=mix(nightWater,vec3(.025,.055,.09),horizonHaze);water=mix(water,nightWater,night);}gl_FragColor=vec4(water,1.);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      }`,
  });
  const sea = new THREE.Mesh(
    new THREE.PlaneGeometry(1200, 1200, 180, 180),
    seaMaterial,
  );
  sea.rotation.x = -Math.PI / 2;
  sea.position.y = -3.4;
  scene.add(sea);
  const coastline = createCoastline();
  scene.add(coastline);
  const nearRockMaterial = new THREE.MeshStandardMaterial({
    color: 0x3b4b4e,
    roughness: 1,
    flatShading: true,
  });
  for (const [x, z, r, h] of [
    [-15, 8, 2.1, 5],
    [-22, -7, 2.6, 5],
    [15, -10, 2.9, 6],
    [-9, -18, 1.4, 4],
    [24, 9, 2.4, 6],
  ]) {
    const rock = new THREE.Mesh(cliffGeometry(x, r, h), nearRockMaterial);
    rock.position.set(x, -2.5, z);
    scene.add(rock);
  }
  // Distant seabirds have independent wings; they don't overlay the readable text.
  const birdMaterial = new THREE.MeshBasicMaterial({
    color: 0x293e46,
    side: THREE.DoubleSide,
  });
  const birds = [];
  for (let i = 0; i < 6; i++) {
    const group = new THREE.Group(),
      wingGeometry = new THREE.BufferGeometry();
    wingGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        [0, 0, 0, 0.7, 0, -0.1, 0.22, 0, 0.14],
        3,
      ),
    );
    wingGeometry.computeVertexNormals();
    const right = new THREE.Mesh(wingGeometry, birdMaterial),
      left = new THREE.Mesh(wingGeometry, birdMaterial);
    left.scale.x = -1;
    group.add(right, left);
    group.position.set(-20 + i * 3, 10 + i * 0.8, -22 - i * 2);
    group.scale.setScalar(0.55);
    scene.add(group);
    birds.push({ group, right, left, phase: i * 0.9 });
  }
  const texturedSky = skyMaterial.fragmentShader;
  const texturedSea = seaMaterial.fragmentShader;
  let shaderMode = "textured";
  let shaderRequest = 0;
  async function setShaderMode(mode) {
    const request = ++shaderRequest;
    if (mode === shaderMode) return;
    const reference =
      mode === "procedural" ? await import("./environment-reference.js") : null;
    if (request !== shaderRequest) return;
    skyMaterial.fragmentShader = reference?.skyFragment ?? texturedSky;
    seaMaterial.fragmentShader = reference?.seaFragment ?? texturedSea;
    skyMaterial.needsUpdate = seaMaterial.needsUpdate = true;
    shaderMode = mode;
    requestFrame();
  }
  return {
    sky,
    sea,
    coastline,
    skyUniforms,
    seaUniforms,
    birds,
    setShaderMode,
  };
}
