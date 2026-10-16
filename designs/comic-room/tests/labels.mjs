import {chromium} from '@playwright/test';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({viewport:{width:1536,height:960}});
try{
 await page.goto('http://127.0.0.1:5174/',{waitUntil:'networkidle'});
 await page.evaluate(()=>__roomDebug.rooftop.city.assetReady);
 await page.locator('.scene-settings summary').click();
 const toggle=page.locator('#labels-toggle');
 if(await toggle.getAttribute('aria-pressed')!=='true')throw Error('Labels must start on');
 await toggle.click();await page.waitForTimeout(100);
 if(await toggle.getAttribute('aria-pressed')!=='false'||await page.locator('.object-label:visible').count())throw Error('Labels were not hidden');
 await page.screenshot({path:'qa/room-labels-hidden.png'});
 const point=await page.evaluate(()=>{const d=__roomDebug,p=d.rooftop.windowSurface.getWorldPosition(d.camera.position.clone()).project(d.camera);return{x:(p.x*.5+.5)*innerWidth,y:(-p.y*.5+.5)*innerHeight};});
 await page.mouse.click(point.x,point.y);await page.locator('.roof-skip').click();await page.locator('.roof-return').click();await page.waitForTimeout(1100);
 if(await page.locator('.object-label:visible').count())throw Error('Return reset hidden label state');
 if(!await page.locator('.room-map summary').evaluate(el=>el===document.activeElement))throw Error('Hidden label received return focus');
 await page.locator('.scene-settings summary').click();
 await toggle.focus();await page.keyboard.press('Space');await page.waitForTimeout(100);
 if(await toggle.getAttribute('aria-pressed')!=='true'||await page.locator('.object-label:visible').count()!==4)throw Error('Keyboard toggle did not restore labels: '+JSON.stringify(await page.evaluate(()=>({pressed:document.querySelector('#labels-toggle').getAttribute('aria-pressed'),labels:[...document.querySelectorAll('.object-label')].map(x=>getComputedStyle(x).visibility),active:document.activeElement?.id,settings:document.querySelector('.scene-settings').open}))));
 console.log('PASS labels toggle, physical picking with labels hidden, state retained on return, accessible return focus and keyboard toggle');
}finally{await browser.close();}
