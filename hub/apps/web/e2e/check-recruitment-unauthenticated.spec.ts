import { test, expect } from '@playwright/test';

test('load recruitment page unauthenticated to check for errors', async ({ page }) => {
  const errors: string[] = [];
  const logs: { type: string; message: string }[] = [];

  page.on('console', (msg) => {
    logs.push({ type: msg.type(), message: msg.text() });
    if (msg.type() === 'error') {
      console.log(`[CONSOLE ERROR] ${msg.text()}`);
      errors.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    console.log(`[PAGE ERROR] ${err.message}`);
    errors.push(`PAGE_ERROR: ${err.message}\n${err.stack}`);
  });

  console.log('Navigating to /recruitment without auth...');
  await page.goto('https://feature-complete-api-endpoints-gamer-hub.juancojcl.workers.dev/recruitment', { 
    waitUntil: 'domcontentloaded'
  });

  await page.waitForTimeout(2000);

  console.log(`Current URL: ${page.url()}`);
  
  // Check if redirected to login
  if (page.url().includes('/login')) {
    console.log('✓ Correctly redirected to login');
  }

  console.log(`\nTotal console logs: ${logs.length}`);
  console.log(`Total errors: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('\n=== ERRORS FOUND ===');
    errors.forEach((err, i) => {
      console.log(`\nError ${i + 1}:`);
      console.log(err);
    });
  }

  // Also check for Cloudflare errors in the HTML
  const content = await page.content();
  if (content.includes('Worker threw exception')) {
    console.log('\n⚠️  CLOUDFLARE WORKER ERROR DETECTED');
    const rayMatch = content.match(/Ray ID: ([a-f0-9]+)/);
    if (rayMatch) {
      console.log(`Ray ID: ${rayMatch[1]}`);
    }
  }
});
