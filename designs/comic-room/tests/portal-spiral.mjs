import {chromium} from '@playwright/test';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({viewport:{width:1536,height:960}});
try{
 await page.goto('http://127.0.0.1:5174/',{waitUntil:'networkidle'});
 await page.locator('#contact-label').click();
 await page.evaluate(()=>{window.spiralSamples=[];function sample(){const d=__roomDebug,p=d.couchPortal;if(p.active){spiralSamples.push({t:p.timeline,inside:p.inside,x:d.camera.position.x,z:d.camera.position.z,q:d.camera.quaternion.toArray()});if(p.phase!=='arrived')requestAnimationFrame(sample);}}sample();});
 await page.waitForFunction(()=>__roomDebug.couchPortal.timeline>5300);
 await page.screenshot({path:'qa/portal-black-hole-spiral.png'});
 await page.locator('.portal-contact').waitFor({state:'visible',timeout:12000});
 const result=await page.evaluate(()=>{
  const p=__roomDebug.couchPortal,s=spiralSamples.filter(v=>v.inside&&v.t>=p.timings.diveEnd);
  let rotation=0;for(let i=1;i<s.length;i++){const dot=Math.abs(s[i].q.reduce((n,v,k)=>n+v*s[i-1].q[k],0));rotation+=2*Math.acos(Math.min(1,dot));}
  return{duration:s.at(-1).t,rotation,excursion:Math.max(...s.map(v=>Math.abs(v.x))),upright:__roomDebug.camera.up.clone().applyQuaternion(__roomDebug.camera.quaternion).y};
 });
 if(result.duration<8300||result.rotation<11||result.excursion<.25||result.upright<.99)throw Error('Long corkscrew or upright arrival missing: '+JSON.stringify(result));
 console.log('PASS longer spiral travel and upright arrival',result);
}finally{await browser.close();}
