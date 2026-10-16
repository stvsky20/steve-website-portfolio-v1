import {chromium} from '@playwright/test';
async function clickOption(page,id){if(!await page.locator('.scene-settings').evaluate(el=>el.open))await page.locator('.scene-settings summary').click();await page.locator(id).click();}

const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({viewport:{width:1536,height:960}});
await page.goto('http://127.0.0.1:5174/',{waitUntil:'networkidle'});
await page.waitForTimeout(500);
for(const destination of ['pc','about']) {
 const point=await page.evaluate(destination=>{
  const d=window.__roomDebug;let mesh;d.scene.traverse(o=>{if(o.userData.destination===destination&&o.geometry?.type==='PlaneGeometry')mesh=o;});
  const p=mesh.getWorldPosition(mesh.position.clone()).project(d.camera);const r=document.querySelector('#room').getBoundingClientRect();
  return {x:r.left+(p.x*.5+.5)*r.width,y:r.top+(-p.y*.5+.5)*r.height};
 },destination);
 await page.mouse.click(point.x,point.y);await page.locator(destination==='pc'?'#world-desktop':'#board-view').waitFor({state:'visible',timeout:4000});
 console.log('3D picking passed: '+destination);await page.keyboard.press('Escape');await page.waitForTimeout(1000);
}
const before=await page.evaluate(()=>window.__roomDebug.camera.position.toArray());
await page.mouse.move(600,700);await page.mouse.down();await page.mouse.move(750,690,{steps:10});await page.mouse.up();await page.waitForTimeout(500);
const after=await page.evaluate(()=>window.__roomDebug.camera.position.toArray());
if(JSON.stringify(before)===JSON.stringify(after))throw Error('Orbit drag failed');
await clickOption(page,'#reset');await page.waitForTimeout(1200);
console.log('Drag and reset passed.');
const fallback=await browser.newPage({viewport:{width:1200,height:800}});
await fallback.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl'||type==='webgl2'?null:original.call(this,type,...args);};});
await fallback.goto('http://127.0.0.1:5174/');
await fallback.locator('.room-map summary').click();await fallback.getByRole('button',{name:'Projects ↗',exact:true}).click();await fallback.locator('#world-desktop').waitFor({state:'visible'});
console.log('No-WebGL HTML navigation fallback passed.');
await browser.close();

