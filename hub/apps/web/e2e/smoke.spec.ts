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
        !err.includes('net::ERR') &&
        !err.includes('CORS') &&
        !err.includes('Access to fetch')
    );

    if (criticalErrors.length > 0) {
      throw new Error(`Critical console errors: ${criticalErrors.join('; ')}`);
    }
  });

  test('auth forms load and are interactive', async ({ page }) => {
    let uncaughtErrors: string[] = [];

    page.on('pageerror', (err) => {
      uncaughtErrors.push(err.message);
    });

    // Verify registro page loads
    await page.goto('/registro', { waitUntil: 'networkidle' });
    expect(page.url()).toContain('/registro');

    // Verify registration form is fully interactive
    const displayNameInput = page.locator('input[name="displayName"]');
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    const submitButton = page.locator('button:has-text("Crear mi cuenta")');

    await expect(displayNameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();

    if (uncaughtErrors.length > 0) {
      throw new Error(`Uncaught errors on registro: ${uncaughtErrors.join('; ')}`);
    }

    // Verify login page loads
    await page.goto('/login', { waitUntil: 'networkidle' });
    expect(page.url()).toContain('/login');

    const loginEmailInput = page.locator('input[name="email"]');
    const loginPasswordInput = page.locator('input[name="password"]');
    const loginButton = page.locator('button:has-text("Ingresar")');

    await expect(loginEmailInput).toBeVisible();
    await expect(loginPasswordInput).toBeVisible();
    await expect(loginButton).toBeVisible();
    await expect(loginButton).toBeEnabled();

    if (uncaughtErrors.length > 0) {
      throw new Error(`Uncaught errors on login: ${uncaughtErrors.join('; ')}`);
    }
  });
});
