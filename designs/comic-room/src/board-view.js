export const boardNotes=[
  {title:'01 / NOTICE',lines:['DEFINE THE PROBLEM','WHO IS IT FOR?','WHAT SHOULD CHANGE?']},
  {title:'STEVEN JOE',lines:['Valdez','Software engineer','Systems / apps']},
  {title:'02 / EXPLORE',lines:['SKETCH OPTIONS','TEST ASSUMPTIONS','CHOOSE A DIRECTION']},
  {title:'03 / BUILD',lines:['IDEA','PROTOTYPE','ITERATE']},
  {title:'04 / TEST',lines:['Check behavior. Improve.']},
  {title:'AYOS! / CIVIC TECH',lines:['Reporting: users ↔ LGUs']},
  {title:'NEXT / CONNECT',lines:['What could we build?']}
];

export function createBoardView({stage,onExit,hasWebGL}){
  const element=document.createElement('section');element.id='board-view';element.hidden=true;
  element.setAttribute('aria-label','Whole corkboard view');
  element.innerHTML='<div class="board-view-caption"><span>02 / THE PERSON BEHIND IT</span><p>THE WHOLE PICTURE.</p></div><button class="board-exit">← BACK TO ROOM</button><div class="board-text"><h2>Steven Joe Valdez’s corkboard</h2>'+boardNotes.map(n=>'<article><h3>'+n.title+'</h3><p>'+n.lines.join(' · ')+'</p></article>').join('')+'</div>';
  stage.append(element);element.querySelector('.board-exit').addEventListener('click',onExit);
  let active=false;
  return{
    enter(){active=true;element.hidden=false;stage.classList.add('viewing-board');if(!hasWebGL)stage.classList.add('board-fallback');element.querySelector('.board-exit').focus({preventScroll:true});},
    exit(){active=false;element.hidden=true;stage.classList.remove('viewing-board','board-fallback');},
    get active(){return active;}
  };
}
