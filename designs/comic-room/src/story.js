export function createStory({stage,onNavigate,onRoom,onBrowse}){
 const root=document.createElement('section');root.className='story-layer';root.setAttribute('aria-label','Portfolio story');
 root.innerHTML=`<div class="story-hud"><small class="story-number"></small><p class="story-prompt" aria-live="polite"></p></div>
 <article class="story-intro"><small>01 / MEET STEVEN JOE VALDEZ</small><h1>Hey, I’m<br><span>Steven Joe.</span></h1><p>Software engineer exploring systems, apps, interfaces and machine learning.</p><p class="story-proof">Ayos! · Regional finalist<br>Philippine Startup Challenge</p><button class="story-primary" data-story="pc">START WITH MY WORK →</button><button class="story-quiet" data-story="room">Explore the room freely</button><button class="story-quiet" data-story="direct">Contact me directly ↗</button></article>
 <details class="story-index"><summary>CHAPTERS <span class="story-count">01 / 04</span></summary><div class="story-bookmarks"><button data-story="intro">01 / Meet Steven</button><button data-story="pc">02 / Selected work</button><button data-story="about">03 / How I think</button><button data-story="direct">04 / Connect now</button><button data-story="rooftop">Optional / Rooftop ↗</button></div></details><div class="story-actions"></div>`;
 stage.append(root);stage.classList.add('story-enabled');
 const bookmarks=root.querySelector('.story-index'),roomMap=stage.querySelector('.room-map');
 bookmarks.addEventListener('toggle',()=>{if(bookmarks.open)roomMap.open=false;});
 roomMap.addEventListener('toggle',()=>{if(roomMap.open)bookmarks.open=false;});
 const chapters={intro:['01 / MEET STEVEN','A room of ideas. Start with the work.'],room:['EXPLORE / INSIDE MY WORLD','Choose an object, or follow the story.'],pc:['02 / SELECTED WORK','Ayos! — connecting users and local government units.'],about:['03 / HOW I THINK','From a question to something people can use.'],rooftop:['OPTIONAL / A DIFFERENT VIEW','Take the leap, or continue to the ending.'],contact:['04 / CONNECT','Next stop: let’s build something.']};
 let current='intro',arrived=false;const visited=new Set(['intro']);
 function draw(){
  const [number,prompt]=chapters[current];root.querySelector('.story-number').textContent=current==='contact'&&arrived?'04 / FINAL STOP':number;root.querySelector('.story-prompt').textContent=current==='contact'&&arrived?'The next project starts with a conversation.':prompt;
  stage.dataset.storyScene=current;root.querySelector('.story-intro').hidden=current!=='intro';
  const index={intro:1,room:1,pc:2,about:3,rooftop:3,contact:4}[current];root.querySelector('.story-count').textContent=String(index).padStart(2,'0')+' / 04';
  root.querySelectorAll('.story-bookmarks button').forEach(b=>{b.setAttribute('aria-label',b.textContent);const key=b.dataset.story==='direct'?'contact':b.dataset.story;b.classList.toggle('visited',visited.has(key));if(key===current)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
  const actions={intro:'',room:'<button class="story-primary" data-story="pc">START WITH MY WORK →</button>',pc:'<button class="story-primary" data-story="about">SEE HOW I THINK →</button><button class="story-secondary" data-story="browse">Browse project folders</button>',about:'<button class="story-primary" data-story="contact">CONTINUE TO CONNECT →</button><button class="story-secondary" data-story="rooftop">Take the rooftop detour ↗</button>',rooftop:'<button class="story-primary" data-story="contact">CONTINUE TO CONNECT →</button><button class="story-secondary" data-story="about">Back to my approach</button>',contact:arrived?'<button class="story-primary" data-story="room">EXPLORE THE ROOM AGAIN ↺</button><button class="story-secondary" data-story="pc">Revisit Ayos!</button>':''};
  root.querySelector('.story-actions').innerHTML=actions[current];
 }
 root.addEventListener('click',event=>{
  const button=event.target.closest('[data-story]');if(!button)return;root.querySelector('.story-index').open=false;
  const key=button.dataset.story;
  if(key==='browse'){onBrowse();return;}
  if(key==='intro'||key==='room'){onRoom();show(key);return;}
  onNavigate(key==='direct'?'contact':key,button,{instant:key==='direct'});
 });
 function show(key){current=key;arrived=false;visited.add(key);draw();}
 function update({contactPhase}){const next=current==='contact'&&contactPhase==='arrived';if(next!==arrived){arrived=next;draw();}}
 draw();
 return{show,update,get current(){return current;}};
}
