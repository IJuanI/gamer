import { test, expect } from '@playwright/test';

test.describe('Frontend Smoke Tests', () => {
  test('homepage loads without JS errors', async ({ page }) => {
    let consoleErrors: string[] = [];
    let uncaughtErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', (err) => {
      uncaughtErrors.push(err.message);
    });

    const response = await page.goto('/', { waitUntil: 'networkidle' });
    expect(response?.status()).toBe(200);

    // Wait for hydration to complete
    await page.waitForLoadState('networkidle');

    // Critical: check for uncaught errors
    if (uncaughtErrors.length > 0) {
      throw new Error(`Uncaught errors: ${uncaughtErrors.join('; ')}`);
    }

    // Flag only critical JavaScript errors, not network failures
    const criticalErrors = consoleErrors.filter(
      (err) =>
        !err.includes('Failed to load resource') &&
        !err.includes('recaptcha') &&
        !err.includes('Deprecation') &&
        !err.includes('middleware') &&
        !err.includes('net::ERR')
    );

    if (criticalErrors.length > 0) {
      throw new Error(`Critical console errors: ${criticalErrors.join('; ')}`);
    }
  });

  test('full auth flow: register, logout, and login', async ({ page }) => {
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    const testDisplayName = `TestUser${Date.now()}`;

    let uncaughtErrors: string[] = [];

    page.on('pageerror', (err) => {
      uncaughtErrors.push(err.message);
    });

    // Register new account
    await page.goto('/registro', { waitUntil: 'networkidle' });
    expect(page.url()).toContain('/registro');

    // Fill and submit registration form
    await page.fill('input[name="displayName"]', testDisplayName);
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);

    // Click submit and wait for response
    const submitPromise = page.waitForNavigation({ waitUntil: 'networkidle' });
    await page.click('button:has-text("Crear mi cuenta")');
    await submitPromise;

    // Verify we're on dashboard
    expect(page.url()).toContain('/dashboard');

    if (uncaughtErrors.length > 0) {
      throw new Error(`Uncaught errors after registration: ${uncaughtErrors.join('; ')}`);
    }

    // Logout
    await page.click('button:has-text("Salir")');
    await page.waitForURL('**/login', { timeout: 5000 });

    // Login with registered credentials
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);

    // Click submit and wait for response
    const loginPromise = page.waitForNavigation({ waitUntil: 'networkidle' });
    await page.click('button:has-text("Ingresar")');
    await loginPromise;

    // Verify we're back at dashboard
    expect(page.url()).toContain('/dashboard');

    if (uncaughtErrors.length > 0) {
      throw new Error(`Uncaught errors after login: ${uncaughtErrors.join('; ')}`);
    }
  });
});
