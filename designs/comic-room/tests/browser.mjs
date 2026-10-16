import { chromium } from '@playwright/test';
async function clickOption(page,id){if(!await page.locator('.scene-settings').evaluate(el=>el.open))await page.locator('.scene-settings summary').click();await page.locator(id).click();}

const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1536,height:960},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.goto('http://127.0.0.1:5174/',{waitUntil:'networkidle'});
await page.waitForTimeout(2200);
await page.screenshot({path:'qa/room-desktop.png'});
console.log(JSON.stringify(await page.evaluate(()=>({fps:window.__roomDebug.fps,meshes:window.__roomDebug.meshCount,drawCalls:window.__roomDebug.renderer.info.render.calls,triangles:window.__roomDebug.renderer.info.render.triangles,canvas:{w:document.querySelector('canvas').width,h:document.querySelector('canvas').height}}))));
await clickOption(page,'#desk-study');
await page.waitForTimeout(1000);
if(await page.locator('#desk-study').getAttribute('aria-pressed')!=='true')throw Error('Desk study state failed');
await page.screenshot({path:'qa/desk-study.png'});
await clickOption(page,'#reset');
await page.waitForTimeout(1000);
if(await page.locator('#desk-study').getAttribute('aria-pressed')!=='false')throw Error('Desk study reset failed');
await clickOption(page,'#desk-study'); await page.waitForTimeout(950); await page.keyboard.press('Escape'); await page.waitForTimeout(950); if(await page.locator('#desk-study').getAttribute('aria-pressed')!=='false')throw Error('Desk study Escape failed');
await page.locator('#pc-label').click();
await page.locator('#world-desktop').waitFor({state:'visible'});
await page.locator('.desktop-icons [data-folder="ML"]').click();
await page.locator('.project-file').first().click();
if(!await page.getByRole('heading',{name:'Pattern recognition'}).isVisible())throw Error('Case study did not open');
await page.screenshot({path:'qa/project-desktop.png'});
await page.keyboard.press('Escape');await page.waitForTimeout(1000);
await page.locator('.room-map summary').click(); await page.getByRole('button',{name:'About ↗',exact:true}).click();await page.locator('#board-view').waitFor({state:'visible'});
if(!await page.locator('.board-exit').isVisible())throw Error('About failed');
await page.keyboard.press('Escape');await page.waitForTimeout(1000);
await page.locator('.room-map summary').click(); await page.getByRole('button',{name:'Contact ↗',exact:true}).click();await page.locator('.portal-contact').waitFor({state:'visible'});
if(!await page.getByRole('heading',{name:/LET’S TALK/}).isVisible())throw Error('Contact failed');
await page.keyboard.press('Escape');await page.waitForTimeout(1000);
await clickOption(page,'#ink-toggle');if(await page.locator('#ink-toggle').getAttribute('aria-pressed')!=='false')throw Error('Texture toggle failed');
await clickOption(page,'#ink-toggle');
await page.emulateMedia({reducedMotion:'reduce'});
await clickOption(page,'#desk-study');
await page.waitForTimeout(1000);
if(await page.locator('#desk-study').getAttribute('aria-pressed')!=='true')throw Error('Desk study state failed');
await page.screenshot({path:'qa/desk-study.png'});
await clickOption(page,'#reset');
await page.waitForTimeout(1000);
if(await page.locator('#desk-study').getAttribute('aria-pressed')!=='false')throw Error('Desk study reset failed');
await clickOption(page,'#desk-study'); await page.waitForTimeout(950); await page.keyboard.press('Escape'); await page.waitForTimeout(950); if(await page.locator('#desk-study').getAttribute('aria-pressed')!=='false')throw Error('Desk study Escape failed');
await page.locator('#pc-label').click();await page.locator('#world-desktop').waitFor({state:'visible'});
await page.keyboard.press('Escape');await page.waitForTimeout(200);
console.log('Navigation, categories, case study, About, Contact, texture toggle, Escape, reduced motion passed.');
console.log('Browser errors: '+JSON.stringify(errors));
await browser.close();
if(errors.length)process.exitCode=1;



