import {chromium} from '@playwright/test';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({viewport:{width:1536,height:960}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:5174/',{waitUntil:'networkidle'});
 await page.evaluate(()=>__roomDebug.rooftop.city.assetReady);
 const asset=await page.evaluate(()=>({imported:__roomDebug.rooftop.city.imported,error:__roomDebug.rooftop.city.assetError,styles:[...new Set(__roomDebug.rooftop.city.placements.map(b=>b.style))].length,sources:[...new Set(__roomDebug.rooftop.city.root.children.filter(b=>b.userData.source).map(b=>b.userData.source))].length,details:__roomDebug.rooftop.city.architecture?.partCount,batches:__roomDebug.rooftop.city.architecture?.batchCount}));if(asset.error||asset.imported!==96)throw Error('City import failed '+JSON.stringify(asset));
 if(asset.styles<5||asset.sources<8||asset.details<100||asset.batches>30)throw Error('Architecture variety/detail budget missing '+JSON.stringify(asset));
 const horizon=await page.evaluate(async()=>{
  const city=__roomDebug.rooftop.city,h=city.horizon,{Raycaster,Vector3}=await import('/node_modules/three/build/three.module.js');
  const tower=h.bridge.children.find(o=>o.name==='Bridge_pointed_arch_tower');h.root.updateWorldMatrix(true,true);
  const ray=new Raycaster(),direction=new Vector3(0,0,-1).transformDirection(tower.matrixWorld);
  ray.set(tower.localToWorld(new Vector3(-8,45,30)),direction);const opening=ray.intersectObject(tower).length;
  ray.set(tower.localToWorld(new Vector3(0,45,30)),direction);const pier=ray.intersectObject(tower).length;
  // Downward probes must land on the road, quay, river or shore, never the sky dome.
  let groundMisses=0;
  for(const x of [-12,0,12])for(let z=-40;z>=-620;z-=10){
   ray.set(new Vector3(x,4,z),new Vector3(0,-1,0));
   const hit=ray.intersectObject(city.scene,true).find(h=>h.object.isMesh);
   if(!hit||hit.distance>5)groundMisses++;
  }
  return{groundMisses,layers:h.layers.map(l=>l.userData.depth),buildings:h.buildingCount,opening,pier,bridge:!!h.bridge.getObjectByName('Bridge_suspension_and_fan_cables')};
 });
 if(horizon.groundMisses||horizon.layers.length!==4||horizon.layers.some((v,i)=>i&&v<=horizon.layers[i-1])||horizon.buildings<200||horizon.opening||!horizon.pier||!horizon.bridge)throw Error('Layered horizon or dimensional bridge missing '+JSON.stringify(horizon));
 await page.locator('#motion-toggle').click();await page.waitForTimeout(250);
 const live=await page.evaluate(()=>{const d=__roomDebug,r=d.rooftop,colors=new Set(),pixel=new Uint8Array(4);
  for(let x=32;x<r.windowTarget.width;x+=100)for(let y=32;y<r.windowTarget.height;y+=50){d.renderer.readRenderTargetPixels(r.windowTarget,x,y,1,1,pixel);colors.add(Array.from(pixel).join(','));}
  return{mapped:r.windowSurface.material.map===r.windowTarget.texture,passes:r.windowPasses,colors:colors.size};
 });
 if(!live.mapped||!live.passes||live.colors<10)throw Error('City window is blank or not live '+JSON.stringify(live));
 await page.waitForTimeout(250);
 if(await page.evaluate(()=>__roomDebug.rooftop.windowPasses)!==live.passes)throw Error('Paused stationary window did not reuse frame');
 await page.evaluate(()=>{window.windowTestOrigin=__roomDebug.camera.position.clone();__roomDebug.camera.position.x+=.35;});await page.waitForTimeout(120);
 if(await page.evaluate(()=>__roomDebug.rooftop.windowPasses)<=live.passes)throw Error('Room camera movement did not refresh city window');
 await page.evaluate(()=>__roomDebug.camera.position.copy(windowTestOrigin));await page.locator('#motion-toggle').click();await page.waitForTimeout(100);
 await page.screenshot({path:'qa/room-rooftop-entry.png'});
 const point=await page.evaluate(()=>{const d=__roomDebug,p=d.rooftop.windowSurface.getWorldPosition(d.camera.position.clone()).project(d.camera);return{x:(p.x*.5+.5)*innerWidth,y:(-p.y*.5+.5)*innerHeight};});
 await page.mouse.click(point.x,point.y);
 await page.waitForFunction(()=>__roomDebug.rooftop.phase==='ascending',{},{timeout:5000});await page.screenshot({path:'qa/rooftop-ascent.png'});
 await page.waitForFunction(()=>__roomDebug.rooftop.phase==='rooftop',{},{timeout:5000});await page.screenshot({path:'qa/rooftop-ledge.png'});
 const before=await page.evaluate(()=>__roomDebug.camera.position.toArray());await page.waitForTimeout(250);if(JSON.stringify(before)!==JSON.stringify(await page.evaluate(()=>__roomDebug.camera.position.toArray())))throw Error('Ledge did not hold');
 await page.locator('.roof-leap').click();await page.waitForTimeout(1300);await page.screenshot({path:'qa/rooftop-slow-fall.png'});
 await page.waitForFunction(()=>__roomDebug.rooftop.phase==='suspended',{},{timeout:5000});await page.screenshot({path:'qa/rooftop-inverted-skyline.png'});
 const roll=await page.evaluate(()=>{const {camera}=__roomDebug;return camera.rotation.z;});if(Math.abs(roll)<2)throw Error('City did not invert');
 await page.setViewportSize({width:1200,height:800});await page.waitForTimeout(100);if(await page.evaluate(()=>__roomDebug.rooftop.phase)!=='suspended')throw Error('Resize interrupted roof');
 await page.locator('.roof-replay').click();await page.locator('.roof-return').click();await page.waitForTimeout(1000);
 if(await page.evaluate(()=>__roomDebug.rooftop.active||__roomDebug.camera.far!==120||__roomDebug.rooftop.windowSurface.material.map!==__roomDebug.rooftop.windowTarget.texture))throw Error('Roof did not restore room camera');
 if(!await page.locator('#window-label').evaluate(el=>el===document.activeElement))throw Error('Window focus not restored');
 await page.locator('#window-label').click();await page.keyboard.press('Escape');await page.waitForTimeout(1000);
 if(await page.evaluate(()=>__roomDebug.rooftop.active))throw Error('Roof interrupt failed');
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('#window-label').click();if(await page.evaluate(()=>__roomDebug.rooftop.phase)!=='rooftop')throw Error('Reduced roof failed');await page.locator('.roof-leap').click();if(await page.evaluate(()=>__roomDebug.rooftop.phase)!=='suspended')throw Error('Reduced leap failed');await page.keyboard.press('Escape');
 const fallback=await browser.newPage({viewport:{width:1200,height:800}});await fallback.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl'||type==='webgl2'?null:original.call(this,type,...args);};});await fallback.goto('http://127.0.0.1:5174/');await fallback.locator('.room-map summary').click();await fallback.getByRole('button',{name:'Rooftop ↗',exact:true}).click();await fallback.locator('.roof-leap').click();await fallback.locator('.roof-replay').waitFor({state:'visible'});await fallback.locator('.roof-return').click();if(await fallback.evaluate(()=>__roomDebug.rooftop.active))throw Error('Native fallback return failed');await fallback.close();
 if(errors.length)throw Error(errors.join('\n'));console.log('PASS imported city, physical window picking, ascent, ledge hold, slow inverted fall, replay, resize, return/focus, cancellation and reduced motion',asset,horizon);
}finally{await browser.close();}
