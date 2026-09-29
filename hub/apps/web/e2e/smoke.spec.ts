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

  test('login page loads without JS errors', async ({ page }) => {
    let uncaughtErrors: string[] = [];

    page.on('pageerror', (err) => {
      uncaughtErrors.push(err.message);
    });

    const response = await page.goto('/login', { waitUntil: 'networkidle' });
    expect(response?.status()).toBe(200);

    await page.waitForLoadState('networkidle');

    if (uncaughtErrors.length > 0) {
      throw new Error(`Uncaught errors on /login: ${uncaughtErrors.join('; ')}`);
    }

    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('registro page loads without JS errors', async ({ page }) => {
    let uncaughtErrors: string[] = [];

    page.on('pageerror', (err) => {
      uncaughtErrors.push(err.message);
    });

    const response = await page.goto('/registro', { waitUntil: 'networkidle' });
    expect(response?.status()).toBe(200);

    await page.waitForLoadState('networkidle');

    if (uncaughtErrors.length > 0) {
      throw new Error(`Uncaught errors on /registro: ${uncaughtErrors.join('; ')}`);
    }
  });

  test('theme provider works', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const htmlElement = page.locator('html');
    const classes = await htmlElement.getAttribute('class');

    expect(classes).toMatch(/(dark|light)/);
  });

  test('full auth flow: registration and login forms load', async ({ page }) => {
    let uncaughtErrors: string[] = [];

    page.on('pageerror', (err) => {
      uncaughtErrors.push(err.message);
    });

    // Verify registro page loads
    const regResponse = await page.goto('/registro', { waitUntil: 'networkidle' });
    expect(regResponse?.status()).toBe(200);

    if (uncaughtErrors.length > 0) {
      throw new Error(`Uncaught errors on /registro: ${uncaughtErrors.join('; ')}`);
    }

    // Verify registration form is complete
    await expect(page.locator('input[name="displayName"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Crear mi cuenta")')).toBeVisible();

    // Verify login page also loads
    const loginResponse = await page.goto('/login', { waitUntil: 'networkidle' });
    expect(loginResponse?.status()).toBe(200);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Ingresar")')).toBeVisible();
  });
});
