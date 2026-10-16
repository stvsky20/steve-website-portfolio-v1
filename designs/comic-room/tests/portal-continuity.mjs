import {chromium} from '@playwright/test';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({viewport:{width:1536,height:960}});
await page.goto('http://127.0.0.1:5174/',{waitUntil:'networkidle'});
await page.locator('#contact-label').click();
await page.waitForFunction(()=>__roomDebug.couchPortal.timeline>=__roomDebug.couchPortal.crossingAt-220);
const result=await page.evaluate(()=>new Promise(resolve=>{
 const samples=[],start=performance.now();
 function frame(){
  const d=__roomDebug,p=d.couchPortal;
  const mouth=p.portal.children.find(o=>o.geometry?.type==='PlaneGeometry');
  const q=d.camera.quaternion.clone();
  if(!p.inside)q.premultiply(mouth.getWorldQuaternion(q.clone()).invert());
  samples.push({time:performance.now(),inside:p.inside,position:p.portalEye.toArray(),rotation:q.toArray()});
  if(performance.now()-start<850)requestAnimationFrame(frame);else resolve(samples);
 }requestAnimationFrame(frame);
}));
const crossed=result.findIndex((v,i)=>i>0&&v.inside&&!result[i-1].inside);
if(crossed<1)throw Error('No continuous entrance crossing recorded');
const a=result[crossed-1],b=result[crossed];
const distance=Math.hypot(...a.position.map((v,i)=>v-b.position[i]));
const dot=Math.abs(a.rotation.reduce((sum,v,i)=>sum+v*b.rotation[i],0));
const elapsed=(b.time-a.time)/1000,angle=2*Math.acos(Math.min(1,dot));
// Judge travel per second; a slower headless frame must not look like a teleport.
if(distance>30*elapsed+.1||angle>10*elapsed+.06)throw Error('Pose jump at portal: '+JSON.stringify({distance,dot,elapsed}));
await page.screenshot({path:'qa/portal-continuous-interior.png'});
console.log('Portal pose continuity passed: '+JSON.stringify({distance,quaternionDot:dot,elapsed,samples:result.length}));
await page.keyboard.press('Escape');await page.waitForTimeout(1000);
if(await page.evaluate(()=>__roomDebug.couchPortal.inside))throw Error('Return left camera inside portal');
await browser.close();
