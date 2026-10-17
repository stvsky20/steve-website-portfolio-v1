// Previous shaders, loaded only by the opt-in FPS comparison.
export const skyFragment = `
      precision highp float;varying vec3 vDirection;uniform float time;uniform float spaceFade;uniform float night;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float n=0.,a=.5;for(int i=0;i<5;i++){n+=noise(p)*a;p=p*2.03+4.17;a*=.5;}return n;}
      void main(){if(spaceFade>=1.){gl_FragColor=vec4(.003,.006,.016,1.);}else{vec3 d=normalize(vDirection);float y=max(d.y,0.);vec3 horizon=vec3(.66,.76,.77);vec3 top=vec3(.12,.32,.49);vec3 color=mix(horizon,top,pow(y,.44));
      vec3 sun=normalize(vec3(-.8,.09,-1.7));float dist=length(d-sun);color+=vec3(.45,.26,.10)*exp(-dist*5.);color+=vec3(.6,.4,.18)*exp(-dist*34.);
      vec2 p=d.xz/max(d.y+.23,.12)*1.45;float clouds=fbm(p+vec2(time*.0015,0.));float mask=smoothstep(.43,.72,clouds)*smoothstep(0.,.10,d.y);vec3 cloudColor=mix(vec3(.36,.49,.56),vec3(.91,.87,.75),smoothstep(.45,.8,clouds));color=mix(color,cloudColor,mask*.72);
      float disk=1.-smoothstep(.012,.022,dist);color=mix(color,vec3(1.,.83,.55),disk*.75);if(night>0.){vec3 nightColor=mix(vec3(.025,.055,.09),vec3(.004,.009,.025),pow(y,.4));
      vec2 stars=vec2(atan(d.z,d.x),asin(clamp(d.y,-1.,1.)))*410.;vec2 cell=floor(stars);float star=step(.997,hash(cell))*(1.-smoothstep(.02,.16,length(fract(stars)-.5)))*smoothstep(.02,.12,d.y);
      nightColor+=vec3(.6,.75,.95)*star*(1.-mask*.85);
      vec3 moonDir=normalize(vec3(-.65,.14,-1.4));float moonDist=length(d-moonDir);nightColor+=vec3(.08,.13,.22)*exp(-moonDist*13.);nightColor=mix(nightColor,vec3(.72,.81,.9),1.-smoothstep(.026,.029,moonDist));
      nightColor=mix(nightColor,vec3(.035,.065,.10),mask*.35);
      color=mix(color,nightColor,night);}color=mix(color,vec3(.003,.006,.016),spaceFade);gl_FragColor=vec4(color,1.);}
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      }`;

export const seaFragment = `precision highp float;uniform float time;uniform float night;uniform vec3 eye;varying vec3 vWorld;varying float vWave;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      void main(){vec2 p=vWorld.xz;float t=time;vec3 n=normalize(vec3(-cos(p.x*.51+t*.7)*.051-cos((p.x-p.y)*.83+t*.41)*.037,1.,cos(p.y*.31+t*.65)*.034));n.xz+=(noise(p*3.+time*.1)-.5)*.06; n=normalize(n);
      vec3 viewDir=normalize(eye-vWorld);float fresnel=pow(1.-max(dot(n,viewDir),0.),3.);vec3 water=mix(vec3(.055,.21,.25),vec3(.31,.51,.56),fresnel*.8);water+=vWave*.1;
      vec3 sun=normalize(vec3(-.8,.18,-1.7));float spec=pow(max(dot(reflect(-sun,n),viewDir),0.),150.);water+=vec3(.85,.57,.29)*spec*.9;
      float chop=noise(p*1.8+vec2(t*.12,0.));float crest=smoothstep(.14,.21,vWave)*smoothstep(.52,.8,chop);water+=vec3(.24,.29,.29)*crest*.28;
      float dist=length((p-vec2(3.6,0.))*vec2(1.,1.17));float surf=exp(-abs(dist-8.2-chop*.6)*1.5);float ripple=pow(max(0.,sin(dist*6.-time*1.2+chop*4.)),5.);water=mix(water,vec3(.59,.64,.60),surf*ripple*.7);
      float distanceToEye=length(eye.xz-p);float fog=1.-exp(-distanceToEye*.004);water=mix(water,vec3(.42,.59,.61),fog*.7);float horizonHaze=smoothstep(190.,560.,distanceToEye);vec3 horizonColor=vec3(.66,.76,.77);vec3 horizonSun=normalize(vec3(-.8,.09,-1.7));float horizonDist=length(normalize(vec3(p.x-eye.x,0.,p.y-eye.z))-horizonSun);horizonColor+=vec3(.45,.26,.10)*exp(-horizonDist*5.);water=mix(water,horizonColor,horizonHaze);
      if(night>0.){vec3 nightWater=mix(vec3(.004,.016,.026),vec3(.025,.065,.095),fresnel);float moonSpec=pow(max(dot(reflect(-normalize(vec3(-.65,.14,-1.4)),n),viewDir),0.),90.);nightWater+=vec3(.25,.40,.56)*moonSpec*.65;nightWater+=vec3(.035,.055,.065)*surf*ripple;nightWater=mix(nightWater,vec3(.025,.055,.09),horizonHaze);water=mix(water,nightWater,night);}gl_FragColor=vec4(water,1.);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      }`;
