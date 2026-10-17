const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
 const browser = await chromium.launch({channel:'chrome',headless:true});
 try {
  for (const width of [390,768,1440]) {
   const page = await browser.newPage({viewport:{width,height:900}});
   await page.goto(process.env.PREVIEW_URL || 'http://127.0.0.1:4176');
   await page.evaluate(() => document.fonts.ready);
   for (const progress of [.1,.85,.3,.95]) {
    await page.evaluate(p => {
     document.documentElement.style.scrollBehavior='auto';
     const el=document.querySelector('.history-timeline');
     const r=el.getBoundingClientRect();
     const top=parseFloat(getComputedStyle(el,'::after').top);
     scrollTo(0,scrollY+r.top+top+(r.height-top)*p-innerHeight*.45);
    },progress);
    await page.waitForTimeout(80);
    const result=await page.evaluate(() => {
     const el=document.querySelector('.history-timeline');
     const s=getComputedStyle(el,'::after');
     const r=el.getBoundingClientRect(); const top=parseFloat(s.top);
     return {actual:new DOMMatrix(s.transform).m22,expected:Math.max(0,Math.min(1,(innerHeight*.45-r.top-top)/(r.height-top))),animation:s.animationName};
    });
    assert.equal(result.animation,'timeline-fill');
    assert.ok(Math.abs(result.actual-result.expected)<.003,JSON.stringify({width,progress,...result}));
   }
   if (process.env.CAPTURE_DIR) await page.screenshot({path:`${process.env.CAPTURE_DIR}/timeline-${width}.png`});
   console.log(`PASS ${width}px: rapid forward/reverse scroll, fill tracks 45% reading line`);
   await page.close();
  }
 } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exit(1)});
