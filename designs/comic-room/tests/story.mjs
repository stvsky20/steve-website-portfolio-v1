import {chromium} from '@playwright/test';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({viewport:{width:1536,height:960}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:5174/',{waitUntil:'networkidle'});await page.evaluate(()=>__roomDebug.rooftop.city.assetReady);
 await page.screenshot({path:'qa/story-introduction.png'});
 await page.getByRole('button',{name:'START WITH MY WORK',exact:false}).first().click();await page.locator('.featured-case').waitFor({state:'visible'});
 if(!await page.locator('.featured-case').innerText().then(s=>s.includes('Ayos!')&&s.includes('Regional finalist')&&s.includes('local government units')))throw Error('Featured Ayos! facts missing');
 if(!await page.locator('.project-link-pending').isDisabled())throw Error('Placeholder link must be disabled');
 await page.screenshot({path:'qa/story-featured-ayos.png'});
 await page.getByRole('button',{name:'SEE HOW I THINK'}).click();await page.locator('#board-view').waitFor({state:'visible'});await page.screenshot({path:'qa/story-approach.png'});
 await page.getByRole('button',{name:'Take the rooftop detour'}).click();await page.locator('.roof-skip').click();
 if(await page.locator('#stage').getAttribute('data-story-scene')!=='rooftop')throw Error('Optional chapter missing');
 await page.getByRole('button',{name:'CONTINUE TO CONNECT'}).click();await page.locator('.portal-skip').click();await page.locator('.contact-email').waitFor({state:'visible'});await page.screenshot({path:'qa/story-ending.png'});
 await page.getByRole('button',{name:'EXPLORE THE ROOM AGAIN'}).click();await page.waitForTimeout(1000);
 if(await page.locator('#stage').getAttribute('data-story-scene')!=='room')throw Error('Ending did not return to free exploration');
 await page.locator('.room-map summary').click();const before=Date.now();await page.getByRole('button',{name:'Contact ↗',exact:true}).click();await page.locator('.contact-email').waitFor({state:'visible',timeout:1000});
 if(Date.now()-before>1000)throw Error('Direct contact still waits for the portal');
 await page.keyboard.press('Escape');await page.waitForTimeout(1000);await page.locator('.story-index summary').click();await page.getByRole('button',{name:'02 / Selected work',exact:true}).click();await page.locator('.featured-case').waitFor({state:'visible'});
 await page.getByRole('button',{name:'Browse project folders'}).click();await page.locator('.folder[data-folder="ML"]').click();await page.locator('.project-file').first().click();if(!await page.getByRole('heading',{name:'Pattern recognition'}).isVisible())throw Error('Free project browsing broken');
 await page.keyboard.press('Escape');await page.waitForTimeout(1000);await page.emulateMedia({reducedMotion:'reduce'});await page.locator('#pc-label').click();await page.locator('.featured-case').waitFor({state:'visible'});
 if(errors.length)throw Error(errors.join('\n'));
 console.log('PASS guided intro, real Ayos! feature, process board, optional rooftop, ending, direct contact, bookmarks, free browsing and reduced motion');
}finally{await browser.close();}
