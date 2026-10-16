// Serve this worktree on 4176; run with Playwright available in NODE_PATH.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:4176';
const capture = process.env.CAPTURE_DIR;
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  if (capture) fs.mkdirSync(capture, { recursive: true });
  try {
    for (const width of [320, 390, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce', hasTouch: width < 600, isMobile: width < 600 });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(base);
      await page.evaluate(() => document.fonts.ready);
      const screenshot = async name => { if (capture) await page.screenshot({ path: `${capture}/${width}-${name}.png` }); };
      const navigate = async id => {
        await page.locator('.section-menu summary').click();
        await page.locator(`.section-menu a[href="#${id}"]`).click();
        assert.equal(await page.locator('.section-menu').getAttribute('open'), null);
      };
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      assert.equal(await page.locator('.hero-photo > img').evaluate(el => getComputedStyle(el).animationName), 'none');
      assert.ok(await page.locator('.identity-header').evaluate(el => {
        const logo = el.querySelector('.site-identity').getBoundingClientRect();
        const menu = el.querySelector('summary').getBoundingClientRect();
        return logo.right < menu.left && menu.right <= innerWidth;
      }), `Header overlap at ${width}`);
      await screenshot('hero');
      await navigate('luoc-su');
      await page.waitForFunction(() => document.querySelector('.timeline-entry.is-current'));
      assert.equal(await page.locator('.section-menu a[aria-current]').textContent(), 'Lược sử');
      assert.ok(await page.locator('#luoc-su').evaluate(el => el.getBoundingClientRect().top >= document.querySelector('.site-header').offsetHeight));
      await screenshot('timeline');
      await page.locator('.section-menu summary').click();
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('.section-menu').getAttribute('open'), null);
      await navigate('tu-si');
      await page.locator('.person-card img').evaluateAll(images => Promise.all(images.map(img => { img.loading = 'eager'; return img.decode(); })));
      await screenshot('portraits');
      if (width < 600) {
        if (width === 390) {
          const cdp = await page.context().newCDPSession(page);
          const box = await page.locator('.personnel-grid').boundingBox();
          const y = box.y + box.height / 2;
          await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 300, y }] });
          for (const x of [270, 220, 170, 120, 70]) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y }] });
          await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
          await page.waitForFunction(() => document.querySelector('.personnel-grid').scrollLeft > 100);
        }
        await page.locator('.personnel-grid').focus();
        await page.keyboard.press('ArrowRight');
        await page.waitForFunction(() => document.querySelector('.personnel-grid').scrollLeft > 100);
        await page.keyboard.press('End');
        await page.waitForFunction(() => { const el = document.querySelector('.personnel-grid'); return el.scrollWidth - el.clientWidth - el.scrollLeft < 2; });
        await page.keyboard.press('Home');
        await page.waitForFunction(() => document.querySelector('.personnel-grid').scrollLeft < 2);
      }
      await navigate('thu-vien');
      const range = page.locator('.comparison-range').first();
      await range.scrollIntoViewIfNeeded();
      await page.locator('.cd-image-container').first().evaluate(async el => Promise.all([...el.querySelectorAll('img')].map(img => img.decode())));
      await screenshot('gallery');
      assert.equal(await range.inputValue(), '50');
      if (width === 390) {
        const cdp = await page.context().newCDPSession(page);
        const box = await range.boundingBox();
        const y = box.y + box.height / 2;
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: box.x + box.width / 2, y }] });
        for (const fraction of [.55, .6, .65, .7, .75]) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: box.x + box.width * fraction, y }] });
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        assert.ok(Number(await range.inputValue()) > 65, 'Horizontal touch did not move comparison');
        const value = await range.inputValue();
        const scrollBefore = await page.evaluate(() => scrollY);
        const handle = await page.locator('.cd-handle').first().boundingBox();
        const x = handle.x + handle.width / 2;
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
        for (const distance of [30, 60, 90, 120, 150]) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - distance }] });
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await page.waitForFunction(before => scrollY > before + 50, scrollBefore);
        assert.equal(await range.inputValue(), value, 'Vertical swipe changed comparison');
        await range.scrollIntoViewIfNeeded();
        console.log('PASS touch: portrait swipe, comparison drag and vertical page scroll');
      }
      await range.focus();
      for (const [key, expected] of [['Home', '0'], ['End', '100']]) {
        await page.keyboard.press(key);
        assert.equal(await range.inputValue(), expected);
      }
      await page.keyboard.press('Home');
      const box = await range.boundingBox();
      await page.mouse.click(box.x + box.width * .75, box.y + box.height / 2);
      assert.ok(Number(await range.inputValue()) > 60);
      const button = page.locator('.view-large').first();
      await button.click();
      assert.equal(await page.locator('dialog').evaluate(el => el.open), true);
      await page.waitForFunction(() => document.querySelector('.photo-large').naturalWidth > 0 && document.querySelector('.photo-status').textContent === '');
      assert.ok((await page.locator('.photo-large').getAttribute('src')).includes('interior-a'));
      await page.getByRole('button', { name: 'Ảnh B', exact: true }).click();
      await page.waitForFunction(() => document.querySelector('.photo-status').textContent === '');
      assert.ok((await page.locator('.photo-large').getAttribute('src')).includes('hero.webp'));
      await screenshot('dialog');
      await page.getByRole('button', { name: 'Phóng to', exact: true }).click();
      assert.ok(await page.locator('.photo-stage').evaluate(el => el.scrollWidth > el.clientWidth));
      await page.getByRole('button', { name: 'Thu nhỏ', exact: true }).click();
      await page.keyboard.press('Escape');
      await page.waitForFunction(() => !document.documentElement.classList.contains('photo-open'));
      assert.equal(await page.locator('dialog').evaluate(el => el.open), false);
      assert.equal(await button.evaluate(el => document.activeElement === el), true);
      assert.equal(await page.locator('html').evaluate(el => el.classList.contains('photo-open')), false);
      await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForFunction(() => Number(document.querySelector('.site-header').style.getPropertyValue('--reading-progress')) > .99);
      await page.locator('.site-identity').click();
      await page.waitForFunction(() => scrollY === 0);
      assert.deepEqual(errors, []);
      console.log(`PASS ${width}px: header, menu, timeline, carousel keyboard, comparison, dialog/focus, progress, reduced motion`);
      await page.close();
    }
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(base);
    assert.equal(await page.locator('.hero-photo > img').evaluate(el => getComputedStyle(el).animationName), 'hero-settle');
    await page.locator('.parish-stats').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => [...document.querySelectorAll('.parish-stats strong [aria-hidden]')].map(el => el.textContent).join(',') === '~1000,20,~520,~120');
    const first = page.locator('.comparison-range').first();
    await first.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => Number(document.querySelector('.comparison-range').value) > 50);
    await first.focus();
    await page.keyboard.press('End');
    await page.waitForTimeout(1400); // Outlast the hint to catch input takeover regressions.
    assert.equal(await first.inputValue(), '100');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await page.locator('.hero-photo > img').evaluate(el => getComputedStyle(el).animationName), 'none');
    console.log('PASS motion: hero, final counters, hint cancellation, live reduced-motion change');
    await page.close();
    const noJS = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    await noJS.goto(base);
    assert.equal(await noJS.locator('.view-large:visible').count(), 0);
    assert.equal(await noJS.locator('.person-card').count(), 6);
    assert.equal(await noJS.locator('.parish-stats strong').first().textContent(), '~1000');
    console.log('PASS no JavaScript: content/stats remain, unavailable dialog controls hidden');
    await noJS.close();
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
