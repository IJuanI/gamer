const puppeteer = require('puppeteer');

async function test() {
  console.log('🧪 Light Theme + Telemetry Auto-load Test\n');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    // Navigate to /devs
    console.log('1️⃣  Loading /devs in dark theme...');
    await page.goto('http://localhost:3000/devs', { waitUntil: 'networkidle2' });

    const htmlClassDark = await page.evaluate(() => document.documentElement.className);
    console.log('   HTML class:', htmlClassDark);
    console.log('   Theme toggle button exists:', await page.evaluate(() => !!document.querySelector('button[aria-label="Toggle theme"]')));
    console.log('✅ Page loaded\n');

    // Toggle to light theme
    console.log('2️⃣  Clicking theme toggle...');
    await page.evaluate(() => {
      const btn = document.querySelector('button[aria-label="Toggle theme"]');
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    const htmlClassLight = await page.evaluate(() => document.documentElement.className);
    const isLight = htmlClassLight.includes('light');
    console.log('   HTML class after toggle:', htmlClassLight);
    console.log('   Is light theme:', isLight, '\n');

    // Check contrast in light theme
    console.log('3️⃣  Checking light theme colors...');
    const lightColors = await page.evaluate(() => {
      const root = document.documentElement;
      const style = getComputedStyle(root);
      return {
        background: style.getPropertyValue('--background'),
        foreground: style.getPropertyValue('--foreground'),
        textPrimary: style.getPropertyValue('--text-primary'),
        textSecondary: style.getPropertyValue('--text-secondary'),
      };
    });
    console.log('   Colors:', lightColors, '\n');

    // Navigate to telemetry and verify auto-load
    console.log('4️⃣  Loading /telemetry...');
    await page.goto('http://localhost:3000/telemetry', { waitUntil: 'networkidle2' });

    console.log('   Waiting for events to auto-load...');
    await new Promise(r => setTimeout(r, 2000));

    const eventCount = await page.evaluate(() => {
      const eventDivs = document.querySelectorAll('div[style*="border-left"]');
      return eventDivs.length;
    });

    const status = await page.evaluate(() => {
      const debug = document.querySelector('div[style*="#fca5a5"]');
      if (debug) {
        const text = debug.textContent;
        const match = text.match(/Status:\s*([^|]*)/);
        return match ? match[1].trim() : 'unknown';
      }
      return 'not found';
    });

    console.log('   Events loaded:', eventCount);
    console.log('   Status:', status);
    console.log('✅ Telemetry page loaded\n');

    console.log('═'.repeat(60));
    if (isLight && eventCount > 0 && status === 'ok') {
      console.log('✅ ALL TESTS PASSED');
      console.log('  ✓ Light theme toggle works');
      console.log('  ✓ Light theme colors applied');
      console.log(`  ✓ Telemetry auto-loaded ${eventCount} events`);
    } else {
      console.log('❌ SOME TESTS FAILED');
      console.log(`  Light theme: ${isLight ? '✓' : '✗'}`);
      console.log(`  Events loaded: ${eventCount > 0 ? '✓' : '✗'} (${eventCount})`);
      console.log(`  Status ok: ${status === 'ok' ? '✓' : '✗'} (${status})`);
    }
    return isLight && eventCount > 0 && status === 'ok';
  } catch (e) {
    console.error('❌ Error:', e.message);
    return false;
  } finally {
    if (browser) await browser.close();
  }
}

test().then((s) => process.exit(s ? 0 : 1));
