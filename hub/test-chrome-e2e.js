const puppeteer = require('puppeteer');

async function testTelemetryClick() {
  console.log('🧪 Starting Chrome E2E Test...\n');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Capture console logs and page errors
    const logs = [];
    page.on('console', msg => {
      logs.push(`[${msg.type()}] ${msg.text()}`);
    });
    page.on('pageerror', err => {
      logs.push(`[pageerror] ${err.message}`);
    });
    page.on('requestfailed', req => {
      logs.push(`[requestfailed] ${req.url()} ${req.failure()?.errorText}`);
    });

    console.log('1️⃣  Loading telemetry page...');
    await page.goto('http://localhost:3000/telemetry', { waitUntil: 'networkidle2' });
    console.log('✅ Page loaded\n');

    // Verify button exists
    console.log('2️⃣  Verifying button exists...');
    const buttons = await page.evaluate(() =>
      Array.from(document.querySelectorAll('button')).map(b => b.textContent)
    );
    console.log('Available buttons:', buttons);
    const buttonExists = buttons.some(b => b && b.includes('Load Events'));
    if (!buttonExists) {
      console.log('❌ Load Events button not found in DOM');
      return false;
    }
    console.log('✅ Button element found\n');

    // Get initial status
    console.log('3️⃣  Checking initial status...');
    const initialStatus = await page.evaluate(() => {
      const statusEl = document.querySelector('span');
      return statusEl ? statusEl.textContent : 'not found';
    });
    console.log(`Initial status: "${initialStatus}"\n`);

    // Click the Load Events button by finding it via its text content
    console.log('4️⃣  Clicking "Load Events" button...');
    const clicked = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Load Events'));
      if (!btn) return false;
      btn.click();
      return true;
    });
    console.log(clicked ? '✅ Button clicked\n' : '❌ Could not click button\n');

    // Wait for the fetch and status update
    console.log('5️⃣  Waiting for data to load...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get the status after clicking
    const statusAfter = await page.evaluate(() => {
      const debug = document.querySelector('div[style*="#fca5a5"]');
      return debug ? debug.textContent : 'status not found';
    });
    console.log(`Status after click: ${statusAfter}\n`);

    // Get the events count
    console.log('6️⃣  Checking events displayed...');
    const eventCount = await page.evaluate(() => {
      const eventDivs = document.querySelectorAll('div[style*="border-left"]');
      return eventDivs.length;
    });
    console.log(`Events displayed: ${eventCount}\n`);

    // Get detailed event info
    const eventInfo = await page.evaluate(() => {
      const events = [];
      document.querySelectorAll('div[style*="border-left"]').forEach(el => {
        const text = el.textContent;
        const lines = text.split('\n');
        events.push(lines[0] || 'unknown');
      });
      return events.slice(0, 3);
    });

    if (eventCount > 0) {
      console.log('Sample events displayed:');
      eventInfo.forEach((e, i) => {
        console.log(`  ${i + 1}. ${e.substring(0, 60)}...`);
      });
    }

    console.log('📋 All captured console/page logs:');
    logs.forEach(l => console.log('  ' + l));
    console.log('');

    console.log('\n' + '='.repeat(60));
    if (eventCount > 0 && statusAfter.includes('ok')) {
      console.log('✅ E2E TEST PASSED');
      console.log('\nVerified:');
      console.log(`  ✓ Page loaded`);
      console.log(`  ✓ Button clicked successfully`);
      console.log(`  ✓ Status changed to "ok"`);
      console.log(`  ✓ ${eventCount} events displayed`);
      return true;
    } else {
      console.log('❌ E2E TEST FAILED');
      console.log(`\nStatus: ${statusAfter}`);
      console.log(`Events displayed: ${eventCount}`);
      console.log('\nConsole logs:');
      logs.forEach(l => console.log('  ' + l));
      return false;
    }

  } catch (e) {
    console.error('❌ Error:', e.message);
    console.error(e.stack);
    return false;
  } finally {
    if (browser) await browser.close();
  }
}

testTelemetryClick().then(success => {
  process.exit(success ? 0 : 1);
});
