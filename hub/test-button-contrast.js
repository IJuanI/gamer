const puppeteer = require('puppeteer');

async function test() {
  console.log('🧪 Button Contrast Test - Light & Dark Modes\n');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    // Test home page
    console.log('Testing / (home page)');
    console.log('═'.repeat(50));

    // Dark mode
    console.log('\n1️⃣  Dark mode:');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
    const darkConocerMasText = await page.evaluate(() => {
      const btn = document.querySelector('a[href="/#features"]');
      if (!btn) return null;
      const style = window.getComputedStyle(btn);
      return {
        text: btn.textContent.trim(),
        color: style.color,
        bgColor: style.backgroundColor,
      };
    });
    console.log('   "Conocer más" button:', darkConocerMasText);

    // Light mode
    console.log('\n2️⃣  Light mode:');
    await page.evaluate(() => {
      const btn = document.querySelector('button[aria-label="Toggle theme"]');
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    const lightConocerMasText = await page.evaluate(() => {
      const btn = document.querySelector('a[href="/#features"]');
      if (!btn) return null;
      const style = window.getComputedStyle(btn);
      return {
        text: btn.textContent.trim(),
        color: style.color,
        bgColor: style.backgroundColor,
      };
    });
    console.log('   "Conocer más" button:', lightConocerMasText);

    // Test devs page
    console.log('\n\nTesting /devs (GameDevs page)');
    console.log('═'.repeat(50));

    // Dark mode
    console.log('\n3️⃣  Dark mode:');
    await page.goto('http://localhost:3000/devs', { waitUntil: 'networkidle2' });
    const darkUnirmeText = await page.evaluate(() => {
      const btn = document.querySelector('a[href="/register"]');
      if (!btn) return null;
      const style = window.getComputedStyle(btn);
      return {
        text: btn.textContent.trim(),
        color: style.color,
        bgColor: style.backgroundColor,
      };
    });
    console.log('   "Unirme a GameDevs" button:', darkUnirmeText);

    // Light mode
    console.log('\n4️⃣  Light mode:');
    await page.evaluate(() => {
      const btn = document.querySelector('button[aria-label="Toggle theme"]');
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    const lightUnirmeText = await page.evaluate(() => {
      const btn = document.querySelector('a[href="/register"]');
      if (!btn) return null;
      const style = window.getComputedStyle(btn);
      return {
        text: btn.textContent.trim(),
        color: style.color,
        bgColor: style.backgroundColor,
      };
    });
    console.log('   "Unirme a GameDevs" button:', lightUnirmeText);

    console.log('\n' + '═'.repeat(50));
    console.log('✅ Button contrast test complete');
    return true;
  } catch (e) {
    console.error('❌ Error:', e.message);
    return false;
  } finally {
    if (browser) await browser.close();
  }
}

test();
