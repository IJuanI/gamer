const puppeteer = require('puppeteer');

async function testMobileTouch() {
  console.log('🧪 Mobile Touch E2E Test\n');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // Emulate a real mobile device: viewport + touch + user agent
    await page.setViewport({
      width: 390,
      height: 844,
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 3,
    });
    await page.setUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    );

    const logs = [];
    page.on('console', (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));
    page.on('pageerror', (err) => logs.push(`[pageerror] ${err.message}`));

    console.log('1️⃣  Loading /telemetry on mobile viewport...');
    await page.goto('http://localhost:3000/telemetry', { waitUntil: 'networkidle2' });
    console.log('✅ Page loaded\n');

    // Find the button's bounding box
    console.log('2️⃣  Locating "Load Events" button position...');
    const box = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Load Events')
      );
      if (!btn) return null;
      const r = btn.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    });

    if (!box) {
      console.log('❌ Button not found');
      return false;
    }
    console.log('Button box:', box, '\n');

    // Check what element is ACTUALLY at the button's center point
    console.log('3️⃣  Checking what element is at the button center (overlay check)...');
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;
    const topElement = await page.evaluate(
      (cx, cy) => {
        const el = document.elementFromPoint(cx, cy);
        if (!el) return null;
        return {
          tag: el.tagName,
          text: el.textContent?.slice(0, 40),
          isButton: el.tagName === 'BUTTON' || el.closest('button') !== null,
        };
      },
      centerX,
      centerY
    );
    console.log('Element at button center:', topElement, '\n');

    // Perform a REAL touch tap (not a mouse click) at that coordinate
    console.log('4️⃣  Performing touchscreen tap() at button coordinates...');
    await page.touchscreen.tap(centerX, centerY);
    console.log('✅ Tap sent\n');

    await new Promise((r) => setTimeout(r, 1500));

    const statusAfter = await page.evaluate(() => {
      const debug = document.querySelector('div[style*="#fca5a5"]');
      return debug ? debug.textContent : 'status not found';
    });
    console.log('Status after tap:', statusAfter, '\n');

    console.log('📋 Console/page logs:');
    logs.forEach((l) => console.log('  ' + l));

    const passed = statusAfter.includes('ok');
    console.log('\n' + (passed ? '✅ MOBILE TAP TEST PASSED' : '❌ MOBILE TAP TEST FAILED'));
    return passed;
  } catch (e) {
    console.error('❌ Error:', e.message);
    console.error(e.stack);
    return false;
  } finally {
    if (browser) await browser.close();
  }
}

testMobileTouch().then((success) => process.exit(success ? 0 : 1));
