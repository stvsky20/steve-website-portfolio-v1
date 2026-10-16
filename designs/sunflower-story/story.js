import { createStudioScene } from './studio-scene.js';
const scrollArea = document.querySelector('#story-scroll');
const panels = [...document.querySelectorAll('.panel')];
const layers = [...document.querySelectorAll('.scene-layer')];
const slider = document.querySelector('#scrub');
const play = document.querySelector('#play');
const icon = document.querySelector('#play-icon');
const replayClimb=document.querySelector('#replay-climb');
let playbackEnd=1,playbackSeconds=50;
const chapterButtons = [...document.querySelectorAll('[data-go]')];
let manualStill=false;
const stillButton=document.querySelector('#still-view');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const isStill=()=>reduced.matches||manualStill;
const titles = ['A ROOM. A SCREEN. AN IDEA.', 'OUT INTO THE WORLD', 'IN THE MAKING', 'ONE STEP. THEN THE NEXT.', 'THE NEXT CHAPTER'];
const places = ['BEDROOM / ORIGIN', 'BROWNSTONE STREET / WORK', 'GRAFFITI HIDEOUT / MAKING', 'WALL CLIMB / PROGRESS', 'SNOWY CITY / CONNECT'];
const cache = new Map();
const studio = new URLSearchParams(location.search).get('view')==='flat' ? null : createStudioScene(document.querySelector('.scene'),schedule);
let progress = 0, active = -1, playing = false, lastTime = 0, queued = false, playbackRAF = null;
let seekRevision=0;
const clamp = x => Math.max(0, Math.min(1, x));
const ease = x => 1-Math.pow(1-clamp(x),3);
const extent = () => Math.max(1, scrollArea.offsetHeight - window.innerHeight);
function loadPlate(name){
 if(!cache.has(name)){const img=new Image();img.src=`assets/studio/${name}-plate.png`;cache.set(name,img);img.addEventListener('load',schedule,{once:true});}
 return cache.get(name);
}
function stop() { if(playbackRAF!==null){cancelAnimationFrame(playbackRAF);playbackRAF=null;}playing=false;play.setAttribute('aria-label','Play story');icon.innerHTML='<path d="M6 3 16 10 6 17Z"/>'; }
function seek(p) {seekRevision++;window.scrollTo({top:scrollArea.offsetTop+extent()*clamp(p),behavior:'instant'});update();}
function setImage(el,img) {if(img.complete&&img.naturalWidth>0&&el.dataset.frame!==img.src){el.src=img.src;el.dataset.frame=img.src;}}
function renderLayer(layer,t){
 const img=loadPlate(layer.dataset.set);
 setImage(layer.querySelector('.frame-a'),img);
 layer.querySelector('.frame-b').style.opacity=0;
 layer.querySelector('.frame-a').style.transform=isStill()?'none':`scale(${1.035+t*.025}) translate(${(t-.5)*.7}%,${layer.dataset.set==='climb'?(t-.5)*-1.8:0}%)`;
}
const snow=document.querySelector('.snow-field');
for(let i=0;i<35;i++){const flake=document.createElement('i');flake.style.left=`${(i*29.3)%100}%`;flake.style.width=flake.style.height=`${2+i%4}px`;snow.append(flake);}
function update() {
 queued=false;progress=clamp((window.scrollY-scrollArea.offsetTop)/extent());
 const next=Math.min(4,Math.floor(progress*5));const local=clamp(progress*5-next);
 if(next!==active){
  active=next;replayClimb.hidden=active!==3;
  panels.forEach((p,i)=>{p.classList.toggle('active',i===active);p.setAttribute('aria-hidden',String(i!==active));p.inert=i!==active;});
  chapterButtons.forEach((b,i)=>i===active?b.setAttribute('aria-current','step'):b.removeAttribute('aria-current'));
  document.querySelector('.chapter-tag').textContent=`0${active+1} / ${titles[active]}`;
  document.querySelector('.chapter-count').textContent=`0${active+1} — 05`;
  document.querySelector('.scene-note').textContent=places[active];
  document.querySelector('#stage').dataset.location=layers[active].dataset.set;
  // Preload only this scene and the next scene; scrubbing requests missing frames on demand.
  for(const name of layers.map(l=>l.dataset.set))loadPlate(name);
 }
 slider.value=Math.round(progress*1000);slider.setAttribute('aria-valuetext',`${places[active]}, ${Math.round(progress*100)} percent`);
 layers.forEach((layer,i)=>{
  const visible=i===active||(i===active-1&&local<.13&&!isStill());
  layer.style.visibility=visible?'visible':'hidden';
  layer.style.zIndex=i;
  if(!visible)return;
  renderLayer(layer,i===active?local:1);
  const wipe=(i===active&&active>0&&!isStill())?clamp(local/.13):1;
  layer.style.clipPath=wipe>=1?'none':`polygon(0 0, ${wipe*120}% 0, ${wipe*120-20}% 100%, 0 100%)`;
 });
 const glReady=studio?.render(active,local,progress,isStill())??false;document.querySelector('#stage').dataset.renderer=glReady?'webgl':'fallback';
 const arrival=isStill()?1:ease(local/.15);
 panels[active].style.transform=isStill()?'none':`translateX(${(1-arrival)*22}px)`;
 document.querySelector('#stage').dataset.still=String(isStill());
 panels[active].querySelectorAll('[data-at]').forEach(el=>{
  const at=Number(el.dataset.at),r=isStill()?1:ease((local-at)/.12);
  el.style.opacity=r;
  if(el.classList.contains('caption')){
   const angle=el.classList.contains('role')?1:el.classList.contains('small')?-3:-2;
   el.style.transform=`translateY(${isStill()?0:(1-r)*28}px) rotate(${angle}deg)`;
  }else el.style.transform=isStill()?'none':`translateY(${(1-r)*14}px)`;
  el.querySelectorAll('[data-word]').forEach((word,i)=>{
   const wordAt=word.dataset.wordAt?Number(word.dataset.wordAt):at+i*.075;
   const w=isStill()?1:ease((local-wordAt)/.1);
   word.style.opacity=w;word.style.transform=`translateY(${(1-w)*.35}em) scale(${.96+.04*w})`;
  });
 });
 snow.style.opacity=active===4&&!isStill()&&!glReady?Math.min(1,local*5):0;
 [...snow.children].forEach((flake,i)=>{flake.style.transform=`translate(${Math.sin(progress*10+i)*18}px, ${((progress*7+i*.071)%1)*110}svh)`;});
 const travel=document.querySelector('.travel-ink');
 travel.style.opacity=!isStill()&&active>0&&local<.13?Math.sin(local/.13*Math.PI)*.28:0;
 travel.style.transform=`translateX(${local*80}%)`;
}
function schedule(){if(!queued){queued=true;requestAnimationFrame(update);}}
function tick(time){if(!playing)return;const delta=Math.min((time-lastTime)/1000,.1);lastTime=time;const next=Math.min(playbackEnd,progress+delta/playbackSeconds);seek(next);if(next>=playbackEnd){stop();return;}playbackRAF=requestAnimationFrame(tick);}
play.addEventListener('click',()=>{if(playing){stop();return;}if(isStill())return;if(progress>=.99)seek(0);playbackEnd=1;playbackSeconds=50;playing=true;lastTime=performance.now();play.setAttribute('aria-label','Pause story');icon.innerHTML='<path d="M4 3H8V17H4ZM12 3H16V17H12Z"/>';playbackRAF=requestAnimationFrame(tick);});
replayClimb.addEventListener('click',()=>{if(isStill())return;stop();seek(.6);playbackEnd=.799;playbackSeconds=40;playing=true;lastTime=performance.now();play.setAttribute('aria-label','Pause story');icon.innerHTML='<path d="M4 3H8V17H4ZM12 3H16V17H12Z"/>';playbackRAF=requestAnimationFrame(tick);});
slider.addEventListener('input',()=>{stop();seek(Number(slider.value)/1000);});
// Focusing controls inside the sticky frame must not advance the scroll-driven story.
document.querySelector('.transport').addEventListener('focusin',()=>{
 const savedProgress=progress,revision=seekRevision;
 requestAnimationFrame(()=>{if(revision===seekRevision&&!playing)seek(savedProgress);});
});
chapterButtons.forEach(b=>b.addEventListener('click',()=>{stop();seek(Number(b.dataset.go));}));
['wheel','touchstart','keydown'].forEach(type=>window.addEventListener(type,event=>{if(type!=='keydown'||(event.target!==play&&['ArrowDown','ArrowUp','PageDown','PageUp','Home','End','Escape',' '].includes(event.key)))stop();},{passive:true}));
document.querySelectorAll('a').forEach(a=>a.addEventListener('click',stop));
window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',()=>seek(progress));
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
function motionChanged(){stop();stillButton.setAttribute('aria-pressed',String(isStill()));stillButton.textContent=isStill()?'Motion view':'Still view';stillButton.disabled=reduced.matches;play.disabled=isStill();replayClimb.disabled=isStill();play.title=isStill()?'Autoplay is disabled in still view':'Play the 50-second story';update();}
stillButton.addEventListener('click',()=>{manualStill=!manualStill;motionChanged();});
reduced.addEventListener('change',motionChanged);motionChanged();

// Compact read-only diagnostics for visual QA; no personal information.
window.storyDiagnostics=()=>({progress,active,playing,reduced:isStill(),studio:studio?.getState()??null});

