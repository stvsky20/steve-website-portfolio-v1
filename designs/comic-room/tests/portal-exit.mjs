import {chromium} from '@playwright/test';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({viewport:{width:1536,height:960}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
  await page.goto('http://127.0.0.1:5174/',{waitUntil:'networkidle'});
  await page.evaluate(()=>{
    window.exitSamples=[];function sample(){const p=__roomDebug.couchPortal,c=__roomDebug.camera;if(p.active&&p.inside)exitSamples.push({z:c.position.z,visible:p.lining.parent.visible,phase:p.phase,exit:p.lining.userData.exitZ,near:c.near});requestAnimationFrame(sample);}sample();
  });
  await page.locator('#contact-label').click();
  await page.waitForFunction(()=>__roomDebug.couchPortal.phase==='train');
  await page.screenshot({path:'qa/portal-physical-exit.png'});
  await page.locator('.portal-contact').waitFor({state:'visible',timeout:12000});
  const result=await page.evaluate(async()=>{
    const p=__roomDebug.couchPortal,c=__roomDebug.camera;
    const {Raycaster,Vector2}=await import('/node_modules/three/build/three.module.js');let hits=0;const ray=new Raycaster();
    for(const x of [-1,-.5,0,.5,1])for(const y of [-1,-.5,0,.5,1]){ray.setFromCamera(new Vector2(x,y),c);hits+=ray.intersectObject(p.lining).length;}
    return{samples:exitSamples,wallHits:hits};
  });
  if(result.samples.some(s=>!s.visible&&s.z>=s.exit-s.near))throw Error('Tunnel hidden before camera physically exited');
  if(!result.samples.some(s=>s.phase==='train'&&s.visible))throw Error('Shell did not persist through train handoff');
  if(!result.samples.some(s=>!s.visible))throw Error('Shell did not clear after camera exited');
  if(result.wallHits)throw Error('Tunnel walls remain in the contact camera frustum');
  await page.keyboard.press('Escape');await page.waitForTimeout(1100);
  if(!await page.evaluate(()=>__roomDebug.couchPortal.lining.parent.visible))throw Error('Return did not restore tunnel');
  if(errors.length)throw Error(errors.join('\n'));
  console.log('PASS physical exit: no premature shell removal; train handoff retains tunnel; all 25 final view rays clear; return restores shell',result.samples.length,'samples');
}finally{await browser.close();}
