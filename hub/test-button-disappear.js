const puppeteer = require('puppeteer');

async function test() {
  console.log('🧪 Nav Button Visibility Test - Checking for Disappearing Buttons\n');

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

    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });

    // Check button visibility every 500ms for 20 seconds
    let ingreserVisible = true;
    let unirmeVisible = true;

    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, 500));

      const state = await page.evaluate(() => {
        const ingresar = document.querySelector('a[href="/login"]');
        const unirme = document.querySelector('a[href="/register"]');

        return {
          ingresar: ingresar ? {
            visible: !!ingresar.offsetParent,
            text: ingresar.textContent.trim()
          } : null,
          unirme: unirme ? {
            visible: !!unirme.offsetParent,
            text: unirme.textContent.trim()
          } : null,
        };
      });

      if (state.ingresar && !state.ingresar.visible) {
        ingreserVisible = false;
        console.log(`❌ t=${i * 500}ms: Ingresar HIDDEN`);
      }
      if (state.unirme && !state.unirme.visible) {
        unirmeVisible = false;
        console.log(`❌ t=${i * 500}ms: Unirme HIDDEN`);
      }
    }

    if (ingreserVisible && unirmeVisible) {
      console.log('✅ Both buttons visible for entire 20 second period');
    } else {
      console.log('❌ Buttons disappeared during page lifetime');
    }

    // Test /devs page
    console.log('\n\nTesting /devs (GameDevs page)');
    console.log('═'.repeat(50));

    await page.goto('http://localhost:3000/devs', { waitUntil: 'networkidle2' });

    ingreserVisible = true;
    unirmeVisible = true;

    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, 500));

      const state = await page.evaluate(() => {
        const ingresar = document.querySelector('a[href="/login"]');
        const unirme = document.querySelector('a[href="/register"]');

        return {
          ingresar: ingresar ? {
            visible: !!ingresar.offsetParent,
            text: ingresar.textContent.trim()
          } : null,
          unirme: unirme ? {
            visible: !!unirme.offsetParent,
            text: unirme.textContent.trim()
          } : null,
        };
      });

      if (state.ingresar && !state.ingresar.visible) {
        ingreserVisible = false;
        console.log(`❌ t=${i * 500}ms: Ingresar HIDDEN`);
      }
      if (state.unirme && !state.unirme.visible) {
        unirmeVisible = false;
        console.log(`❌ t=${i * 500}ms: Unirme HIDDEN`);
      }
    }

    if (ingreserVisible && unirmeVisible) {
      console.log('✅ Both buttons visible for entire 20 second period');
    } else {
      console.log('❌ Buttons disappeared during page lifetime');
    }

    console.log('\n' + '═'.repeat(50));
    console.log('✅ Test complete');
    return true;
  } catch (e) {
    console.error('❌ Error:', e.message);
    return false;
  } finally {
    if (browser) await browser.close();
  }
}

test();
