import * as THREE from 'three';


export function createDesktop({stage,screen,camera,projects,onExit,hasWebGL}) {
  const layer={domElement:document.createElement('div')};
  layer.domElement.className='desktop-layer';
  layer.domElement.hidden=true;
  stage.append(layer.domElement);
  const element=document.createElement('section');
  element.id='world-desktop';element.className='world-desktop';
  element.setAttribute('aria-label','Steven’s portfolio desktop');
  element.style.position='absolute';element.style.transformOrigin='0 0';layer.domElement.append(element);
  let active=false, category=null, file=null, minimized=false, app=null, drag=null, position={x:170,y:64}, query='';
  const icons={Systems:'{ }',Apps:'</>','UI/UX':'✦',ML:'∑'};
  element.innerHTML='<div class="os-wallpaper" aria-hidden="true"><b>BUILD.<br>BREAK.<br>REPEAT.</b></div><header class="os-bar"><strong>WORLD_OS <span>/ STEVEN JOE VALDEZ</span></strong><button class="os-exit">← LEAVE DESK</button></header><div class="desktop-icons">'+Object.keys(projects).map(c=>'<button class="folder" data-folder="'+c+'"><span class="folder-icon">'+escape(icons[c])+'</span><span>'+c+'</span></button>').join('')+'<button class="folder" data-app="notes"><span class="folder-icon paper-icon">Aa</span><span>Read me</span></button></div><section class="os-window" hidden aria-label="Portfolio file explorer"><div class="window-title"><span class="window-name">FILE EXPLORER</span><div><button class="window-minimize" aria-label="Minimize window">−</button><button class="window-close" aria-label="Close window">×</button></div></div><div class="window-body"></div></section><footer class="os-taskbar"><button class="os-home">▦ <span>DESKTOP</span></button><button class="task-window" hidden>▱ FILE EXPLORER</button><span class="os-status">PORTFOLIO / SELECTED WORK</span><time class="os-clock"></time></footer>';
  const win=element.querySelector('.os-window'), body=element.querySelector('.window-body'), task=element.querySelector('.task-window');
  function place(){win.style.transform='translate('+position.x+'px,'+position.y+'px)';}
  function focus(selector){element.querySelector(selector)?.focus({preventScroll:true});}
  function escape(text){return text.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function renderWindow(){
    win.hidden=!app||minimized;task.hidden=!app;task.setAttribute('aria-pressed',String(!!app&&!minimized));
    element.querySelector('.window-name').textContent=app==='notes'?'READ ME.txt':(category||'FILE EXPLORER').toUpperCase();
    if(!app)return;
    if(app==='notes'){
      body.innerHTML='<article class="os-readme"><small>README.txt / PROTOTYPE</small><h2>Hey, I’m Steven.</h2><p>This desktop is where you explore systems, apps, UI/UX designs, and machine learning experiments.</p><p>Open a folder, choose a project file, and read its case study. You can move this window, minimize it, or reopen it from the taskbar.</p><p class="os-notice">Ayos! is the featured project. Other files are prototype samples. More project details and links will follow.</p></article>';return;
    }
    const entries=projects[category];
    body.innerHTML='<aside class="explorer-sidebar"><strong>WORK DIRECTORY</strong>'+Object.keys(projects).map(c=>'<button data-folder="'+c+'" aria-pressed="'+(c===category)+'">'+escape(icons[c])+' '+c+'</button>').join('')+'</aside><div class="explorer-main"><div class="explorer-address"><button class="file-back" '+(file===null?'disabled':'')+' aria-label="Back to folder">←</button><span>Work / '+category+(file===null?'':' / case-study')+'</span></div><div class="explorer-content"></div></div>';
    const content=body.querySelector('.explorer-content');
    if(file===null){
      content.innerHTML='<label class="file-search">⌕ <input type="search" aria-label="Search project files" placeholder="Search this folder" value="'+escape(query)+'"></label><div class="file-list"></div><p class="os-notice">Selected work / other entries are prototype samples.</p>';
      const drawFiles=()=>{
        content.querySelector('.file-list').innerHTML=entries.map((p,i)=>({p,i})).filter(({p})=>p.name.toLowerCase().includes(query.toLowerCase())).map(({p,i})=>'<button class="project-file" data-file="'+i+'"><span>'+p.mark+'</span><strong>'+p.name+'</strong><small>CASE STUDY / '+category.toUpperCase()+'</small></button>').join('')||'<p class="empty-folder">No matching files.</p>';
      };
      drawFiles();content.querySelector('input').addEventListener('input',e=>{query=e.target.value;drawFiles();});
    }else{
      const p=entries[file];
      if(p.featured){
        content.innerHTML='<article class="os-case-study featured-case"><small>FEATURED PROJECT / '+p.stack+'</small><h2>'+p.name+'</h2><p class="project-achievement">'+p.achievement+'</p><p>'+p.description+'</p><div class="report-diagram"><span>User</span><b>→ Report →</b><span>LGU</span></div><small class="diagram-caption">Concept diagram / project screenshot to be added</small><h3>Connecting a report with the right place</h3><p>Ayos! brings users and LGUs into a reporting system. This project was a regional finalist in the Philippine Startup Challenge.</p><h3>My contribution and technical decisions</h3><p>Detailed contributions and implementation notes will be added to this case study.</p><button class="project-link-pending" disabled>PROJECT LINK / COMING SOON</button></article>';return;
      }
      content.innerHTML='<article class="os-case-study"><small>'+p.stack+'</small><div class="file-art">'+p.mark+'</div><h2>'+p.name+'</h2><p>'+p.description+'</p><h3>Case study outline</h3><p>'+p.decision+'</p><p class="os-notice">Sample file. No project outcomes or metrics have been invented.</p></article>';
    }
  }
  function openFolder(c){category=c;file=null;query='';app='explorer';minimized=false;renderWindow();focus('.file-search input');}
  element.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.folder){openFolder(b.dataset.folder);return;}
    if(b.dataset.file!==undefined){file=Number(b.dataset.file);renderWindow();focus('.file-back');return;}
    if(b.dataset.app){app='notes';minimized=false;renderWindow();focus('.window-close');}
    if(b.matches('.os-exit'))onExit();
    if(b.matches('.window-close')){app=null;renderWindow();focus('.folder');}
    if(b.matches('.window-minimize')){minimized=true;renderWindow();focus('.task-window');}
    if(b.matches('.task-window')){minimized=!minimized;renderWindow();if(!minimized)focus('.window-close');}
    if(b.matches('.os-home')){if(app){minimized=true;renderWindow();}focus('.folder');}
    if(b.matches('.file-back')){file=null;renderWindow();focus('.file-search input');}
  });
  // Convert viewport pointer deltas into the monitor's local pixel coordinates.
  const title=element.querySelector('.window-title');
  title.addEventListener('pointerdown',e=>{
    if(e.target.closest('button')||e.button!==0)return;
    const bounds=element.getBoundingClientRect();
    drag={id:e.pointerId,x:e.clientX,y:e.clientY,start:{...position},scaleX:1000/bounds.width,scaleY:554/bounds.height};
    title.setPointerCapture(e.pointerId);e.preventDefault();
  });
  title.addEventListener('pointermove',e=>{
    if(!drag||e.pointerId!==drag.id)return;
    position.x=Math.max(0,Math.min(1000-760,drag.start.x+(e.clientX-drag.x)*drag.scaleX));
    position.y=Math.max(38,Math.min(554-42-420,drag.start.y+(e.clientY-drag.y)*drag.scaleY));place();
  });
  const stopDrag=()=>{drag=null;};title.addEventListener('pointerup',stopDrag);title.addEventListener('pointercancel',stopDrag);title.addEventListener('lostpointercapture',stopDrag);
  function resize(){update();}
  resize();place();
  function update(){
    if(!active)return;
    if(hasWebGL){
      // Project three corners of the monitor's plane. The desk camera faces it
      // squarely, so this affine transform matches the screen without CSS3D hit-test issues.
      camera.updateMatrixWorld();screen.updateWorldMatrix(true,false);
      const corner=(x,y)=>new THREE.Vector3(x,y,.002).applyMatrix4(screen.matrixWorld).project(camera);
      const tl=corner(-1.01,.56),tr=corner(1.01,.56),bl=corner(-1.01,-.56);
      const pixel=p=>({x:(p.x*.5+.5)*stage.clientWidth,y:(-p.y*.5+.5)*stage.clientHeight});
      const a=pixel(tl),b=pixel(tr),c=pixel(bl);
      element.style.transform='matrix('+[(b.x-a.x)/1000,(b.y-a.y)/1000,(c.x-a.x)/554,(c.y-a.y)/554,a.x,a.y].join(',')+')';
    }
  }
  return {
    enter(){
      active=true;stage.classList.add('using-pc');layer.domElement.hidden=false;
      if(!hasWebGL){stage.classList.add('desktop-fallback');layer.domElement.append(element);element.style.transform='none';}
      category='Apps';file=0;query='';app='explorer';minimized=false;renderWindow();update();focus('.file-back');
      const now=new Date();element.querySelector('.os-clock').textContent=now.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
    },
    exit(){active=false;drag=null;layer.domElement.hidden=true;stage.classList.remove('using-pc','desktop-fallback');},
    browse(){app=null;renderWindow();focus('.folder');},
    resize,update,get active(){return active;}
  };
}
