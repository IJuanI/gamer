const puppeteer = require('puppeteer');

async function test() {
  console.log('🧪 Theme Toggle Test via LAN IP (mobile viewport + touch)\n');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
    await page.setUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    );

    const logs = [];
    page.on('console', (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));
    page.on('pageerror', (err) => logs.push(`[pageerror] ${err.message}`));
    page.on('requestfailed', (req) => logs.push(`[requestfailed] ${req.url()} ${req.failure()?.errorText}`));
    page.on('response', (res) => {
      if (!res.ok() && res.status() !== 304) logs.push(`[badresponse] ${res.status()} ${res.url()}`);
    });

    console.log('1️⃣  Loading http://192.168.68.106:3000/devs ...');
    const resp = await page.goto('http://192.168.68.106:3000/devs', { waitUntil: 'networkidle2', timeout: 30000 });
    console.log('Response status:', resp.status(), '\n');

    console.log('2️⃣  Locating theme toggle button...');
    const box = await page.evaluate(() => {
      const btn = document.querySelector('button[aria-label="Toggle theme"]');
      if (!btn) return null;
      const r = btn.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    });
    console.log('Button box:', box, '\n');

    if (!box) {
      console.log('❌ Theme toggle button not found in DOM');
      console.log('Logs so far:');
      logs.forEach((l) => console.log('  ' + l));
      return false;
    }

    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;

    console.log('3️⃣  Checking element at button center (overlay check)...');
    const topEl = await page.evaluate((cx, cy) => {
      const el = document.elementFromPoint(cx, cy);
      return el ? { tag: el.tagName, cls: el.className, isBtnOrChild: el.tagName === 'BUTTON' || !!el.closest('button[aria-label="Toggle theme"]') } : null;
    }, cx, cy);
    console.log('Top element:', topEl, '\n');

    const htmlClassBefore = await page.evaluate(() => document.documentElement.className);
    console.log('html class before tap:', htmlClassBefore, '\n');

    console.log('4️⃣  Tapping theme toggle...');
    await page.touchscreen.tap(cx, cy);
    await new Promise((r) => setTimeout(r, 1000));

    const htmlClassAfter = await page.evaluate(() => document.documentElement.className);
    console.log('html class after tap:', htmlClassAfter, '\n');

    console.log('📋 Logs:');
    logs.forEach((l) => console.log('  ' + l));

    const changed = htmlClassBefore !== htmlClassAfter;
    console.log('\n' + (changed ? '✅ THEME CHANGED' : '❌ THEME DID NOT CHANGE'));
    return changed;
  } catch (e) {
    console.error('❌ Error:', e.message);
    console.error(e.stack);
    return false;
  } finally {
    if (browser) await browser.close();
  }
}

test().then((s) => process.exit(s ? 0 : 1));
