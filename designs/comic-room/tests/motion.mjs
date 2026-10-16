import {chromium} from '@playwright/test';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({viewport:{width:1536,height:960}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:5174/',{waitUntil:'networkidle'});
await page.waitForTimeout(400);
const sample=()=>page.evaluate(()=>({
 clock:__roomDebug.comicWorld.motionClock,
 card:__roomDebug.comicWorld.objects[0].group.position.toArray()
}));
const a=await sample();await page.waitForTimeout(400);const b=await sample();
if(b.clock<=a.clock||a.card.every((v,i)=>Math.abs(v-b.card[i])<.001))throw Error('Ambient animation did not move');
await page.locator('#motion-toggle').click();await page.waitForTimeout(100);
const c=await sample();await page.waitForTimeout(400);const d=await sample();
if(c.clock!==d.clock||c.card.some((v,i)=>Math.abs(v-d.card[i])>.001))throw Error('Pause did not freeze decorative motion');
await page.locator('#pc-label').click();await page.locator('#world-desktop').waitFor({state:'visible'});
if(await page.locator('.comic-motion').evaluate(el=>el.getAnimations({subtree:true}).length))throw Error('Paused travel effect remains');
await page.keyboard.press('Escape');await page.waitForTimeout(1000);
await page.locator('#motion-toggle').click();
await page.locator('#pc-label').hover();
if(await page.locator('.comic-motion g').nth(1).evaluate(el=>Number(el.style.opacity))<.5)throw Error('Object ink feedback missing');
await page.screenshot({path:'qa/room-motion-hover.png'});
await page.locator('#pc-label').click();
await page.waitForTimeout(80);
if(!await page.locator('.comic-motion').evaluate(el=>el.getAnimations({subtree:true}).length))throw Error('Travel lines missing');
await page.screenshot({path:'qa/room-motion-travel.png'});
await page.locator('#world-desktop').waitFor({state:'visible'});await page.keyboard.press('Escape');await page.waitForTimeout(1000);
await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(200);
const e=await sample();await page.waitForTimeout(400);const f=await sample();
if(e.clock!==f.clock||e.card.some((v,i)=>Math.abs(v-f.card[i])>.001))throw Error('Reduced motion still animates');
await page.locator('#pc-label').click();await page.locator('#world-desktop').waitFor({state:'visible'});
if(await page.locator('.comic-motion').evaluate(el=>el.getAnimations({subtree:true}).length))throw Error('Reduced motion travel remains');
if(errors.length)throw Error(errors.join('\n'));
console.log('Motion, pause/resume, navigation while paused, object feedback, travel accents and reduced motion passed.');
await browser.close();
