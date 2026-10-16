import {chromium} from '@playwright/test';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({viewport:{width:1536,height:960}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:5174/',{waitUntil:'networkidle'});
const result=await page.evaluate(async()=>{
  const {Raycaster,Vector3}=await import('/node_modules/three/build/three.module.js');
  const lining=__roomDebug.couchPortal.lining;lining.updateWorldMatrix(true,false);
  const ray=new Raycaster(),misses=[];
  for(const z of [-.5,-8,-30,-65])for(let i=0;i<36;i++){
    const angle=i*Math.PI/18;
    ray.set(new Vector3(0,0,z),new Vector3(Math.cos(angle),Math.sin(angle),0));
    if(!ray.intersectObject(lining,false).length)misses.push({z,angle});
  }
  return{misses,opaque:!lining.material.transparent};
});
if(result.misses.length||!result.opaque)throw Error('Tunnel wall leaks: '+JSON.stringify(result));
await page.locator('#contact-label').click();await page.waitForFunction(()=>__roomDebug.couchPortal.phase==='tunnel');
await page.waitForTimeout(250);await page.screenshot({path:'qa/enclosed-wormhole.png'});
await page.locator('.portal-skip').click();await page.locator('.portal-contact').waitFor({state:'visible'});
if(await page.evaluate(()=>__roomDebug.couchPortal.lining.parent.visible))throw Error('Tunnel lining remained at station');
await page.keyboard.press('Escape');await page.waitForTimeout(1000);
if(errors.length)throw Error(errors.join('\n'));
console.log('Opaque enclosure hit by all 144 side rays; tunnel framing, skip and station reveal passed.');
await browser.close();
