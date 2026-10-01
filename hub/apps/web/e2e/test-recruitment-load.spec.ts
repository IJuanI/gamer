import { test } from '@playwright/test';

test('check recruitment page load errors', async ({ page }) => {
  const errors: string[] = [];
  const logs: string[] = [];

  page.on('console', (msg) => {
    logs.push(`[${msg.type()}] ${msg.text()}`);
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    errors.push(`PAGE_ERROR: ${err.message}`);
  });

  console.log('=== Navigating to recruitment page ===');
  await page.goto('https://feature-complete-api-endpoints-gamer-hub.juancojcl.workers.dev/recruitment', { 
    waitUntil: 'domcontentloaded',
    timeout: 15000 
  });

  await page.waitForTimeout(3000);

  console.log('\n=== CONSOLE LOGS ===');
  logs.forEach(log => console.log(log));

  console.log('\n=== ERRORS FOUND ===');
  if (errors.length === 0) {
    console.log('No errors found');
  } else {
    errors.forEach(err => console.log('ERROR:', err));
  }

  console.log('\n=== PAGE HTML ===');
  const content = await page.content();
  const cfError = content.match(/<h2[^>]*data-translate="error_desc"[^>]*>(.*?)<\/h2>/);
  if (cfError) {
    console.log('Cloudflare Error Found:', cfError[1]);
  }
  
  const rayId = content.match(/Ray ID: ([a-f0-9]+)/);
  if (rayId) {
    console.log('Cloudflare Ray ID:', rayId[1]);
  }
});
