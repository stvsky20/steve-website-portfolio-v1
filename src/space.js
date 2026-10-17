import * as THREE from "../vendor/three.module.js";
import { seededRandom } from "./geometry.js";

export const destinations = [
  {
    id: "github",
    name: "GitHub",
    subtitle: "Explore the source.",
    description:
      "Explore my projects, experiments, and collaborative development work on GitHub.",
    tags: ["Code", "Projects", "Open source"],
    placeholder: "github.com/stvsky20",
    href: "https://github.com/stvsky20",
    position: [24, 150, 120],
    radius: 3.8,
    type: 0,
    color: "#bcb6d6",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    subtitle: "Let’s talk about what’s next.",
    description:
      "Connect with me for professional opportunities, collaborations, and conversations about building and delivering software.",
    tags: ["Opportunities", "Collaboration", "Career"],
    placeholder: "linkedin.com/in/steven-joe-valdez-15817128a",
    href: "https://www.linkedin.com/in/steven-joe-valdez-15817128a",
    position: [14, 139, 122],
    radius: 4.1,
    type: 1,
    color: "#9fbddf",
  },
  {
    id: "email",
    name: "Email",
    subtitle: "Send a signal my way.",
    description:
      "Have a project in mind or want to work together? This is the place to start a direct conversation.",
    tags: ["Projects", "Inquiries", "Say hello"],
    placeholder: "valdez.stevenjoe@gmail.com",
    href: "mailto:valdez.stevenjoe@gmail.com",
    phone: "0994 540 9718",
    phoneHref: "tel:+639945409718",
    position: [0, 151, 121],
    radius: 3.8,
    type: 2,
    color: "#edc08c",
  },
  {
    id: "instagram",
    name: "Instagram",
    subtitle: "A little beyond the work.",
    description:
      "A space for everyday moments, creative interests, and a glimpse of the person behind the station.",
    tags: ["Life", "Creativity", "Behind the scenes"],
    placeholder: "Instagram · Profile coming soon",
    position: [-8, 139, 118],
    radius: 3.7,
    type: 3,
    color: "#db9eb8",
  },
];

export function createSpace(scene) {
  const group = new THREE.Group();
  group.name = "Contact constellation";
  group.visible = false;
  scene.add(group);
  const random = seededRandom(985),
    positions = [],
    colors = [];
  for (let i = 0; i < 2600; i++) {
    const a = random() * Math.PI * 2,
      z = random() * 2 - 1,
      r = 170 + random() * 450,
      s = Math.sqrt(1 - z * z);
    positions.push(
      7 + Math.cos(a) * s * r,
      146 + z * r,
      120 + Math.sin(a) * s * r,
    );
    const shade = 0.5 + random() * 0.5;
    colors.push(
      shade * (0.8 + random() * 0.2),
      shade * (0.85 + random() * 0.15),
      shade,
    );
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  starGeometry.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(colors, 3),
  );
  const starMaterial = new THREE.PointsMaterial({
    size: 0.38,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    fog: false,
  });
  const stars = new THREE.Points(starGeometry, starMaterial);
  group.add(stars);
  const worlds = [],
    rings = [];
  const sphere = new THREE.SphereGeometry(1, 64, 40);
  for (const data of destinations) {
    const material = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        kind: { value: data.type },
        time: { value: 0 },
        reveal: { value: 0 },
      },
      vertexShader: `varying vec3 vLocal;varying vec3 vNormal;varying vec3 vWorld;void main(){vLocal=position;vNormal=normalize(mat3(modelMatrix)*normal);vec4 p=modelMatrix*vec4(position,1.);vWorld=p.xyz;gl_Position=projectionMatrix*viewMatrix*p;}`,
      fragmentShader: `
      precision highp float;uniform float kind;uniform float time;uniform float reveal;varying vec3 vLocal;varying vec3 vNormal;varying vec3 vWorld;
      float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
      float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
      float fbm(vec3 p){float n=0.,a=.5;for(int i=0;i<5;i++){n+=noise(p)*a;p=p*2.02+vec3(7.1,3.7,8.3);a*=.5;}return n;}
      void main(){vec3 p=normalize(vLocal),n=normalize(vNormal);float terrain=fbm(p*5.);vec3 albedo;vec3 glow=vec3(.36,.57,.73);
      if(kind<.5){float fine=fbm(p*28.);albedo=mix(vec3(.10,.07,.16),vec3(.48,.43,.60),smoothstep(.25,.75,terrain));albedo+=fine*.10;float craters=1.-smoothstep(.04,.17,abs(fbm(p*44.)-.48));albedo*=1.-craters*.16;albedo=mix(albedo,vec3(.70,.68,.75),smoothstep(.73,.87,abs(p.y)));glow=vec3(.51,.40,.69);}
      else if(kind<1.5){float bands=sin((p.y+noise(p*4.)*.08)*63.);albedo=mix(vec3(.18,.32,.49),vec3(.58,.74,.83),bands*.25+.5);albedo*=.85+terrain*.3;float storm=exp(-length((p.yz-vec2(.18,.83))*vec2(8.,16.)));albedo=mix(albedo,vec3(.32,.48,.64),storm*.45);glow=vec3(.34,.57,.78);}
      else if(kind<2.5){float dunes=fbm(p*12.);albedo=mix(vec3(.38,.15,.07),vec3(.91,.66,.34),terrain);albedo+=dunes*.12;glow=vec3(.85,.48,.20);}
      else{float swirls=fbm(p*7.+vec3(0.,time*.002,0.));albedo=mix(vec3(.24,.08,.30),vec3(.75,.34,.46),swirls);float bands=sin(p.y*39.+terrain*13.);albedo+=vec3(.18,.10,.06)*smoothstep(.2,.9,bands);glow=vec3(.72,.32,.52);}
      vec3 light=normalize(vec3(.65,.5,-.8));float diffuse=max(dot(n,light),0.);vec3 view=normalize(cameraPosition-vWorld);float rim=pow(1.-max(dot(n,view),0.),3.);float terminator=smoothstep(-.18,.22,dot(n,light));vec3 reflected=vec3(.10,.14,.22)*(.5+.5*n.y);vec3 color=albedo*(.035+terminator*diffuse*1.65)+albedo*reflected+glow*rim*.55;gl_FragColor=vec4(color,reveal);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      }`,
    });
    const mesh = new THREE.Mesh(sphere, material);
    mesh.position.fromArray(data.position);
    mesh.scale.setScalar(data.radius);
    mesh.userData.destination = data.id;
    mesh.name = data.name;
    group.add(mesh);
    worlds.push({ data, mesh });
    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(data.radius * 1.025, 48, 32),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          reveal: { value: 0 },
          tint: { value: new THREE.Color(data.color) },
        },
        vertexShader: `varying vec3 n;varying vec3 w;void main(){n=normalize(mat3(modelMatrix)*normal);w=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(w,1.);}`,
        fragmentShader: `uniform float reveal;uniform vec3 tint;varying vec3 n;varying vec3 w;void main(){float rim=pow(1.-abs(dot(normalize(n),normalize(cameraPosition-w))),5.);gl_FragColor=vec4(tint,rim*.24*reveal);}`,
      }),
    );
    halo.position.copy(mesh.position);
    group.add(halo);
    worlds.at(-1).halo = halo;
    if (data.type === 1) {
      const ringGeometry = new THREE.RingGeometry(6.7, 9.4, 128, 1);
      const ring = new THREE.Mesh(
        ringGeometry,
        new THREE.ShaderMaterial({
          side: THREE.DoubleSide,
          transparent: true,
          depthWrite: false,
          uniforms: { reveal: { value: 0 } },
          vertexShader: `varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
          fragmentShader: `uniform float reveal;varying vec3 p;void main(){float r=length(p.xy);float stripes=.5+.5*sin(r*72.);float gap=1.-smoothstep(.03,.12,abs(r-8.15));float a=(.20+stripes*.35)*(1.-gap*.92);gl_FragColor=vec4(vec3(.56,.51,.39),a*reveal);}`,
        }),
      );
      ring.position.copy(mesh.position);
      ring.rotation.x = 1.12;
      ring.rotation.z = 0.22;
      group.add(ring);
      rings.push(ring);
    }
  }
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(0.66, 24, 16),
    new THREE.MeshBasicMaterial({
      color: 0x9eadae,
      fog: false,
      transparent: true,
      opacity: 0,
    }),
  );
  group.add(moon);
  function update(time, starReveal, planetReveal = starReveal) {
    group.visible = starReveal > 0 || planetReveal > 0;
    starMaterial.opacity = starReveal;
    for (const world of worlds) {
      world.mesh.rotation.y = time * 0.016;
      world.mesh.material.uniforms.time.value = time;
      world.mesh.visible = planetReveal > 0;
      world.halo.visible = planetReveal > 0;
      world.mesh.material.uniforms.reveal.value = planetReveal;
      world.halo.material.uniforms.reveal.value = planetReveal;
    }
    for (const ring of rings) {
      ring.visible = planetReveal > 0;
      ring.material.uniforms.reveal.value = planetReveal;
    }
    moon.position.set(
      -12 + Math.cos(time * 0.07) * 6.3,
      140.1,
      118 + Math.sin(time * 0.07) * 6.3,
    );
    moon.visible = planetReveal > 0;
    moon.material.opacity = planetReveal;
  }
  return { group, worlds, update };
}
